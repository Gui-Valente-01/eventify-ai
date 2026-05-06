import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generateHtmlWithGemini, isGeminiAvailable } from "@/lib/gemini";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `Você é um engenheiro full-stack sênior do Eventify AI (Next.js App Router + Supabase + Stripe + Gemini).

Sua tarefa: analisar um erro reportado pelo monitoramento e responder em formato MARKDOWN PURO (não HTML), em português, com:

## Diagnóstico
1-2 parágrafos curtos: o que provavelmente causou esse erro.

## Severidade
Uma palavra: \`low\`, \`medium\`, \`high\` ou \`critical\`.
- low: erro cosmético ou que não afeta a função principal
- medium: afeta um fluxo secundário; usuário consegue contornar
- high: bloqueia fluxo importante (criar evento, login, checkout)
- critical: dados perdidos, segurança ou queda total

## Sugestão de correção
3-6 bullets concretos. Cite arquivos prováveis quando possível (ex: \`app/api/checkout/route.ts\`).
Se for de configuração (env, migration, Stripe, Gemini), diga claramente.

## Risco se não corrigir
1 frase.

NÃO escreva código completo — só diretrizes claras pro dev.
NÃO use \`\`\`html\`\`\` ou \`<!DOCTYPE>\` — saída é markdown puro.`;

export async function POST(req: Request) {
  // Auth: só admin
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  let body: { errorId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body.errorId) return NextResponse.json({ error: "errorId obrigatório" }, { status: 400 });

  if (!isGeminiAvailable()) {
    return NextResponse.json({ error: "GOOGLE_API_KEY não configurada" }, { status: 503 });
  }

  // Pega erro do banco com service role (RLS de admin já permite, mas service é mais simples)
  const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!adminUrl || !adminKey) {
    return NextResponse.json({ error: "Service role não configurada" }, { status: 503 });
  }
  const admin = createClient(adminUrl, adminKey);

  const { data: err, error: dbErr } = await admin
    .from("error_logs")
    .select("*")
    .eq("id", body.errorId)
    .maybeSingle();

  if (dbErr || !err) return NextResponse.json({ error: "Erro não encontrado" }, { status: 404 });

  // Monta prompt com o erro
  const userPrompt = `# Erro reportado

**Scope:** ${err.scope}
**Level:** ${err.level}
**Message:** ${err.message}

**Error name:** ${err.error_name ?? "(N/A)"}
**Error message:** ${err.error_message ?? "(N/A)"}
**URL:** ${err.url ?? "(N/A)"}
**User agent:** ${err.user_agent?.slice(0, 200) ?? "(N/A)"}

**Stack trace:**
\`\`\`
${(err.stack as string | null)?.slice(0, 4000) ?? "(sem stack)"}
\`\`\`

**Context:**
\`\`\`json
${JSON.stringify(err.context ?? {}, null, 2).slice(0, 2000)}
\`\`\`

Analise e responda no formato pedido no system prompt.`;

  // Reusa Gemini com prompt em texto (não precisa de HTML aqui)
  const result = await generateHtmlWithGemini({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 2000,
  });

  // O helper espera HTML, mas pra texto livre o resultado pode vir só como texto
  // sem doctype. Como falha o validador de HTML, recuperamos do erro/log.
  // Solução: chamar Gemini direto via SDK aqui.
  if (result.html) {
    // improvável, mas se vier HTML, extrai texto
    const text = result.html.replace(/<[^>]+>/g, "").trim();
    return await persistAndRespond(admin, err.id, text);
  }

  // Fallback: tenta de novo via SDK direto pra texto puro
  const text = await generateTextWithGemini(SYSTEM_PROMPT, userPrompt);
  if (!text) {
    logger.error("analyze-error", "Gemini não retornou análise", null, { errorId: body.errorId });
    return NextResponse.json({ error: "IA não respondeu" }, { status: 502 });
  }

  return await persistAndRespond(admin, err.id, text);
}

async function generateTextWithGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });
    const response = await client.models.generateContent({
      model: process.env.GOOGLE_MODEL || "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4,
        maxOutputTokens: 2000,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    return (response.text || "").trim() || null;
  } catch (err) {
    logger.error("analyze-error", "Gemini falhou", err);
    return null;
  }
}

async function persistAndRespond(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any, "public", any>,
  errorId: string,
  analysis: string
) {
  // Extrai severidade do markdown (procura "## Severidade\n... low|medium|high|critical")
  const severityMatch = analysis.match(/##\s*Severidade[\s\S]{0,300}?\b(low|medium|high|critical)\b/i);
  const severity = severityMatch ? severityMatch[1].toLowerCase() : null;

  // Extrai sugestão (seção "Sugestão de correção")
  const fixMatch = analysis.match(/##\s*Sugest[ãa]o[^\n]*\n([\s\S]+?)(?=\n##\s|$)/i);
  const fix = fixMatch ? fixMatch[1].trim() : null;

  await admin
    .from("error_logs")
    .update({
      ai_analysis: analysis,
      ai_suggested_fix: fix,
      ai_severity: severity,
      status: "investigating",
    })
    .eq("id", errorId);

  return NextResponse.json({
    ok: true,
    analysis,
    severity,
    fix,
  });
}
