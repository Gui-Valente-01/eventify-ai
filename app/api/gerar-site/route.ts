import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { EventoDados, GeneratedSite } from "@/lib/siteAgent";
import { runAgentCompany } from "@/lib/agents/orchestrator";
import type { AgentCompanyResult, AgentRunSummary } from "@/lib/agents/types";
import { selectEventTemplate } from "@/lib/templates";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { calcularCustoUSD, type TokenUsage } from "@/lib/aiPricing";
import { checkPodeCriarEvento, checkPodeRegenerar } from "@/lib/planLimits";
import { logger } from "@/lib/logger";
import { generateHtmlWithGemini, isGeminiAvailable } from "@/lib/gemini";
import {
  buildPlanPrompt,
  getPlanDisplayName,
  getPlanGenerationStrategy,
  getSelectedPlanFromEvento,
} from "@/lib/planStrategy";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_CALLS = 5;
const DEFAULT_MAX_HTML_TOKENS = 12000;

export const runtime = "nodejs";
// Vercel Hobby corta em 60s; Pro permite até 300s. Mantemos 60 pra
// compatibilidade. Se subir pra Pro, pode aumentar pra 300.
export const maxDuration = 60;

type Usage = TokenUsage;

function emptyUsage(): Usage {
  return { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
}

function addUsage(a: Usage, b: Usage): Usage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheReadTokens: (a.cacheReadTokens ?? 0) + (b.cacheReadTokens ?? 0),
    cacheWriteTokens: (a.cacheWriteTokens ?? 0) + (b.cacheWriteTokens ?? 0),
  };
}

function extractUsage(usage: unknown): Usage {
  const u = usage as {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  } | undefined;
  return {
    inputTokens: u?.input_tokens ?? 0,
    outputTokens: u?.output_tokens ?? 0,
    cacheReadTokens: u?.cache_read_input_tokens ?? 0,
    cacheWriteTokens: u?.cache_creation_input_tokens ?? 0,
  };
}

function getMaxHtmlTokens() {
  const raw = Number(process.env.ANTHROPIC_MAX_HTML_TOKENS || DEFAULT_MAX_HTML_TOKENS);
  if (!Number.isFinite(raw)) return DEFAULT_MAX_HTML_TOKENS;
  return Math.min(Math.max(Math.floor(raw), 4000), 32000);
}

type Plan = "free" | "basico" | "intermediario" | "premium";

const MODEL_BY_PLAN: Record<Plan, string> = {
  premium: "claude-opus-4-7",
  intermediario: "claude-sonnet-4-6",
  basico: "claude-haiku-4-5-20251001",
  free: "claude-haiku-4-5-20251001",
};

async function resolveContext(): Promise<{
  model: string;
  plan: Plan;
  userId: string | null;
}> {
  const override = process.env.ANTHROPIC_MODEL;
  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return { model: override || MODEL_BY_PLAN.free, plan: "free", userId: null };

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { model: override || MODEL_BY_PLAN.free, plan: "free", userId: null };

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();

    const plan = (profile?.plan as Plan) || "free";
    return {
      model: MODEL_BY_PLAN[plan] || MODEL_BY_PLAN.free,
      plan,
      userId: user.id,
    };
  } catch {
    return { model: override || MODEL_BY_PLAN.free, plan: "free", userId: null };
  }
}

async function logUsage(args: {
  userId: string | null;
  eventoId?: string | null;
  model: string;
  plan: Plan;
  usage: Usage;
  status: "ok" | "error";
  errorMessage?: string;
  provider: "anthropic" | "gemini" | "local";
  agentRun?: AgentRunSummary;
  qualityScore?: number;
}) {
  if (!args.userId) return;
  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return;
    const cost = calcularCustoUSD(args.model, args.usage);
    const basePayload = {
      user_id: args.userId,
      evento_id: args.eventoId ?? null,
      model: args.model,
      plan: args.plan,
      input_tokens: args.usage.inputTokens,
      output_tokens: args.usage.outputTokens,
      cache_read_tokens: args.usage.cacheReadTokens ?? 0,
      cache_write_tokens: args.usage.cacheWriteTokens ?? 0,
      cost_usd: cost,
      status: args.status,
      error_message: args.errorMessage ?? null,
    };
    const payloadWithAgents = {
      ...basePayload,
      provider: args.provider,
      generation_mode: "agent-company",
      quality_score: args.qualityScore ?? args.agentRun?.quality.score ?? null,
      agent_run: args.agentRun ?? null,
    };
    const { error } = await supabase.from("usage_logs").insert(payloadWithAgents);
    if (error && /provider|generation_mode|quality_score|agent_run/i.test(error.message || "")) {
      await supabase.from("usage_logs").insert(basePayload);
    } else if (error) {
      throw error;
    }
  } catch (e) {
    logger.error("gerar-site", "falha ao gravar usage_logs", e, { userId: args.userId });
  }
}

const SYSTEM_PROMPT = `Você é um designer UI/UX e copywriter sênior especializado em sites de eventos premium.

🎯 OBJETIVO:
Construir um SITE COMPLETO (não uma landing page enxuta), com várias seções densas, copy autoral e identidade visual única. O cliente deve olhar e dizer "isso foi feito EXATAMENTE pra mim, parece um site de R$ 5.000".

⚠️ REGRAS DE CONTEÚDO:
- USE TODOS os dados fornecidos. Cada campo do briefing vira pelo menos um trecho do site — nada deve ficar de fora.
- ESCREVA copy LONGO e específico. Nada de 1-2 frases bonitinhas. Cada seção precisa de parágrafos completos com narrativa.
- ZERO clichê ("momento mágico", "ocasião especial", "celebrar a vida"). Linguagem concreta, baseada nos detalhes que o cliente deu.
- Tom: emocional/poético em eventos pessoais; profissional/preciso em corporativos; energético/direto em festas.

🏗️ SEÇÕES OBRIGATÓRIAS (todas, na ordem):
1. **Hero fullscreen** — nome do evento, frase autoral inspirada no briefing, CTA pro RSVP, data formatada e visual forte (gradiente/imagem/forma).
2. **Contagem regressiva funcional** em JS (dias / horas / minutos / segundos, atualizando a cada segundo).
3. **Sobre o evento** — 2 a 3 parágrafos densos baseados na descrição + clima + público.
4. **Seção narrativa específica do tipo de evento** (use os "detalhes" recebidos):
   - Casamento → Nossa História com timeline (como se conheceram, pedido, casamento)
   - Aniversário → mensagem do aniversariante + tema desenvolvido em texto
   - Corporativo → Por que participar (objetivo desenvolvido) + público-alvo
   - Festa → Manifesto da edição / vibe da noite
   - Religioso → Mensagem central / versículo desenvolvido
5. **Programação / Agenda / Line-up** — render visual em formato apropriado (timeline horizontal, lista numerada, cards por horário). SEMPRE que houver dado (agenda, lineup, cerimônia+festa, liturgia, atrações), monte essa seção.
6. **Pessoas** — padrinhos/palestrantes/aniversariante/celebrante em cards ou grid, com nomes e papéis quando houver.
7. **Local** — endereço completo formatado + mapa Google Maps via \`<iframe src="https://www.google.com/maps?q={endereço-codificado}&output=embed">\` + bloco "como chegar" curto.
8. **Informações práticas** — dress code, horários, idade mínima, regras, hospedagem, o que levar (use só o que existir nos detalhes; cada item vira um card).
9. **RSVP** — formulário com input de nome e botão "Confirmar presença". Ao confirmar, mostra alerta "Presença confirmada" via JS (não precisa enviar pra backend).
10. **Lista de presentes / Ingressos / Inscrição** — se houver link/PIX/lotes, monte seção visual com botão destacado.
11. **FAQ** — 4 a 6 perguntas relevantes ao tipo de evento, com respostas escritas pela IA baseadas no contexto.
12. **Footer** — hashtag/instagram se houver, contato, créditos.

🎨 DESIGN — SISTEMA RÍGIDO:
- O bloco "SISTEMA DE DESIGN OBRIGATÓRIO" no contexto contém CSS variables prontas. **COPIE LITERALMENTE no :root do <style>**. NÃO invente cores, fontes ou espaçamentos.
- Use SEMPRE \`var(--color-primary)\`, \`var(--color-ink)\`, etc. NUNCA hexadecimal direto no CSS dos elementos.
- Tipografia: Google Fonts pra carregar as fontes nomeadas em --font-display e --font-body.
- Aplique TODAS as regras de animação listadas em "ANIMAÇÕES" (não pula nenhuma).
- Mobile-first, 100% responsivo (use media queries pra >=768px e >=1024px).

💻 FORMATO DE SAÍDA — OBRIGATÓRIO:
- UM ÚNICO documento HTML 100% AUTOCONTIDO. SEM dependências externas além de Google Fonts.
- Começa LITERALMENTE com \`<!DOCTYPE html>\`. Sem texto antes.
- \`<html lang="pt-BR">\`, \`<head>\` com charset, viewport, title e meta description.
- **TODO O CSS DEVE ESTAR INLINE em \`<style>\` no \`<head>\`. NÃO use Tailwind, NÃO use Bootstrap, NÃO use NENHUM framework CSS. Escreva CSS puro do zero.**
- Use CSS Grid e Flexbox modernos. Custom properties (variáveis CSS) pra paleta.
- Google Fonts pode usar (\`<link href="https://fonts.googleapis.com/...">\`).
- Todo JS inline no final do \`<body>\` em \`<script>\` (countdown, RSVP alert, IntersectionObserver, smooth scroll).
- Termina com \`</html>\`. SEM cercas markdown, SEM explicação, SEM comentário fora do HTML.

🚫 PROIBIDO:
- Texto fora do HTML
- Cercas \`\`\`html
- Comentários do tipo "aqui está o site"
- Seções com placeholder vazio ("Em breve", "Lorem ipsum")
- Imagens externas com URL inventada — use placeholders SVG inline ou gradientes CSS
- **\`<script src="https://cdn.tailwindcss.com">\` ou QUALQUER framework CSS via CDN**
- \`class="bg-blue-500"\` e classes do tipo Tailwind — NÃO funcionam, escreva CSS de verdade

ENTREGUE O HTML DIRETO. SEM PREÂMBULO.`;

const GEMINI_HARDENING_PROMPT = `

CAMADA EXTRA PARA GEMINI:
- Antes de responder, faca uma auditoria mental do HTML: estrutura, CSS, responsividade, JS, secoes obrigatorias e ausencia de placeholders.
- Nao economize codigo. Sites curtos, simples ou parecidos com template devem ser refeitos antes da resposta final.
- O HTML precisa parecer uma pagina publicada, nao um mockup. Todos os botoes, formularios, contagem, mapa e estados visuais devem ter comportamento basico funcional.
- Nao use classes Tailwind nem nomes utilitarios se elas nao estiverem definidas no CSS. Prefira classes semanticas e CSS escrito no <style>.
- Use layout mobile-first com breakpoints reais e evite qualquer texto estourando cards, botoes ou hero.
- Se algum dado estiver ausente, escreva uma solucao editorial coerente sem usar "em breve", "a confirmar" ou placeholder.
- Entregue uma versao final revisada, polida e completa em uma unica resposta HTML.
`;

function formatarData(data?: string) {
  if (!data) return "Data a confirmar";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(`${data}T00:00:00`));
  } catch {
    return data;
  }
}

function buildUserPrompt(evento: EventoDados, agentContext?: string): string {
  const e = evento.endereco || {};
  const b = evento.briefing || {};
  const detalhes = b.detalhes || {};
  const selectedPlan = getSelectedPlanFromEvento(evento);
  const selectedPlanName = getPlanDisplayName(selectedPlan);
  const selectedPlanStrategy = getPlanGenerationStrategy(selectedPlan);

  const enderecoCompleto = [e.rua, e.numero, e.cidade, e.estado, e.cep]
    .filter(Boolean)
    .join(", ");

  const detalhesTexto = Object.entries(detalhes)
    .filter((entry) => typeof entry[1] === "string" && entry[1].trim().length > 0)
    .map(([k, v]) => `- ${k}: ${(v as string).trim()}`)
    .join("\n");

  return `📌 DADOS DO EVENTO:

Nome: ${evento.nome}
Tipo: ${evento.tipo}
Data: ${formatarData(evento.data)}
Plano escolhido pelo cliente: ${selectedPlanName}

📍 LOCAL:
Endereço completo: ${enderecoCompleto || "(não informado)"}
Para o iframe Google Maps, use a URL: https://www.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&output=embed

🎨 BRIEFING CRIATIVO:
- Estilo visual: ${b.estilo || "(livre — escolha algo coerente com o tipo)"}
- Clima: ${b.clima || "(livre)"}
- Público: ${b.publico || "(livre)"}
- Cor principal: ${b.corPrincipal || "(livre)"}
- Descrição do cliente: ${b.descricao ? `"${b.descricao}"` : "(não informada)"}

DIRETRIZ DO PLANO:
${buildPlanPrompt(selectedPlan)}

O site precisa refletir o plano ${selectedPlanName}. Não entregue estrutura de ${selectedPlanStrategy.nome} se o cliente escolheu outro plano.

📋 DETALHES ESPECÍFICOS DO TIPO (use TODOS — cada um vira seção/conteúdo):
${detalhesTexto || "(o cliente não preencheu detalhes — invente algo coerente baseado no briefing geral, mas marque essas seções com texto curto)"}

${evento.imagem ? `🖼️ IMAGEM DO EVENTO disponível em: ${evento.imagem} — use no hero como background ou destaque.` : ""}

PLANO DOS AGENTES INTERNOS:
${agentContext || "(sem plano estruturado)"}

GERE AGORA o HTML completo do site. Comece LITERALMENTE com <!DOCTYPE html>. Não escreva nada antes.`;
}

const COPY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "heroTitle",
    "subtitle",
    "description",
    "invitationMessage",
    "highlights",
    "ctaLabel",
    "seoTitle",
    "seoDescription",
  ],
  properties: {
    heroTitle: { type: "string" },
    subtitle: { type: "string" },
    description: { type: "string" },
    invitationMessage: { type: "string" },
    highlights: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
    ctaLabel: { type: "string" },
    seoTitle: { type: "string" },
    seoDescription: { type: "string" },
  },
} as const;

async function generateCustomHTML(
  client: Anthropic,
  evento: EventoDados,
  modelId: string,
  agentContext: string
): Promise<{ html: string | null; usage: Usage; error?: string }> {
  try {
    const response = await client.messages.create({
      model: modelId,
      max_tokens: getMaxHtmlTokens(),
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: buildUserPrompt(evento, agentContext) }],
    });

    const usage = extractUsage(response.usage);
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { html: null, usage };

    let html = textBlock.text.trim();
    html = html.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "");
    if (!html.toLowerCase().startsWith("<!doctype")) {
      const idx = html.toLowerCase().indexOf("<!doctype");
      if (idx !== -1) html = html.slice(idx);
    }
    return {
      html: html.toLowerCase().includes("<!doctype") ? html : null,
      usage,
    };
  } catch (error) {
    const msg =
      error instanceof Anthropic.APIError
        ? `Anthropic ${error.status}: ${error.message}`
        : error instanceof Error
          ? error.message
          : "erro desconhecido";
    logger.error("gerar-site", "Anthropic falhou ao gerar HTML", error, { detail: msg });
    return { html: null, usage: emptyUsage(), error: msg };
  }
}

async function generateCopyJSON(
  client: Anthropic,
  evento: EventoDados,
  modelId: string
): Promise<{ copy: Partial<GeneratedSite> | null; usage: Usage }> {
  try {
    const response = await client.messages.create({
      model: modelId,
      max_tokens: 1024,
      system: "Você é um copywriter de eventos. Responda em português do Brasil.",
      output_config: {
        format: { type: "json_schema", schema: COPY_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: `Resumir em JSON este evento (curto e vendável): ${JSON.stringify({
            nome: evento.nome,
            tipo: evento.tipo,
            data: evento.data,
            cidade: evento.endereco?.cidade,
            selectedPlan: getSelectedPlanFromEvento(evento),
            briefing: evento.briefing,
          })}`,
        },
      ],
    });
    const usage = extractUsage(response.usage);
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return { copy: null, usage };
    return { copy: JSON.parse(block.text), usage };
  } catch {
    return { copy: null, usage: emptyUsage() };
  }
}

type GenerationResult = {
  copy: GeneratedSite | null;
  html: string | null;
  usage: Usage;
  error?: string;
  provider: "anthropic" | "gemini";
  modelUsed: string;
};

async function generateWithGemini(
  evento: EventoDados,
  localRun: AgentCompanyResult
): Promise<GenerationResult> {
  const template = selectEventTemplate(evento.tipo);
  const fallback = localRun.siteGerado as GeneratedSite;

  const result = await generateHtmlWithGemini({
    systemPrompt: `${SYSTEM_PROMPT}${GEMINI_HARDENING_PROMPT}`,
    userPrompt: buildUserPrompt(evento, localRun.promptContext),
    maxTokens: getMaxHtmlTokens(),
  });

  // Aproveita a copy do agente local pra preencher campos textuais
  const copy: GeneratedSite | null = result.html
    ? {
        ...fallback,
        templateId: template.id,
        templateName: template.name,
        layout: template.layout,
        palette: template.palette,
        generatedBy: "gemini",
        qualityScore: localRun.agentRun.quality.score,
        qualityWarnings: localRun.agentRun.quality.warnings,
        businessSuggestions: localRun.agentRun.business.upsells,
        agentRun: {
          ...localRun.agentRun,
          mode: "ai-assisted",
          finishedAt: new Date().toISOString(),
        },
      }
    : null;

  return {
    copy,
    html: result.html,
    usage: result.usage,
    error: result.error,
    provider: "gemini",
    modelUsed: result.model,
  };
}

async function generateWithClaude(
  evento: EventoDados,
  modelId: string,
  localRun: AgentCompanyResult
): Promise<{
  copy: GeneratedSite | null;
  html: string | null;
  usage: Usage;
  error?: string;
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { copy: null, html: null, usage: emptyUsage() };
  }

  const client = new Anthropic();
  const template = selectEventTemplate(evento.tipo);
  const fallback = localRun.siteGerado as GeneratedSite;

  const [htmlRes, copyRes] = await Promise.all([
    generateCustomHTML(client, evento, modelId, localRun.promptContext),
    generateCopyJSON(client, evento, modelId),
  ]);

  const copy: GeneratedSite | null = copyRes.copy
    ? {
        ...fallback,
        ...copyRes.copy,
        templateId: template.id,
        templateName: template.name,
        layout: template.layout,
        palette: template.palette,
        generatedBy: "claude",
        qualityScore: localRun.agentRun.quality.score,
        qualityWarnings: localRun.agentRun.quality.warnings,
        businessSuggestions: localRun.agentRun.business.upsells,
        agentRun: {
          ...localRun.agentRun,
          mode: "ai-assisted",
          finishedAt: new Date().toISOString(),
        },
      }
    : null;

  return {
    copy,
    html: htmlRes.html,
    usage: addUsage(htmlRes.usage, copyRes.usage),
    error: htmlRes.error,
  };
}

export async function POST(req: Request) {
  let evento: EventoDados;
  try {
    evento = (await req.json()) as EventoDados;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!evento?.nome || !evento?.tipo) {
    return NextResponse.json(
      { error: "Campos 'nome' e 'tipo' são obrigatórios." },
      { status: 400 }
    );
  }

  const { model, plan, userId } = await resolveContext();

  // ----- Validação de limites por plano + rate-limit (server-side) -----
  if (userId) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      // Rate-limit: máx N chamadas/usuário em janela curta
      const desdeISO = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
      const { count: recentCount } = await supabase
        .from("usage_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", desdeISO);
      if ((recentCount ?? 0) >= RATE_LIMIT_MAX_CALLS) {
        logger.warn("gerar-site", "rate-limit atingido", { userId, recentCount });
        return NextResponse.json(
          {
            error: `Muitas chamadas em pouco tempo. Tente novamente em ${RATE_LIMIT_WINDOW_SECONDS}s.`,
            code: "rate_limit",
          },
          { status: 429 }
        );
      }

      // Se NÃO tem evento.id, é criação nova → checa max_eventos
      if (!evento.id) {
        const { count: eventosCount } = await supabase
          .from("eventos")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", userId);
        const podeCriar = checkPodeCriarEvento(plan, eventosCount ?? 0);
        if (!podeCriar.ok) {
          return NextResponse.json(
            { error: podeCriar.message, code: podeCriar.code },
            { status: 403 }
          );
        }
      } else {
        // Se tem evento.id, é regeneração → checa limite por evento
        const { count: regenCount } = await supabase
          .from("usage_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("evento_id", evento.id);
        const podeRegenerar = checkPodeRegenerar(plan, regenCount ?? 0);
        if (!podeRegenerar.ok) {
          return NextResponse.json(
            { error: podeRegenerar.message, code: podeRegenerar.code },
            { status: 403 }
          );
        }
      }
    }
  }

  const localRun = runAgentCompany(evento);

  // Provider: Gemini é prioridade quando disponível (mais barato).
  // Anthropic vira fallback se Gemini falhar.
  let copy: GeneratedSite | null = null;
  let html: string | null = null;
  let usage: Usage = emptyUsage();
  let error: string | undefined;
  let providerUsed: "anthropic" | "gemini" = "anthropic";
  let modelUsed: string = model;

  if (isGeminiAvailable()) {
    const r = await generateWithGemini(evento, localRun);
    copy = r.copy;
    html = r.html;
    usage = r.usage;
    error = r.error;
    providerUsed = r.provider;
    modelUsed = r.modelUsed;
  }

  // Fallback Anthropic se Gemini falhou OU se Gemini não está configurado
  if (!html && process.env.ANTHROPIC_API_KEY) {
    const r = await generateWithClaude(evento, model, localRun);
    copy = r.copy;
    html = r.html;
    usage = r.usage;
    error = r.error;
    providerUsed = "anthropic";
    modelUsed = model;
  }

  const siteGerado = copy || (localRun.siteGerado as GeneratedSite);
  const agentRun = siteGerado.agentRun || localRun.agentRun;
  const aiAvailable = isGeminiAvailable() || Boolean(process.env.ANTHROPIC_API_KEY);

  if (userId && aiAvailable) {
    await logUsage({
      userId,
      eventoId: evento.id ?? null,
      model: modelUsed,
      plan,
      usage,
      status: error ? "error" : "ok",
      errorMessage: error,
      provider: providerUsed,
      agentRun,
      qualityScore: siteGerado.qualityScore,
    });
  }

  return NextResponse.json({
    siteGerado,
    siteHtml: html,
    promoData: siteGerado,
    agentRun,
    quality: agentRun.quality,
    business: agentRun.business,
    aiAvailable,
    model: modelUsed,
    plan,
  });
}
