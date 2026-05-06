/**
 * Utilities pra gerar CSV seguro (RFC 4180).
 * Extraído pra ser testável em isolado.
 */

/** Escapa um valor pro CSV. Retorna string entre aspas duplas se contém vírgula, quebra ou aspas. */
export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Monta um CSV completo a partir de header + linhas.
 * - Adiciona BOM UTF-8 pro Excel renderizar acentos.
 * - Usa CRLF como separador de linha (RFC 4180).
 */
export function buildCsv(
  header: string[],
  rows: Array<Array<string | number | null | undefined>>
): string {
  const lines = [header.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(","));
  }
  return "﻿" + lines.join("\r\n") + "\r\n";
}
