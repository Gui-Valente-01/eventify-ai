import Anthropic from "@anthropic-ai/sdk";
import { generateHtmlWithGemini } from "@/lib/gemini";
import { logger } from "@/lib/logger";
import { sanitizeGeneratedHtml as _sanitize } from "@/lib/htmlSanitize";
import type { TokenUsage } from "@/lib/aiPricing";
import type { AgentCompanyResult, AgentRunSummary, QualityOutput, BusinessOutput } from "@/lib/agents/types";
import type { EventoDados, GeneratedSite } from "@/lib/siteAgent";
import { selectEventTemplate } from "@/lib/templates";
import {
  buildPlanPrompt,
  getPlanDisplayName,
  getPlanGenerationStrategy,
  getSelectedPlanFromEvento,
} from "@/lib/planStrategy";
import { isGeminiAvailable } from "@/lib/gemini";

type Plan = "free" | "basico" | "intermediario" | "premium";

const DEFAULT_MAX_HTML_TOKENS = 10000;

function getMaxHtmlTokens() {
  const raw = Number(process.env.ANTHROPIC_MAX_HTML_TOKENS || DEFAULT_MAX_HTML_TOKENS);
  if (!Number.isFinite(raw)) return DEFAULT_MAX_HTML_TOKENS;
  return Math.min(Math.max(Math.floor(raw), 4000), 32000);
}

type Usage = TokenUsage;

function emptyUsage(): Usage {
  return { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
}

/**
 * Wrapper local que loga quando há remoção.
 * A lógica real está em lib/htmlSanitize.ts pra poder ser reusada no client.
 */
function sanitizeGeneratedHtml(html: string): string {
  const cleaned = _sanitize(html);
  if (cleaned !== html) {
    logger.info("gerar-site", "sanitização removeu data:image/svg+xml malformados", {
      delta: html.length - cleaned.length,
    });
  }
  return cleaned;
}

function addUsage(a: Usage, b: Usage): Usage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheReadTokens: (a.cacheReadTokens ?? 0) + (b.cacheReadTokens ?? 0),
    cacheWriteTokens: (a.cacheWriteTokens ?? 0) + (b.cacheWriteTokens ?? 0),
  };
}

const SYSTEM_PROMPT = `Você gera sites de evento prontos pra publicar. UM documento HTML completo, autocontido, em português.

═══════════════════════════════════════════════════
 REGRA #1 — UMA BARRA DE ROLAGEM SÓ (a da página)
═══════════════════════════════════════════════════
- O <body> rola naturalmente. Mais nada.
- 🔴 NUNCA use \`overflow: auto\`, \`overflow: scroll\`, \`overflow-y: scroll\` em NENHUM elemento (header, section, div, aside, nav, main, body, html).
- 🔴 NUNCA use \`position: fixed\` ou \`position: sticky\` em sidebars, headers que travem na tela, ou barras laterais.
- 🔴 NUNCA crie painéis laterais com altura fixa que rolam internamente.
- ✅ Layout = uma coluna empilhando seções de cima pra baixo. Mobile-first.
- ✅ Hero, sobre, programação, RSVP, etc. um abaixo do outro. Body cresce naturalmente.
- ✅ Em desktop pode usar grid 2-col DENTRO de uma seção (ex: foto + texto lado a lado), mas a SEÇÃO inteira flui no documento.

═══════════════════════════════════════════════════
 REGRA #1b — ALTURAS EM PIXELS, NUNCA em vh
═══════════════════════════════════════════════════
- 🔴 \`min-height\`, \`max-height\`, \`height\` SEMPRE em pixels. NUNCA \`vh\`, \`%\`, \`vmin\`, \`vmax\`.
- Motivo: o preview deste site roda dentro de um \`<iframe>\` com altura dinâmica medida do conteúdo. \`vh\` dentro do iframe é instável (cria loop de feedback: iframe cresce → vh cresce → conteúdo cresce → loop).
- Valores recomendados:
  - Hero: \`min-height: 560px; max-height: 760px\`
  - Outras seções: \`min-height: 320px\` ou apenas \`padding: 80px 5vw\` (sem min-height fixo)
  - Modals/overlays: \`max-height: 600px\`
- 🔴 \`vw\` em padding HORIZONTAL é OK (\`padding: 56px 5vw\`). \`vh\` em padding VERTICAL — evite, use px (\`padding: 80px 5vw\`).
  ✅ \`min-height: 560px;\`
  ✅ \`padding: 80px 5vw;\`
  ❌ \`min-height: 70vh;\`
  ❌ \`height: 100vh;\`
  ❌ \`padding: 10vh 5vw;\` (vh em padding vertical)

═══════════════════════════════════════════════════
 REGRA #2 — HERO LEGÍVEL, COMPACTO, COM TÍTULO IMEDIATO
═══════════════════════════════════════════════════
- 🔴 ALTURA EM PIXELS, NUNCA em \`vh\`/\`vw\`/\`%\`. O preview roda dentro de um iframe com altura dinâmica — \`vh\` cria loop de feedback (iframe cresce → vh cresce → hero cresce → loop infinito).
  ✅ \`min-height: 560px; max-height: 760px;\`
  ❌ \`min-height: 70vh; max-height: 100vh;\`
  ❌ \`height: 100vh;\`
- Título do evento em fonte display, tamanho \`clamp(40px, 8vw, 96px)\`, contraste ALTO com o fundo.
- Padding compacto: \`padding: 56px 5vw\` (vw em padding HORIZONTAL é OK — só ALTURA não pode usar vh).
- Display flex column, items-center, justify-center — assim o título centraliza dentro de um bloco compacto, sem espaço gigante antes ou depois.
- Se houver imagem do evento: use a URL exata fornecida, com overlay escuro por cima (\`background: linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(...) center/cover\`) e texto branco por cima.
- Se NÃO houver imagem: gradiente CSS suave entre 2 cores da paleta. Nunca preto puro de fundo.
- NUNCA use IntersectionObserver/JS pra revelar o título. O hero precisa ficar legível imediatamente, sem espera por animação ou scroll.
- Exemplo válido de hero:
\`\`\`
.hero {
  min-height: 560px;
  max-height: 760px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 56px 5vw;
  background: linear-gradient(135deg, var(--color-primary-soft), var(--color-surface-alt));
  color: var(--color-ink);
  gap: 16px;
}
\`\`\`

═══════════════════════════════════════════════════
 REGRA #3 — SEM URLs/RECURSOS QUEBRADOS
═══════════════════════════════════════════════════
- 🔴 PROIBIDO \`data:image/svg+xml\` em background-image OU em <img src>. Quebra o parser HTML.
- 🔴 PROIBIDO \`source.unsplash.com\` (endpoint morto desde 2023). Nada de \`url('https://source.unsplash.com/...')\`.
- 🔴 PROIBIDO inventar URLs de stock photo (picsum.photos/random, placeholder.com, etc.)
- ✅ Use SÓ a URL exata em \`evento.imagem\` se fornecida.
- ✅ Se PRECISA de SVG decorativo, escreva como elemento \`<svg>\` no HTML, NÃO como data URI.
- ✅ Sem imagem? Use gradiente CSS puro.

═══════════════════════════════════════════════════
 REGRA #4 — ANIMAÇÕES SEM DEPENDÊNCIA DE JS
═══════════════════════════════════════════════════
- Se usar \`opacity: 0\` inicial, OBRIGATÓRIO \`animation: nome 0.7s ease 0.2s forwards\` (com \`forwards\` no fill-mode).
  ✅ \`.fade-up { opacity: 0; animation: fadeUp 0.7s ease 0.2s forwards; } @keyframes fadeUp { to { opacity: 1; transform: none; } }\`
  ❌ \`.fade-up { opacity: 0; } .fade-up.visible { opacity: 1; }\` (depende de JS adicionar .visible — NÃO usar)
- Site precisa renderizar 100% legível mesmo com JS desabilitado.

═══════════════════════════════════════════════════
 CONTEÚDO — DENSO, AUTORAL, SEM CLICHÊ
═══════════════════════════════════════════════════
- Use TODOS os dados do briefing. Cada campo vira pelo menos um trecho de copy.
- Copy LONGO, em parágrafos com narrativa. Nada de "momento mágico" ou "ocasião especial".
- Tom: poético em eventos pessoais; profissional em corporativos; direto em festas.

═══════════════════════════════════════════════════
 SEÇÕES (na ordem)
═══════════════════════════════════════════════════
1. **Hero** — nome, frase autoral, CTA pro RSVP, data formatada.
2. **Contagem regressiva** — dias/horas/minutos/segundos em JS, atualiza a cada segundo.
3. **Sobre** — 2-3 parágrafos densos.
4. **Narrativa específica do tipo**:
   - Casamento → Nossa história em timeline
   - Aniversário → mensagem do aniversariante + tema
   - Corporativo → Por que participar + público-alvo
   - Festa → Manifesto / vibe
   - Religioso → Mensagem / versículo
5. **Programação** — timeline ou cards por horário, quando houver dado.
6. **Pessoas** — padrinhos/palestrantes/celebrante em cards.
7. **Local** — endereço + Google Maps via \`<iframe src="https://www.google.com/maps?q={endereço}&output=embed">\`.
8. **Informações práticas** — dress code, regras, hospedagem (cada item vira um card).
9. **RSVP** — form com input nome + botão; ao confirmar, alerta JS "Presença confirmada".
10. **Presentes/Ingressos** — se houver link/PIX/lotes, botão destacado.
11. **FAQ** — 4-6 perguntas relevantes.
12. **Footer** — hashtag, contato, créditos.

═══════════════════════════════════════════════════
 DESIGN SYSTEM
═══════════════════════════════════════════════════
- Use as CSS variables do bloco "SISTEMA DE DESIGN" no contexto. Copie literalmente no \`:root\`.
- SEMPRE \`var(--color-primary)\` em vez de hex direto.
- Fontes: Google Fonts (apenas as nomeadas em --font-display e --font-body).
- Mobile-first, breakpoints em \`>=768px\` e \`>=1024px\`.

═══════════════════════════════════════════════════
 FORMATO DE SAÍDA
═══════════════════════════════════════════════════
- Começa LITERAL com \`<!DOCTYPE html>\`. Sem texto antes, sem markdown, sem cercas \`\`\`.
- \`<html lang="pt-BR">\`, \`<head>\` com charset/viewport/title/description.
- CSS INLINE em \`<style>\` no \`<head>\`. CSS PURO. Sem Tailwind/Bootstrap/CDN.
- 🔴 CSS no máximo 4000 caracteres. Seja conciso.
- JS inline no final do \`<body>\` (countdown, RSVP).
- Termina com \`</html>\`.
- 🔴 PROIBIDO: \`class="bg-blue-500"\` (Tailwind), \`<script src="cdn.tailwindcss.com">\`, frameworks via CDN.

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

${evento.imagem ? `🖼️ IMAGEM DO EVENTO disponível em: ${evento.imagem}
USAR COMO: background do hero COM overlay escuro obrigatório por cima — \`background: linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url("${evento.imagem}") center/cover\`. O título DO EVENTO precisa ficar legível em branco/marfim por cima desse overlay. ALTURA do hero: 70vh, no máximo 100vh — não passa disso.` : ""}

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

    const usage: Usage = {
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
      cacheReadTokens: response.usage?.cache_read_input_tokens ?? 0,
      cacheWriteTokens: response.usage?.cache_creation_input_tokens ?? 0,
    };

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { html: null, usage };

    let html = textBlock.text.trim();
    html = html.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "");
    if (!html.toLowerCase().startsWith("<!doctype")) {
      const idx = html.toLowerCase().indexOf("<!doctype");
      if (idx !== -1) html = html.slice(idx);
    }
    const finalHtml = html.toLowerCase().includes("<!doctype") ? sanitizeGeneratedHtml(html) : null;
    return {
      html: finalHtml,
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
    const usage: Usage = {
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
      cacheReadTokens: response.usage?.cache_read_input_tokens ?? 0,
      cacheWriteTokens: response.usage?.cache_creation_input_tokens ?? 0,
    };
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

export async function generateWithGemini(
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

export async function generateWithClaude(
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

export async function generateSite(
  evento: EventoDados,
  model: string,
  plan: Plan,
  userId: string | null,
  localRun: AgentCompanyResult,
  logUsageFn: (args: {
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
  }) => Promise<void>
): Promise<{
  siteGerado: GeneratedSite;
  siteHtml: string | null;
  agentRun: AgentRunSummary;
  quality: QualityOutput;
  business: BusinessOutput;
  aiAvailable: boolean;
  modelUsed: string;
  plan: Plan;
}> {
  // Provider: Gemini é prioridade quando disponível (mais barato).
  // Anthropic vira fallback se Gemini falhar.
  let copy: GeneratedSite | null = null;
  let html: string | null = null;
  let usage: Usage = emptyUsage();
  let error: string | undefined;
  let providerUsed: "anthropic" | "gemini" | "local" = "local";
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

  // Fallback Anthropic está desativado em produção — está sem crédito e
  // só causaria atraso. Re-ativar removendo o "false &&" abaixo quando o
  // saldo voltar.
  if (false && !html && process.env.ANTHROPIC_API_KEY) {
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
    await logUsageFn({
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

  return {
    siteGerado,
    siteHtml: html ? sanitizeGeneratedHtml(html) : html,
    agentRun,
    quality: agentRun.quality,
    business: agentRun.business,
    aiAvailable,
    modelUsed,
    plan,
  };
}
