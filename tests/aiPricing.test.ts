import { describe, it, expect } from "vitest";
import {
  calcularCustoUSD,
  getPricing,
  formatBRL,
  formatUSD,
} from "@/lib/aiPricing";

describe("aiPricing", () => {
  describe("getPricing", () => {
    it("retorna preços conhecidos", () => {
      expect(getPricing("claude-opus-4-7").outputPerMTok).toBe(75);
      expect(getPricing("gemini-2.5-flash").outputPerMTok).toBe(2.5);
    });

    it("usa fallback (Haiku) pra modelo desconhecido", () => {
      const p = getPricing("modelo-que-nao-existe");
      expect(p.outputPerMTok).toBe(5); // Haiku 4.5
    });
  });

  describe("calcularCustoUSD", () => {
    it("calcula custo zero pra usage zero", () => {
      const c = calcularCustoUSD("claude-opus-4-7", {
        inputTokens: 0,
        outputTokens: 0,
      });
      expect(c).toBe(0);
    });

    it("calcula custo de 1M input tokens com Opus 4.7", () => {
      const c = calcularCustoUSD("claude-opus-4-7", {
        inputTokens: 1_000_000,
        outputTokens: 0,
      });
      // $15/M input
      expect(c).toBeCloseTo(15, 4);
    });

    it("calcula custo de 1M output tokens com Opus 4.7", () => {
      const c = calcularCustoUSD("claude-opus-4-7", {
        inputTokens: 0,
        outputTokens: 1_000_000,
      });
      expect(c).toBeCloseTo(75, 4);
    });

    it("soma input + output corretamente", () => {
      const c = calcularCustoUSD("claude-haiku-4-5-20251001", {
        inputTokens: 100_000,
        outputTokens: 100_000,
      });
      // $1/M in + $5/M out × 0.1M = 0.1 + 0.5 = 0.6
      expect(c).toBeCloseTo(0.6, 4);
    });

    it("inclui cache reads e writes", () => {
      const c = calcularCustoUSD("claude-opus-4-7", {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 1_000_000,
        cacheWriteTokens: 1_000_000,
      });
      // $1.5/M read + $18.75/M write
      expect(c).toBeCloseTo(20.25, 4);
    });

    it("Gemini 2.5 Flash é dramaticamente mais barato que Opus", () => {
      const usage = { inputTokens: 100_000, outputTokens: 30_000 };
      const opus = calcularCustoUSD("claude-opus-4-7", usage);
      const flash = calcularCustoUSD("gemini-2.5-flash", usage);
      expect(flash).toBeLessThan(opus / 10); // pelo menos 10x mais barato
    });
  });

  describe("formatBRL", () => {
    it("converte USD pra BRL com taxa default 5.4", () => {
      const r = formatBRL(10);
      expect(r).toMatch(/54,00/);
    });

    it("aceita taxa custom", () => {
      const r = formatBRL(10, 6);
      expect(r).toMatch(/60,00/);
    });
  });

  describe("formatUSD", () => {
    it("formata em USD com 4 decimais", () => {
      const r = formatUSD(0.0123);
      expect(r).toMatch(/\$/);
      expect(r).toMatch(/0\.0123/);
    });
  });
});
