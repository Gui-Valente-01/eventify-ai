import dotenv from "dotenv"
dotenv.config({ path: "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai/.env.local" })

import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import { GoogleGenAI } from "@google/genai"
import { checkGeminiQuota, registerGeminiCall } from "../lib/geminiQuota.js"

const OBSIDIAN = "C:/Users/Win 11/Desktop/eventify"
const DATA = new Date().toISOString().slice(0, 10)
const PASTA_AGENTES = path.join(OBSIDIAN, "21 - AUTOMACOES", "AGENTES AUTOMATICOS")

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

function salvarArquivo(caminho, conteudo) {
  fs.mkdirSync(path.dirname(caminho), { recursive: true })
  fs.writeFileSync(caminho, conteudo, "utf8")
}

function warnExit(motivo) {
  console.warn(`[SUP] AVISO: ${motivo}`)
  console.warn("[SUP] Saindo com exit 0 (modo seguro).")
  process.exit(0)
}

console.log("[SUP] Agente Suporte iniciado...")

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  warnExit("Credenciais Supabase ausentes.")
}

const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

const desde7d = new Date(Date.now() - 7 * 86400 * 1000).toISOString()
const desde30d = new Date(Date.now() - 30 * 86400 * 1000).toISOString()

const metricas = {}

try {
  // ============ Erros abertos (status='open') últimos 7d ============
  const { data: errosAbertos, error: errAbertos } = await supa
    .from("error_logs")
    .select("id, scope, level, message, error_name, error_message, url, status, ai_severity, created_at")
    .eq("status", "open")
    .gte("created_at", desde7d)
    .order("created_at", { ascending: false })
    .limit(100)

  if (errAbertos) throw errAbertos

  metricas.erros_abertos_7d = errosAbertos?.length || 0

  // ============ Agrupado por scope (qual área do código erra mais) ============
  const porScope = {}
  const porLevel = { warn: 0, error: 0, fatal: 0 }
  const porSeveridadeIA = { low: 0, medium: 0, high: 0, critical: 0, "sem analise": 0 }
  const mensagensFrequentes = {}

  for (const e of errosAbertos || []) {
    porScope[e.scope] = (porScope[e.scope] || 0) + 1
    porLevel[e.level || "error"] = (porLevel[e.level || "error"] || 0) + 1
    porSeveridadeIA[e.ai_severity || "sem analise"]++

    // Agrupa por mensagem normalizada (primeiros 80 chars sem números/UUIDs)
    const msgKey = (e.error_message || e.message || "(sem mensagem)")
      .slice(0, 120)
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "<uuid>")
      .replace(/\d+/g, "<n>")
      .trim()
    mensagensFrequentes[msgKey] = (mensagensFrequentes[msgKey] || 0) + 1
  }

  metricas.por_scope = porScope
  metricas.por_level = porLevel
  metricas.por_severidade_ia = porSeveridadeIA

  metricas.top_mensagens = Object.entries(mensagensFrequentes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([msg, count]) => ({ msg, count }))

  // ============ Comparação de volume: 7d vs 30d ============
  const { count: count30d } = await supa
    .from("error_logs")
    .select("id", { count: "exact", head: true })
    .gte("created_at", desde30d)

  metricas.erros_total_30d = count30d || 0
  metricas.media_diaria_30d = Math.round(((count30d || 0) / 30) * 10) / 10

  // ============ Erros já resolvidos vs ignorados (taxa de saúde) ============
  const { data: byStatus } = await supa
    .from("error_logs")
    .select("status")
    .gte("created_at", desde30d)

  const statusCount = { open: 0, investigating: 0, resolved: 0, ignored: 0 }
  for (const r of byStatus || []) statusCount[r.status || "open"]++
  metricas.distribuicao_status_30d = statusCount

  // Amostras pra IA analisar (sem PII bruta)
  metricas.amostras_para_analise = (errosAbertos || []).slice(0, 15).map((e) => ({
    scope: e.scope,
    level: e.level,
    error_name: e.error_name,
    message: (e.error_message || e.message || "").slice(0, 300),
    url: e.url ? new URL(e.url, "https://x").pathname : null,
    when: e.created_at,
  }))
} catch (err) {
  warnExit(`Falha ao coletar metricas: ${err.message}`)
}

console.log(`[SUP] Erros abertos (7d): ${metricas.erros_abertos_7d}`)
console.log(`[SUP] Top scopes:`, Object.entries(metricas.por_scope || {}).slice(0, 5))

function salvarRelatorio(corpo) {
  const saida = path.join(PASTA_AGENTES, `Agente Suporte - ${DATA}.md`)
  salvarArquivo(
    saida,
    `# AGENTE SUPORTE - ${DATA}

**Erros abertos (7d):** ${metricas.erros_abertos_7d ?? 0}
**Total 30d:** ${metricas.erros_total_30d ?? 0} (média ${metricas.media_diaria_30d ?? 0}/dia)
**Status 30d:** ${JSON.stringify(metricas.distribuicao_status_30d)}

${corpo}

## Métricas detalhadas

\`\`\`json
${JSON.stringify(metricas, null, 2)}
\`\`\`

---

# RELACIONAMENTOS

- [[Roadmap Principal]]
- [[Agentes]]
- [[Dashboard Operacional]]
`
  )
  console.log(`[SUP] Relatório salvo: ${saida}`)
}

if (!GEMINI_KEY) {
  salvarRelatorio("> Gemini indisponível. Relatório só com métricas.")
  process.exit(0)
}

const quotaCheckSup = checkGeminiQuota("agente-suporte")
if (!quotaCheckSup.ok) {
  console.warn(`[SUP] ${quotaCheckSup.message}`)
  salvarRelatorio(`> ${quotaCheckSup.message}`)
  process.exit(0)
}

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY })

const contexto = `
Voce e o Agente Suporte do Eventify AI.

Voce analisa erros capturados pelo sistema e categoriza por urgencia/causa raiz.
Voce nao recebe dados pessoais — apenas scopes, mensagens de erro tecnicas e contagens.

Formato OBRIGATORIO:

## DIAGNOSTICO GERAL
2-3 paragrafos sobre a saude do sistema (volume de erros, tendencia, areas mais fragis).

## CATEGORIAS DE ERRO
Agrupe os erros por categoria provavel (ex: "Integracao Stripe", "Timeout IA",
"Validacao de input", "Bug de frontend") com contagens.

## TOP 3 ERROS PRIORITARIOS
Pra cada um:
- Descricao tecnica
- Provavel causa raiz
- Sugestao de fix concreta (qual arquivo, qual mudanca)
- Severidade percebida (low/medium/high/critical)

## QUICK WINS
2-4 melhorias rapidas (< 30min cada) que reduziriam muito o volume de erros.

## ALERTAS
Padroes suspeitos: erros que aumentaram subitamente, scopes que nunca deveriam errar, etc.

Regras:
- Seja especifico. Cite mensagens reais quando relevante.
- Se nao ha erros (0 entries), diga isso. Nao invente.
- Se um erro aparece muitas vezes (top_mensagens), isso e prioridade.

# Metricas
\`\`\`json
${JSON.stringify(metricas, null, 2)}
\`\`\`
`

let respostaTexto = ""
try {
  const resposta = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contexto
  })
  respostaTexto = resposta.text || ""
  registerGeminiCall("agente-suporte")
} catch (err) {
  warnExit(`Falha ao chamar Gemini: ${err.message}`)
}

salvarRelatorio(respostaTexto)
console.log("[SUP] Agente Suporte finalizado.")
