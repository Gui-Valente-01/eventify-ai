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
  return JSON.stringify(
    {
      event: {
        nome: args.evento.nome,
        tipo: args.evento.tipo,
        data: args.evento.data,
        endereco: args.location.address,
        briefing: args.evento.briefing || {},
      },
      creativeDirection: args.interpretation,
      designSystem: {
        templateId: args.design.template.id,
        templateName: args.design.template.name,
        layout: args.design.template.layout,
        palette: args.design.template.palette,
        typography: args.design.typography,
        visualRules: args.design.visualRules,
        differentiators: args.design.differentiators,
      },
      imageStrategy: args.image,
      business: args.business,
    },
    null,
    2
  );
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
    promptContext: buildPromptContext({ evento, interpretation, design, location, image, business }),
  };
}
