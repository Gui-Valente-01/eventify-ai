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
  console.warn(`[CLI] AVISO: ${motivo}`)
  console.warn("[CLI] Saindo com exit 0 (modo seguro).")
  process.exit(0)
}

function extrairDominio(url) {
  if (!url) return "direto"
  try {
    return new URL(url).hostname
  } catch {
    return "invalido"
  }
}

function bucketUserAgent(ua) {
  if (!ua) return "unknown"
  const s = ua.toLowerCase()
  if (s.includes("whatsapp")) return "whatsapp"
  if (s.includes("telegram")) return "telegram"
  if (s.includes("instagram")) return "instagram"
  if (s.includes("facebook")) return "facebook"
  if (s.includes("iphone") || s.includes("ipad")) return "ios"
  if (s.includes("android")) return "android"
  if (s.includes("mobile")) return "mobile-outro"
  return "desktop"
}

console.log("[CLI] Agente Cliente iniciado...")

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  warnExit("Credenciais Supabase ausentes.")
}

const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

const metricas = {}
const desde30d = new Date(Date.now() - 30 * 86400 * 1000).toISOString()

try {
  // ============ RSVP / Convidados (SEM NOMES) ============
  const { data: convs, error: convErr } = await supa
    .from("convidados")
    .select("evento_id, confirmado_em")
  if (convErr) throw convErr

  const rsvpPorEvento = {}
  const rsvpHoraDia = Array(24).fill(0)
  const rsvpDiaSemana = Array(7).fill(0)
  for (const c of convs) {
    rsvpPorEvento[c.evento_id] = (rsvpPorEvento[c.evento_id] || 0) + 1
    const d = new Date(c.confirmado_em)
    rsvpHoraDia[d.getHours()]++
    rsvpDiaSemana[d.getDay()]++
  }
  const tamanhos = Object.values(rsvpPorEvento)
  metricas.rsvp_total = convs.length
  metricas.eventos_com_rsvp = tamanhos.length
  metricas.media_rsvp_por_evento = tamanhos.length
    ? Number((tamanhos.reduce((a, b) => a + b, 0) / tamanhos.length).toFixed(1))
    : 0
  metricas.maior_evento_rsvp = tamanhos.length ? Math.max(...tamanhos) : 0
  metricas.rsvp_por_hora_dia = rsvpHoraDia
  metricas.rsvp_por_dia_semana = rsvpDiaSemana

  // ============ Views (anonimizar) ============
  let viewsAll = []
  try {
    const { data, error } = await supa.from("event_views").select("evento_id, session_id, referrer, user_agent, country, created_at")
    if (error) throw error
    viewsAll = data || []
  } catch (e) {
    metricas.event_views_erro = e.message
  }

  const viewsPorEvento = {}
  const sessionsPorEvento = {}
  const porPais = {}
  const porDominio = {}
  const porDispositivo = {}
  const viewHoraDia = Array(24).fill(0)
  for (const v of viewsAll) {
    viewsPorEvento[v.evento_id] = (viewsPorEvento[v.evento_id] || 0) + 1
    if (!sessionsPorEvento[v.evento_id]) sessionsPorEvento[v.evento_id] = new Set()
    sessionsPorEvento[v.evento_id].add(v.session_id)

    const pais = v.country || "desconhecido"
    porPais[pais] = (porPais[pais] || 0) + 1

    const dom = extrairDominio(v.referrer)
    porDominio[dom] = (porDominio[dom] || 0) + 1

    const dev = bucketUserAgent(v.user_agent)
    porDispositivo[dev] = (porDispositivo[dev] || 0) + 1

    viewHoraDia[new Date(v.created_at).getHours()]++
  }
  metricas.views_total = viewsAll.length
  metricas.views_unicas_total = Object.values(sessionsPorEvento).reduce((a, s) => a + s.size, 0)
  metricas.views_por_pais = porPais
  metricas.views_por_dominio_origem = porDominio
  metricas.views_por_dispositivo = porDispositivo
  metricas.views_por_hora_dia = viewHoraDia

  // ============ Funil view → RSVP por evento (apenas distribuição) ============
  const taxasConversao = []
  for (const [evId, viewCount] of Object.entries(viewsPorEvento)) {
    const rsvpCount = rsvpPorEvento[evId] || 0
    if (viewCount > 0) taxasConversao.push(Number((rsvpCount / viewCount).toFixed(3)))
  }
  metricas.taxa_view_rsvp_media = taxasConversao.length
    ? Number((taxasConversao.reduce((a, b) => a + b, 0) / taxasConversao.length).toFixed(3))
    : 0
  metricas.eventos_com_views_e_rsvp = taxasConversao.length
} catch (err) {
  warnExit(`Falha ao coletar métricas: ${err.message}`)
}

console.log("[CLI] Métricas coletadas:", JSON.stringify(metricas, null, 2))

function salvarRelatorio(corpo) {
  const saida = path.join(PASTA_AGENTES, `Agente Cliente - ${DATA}.md`)
  salvarArquivo(
    saida,
    `# AGENTE CLIENTE - ${DATA}

**Views totais:** ${metricas.views_total ?? 0} (${metricas.views_unicas_total ?? 0} únicas) | **RSVPs:** ${metricas.rsvp_total ?? 0}
**Taxa view→RSVP média:** ${(metricas.taxa_view_rsvp_media ?? 0) * 100}%

${corpo}

## Métricas (agregadas, anonimizadas)

\`\`\`json
${JSON.stringify(metricas, null, 2)}
\`\`\`

---

# RELACIONAMENTOS

- [[Visao Geral]]
- [[Roadmap Principal]]
- [[Agentes]]
`
  )
  console.log(`[CLI] Relatório salvo: ${saida}`)
}

if (!GEMINI_KEY) {
  salvarRelatorio("> Gemini indisponível. Relatório só com métricas.")
  process.exit(0)
}

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY })

const contexto = `
Voce e o Agente Cliente do Eventify AI.

Voce analisa o COMPORTAMENTO dos convidados dos sites de eventos publicados.
Voce NUNCA recebe nomes, emails, telefones ou texto identificavel. So agregados.

Formato OBRIGATORIO:

## COMPORTAMENTO DOS CONVIDADOS
- 3 a 5 padroes observados (horarios de pico, dispositivos, paises, domino de origem)

## FUNIL VIEW → RSVP
- analise da taxa de conversao e o que ela sugere

## OPORTUNIDADES DE ENGAJAMENTO
- 2 a 4 ideias pra melhorar conversao ou compartilhamento (ex: melhorar share no whatsapp, melhorar mobile, etc)

## ALERTAS
- problemas visiveis (ex: views sem RSVP, dispositivos com baixa conversao, paises inesperados)

## PERGUNTAS PRA INVESTIGAR
- 2 a 3 perguntas para mais dados ou pesquisa qualitativa

Regras:
- seja conservador quando volume de dados e pequeno
- nao invente nomes ou eventos
- foque em valor pro cliente final (que paga) e seus convidados

# Metricas
\`\`\`json
${JSON.stringify(metricas, null, 2)}
\`\`\`
`

const quotaCheckCli = checkGeminiQuota("agente-cliente")
if (!quotaCheckCli.ok) {
  console.warn(`[CLI] ${quotaCheckCli.message}`)
  salvarRelatorio(`> ${quotaCheckCli.message}`)
  process.exit(0)
}

let respostaTexto = ""
try {
  const resposta = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contexto
  })
  respostaTexto = resposta.text || ""
  registerGeminiCall("agente-cliente")
} catch (err) {
  warnExit(`Falha ao chamar Gemini: ${err.message}`)
}

salvarRelatorio(respostaTexto)
console.log("[CLI] Agente Cliente finalizado.")
