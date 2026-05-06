import { runAgentCompany } from "@/lib/agents/orchestrator";
import type { AgentRunSummary } from "@/lib/agents/types";
import type { EventTemplate } from "./templates";

export type EventoDados = {
  id?: string;
  nome: string;
  tipo: string;
  data: string;
  endereco?: {
    cep?: string;
    rua?: string;
    numero?: string;
    cidade?: string;
    estado?: string;
  };
  imagem?: string;
  selectedPlan?: string;
  briefing?: {
    estilo?: string;
    clima?: string;
    publico?: string;
    corPrincipal?: string;
    descricao?: string;
    detalhes?: Record<string, string>;
    planoSelecionado?: string;
  };
  convidados?: string[];
  siteGerado?: GeneratedSite;
  siteHtml?: string;
};

export type GeneratedSite = {
  templateId: string;
  templateName: string;
  layout: string;
  palette: EventTemplate["palette"];
  heroTitle: string;
  subtitle: string;
  description: string;
  invitationMessage: string;
  highlights: string[];
  ctaLabel: string;
  seoTitle: string;
  seoDescription: string;
  generatedBy: "local-agent" | "claude" | "gemini" | "openai";
  qualityScore?: number;
  qualityWarnings?: string[];
  businessSuggestions?: string[];
  agentRun?: AgentRunSummary;
};

export function generateSiteLocally(evento: EventoDados): GeneratedSite {
  const result = runAgentCompany(evento);
  return result.siteGerado;
}

export function buildEventAddress(evento: EventoDados) {
  const endereco = evento.endereco || {};
  return [endereco.rua, endereco.numero, endereco.cidade, endereco.estado].filter(Boolean).join(", ");
}
