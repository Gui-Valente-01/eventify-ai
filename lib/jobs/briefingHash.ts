import { createHash } from "node:crypto";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type BriefingLike = {
  estilo?: string;
  clima?: string;
  publico?: string;
  corPrincipal?: string;
  descricao?: string;
  detalhes?: Record<string, string>;
  planoSelecionado?: string;
  templateId?: string;
  customTemplate?: {
    paleta?: string[];
    fontDisplayId?: string;
    fontBodyId?: string;
  };
};

type EventoLike = {
  tipo: string;
  imagem?: string;
  selectedPlan?: string;
  briefing?: BriefingLike;
};

/**
 * Calcula hash determinístico das partes do briefing que afetam a geração.
 * Mudou qualquer um dos campos abaixo → cache invalida.
 *
 * NÃO inclui: nome, data, endereço (esses são editados sem precisar regerar),
 * convidados, status, paid_*, siteHtml, siteGerado.
 */
export function hashBriefing(evento: EventoLike): string {
  const briefing: BriefingLike = evento.briefing || {};
  const customTemplate = briefing.customTemplate;

  const relevant = {
    tipo: evento.tipo,
    imagem: evento.imagem || null,
    selectedPlan: evento.selectedPlan || null,
    briefing: {
      estilo: briefing.estilo || null,
      clima: briefing.clima || null,
      publico: briefing.publico || null,
      corPrincipal: briefing.corPrincipal || null,
      descricao: briefing.descricao || null,
      planoSelecionado: briefing.planoSelecionado || null,
      templateId: briefing.templateId || null,
      detalhes: briefing.detalhes || null,
    },
    customTemplate: customTemplate
      ? {
          paleta: customTemplate.paleta || null,
          fontDisplayId: customTemplate.fontDisplayId || null,
          fontBodyId: customTemplate.fontBodyId || null,
        }
      : null,
  };

  const json = JSON.stringify(relevant, Object.keys(relevant).sort());
  return createHash("sha256").update(json).digest("hex").slice(0, 32);
}

/**
 * Cache é válido se o hash bate, siteHtml existe e foi gerado nos últimos 7 dias.
 */
export function isCacheValid(args: {
  storedHash?: string | null;
  newHash: string;
  storedSiteHtml?: string | null;
  cachedAt?: string | null;
}): boolean {
  if (!args.storedHash || !args.storedSiteHtml) return false;
  if (args.storedHash !== args.newHash) return false;
  if (!args.cachedAt) return false;

  const ageMs = Date.now() - new Date(args.cachedAt).getTime();
  if (ageMs > CACHE_TTL_MS) return false;

  return true;
}
