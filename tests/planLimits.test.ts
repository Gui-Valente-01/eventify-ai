import { describe, it, expect } from "vitest";
import {
  checkPodeCriarEvento,
  checkPodeRegenerar,
  checkPodePublicar,
  getPlanLimits,
} from "@/lib/planLimits";

describe("planLimits", () => {
  describe("getPlanLimits", () => {
    it("retorna limites do plano free pra valores inválidos", () => {
      const limits = getPlanLimits(null);
      expect(limits.maxEventos).toBe(1);
      expect(limits.permitePublicar).toBe(false);
      expect(limits.watermark).toBe(true);
    });

    it("retorna limites corretos pra cada plano nominal", () => {
      expect(getPlanLimits("free").maxEventos).toBe(1);
      expect(getPlanLimits("basico").maxEventos).toBe(5);
      expect(getPlanLimits("intermediario").maxEventos).toBe(20);
      expect(getPlanLimits("premium").maxEventos).toBe(999);
    });

    it("trata string aleatória como free", () => {
      const limits = getPlanLimits("invalido");
      expect(limits.maxEventos).toBe(1);
    });
  });

  describe("checkPodeCriarEvento", () => {
    it("free com 0 eventos pode criar", () => {
      expect(checkPodeCriarEvento("free", 0)).toEqual({ ok: true });
    });

    it("free com 1 evento bloqueia", () => {
      const res = checkPodeCriarEvento("free", 1);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe("max_eventos");
        expect(res.message).toMatch(/1 evento/);
      }
    });

    it("basico com 5 eventos bloqueia", () => {
      const res = checkPodeCriarEvento("basico", 5);
      expect(res.ok).toBe(false);
    });

    it("premium com 100 eventos ainda pode (limite 999)", () => {
      expect(checkPodeCriarEvento("premium", 100).ok).toBe(true);
    });
  });

  describe("checkPodeRegenerar", () => {
    it("free permite até 2 regenerações", () => {
      expect(checkPodeRegenerar("free", 0).ok).toBe(true);
      expect(checkPodeRegenerar("free", 1).ok).toBe(true);
      expect(checkPodeRegenerar("free", 2).ok).toBe(false);
    });

    it("intermediario permite até 15", () => {
      expect(checkPodeRegenerar("intermediario", 14).ok).toBe(true);
      expect(checkPodeRegenerar("intermediario", 15).ok).toBe(false);
    });
  });

  describe("checkPodePublicar", () => {
    it("free não pode publicar", () => {
      const res = checkPodePublicar("free");
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.code).toBe("no_publish");
    });

    it("planos pagos podem publicar", () => {
      expect(checkPodePublicar("basico").ok).toBe(true);
      expect(checkPodePublicar("intermediario").ok).toBe(true);
      expect(checkPodePublicar("premium").ok).toBe(true);
    });
  });
});
