import {
  copywriterAgent,
  designerAgent,
  guestAgent,
  imageAgent,
  interpretationAgent,
  locationAgent,
  qualityAgent,
  siteBuilderAgent,
} from "./productAgents";
import { businessAgent } from "./businessAgents";
import { buildPlanPrompt, getPlanGenerationStrategy, getSelectedPlanFromEvento } from "@/lib/planStrategy";
import type {
  AgentCompanyResult,
  AgentEvento,
  AgentRunSummary,
  AgentStep,
  BusinessOutput,
  BuilderOutput,
  CopyOutput,
  DesignOutput,
  GuestOutput,
  ImageOutput,
  InterpretationOutput,
  LocationOutput,
  QualityOutput,
} from "./types";

function makeRunId() {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `agent-run-${random}`;
}

function step(
  id: string,
  agent: string,
  summary: string,
  output: Record<string, unknown>,
  status: AgentStep["status"] = "ok",
  category: AgentStep["category"] = "product"
): AgentStep {
  return { id, agent, category, status, summary, output };
}

function buildSteps(args: {
  interpretation: InterpretationOutput;
  design: DesignOutput;
  copy: CopyOutput;
  location: LocationOutput;
  guests: GuestOutput;
  image: ImageOutput;
  builder: BuilderOutput;
  quality: QualityOutput;
  business: BusinessOutput;
}): AgentStep[] {
  return [
    step("interpretation", "Agente de Interpretacao", "Briefing traduzido em direcao criativa.", args.interpretation, args.interpretation.risks.length ? "warning" : "ok"),
    step("designer", "Agente Designer UI/UX", "Template, paleta, tipografia e composicao definidos.", {
      templateId: args.design.template.id,
      templateName: args.design.template.name,
      layoutIntent: args.design.layoutIntent,
      typography: args.design.typography,
      differentiators: args.design.differentiators,
    }),
    step("copywriter", "Agente Copywriter", "Copy promocional gerada para o tipo do evento.", args.copy),
    step("location", "Agente de Localizacao", "Endereco e mapa preparados.", args.location, args.location.issues.length ? "warning" : "ok"),
    step("guests", "Agente de Convidados", "RSVP analisado e normalizado.", args.guests, args.guests.duplicates.length ? "warning" : "ok"),
    step("images", "Agente de Imagens", "Estrategia visual de imagem definida.", args.image),
    step("builder", "Agente Gerador de Site", "Secoes finais e estrutura de publicacao montadas.", args.builder, args.builder.publishReady ? "ok" : "warning"),
    step("optimizer", "Agente de Otimizacao", "Checklist automatico de qualidade aplicado.", args.quality, args.quality.blockers.length ? "error" : args.quality.warnings.length ? "warning" : "ok", "support"),
    step("business", "Agentes de Marketing e Monetizacao", "Ganchos, upsells e proximas acoes criados.", args.business, "ok", "marketing"),
  ];
}

function buildPromptContext(args: {
  evento: AgentEvento;
  interpretation: InterpretationOutput;
  design: DesignOutput;
  location: LocationOutput;
  image: ImageOutput;
  business: BusinessOutput;
}) {
  const selectedPlan = getSelectedPlanFromEvento(args.evento);
  const strategy = getPlanGenerationStrategy(selectedPlan);
  const { spec } = args.design;
  const p = spec.palette;

  // Sistema de design CONCRETO — Gemini deve copiar literalmente.
  const designSystemBlock = `
🎨 SISTEMA DE DESIGN OBRIGATÓRIO (use EXATAMENTE esses valores como CSS variables no <style> do <head>):

:root {
  --color-primary: ${p.primary};
  --color-primary-dark: ${p.primaryDark};
  --color-primary-soft: ${p.primarySoft};
  --color-accent: ${p.accent};
  --color-surface: ${p.surface};
  --color-surface-alt: ${p.surfaceAlt};
  --color-ink: ${p.ink};
  --color-ink-muted: ${p.inkMuted};
  --font-display: ${spec.fontDisplay};
  --font-body: ${spec.fontBody};
  --radius-card: ${spec.radius.card};
  --radius-button: ${spec.radius.button};
  --section-y: ${spec.spacing.sectionY};
  --card-pad: ${spec.spacing.cardPad};
  --gap: ${spec.spacing.gap};
}

REGRAS DE APLICAÇÃO (não negociáveis):
- Headings (h1-h3) usam var(--font-display), peso 700, letter-spacing -0.02em.
  - h1: ${spec.scale.h1}
  - h2: ${spec.scale.h2}
  - h3: ${spec.scale.h3}
- Body usa var(--font-body), peso 400, line-height 1.65, font-size ${spec.scale.body}.
- Botões: border-radius var(--radius-button), padding 0.9rem 1.8rem, transition 200ms ease.
  - Primary: background var(--color-primary), color #fff, hover translateY(-2px) + shadow.
  - Ghost: background transparent, border 1.5px solid var(--color-ink), color var(--color-ink).
- Cards: border-radius var(--radius-card), padding var(--card-pad), background var(--color-surface), border 1px solid color-mix(in srgb, var(--color-ink) 8%, transparent).
- Sections: padding var(--section-y) 24px. Alternar background entre var(--color-surface) e var(--color-surface-alt).
- Imagens: border-radius var(--radius-card), object-fit cover.
- Foco visível em todos inputs/botões: outline 3px solid color-mix(in srgb, var(--color-primary) 30%, transparent).

ANIMAÇÕES (aplicar exatamente):
${spec.motionRules.map((r, i) => `  ${i + 1}. ${r}`).join("\n")}

DIRETIVAS CRIATIVAS:
- Vibe geral: ${args.design.template.layout} (${args.design.layoutIntent})
- Diferenciais: ${args.design.differentiators.join(" · ")}
- Tom de voz: ${args.interpretation.mood}
- Público alvo: ${args.interpretation.audience}

REGRAS RÍGIDAS:
${args.design.visualRules.map((r) => `- ${r}`).join("\n")}

CONTEXTO ADICIONAL (JSON — use pra copy):
${JSON.stringify({
  event: {
    nome: args.evento.nome,
    tipo: args.evento.tipo,
    data: args.evento.data,
    endereco: args.location.address,
    briefing: args.evento.briefing || {},
  },
  selectedPlan,
  selectedPlanStrategy: strategy,
  imageStrategy: args.image,
  business: args.business,
}, null, 2)}
`.trim();

  return designSystemBlock;
}

export function runAgentCompany(evento: AgentEvento): AgentCompanyResult {
  const startedMs = Date.now();
  const startedAt = new Date(startedMs).toISOString();

  const interpretation = interpretationAgent(evento);
  const design = designerAgent(evento, interpretation);
  const copy = copywriterAgent(evento, interpretation, design);
  const location = locationAgent(evento);
  const guests = guestAgent(evento);
  const image = imageAgent(evento, design);
  const builder = siteBuilderAgent(evento, location, guests);
  const quality = qualityAgent({ interpretation, design, location, guests, builder, copy });
  const business = businessAgent({ evento, design, copy, quality });
  const finishedMs = Date.now();

  const agents = buildSteps({
    interpretation,
    design,
    copy,
    location,
    guests,
    image,
    builder,
    quality,
    business,
  });

  const agentRun: AgentRunSummary = {
    id: makeRunId(),
    mode: "local",
    startedAt,
    finishedAt: new Date(finishedMs).toISOString(),
    durationMs: finishedMs - startedMs,
    eventType: evento.tipo,
    templateId: design.template.id,
    agents,
    interpretation,
    design: {
      templateId: design.template.id,
      templateName: design.template.name,
      layoutIntent: design.layoutIntent,
      typography: design.typography,
      visualRules: design.visualRules,
      differentiators: design.differentiators,
      spec: design.spec,
    },
    location,
    guests,
    image,
    builder,
    quality,
    business,
  };

  return {
    siteGerado: {
      ...copy,
      templateId: design.template.id,
      templateName: design.template.name,
      layout: design.template.layout,
      palette: design.template.palette,
      generatedBy: "local-agent",
      qualityScore: quality.score,
      qualityWarnings: quality.warnings,
      businessSuggestions: business.upsells,
      agentRun,
    },
    agentRun,
    promptContext: `${buildPlanPrompt(getSelectedPlanFromEvento(evento))}\n\nCONTEXTO DOS AGENTES:\n${buildPromptContext({ evento, interpretation, design, location, image, business })}`,
  };
}
