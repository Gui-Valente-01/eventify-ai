import { describe, it, expect } from "vitest";
import { csvEscape, buildCsv } from "@/lib/csv";

describe("csvEscape", () => {
  it("retorna string simples sem mudança", () => {
    expect(csvEscape("João")).toBe("João");
  });

  it("retorna string vazia para null/undefined", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });

  it("converte número para string", () => {
    expect(csvEscape(123)).toBe("123");
  });

  it("envolve em aspas se contém vírgula", () => {
    expect(csvEscape("Silva, Maria")).toBe('"Silva, Maria"');
  });

  it("envolve em aspas e dobra aspas internas", () => {
    expect(csvEscape('Diz "olá"')).toBe('"Diz ""olá"""');
  });

  it("envolve em aspas se contém quebra de linha", () => {
    expect(csvEscape("linha1\nlinha2")).toBe('"linha1\nlinha2"');
    expect(csvEscape("linha1\r\nlinha2")).toBe('"linha1\r\nlinha2"');
  });

  it("preserva acentuação sem quotar", () => {
    expect(csvEscape("Aniversário")).toBe("Aniversário");
  });
});

describe("buildCsv", () => {
  it("gera CSV com BOM, header e linhas", () => {
    const csv = buildCsv(["Nome", "Idade"], [
      ["João", 30],
      ["Maria", 25],
    ]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain("Nome,Idade\r\n");
    expect(csv).toContain("João,30\r\n");
    expect(csv).toContain("Maria,25\r\n");
    expect(csv.endsWith("\r\n")).toBe(true);
  });

  it("escapa células com vírgula", () => {
    const csv = buildCsv(["Nome"], [["Silva, João"]]);
    expect(csv).toContain('"Silva, João"');
  });

  it("aceita array vazio (só header)", () => {
    const csv = buildCsv(["A", "B"], []);
    const lines = csv.replace(/^﻿/, "").trim().split("\r\n");
    expect(lines).toEqual(["A,B"]);
  });

  it("usa CRLF entre linhas", () => {
    const csv = buildCsv(["X"], [["a"], ["b"]]);
    const semBom = csv.replace(/^﻿/, "");
    // header + 2 linhas + CRLF final
    expect(semBom.split("\r\n").length).toBe(4);
  });
});
