// Rate-limit local do Gemini pra distribuir os 20 req/dia do free tier
// entre os agentes. Contador persistente em .gemini-quota.json (gitignored).

import fs from "fs"
import path from "path"

const QUOTA_FILE = path.join(
  "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai",
  ".gemini-quota.json"
)

const DAILY_LIMIT = parseInt(process.env.GEMINI_DAILY_LIMIT || "18", 10)

function hoje() {
  return new Date().toISOString().slice(0, 10)
}

function lerEstado() {
  try {
    if (!fs.existsSync(QUOTA_FILE)) return { date: hoje(), count: 0, callers: {} }
    const raw = JSON.parse(fs.readFileSync(QUOTA_FILE, "utf8"))
    if (raw.date !== hoje()) return { date: hoje(), count: 0, callers: {} }
    return raw
  } catch {
    return { date: hoje(), count: 0, callers: {} }
  }
}

function salvarEstado(estado) {
  try {
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(estado, null, 2), "utf8")
  } catch (e) {
    console.warn("[geminiQuota] falha ao salvar estado:", e.message)
  }
}

/**
 * Verifica se ainda há quota disponível.
 * Retorna { ok: true } ou { ok: false, message }.
 */
export function checkGeminiQuota(_caller = "anonymous") {
  const estado = lerEstado()
  if (estado.count >= DAILY_LIMIT) {
    return {
      ok: false,
      message: `Quota local Gemini atingida (${estado.count}/${DAILY_LIMIT} hoje). Reset à meia-noite UTC.`,
      stats: estado,
    }
  }
  return { ok: true, stats: estado }
}

/**
 * Incrementa o contador. Chamar APÓS uma chamada Gemini bem-sucedida.
 */
export function registerGeminiCall(caller = "anonymous") {
  const estado = lerEstado()
  estado.count += 1
  estado.callers[caller] = (estado.callers[caller] || 0) + 1
  estado.lastCall = new Date().toISOString()
  salvarEstado(estado)
  return estado
}

/**
 * Wrapper conveniente: verifica + chama + registra.
 * Uso: const result = await withGeminiQuota("qa", () => ai.models.generateContent(...))
 * Retorna null se sem quota (e loga warning).
 */
export async function withGeminiQuota(caller, fn) {
  const check = checkGeminiQuota(caller)
  if (!check.ok) {
    console.warn(`[geminiQuota] ${caller}: ${check.message}`)
    return null
  }
  const result = await fn()
  registerGeminiCall(caller)
  return result
}

/**
 * Status pra debug/dashboard.
 */
export function getGeminiQuotaStatus() {
  return lerEstado()
}
