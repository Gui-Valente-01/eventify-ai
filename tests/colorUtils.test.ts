import { describe, it, expect } from "vitest";
import { buildPalette } from "@/lib/agents/colorUtils";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

describe("buildPalette", () => {
  it("retorna paleta padrão se nenhuma cor foi informada", () => {
    const p = buildPalette();
    expect(p.primary).toBe("#8847e7");
    expect(p.surface).toBe("#ffffff");
    expect(p.ink).toBe("#0a0814");
  });

  it("retorna paleta padrão se cor inválida", () => {
    const p = buildPalette("não-é-hex");
    expect(p.primary).toBe("#8847e7");
  });

  it("aceita cor primária válida e gera variantes hex", () => {
    const p = buildPalette("#ec4899");
    expect(p.primary).toBe("#ec4899");
    expect(p.primaryDark).toMatch(HEX_RE);
    expect(p.primarySoft).toMatch(HEX_RE);
    expect(p.accent).toMatch(HEX_RE);
    expect(p.surfaceAlt).toMatch(HEX_RE);
  });

  it("primaryDark é mais escuro que o primary", () => {
    const p = buildPalette("#8847e7");
    // simples sanity check: substring numérica menor representa mais escuro
    // (não 100% preciso mas pega a maioria dos casos)
    const primaryNum = parseInt(p.primary.slice(1), 16);
    const darkNum = parseInt(p.primaryDark.slice(1), 16);
    expect(darkNum).toBeLessThan(primaryNum);
  });

  it("primarySoft é mais claro que o primary", () => {
    const p = buildPalette("#8847e7");
    const primaryNum = parseInt(p.primary.slice(1), 16);
    const softNum = parseInt(p.primarySoft.slice(1), 16);
    expect(softNum).toBeGreaterThan(primaryNum);
  });

  it("rejeita formatos hex curtos (#abc)", () => {
    const p = buildPalette("#abc");
    expect(p.primary).toBe("#8847e7"); // fallback
  });
});
