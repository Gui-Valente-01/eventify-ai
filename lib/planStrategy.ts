import { PLANS, type PlanId } from "@/lib/plans";

export const DEFAULT_SELECTED_PLAN: PlanId = "intermediario";

const PLAN_IDS: PlanId[] = ["basico", "intermediario", "premium"];

export type PlanCarrier = {
  selectedPlan?: string | null;
  paidPlan?: string | null;
  briefing?: {
    planoSelecionado?: string | null;
  } | null;
};

export type PlanGenerationStrategy = {
  planId: PlanId;
  nome: string;
  intensidade: "essencial" | "completa" | "premium";
  posicionamento: string;
  secoesObrigatorias: string[];
  design: string[];
  copy: string[];
  limites: string[];
};

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && PLAN_IDS.includes(value as PlanId);
}

export function normalizePlanId(value: unknown): PlanId {
  return isPlanId(value) ? value : DEFAULT_SELECTED_PLAN;
}

export function getSelectedPlanFromEvento(evento?: PlanCarrier | null): PlanId {
  return normalizePlanId(
    evento?.selectedPlan || evento?.briefing?.planoSelecionado || evento?.paidPlan
  );
}

export function getPlanDisplayName(planId: string | null | undefined) {
  const normalized = normalizePlanId(planId);
  return PLANS.find((plan) => plan.id === normalized)?.nome ?? "Intermediario";
}

export const PLAN_GENERATION_STRATEGY: Record<PlanId, PlanGenerationStrategy> = {
  basico: {
    planId: "basico",
    nome: "Basico",
    intensidade: "essencial",
    posicionamento: "Site simples, claro e profissional para publicar rapido.",
    secoesObrigatorias: [
      "Hero direto com nome, data e chamada principal",
      "Sobre o evento em texto curto",
      "Data, horario e local com mapa",
      "RSVP simples",
      "Footer com contato ou assinatura do evento",
    ],
    design: [
      "Visual limpo, poucas secoes e carregamento leve",
      "Paleta com 1 cor principal e neutros",
      "Animas sutis apenas se nao aumentarem complexidade",
      "Sem secoes extensas, efeitos premium ou narrativa longa",
    ],
    copy: [
      "Texto objetivo e elegante",
      "Evitar excesso de storytelling",
      "Priorizar informacao, clareza e compartilhamento",
    ],
    limites: [
      "Nao criar agenda complexa se o cliente nao informou agenda",
      "Nao criar blocos premium como depoimentos, galeria editorial ou FAQ longo",
    ],
  },
  intermediario: {
    planId: "intermediario",
    nome: "Intermediario",
    intensidade: "completa",
    posicionamento: "Site completo para vender melhor o evento e organizar convidados.",
    secoesObrigatorias: [
      "Hero forte com CTA",
      "Contagem regressiva",
      "Sobre o evento",
      "Agenda ou programacao quando houver dados",
      "Local com mapa",
      "Informacoes praticas",
      "RSVP",
      "FAQ curto",
      "Footer com compartilhamento",
    ],
    design: [
      "Layout mais rico, com cards, contraste e hierarquia clara",
      "Microinteracoes discretas",
      "Visual responsivo com secoes bem separadas",
      "Usar QR Code ou chamada para compartilhar quando fizer sentido",
    ],
    copy: [
      "Copy com mais contexto e valor percebido",
      "Linguagem personalizada pelo tipo do evento",
      "Destacar beneficios para o convidado ou participante",
    ],
    limites: [
      "Nao exagerar em efeitos de luxo",
      "Manter site objetivo e facil de navegar",
    ],
  },
  premium: {
    planId: "premium",
    nome: "Premium",
    intensidade: "premium",
    posicionamento: "Experiencia editorial, sofisticada e altamente personalizada.",
    secoesObrigatorias: [
      "Hero cinematografico ou editorial",
      "Contagem regressiva refinada",
      "Narrativa completa baseada no briefing",
      "Secao especifica do tipo de evento com storytelling",
      "Agenda, pessoas, presentes/ingressos/inscricao quando houver dados",
      "Local com mapa e bloco como chegar",
      "Informacoes praticas em cards",
      "RSVP com estado visual",
      "FAQ completo",
      "Footer premium com contato, hashtag ou rede social",
    ],
    design: [
      "Identidade visual mais autoral e menos generica",
      "Tipografia display bem escolhida",
      "Composicao com profundidade visual, grids e secoes memoraveis",
      "Animas e transicoes refinadas sem prejudicar performance",
    ],
    copy: [
      "Copy mais longa, emocional ou estrategica conforme o evento",
      "Usar todos os detalhes do briefing de forma visivel",
      "Criar percepcao de site feito sob medida e de alto valor",
    ],
    limites: [
      "Nao usar texto generico",
      "Nao entregar layout parecido com plano basico",
      "Evitar placeholders e secoes vazias",
    ],
  },
};

export function getPlanGenerationStrategy(planId: string | null | undefined) {
  return PLAN_GENERATION_STRATEGY[normalizePlanId(planId)];
}

export function buildPlanPrompt(planId: string | null | undefined) {
  const strategy = getPlanGenerationStrategy(planId);
  return [
    `PLANO ESCOLHIDO PELO CLIENTE: ${strategy.nome}`,
    `Nivel de entrega: ${strategy.intensidade}`,
    `Posicionamento: ${strategy.posicionamento}`,
    "",
    "Secoes obrigatorias para este plano:",
    ...strategy.secoesObrigatorias.map((item) => `- ${item}`),
    "",
    "Direcao de design:",
    ...strategy.design.map((item) => `- ${item}`),
    "",
    "Direcao de copy:",
    ...strategy.copy.map((item) => `- ${item}`),
    "",
    "Limites do plano:",
    ...strategy.limites.map((item) => `- ${item}`),
  ].join("\n");
}
