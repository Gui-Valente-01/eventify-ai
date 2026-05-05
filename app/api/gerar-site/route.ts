import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  generateSiteLocally,
  EventoDados,
  GeneratedSite,
} from "@/lib/siteAgent";
import { selectEventTemplate } from "@/lib/templates";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { calcularCustoUSD, type TokenUsage } from "@/lib/aiPricing";

export const runtime = "nodejs";
export const maxDuration = 120;

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
  model: string;
  plan: Plan;
  usage: Usage;
  status: "ok" | "error";
  errorMessage?: string;
}) {
  if (!args.userId) return;
  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return;
    const cost = calcularCustoUSD(args.model, args.usage);
    await supabase.from("usage_logs").insert({
      user_id: args.userId,
      model: args.model,
      plan: args.plan,
      input_tokens: args.usage.inputTokens,
      output_tokens: args.usage.outputTokens,
      cache_read_tokens: args.usage.cacheReadTokens ?? 0,
      cache_write_tokens: args.usage.cacheWriteTokens ?? 0,
      cost_usd: cost,
      status: args.status,
      error_message: args.errorMessage ?? null,
    });
  } catch (e) {
    console.error("[gerar-site] falha ao gravar usage_logs:", e);
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

🎨 DESIGN:
- Identidade visual coerente com o estilo + clima + cor principal informados.
- Tipografia: Inter via Google Fonts + UMA fonte display escolhida pelo estilo (Playfair Display para clássico/romântico, Bebas Neue para festa, Space Grotesk para corporativo, etc).
- Use a cor principal de forma consistente (botões, destaques, gradientes), com paleta auxiliar harmônica.
- Mobile-first, 100% responsivo.
- Animações sutis: fade-in on scroll (IntersectionObserver), hover suaves, contagem animada.
- Espaçamento generoso entre seções (padding y mínimo 80px desktop, 48px mobile).

💻 FORMATO DE SAÍDA — OBRIGATÓRIO:
- UM ÚNICO documento HTML autocontido.
- Começa LITERALMENTE com \`<!DOCTYPE html>\`. Sem texto antes.
- \`<html lang="pt-BR">\`, \`<head>\` com charset, viewport, title e meta description (use o briefing pra escrever).
- Tailwind via CDN: \`<script src="https://cdn.tailwindcss.com"></script>\`.
- Google Fonts no \`<head>\`.
- CSS extra em \`<style>\` no head.
- JS no final do \`<body>\` (countdown, RSVP alert, IntersectionObserver, smooth scroll).
- Termina com \`</html>\`. SEM cercas markdown, SEM explicação, SEM comentário fora do HTML.

🚫 PROIBIDO:
- Texto fora do HTML
- Cercas \`\`\`html
- Comentários do tipo "aqui está o site"
- Seções com placeholder vazio ("Em breve", "Lorem ipsum")
- Imagens externas com URL inventada — use placeholders Tailwind (gradientes, formas SVG) ou a imagem do evento se fornecida

ENTREGUE O HTML DIRETO. SEM PREÂMBULO.`;

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

function buildUserPrompt(evento: EventoDados): string {
  const e = evento.endereco || {};
  const b = evento.briefing || {};
  const detalhes = b.detalhes || {};

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

📍 LOCAL:
Endereço completo: ${enderecoCompleto || "(não informado)"}
Para o iframe Google Maps, use a URL: https://www.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&output=embed

🎨 BRIEFING CRIATIVO:
- Estilo visual: ${b.estilo || "(livre — escolha algo coerente com o tipo)"}
- Clima: ${b.clima || "(livre)"}
- Público: ${b.publico || "(livre)"}
- Cor principal: ${b.corPrincipal || "(livre)"}
- Descrição do cliente: ${b.descricao ? `"${b.descricao}"` : "(não informada)"}

📋 DETALHES ESPECÍFICOS DO TIPO (use TODOS — cada um vira seção/conteúdo):
${detalhesTexto || "(o cliente não preencheu detalhes — invente algo coerente baseado no briefing geral, mas marque essas seções com texto curto)"}

${evento.imagem ? `🖼️ IMAGEM DO EVENTO disponível em: ${evento.imagem} — use no hero como background ou destaque.` : ""}

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
  modelId: string
): Promise<{ html: string | null; usage: Usage; error?: string }> {
  try {
    const response = await client.messages.create({
      model: modelId,
      max_tokens: 32000,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: buildUserPrompt(evento) }],
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
    console.error("[gerar-site] HTML —", msg);
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

async function generateWithClaude(
  evento: EventoDados,
  modelId: string
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
  const fallback = generateSiteLocally(evento);

  const [htmlRes, copyRes] = await Promise.all([
    generateCustomHTML(client, evento, modelId),
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
  const { copy, html, usage, error } = await generateWithClaude(evento, model);
  const siteGerado = copy || generateSiteLocally(evento);

  if (process.env.ANTHROPIC_API_KEY) {
    void logUsage({
      userId,
      model,
      plan,
      usage,
      status: error ? "error" : "ok",
      errorMessage: error,
    });
  }

  return NextResponse.json({
    siteGerado,
    siteHtml: html,
    promoData: siteGerado,
    aiAvailable: Boolean(process.env.ANTHROPIC_API_KEY),
    model,
    plan,
  });
}
