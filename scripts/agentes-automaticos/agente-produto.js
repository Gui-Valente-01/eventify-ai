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
  console.warn(`[PROD] AVISO: ${motivo}`)
  console.warn("[PROD] Saindo com exit 0 (modo seguro).")
  process.exit(0)
}

console.log("[PROD] Agente Produto iniciado...")

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  warnExit("Credenciais Supabase ausentes (NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY).")
}

const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

// ========== Coletor seguro: SÓ AGREGADOS, ZERO PII ==========
const metricas = {}

async function contar(tabela, filtro) {
  let q = supa.from(tabela).select("*", { count: "exact", head: true })
  if (filtro) q = filtro(q)
  const { count, error } = await q
  if (error) return { erro: error.message }
  return count ?? 0
}

async function groupBy(tabela, campo) {
  const { data, error } = await supa.from(tabela).select(campo)
  if (error) return { erro: error.message }
  const counts = {}
  for (const row of data) {
    const k = row[campo] ?? "null"
    counts[k] = (counts[k] || 0) + 1
  }
  return counts
}

try {
  // Eventos totais e por status (funil)
  metricas.eventos_total = await contar("eventos")
  metricas.eventos_por_status = await groupBy("eventos", "status")
  metricas.eventos_por_tipo = await groupBy("eventos", "tipo")
  metricas.eventos_por_plano_pago = await groupBy("eventos", "paid_plan")

  // Conversão temporal (últimos 30 dias)
  const desde30d = new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  metricas.eventos_30d = await contar("eventos", (q) => q.gte("created_at", desde30d))
  metricas.eventos_pagos_30d = await contar("eventos", (q) =>
    q.gte("paid_at", desde30d).not("paid_at", "is", null)
  )

  // Usuários e planos
  metricas.profiles_total = await contar("profiles")
  metricas.profiles_por_plano = await groupBy("profiles", "plan")

  // Convidados (só count agregado — NUNCA buscar nomes)
  metricas.convidados_total = await contar("convidados")
  if (metricas.eventos_total > 0) {
    metricas.media_convidados_por_evento = Number(
      (metricas.convidados_total / metricas.eventos_total).toFixed(1)
    )
  }

  // Views (se tabela existir)
  try {
    metricas.event_views_total = await contar("event_views")
  } catch {
    metricas.event_views_total = "tabela ausente"
  }

  // Erros recentes (categoria/tipo, não payload)
  try {
    const { data, error } = await supa
      .from("error_logs")
      .select("kind")
      .gte("created_at", desde30d)
    if (!error && data) {
      const por_tipo = {}
      for (const r of data) por_tipo[r.kind || "unknown"] = (por_tipo[r.kind || "unknown"] || 0) + 1
      metricas.erros_30d_por_tipo = por_tipo
    }
  } catch {
    metricas.erros_30d_por_tipo = "tabela ausente ou coluna 'kind' inexistente"
  }
} catch (err) {
  warnExit(`Falha ao coletar métricas: ${err.message}`)
}

console.log("[PROD] Métricas coletadas:", JSON.stringify(metricas, null, 2))

if (!GEMINI_KEY) {
  // Mesmo sem Gemini, salva relatório só com métricas
  const saida = path.join(PASTA_AGENTES, `Agente Produto - ${DATA}.md`)
  salvarArquivo(
    saida,
    `# AGENTE PRODUTO - ${DATA}

> Gemini não disponível. Relatório contém apenas métricas agregadas.

## Métricas

\`\`\`json
${JSON.stringify(metricas, null, 2)}
\`\`\`

---

# RELACIONAMENTOS

- [[Visao Geral]]
- [[Ideias Futuras]]
- [[Roadmap Principal]]
`
  )
  console.log(`[PROD] Relatório (sem IA) salvo: ${saida}`)
  process.exit(0)
}

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY })

const contexto = `
Voce e o Agente Produto do Eventify AI (SaaS Next.js para sites de eventos com IA).

Voce NUNCA recebe dados pessoais. So recebe metricas agregadas (contagens, distribuicoes, medias).
Seu papel: olhar essas metricas e responder PERGUNTAS DE PRODUTO.

Formato OBRIGATORIO da resposta:

## INSIGHTS
- 3 a 5 padroes notaveis nas metricas (use numeros das metricas literalmente)

## OPORTUNIDADES DE UX
- 2 a 4 mudancas de UX/onboarding que provavelmente melhorariam a conversao

## FEATURES SUGERIDAS
- 2 a 4 features candidatas, com hipotese de impacto

## ALERTAS
- problemas visiveis nas metricas (ex: gargalo no funil, plano nao adotado, tipo de evento ignorado)

## PERGUNTAS PRA INVESTIGAR
- 2 a 3 perguntas que so podem ser respondidas com mais dados (qualitativos ou eventos novos)

Regras:
- nao invente nomes de clientes ou de eventos (voce nao tem esses dados)
- seja conservador: se uma metrica e pequena (poucos dados), diga isso
- foque em VALOR pro cliente final, nao apenas tecnico

# Metricas do projeto
\`\`\`json
${JSON.stringify(metricas, null, 2)}
\`\`\`
`

const quotaCheckProd = checkGeminiQuota("agente-produto")
if (!quotaCheckProd.ok) {
  console.warn(`[PROD] ${quotaCheckProd.message}`)
  process.exit(0)
}

let respostaTexto = ""
try {
  const resposta = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contexto
  })
  respostaTexto = resposta.text || ""
  registerGeminiCall("agente-produto")
} catch (err) {
  warnExit(`Falha ao chamar Gemini: ${err.message}`)
}

const saida = path.join(PASTA_AGENTES, `Agente Produto - ${DATA}.md`)

salvarArquivo(
  saida,
  `# AGENTE PRODUTO - ${DATA}

**Total de eventos:** ${metricas.eventos_total} | **30d:** ${metricas.eventos_30d} | **Pagos 30d:** ${metricas.eventos_pagos_30d}

${respostaTexto}

## Métricas (agregadas, sem PII)

\`\`\`json
${JSON.stringify(metricas, null, 2)}
\`\`\`

---

# RELACIONAMENTOS

- [[Visao Geral]]
- [[Ideias Futuras]]
- [[Roadmap Principal]]
- [[Agentes]]
`
)

console.log(`[PROD] Relatório salvo: ${saida}`)
console.log("[PROD] Agente Produto finalizado.")
