import { describe, it, expect } from "vitest";
import {
  isPublishedStatus,
  normalizeStatus,
  getStatusLabel,
  PUBLISHABLE_STATUSES,
} from "@/lib/publication";

describe("publication helpers", () => {
  describe("isPublishedStatus", () => {
    it("retorna true pra paid e published", () => {
      expect(isPublishedStatus("paid")).toBe(true);
      expect(isPublishedStatus("published")).toBe(true);
    });

    it("retorna false pra preview, draft, archived, null e undefined", () => {
      expect(isPublishedStatus("preview")).toBe(false);
      expect(isPublishedStatus("draft")).toBe(false);
      expect(isPublishedStatus("archived")).toBe(false);
      expect(isPublishedStatus(null)).toBe(false);
      expect(isPublishedStatus(undefined)).toBe(false);
    });

    it("retorna false pra strings inválidas", () => {
      expect(isPublishedStatus("hacked")).toBe(false);
    });
  });

  describe("normalizeStatus", () => {
    it("retorna o status válido inalterado", () => {
      expect(normalizeStatus("paid")).toBe("paid");
      expect(normalizeStatus("published")).toBe("published");
      expect(normalizeStatus("preview")).toBe("preview");
    });

    it("retorna 'preview' como default pra valores inválidos", () => {
      expect(normalizeStatus(null)).toBe("preview");
      expect(normalizeStatus(undefined)).toBe("preview");
      expect(normalizeStatus("xpto")).toBe("preview");
    });
  });

  describe("getStatusLabel", () => {
    it("retorna labels em pt-BR", () => {
      expect(getStatusLabel("draft")).toBe("Rascunho");
      expect(getStatusLabel("preview")).toBe("Preview");
      expect(getStatusLabel("paid")).toBe("Pago");
      expect(getStatusLabel("published")).toBe("Publicado");
      expect(getStatusLabel("archived")).toBe("Arquivado");
    });

    it("aplica normalização pra valores inválidos", () => {
      expect(getStatusLabel("xpto")).toBe("Preview");
    });
  });

  describe("PUBLISHABLE_STATUSES", () => {
    it("contém apenas paid e published", () => {
      expect(PUBLISHABLE_STATUSES).toEqual(["paid", "published"]);
    });
  });
});
