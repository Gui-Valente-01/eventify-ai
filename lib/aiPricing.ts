// Preços públicos da Anthropic (USD por 1M tokens) — atualize se mudarem.
// https://www.anthropic.com/pricing
export type ModelPricing = {
  inputPerMTok: number;
  outputPerMTok: number;
  cacheReadPerMTok: number;
  cacheWritePerMTok: number;
};

const PRICING: Record<string, ModelPricing> = {
  "claude-opus-4-7": {
    inputPerMTok: 15,
    outputPerMTok: 75,
    cacheReadPerMTok: 1.5,
    cacheWritePerMTok: 18.75,
  },
  "claude-sonnet-4-6": {
    inputPerMTok: 3,
    outputPerMTok: 15,
    cacheReadPerMTok: 0.3,
    cacheWritePerMTok: 3.75,
  },
  "claude-haiku-4-5-20251001": {
    inputPerMTok: 1,
    outputPerMTok: 5,
    cacheReadPerMTok: 0.1,
    cacheWritePerMTok: 1.25,
  },
};

const DEFAULT_PRICING = PRICING["claude-haiku-4-5-20251001"];

export function getPricing(model: string): ModelPricing {
  return PRICING[model] || DEFAULT_PRICING;
}

export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
};

export function calcularCustoUSD(model: string, usage: TokenUsage): number {
  const p = getPricing(model);
  const cost =
    (usage.inputTokens * p.inputPerMTok) / 1_000_000 +
    (usage.outputTokens * p.outputPerMTok) / 1_000_000 +
    ((usage.cacheReadTokens ?? 0) * p.cacheReadPerMTok) / 1_000_000 +
    ((usage.cacheWriteTokens ?? 0) * p.cacheWritePerMTok) / 1_000_000;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

export function formatBRL(usd: number, brlPerUsd = 5.4): string {
  return (usd * brlPerUsd).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatUSD(usd: number): string {
  return usd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
  });
}
