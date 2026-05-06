import { describe, it, expect } from "vitest";
import { formatCentsBRL, formatStripeDate } from "@/lib/stripe";

describe("stripe formatters", () => {
  describe("formatCentsBRL", () => {
    it("converte centavos pra real formatado pt-BR", () => {
      const r = formatCentsBRL(2900);
      expect(r).toMatch(/29,00/);
      expect(r).toMatch(/R\$/);
    });

    it("aceita zero", () => {
      const r = formatCentsBRL(0);
      expect(r).toMatch(/0,00/);
    });

    it("respeita currency override", () => {
      const r = formatCentsBRL(1000, "USD");
      expect(r).toMatch(/10[.,]00/);
    });

    it("formata números grandes com milhar", () => {
      const r = formatCentsBRL(1234567);
      // R$ 12.345,67 (pt-BR usa ponto como separador de milhar)
      expect(r).toMatch(/12\.345,67/);
    });
  });

  describe("formatStripeDate", () => {
    it("retorna em-dash pra timestamp 0", () => {
      expect(formatStripeDate(0)).toBe("—");
    });

    it("formata unix seconds em dd/mm/yyyy", () => {
      // 1700000000 = 14/11/2023 22:13 UTC
      const r = formatStripeDate(1700000000);
      expect(r).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });
});
