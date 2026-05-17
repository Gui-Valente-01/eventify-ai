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

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_TRIES = 60;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function adaptResult(data: Record<string, unknown>): GerarSiteResultado {
  return {
    siteGerado: (data.siteGerado as GeneratedSite | null) || null,
    siteHtml: (data.siteHtml as string | null) || null,
    aiAvailable: Boolean(data.aiAvailable),
    agentRun: (data.agentRun as AgentRunSummary | null) || null,
    quality: (data.quality as QualityOutput | null) || null,
    business: (data.business as BusinessOutput | null) || null,
    model: data.model as string | undefined,
    plan: data.plan as string | undefined,
  };
}

async function pollJob(jobId: string): Promise<GerarSiteResultado> {
  for (let i = 0; i < POLL_MAX_TRIES; i++) {
    await sleep(POLL_INTERVAL_MS);
    try {
      const res = await fetch(`/api/gerar-site/${jobId}`);
      if (!res.ok) {
        if (res.status === 404 || res.status === 401 || res.status === 403) {
          return {
            siteGerado: null,
            siteHtml: null,
            aiAvailable: false,
            erro: `Falha ao consultar job (HTTP ${res.status}).`,
          };
        }
        continue;
      }
      const data = await res.json();
      if (data.status === "done") {
        return adaptResult((data.output || {}) as Record<string, unknown>);
      }
      if (data.status === "failed") {
        return {
          siteGerado: null,
          siteHtml: null,
          aiAvailable: false,
          erro: data.error || "Geração falhou.",
        };
      }
      if (data.status === "stale") {
        return {
          siteGerado: null,
          siteHtml: null,
          aiAvailable: false,
          erro: "Geração travou. Tente novamente.",
        };
      }
    } catch {
      // segue tentando
    }
  }
  return {
    siteGerado: null,
    siteHtml: null,
    aiAvailable: false,
    erro: "Tempo esgotado aguardando a geração.",
  };
}

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
        erro: erroJson?.error || `Falha ao gerar site (HTTP ${res.status}).`,
      };
    }

    const dados = await res.json();

    if (dados.jobId && dados.status === "pending") {
      return await pollJob(dados.jobId as string);
    }

    return adaptResult(dados as Record<string, unknown>);
  } catch (error) {
    return {
      siteGerado: null,
      siteHtml: null,
      aiAvailable: false,
      erro: error instanceof Error ? error.message : "Erro de rede ao gerar site.",
    };
  }
}
