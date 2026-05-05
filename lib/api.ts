import type { EventoDados } from "@/hooks/useEventos";
import type { GeneratedSite } from "@/lib/siteAgent";
import type { AgentRunSummary, BusinessOutput, QualityOutput } from "@/lib/agents/types";

export type GerarSiteResultado = {
  siteGerado: GeneratedSite | null;
  siteHtml: string | null;
  aiAvailable: boolean;
  agentRun?: AgentRunSummary | null;
  quality?: QualityOutput | null;
  business?: BusinessOutput | null;
  model?: string;
  plan?: string;
  erro?: string;
};

export async function gerarSiteAPI(evento: EventoDados): Promise<GerarSiteResultado> {
  try {
    const res = await fetch("/api/gerar-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evento),
    });

    if (!res.ok) {
      const erroJson = await res.json().catch(() => null);
      return {
        siteGerado: null,
        siteHtml: null,
        aiAvailable: false,
        agentRun: null,
        quality: null,
        business: null,
        erro: erroJson?.error || `Falha ao gerar site (HTTP ${res.status}).`,
      };
    }

    const dados = await res.json();
    return {
      siteGerado: dados.siteGerado || null,
      siteHtml: dados.siteHtml || null,
      aiAvailable: Boolean(dados.aiAvailable),
      agentRun: dados.agentRun || null,
      quality: dados.quality || null,
      business: dados.business || null,
      model: dados.model,
      plan: dados.plan,
    };
  } catch (error) {
    return {
      siteGerado: null,
      siteHtml: null,
      aiAvailable: false,
      agentRun: null,
      quality: null,
      business: null,
      erro: error instanceof Error ? error.message : "Erro de rede ao gerar site.",
    };
  }
}
