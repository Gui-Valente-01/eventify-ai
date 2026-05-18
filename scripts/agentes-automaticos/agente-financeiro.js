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

// Preços dos planos em BRL (sincronizar com /precos)
const PLANO_PRECO_BRL = {
  free: 0,
  basico: 29,
  intermediario: 49,
  premium: 79,
}

// Stripe cobra ~2.99% + R$ 0.39 por transação (estimativa Brasil)
const STRIPE_PCT = 0.0299
const STRIPE_FIXO_BRL = 0.39

// Conversão USD -> BRL pra normalizar custo IA na mesma moeda
const USD_BRL = parseFloat(process.env.USD_BRL_RATE || "5.20")

function salvarArquivo(caminho, conteudo) {
  fs.mkdirSync(path.dirname(caminho), { recursive: true })
  fs.writeFileSync(caminho, conteudo, "utf8")
}

function warnExit(motivo) {
  console.warn(`[FIN] AVISO: ${motivo}`)
  console.warn("[FIN] Saindo com exit 0 (modo seguro).")
  process.exit(0)
}

function hashCurto(s) {
  // Hash determinístico pra anonimizar user_id em relatório (8 chars)
  let h = 0
  for (let i = 0; i < (s || "").length; i++) h = ((h << 5) - h + (s || "").charCodeAt(i)) | 0
  return Math.abs(h).toString(16).slice(0, 8)
}

console.log("[FIN] Agente Financeiro iniciado...")

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  warnExit("Credenciais Supabase ausentes.")
}

const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

const desde7d = new Date(Date.now() - 7 * 86400 * 1000).toISOString()
const desde30d = new Date(Date.now() - 30 * 86400 * 1000).toISOString()
const desde90d = new Date(Date.now() - 90 * 86400 * 1000).toISOString()

const metricas = {
  cambio_usado: { usd_brl: USD_BRL, fonte: "USD_BRL_RATE env var ou 5.20 default" },
  preco_planos_brl: PLANO_PRECO_BRL,
  stripe_taxa: { pct: STRIPE_PCT, fixo_brl: STRIPE_FIXO_BRL },
}

try {
  // ============ CUSTO IA ============
  const { data: usageAll } = await supa
    .from("usage_logs")
    .select("user_id, model, plan, cost_usd, provider, status, created_at")
    .gte("created_at", desde90d)

  let custoTotal90d = 0
  let custoTotal30d = 0
  let custoTotal7d = 0
  const custoPorPlano = { free: 0, basico: 0, intermediario: 0, premium: 0, sem_plano: 0 }
  const custoPorProvider = {}
  const custoPorModel = {}
  const custoPorUsuario = {}
  let chamadasOk = 0
  let chamadasErro = 0

  for (const u of usageAll || []) {
    const cost = Number(u.cost_usd || 0)
    custoTotal90d += cost
    if (new Date(u.created_at) > new Date(desde30d)) custoTotal30d += cost
    if (new Date(u.created_at) > new Date(desde7d)) custoTotal7d += cost

    const planoKey = u.plan && PLANO_PRECO_BRL[u.plan] !== undefined ? u.plan : "sem_plano"
    custoPorPlano[planoKey] = (custoPorPlano[planoKey] || 0) + cost

    custoPorProvider[u.provider || "unknown"] = (custoPorProvider[u.provider || "unknown"] || 0) + cost
    custoPorModel[u.model || "unknown"] = (custoPorModel[u.model || "unknown"] || 0) + cost

    if (u.user_id) {
      const uid = hashCurto(u.user_id)
      custoPorUsuario[uid] = (custoPorUsuario[uid] || 0) + cost
    }

    if (u.status === "ok") chamadasOk++
    else chamadasErro++
  }

  metricas.custo_ia = {
    total_usd_90d: Number(custoTotal90d.toFixed(4)),
    total_usd_30d: Number(custoTotal30d.toFixed(4)),
    total_usd_7d: Number(custoTotal7d.toFixed(4)),
    total_brl_30d: Number((custoTotal30d * USD_BRL).toFixed(2)),
    chamadas_ok: chamadasOk,
    chamadas_erro: chamadasErro,
    custo_por_plano_usd: Object.fromEntries(
      Object.entries(custoPorPlano).map(([k, v]) => [k, Number(v.toFixed(4))])
    ),
    custo_por_provider_usd: Object.fromEntries(
      Object.entries(custoPorProvider).map(([k, v]) => [k, Number(v.toFixed(4))])
    ),
    custo_por_model_usd: Object.fromEntries(
      Object.entries(custoPorModel).map(([k, v]) => [k, Number(v.toFixed(4))])
    ),
    top_5_usuarios_mais_caros: Object.entries(custoPorUsuario)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([uid, cost]) => ({ user_hash: uid, custo_usd_90d: Number(cost.toFixed(4)) })),
  }

  // ============ ASSINATURAS ATIVAS (RECEITA) ============
  const { data: profilesAll } = await supa
    .from("profiles")
    .select("id, plan, created_at")

  const assinaturasPorPlano = { free: 0, basico: 0, intermediario: 0, premium: 0 }
  for (const p of profilesAll || []) {
    const plano = p.plan && PLANO_PRECO_BRL[p.plan] !== undefined ? p.plan : "free"
    assinaturasPorPlano[plano]++
  }

  let mrrBruto = 0
  const receitaPorPlano = {}
  for (const [plano, count] of Object.entries(assinaturasPorPlano)) {
    const receita = count * (PLANO_PRECO_BRL[plano] || 0)
    receitaPorPlano[plano] = { assinantes: count, receita_brl: receita }
    mrrBruto += receita
  }

  metricas.receita = {
    mrr_bruto_brl: mrrBruto,
    assinaturas_ativas_total: profilesAll?.length || 0,
    por_plano: receitaPorPlano,
  }

  // ============ MARGEM ============
  const custoIaMes30dBrl = Number((custoTotal30d * USD_BRL).toFixed(2))
  // Estimativa de Stripe: assume que MRR gera 1 transação por assinatura/mês
  const taxaStripeEstimada = Object.entries(assinaturasPorPlano).reduce((acc, [plano, count]) => {
    if (plano === "free") return acc
    const preco = PLANO_PRECO_BRL[plano] || 0
    return acc + count * (preco * STRIPE_PCT + STRIPE_FIXO_BRL)
  }, 0)

  metricas.margem = {
    mrr_bruto_brl: mrrBruto,
    custo_ia_30d_brl: custoIaMes30dBrl,
    taxa_stripe_estimada_brl: Number(taxaStripeEstimada.toFixed(2)),
    lucro_bruto_estimado_brl: Number((mrrBruto - custoIaMes30dBrl - taxaStripeEstimada).toFixed(2)),
    margem_pct: mrrBruto > 0
      ? Number((((mrrBruto - custoIaMes30dBrl - taxaStripeEstimada) / mrrBruto) * 100).toFixed(1))
      : 0,
  }

  // ============ EVENTOS PAGOS ============
  const { data: eventosPagos } = await supa
    .from("eventos")
    .select("id, paid_plan, paid_at")
    .not("paid_at", "is", null)
    .gte("paid_at", desde90d)

  const eventosPagosPorPlano = { basico: 0, intermediario: 0, premium: 0 }
  for (const e of eventosPagos || []) {
    if (eventosPagosPorPlano[e.paid_plan] !== undefined) eventosPagosPorPlano[e.paid_plan]++
  }

  metricas.eventos_pagos_90d = {
    total: eventosPagos?.length || 0,
    por_plano: eventosPagosPorPlano,
  }
} catch (err) {
  warnExit(`Falha ao coletar metricas: ${err.message}`)
}

console.log(`[FIN] MRR bruto: R$ ${metricas.receita?.mrr_bruto_brl}`)
console.log(`[FIN] Custo IA 30d: R$ ${metricas.custo_ia?.total_brl_30d} (US$ ${metricas.custo_ia?.total_usd_30d})`)
console.log(`[FIN] Margem estimada: ${metricas.margem?.margem_pct}%`)

function salvarRelatorio(corpo) {
  const saida = path.join(PASTA_AGENTES, `Agente Financeiro - ${DATA}.md`)
  salvarArquivo(
    saida,
    `# AGENTE FINANCEIRO - ${DATA}

**MRR bruto:** R$ ${metricas.receita?.mrr_bruto_brl ?? 0}
**Custo IA (30d):** R$ ${metricas.custo_ia?.total_brl_30d ?? 0} (US$ ${metricas.custo_ia?.total_usd_30d ?? 0})
**Taxa Stripe estimada:** R$ ${metricas.margem?.taxa_stripe_estimada_brl ?? 0}
**Lucro bruto estimado:** R$ ${metricas.margem?.lucro_bruto_estimado_brl ?? 0}
**Margem:** ${metricas.margem?.margem_pct ?? 0}%

${corpo}

## Métricas detalhadas

\`\`\`json
${JSON.stringify(metricas, null, 2)}
\`\`\`

---

# RELACIONAMENTOS

- [[Diferenciais dos Planos]]
- [[Sistema Stripe]]
- [[Roadmap Principal]]
- [[Agentes]]
`
  )
  console.log(`[FIN] Relatório salvo: ${saida}`)
}

if (!GEMINI_KEY) {
  salvarRelatorio("> Gemini indisponível. Relatório só com métricas.")
  process.exit(0)
}

const quotaCheckFin = checkGeminiQuota("agente-financeiro")
if (!quotaCheckFin.ok) {
  console.warn(`[FIN] ${quotaCheckFin.message}`)
  salvarRelatorio(`> ${quotaCheckFin.message}`)
  process.exit(0)
}

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY })

const contexto = `
Voce e o Agente Financeiro / CFO do Eventify AI.

Voce analisa custo de IA, receita de assinaturas e margem por plano.
Nunca recebe dados pessoais — apenas hashes anonimos de usuarios e agregados.

Formato OBRIGATORIO da resposta:

## DIAGNOSTICO FINANCEIRO
2-3 paragrafos: receita atual, custos, saude da margem, tendencia (7d vs 30d).

## MARGEM POR PLANO
Pra cada plano (Basico, Intermediario, Premium): qual a margem real, considerando
custo IA medio e taxa Stripe. Diga se algum plano esta PERDENDO dinheiro.

## ALERTAS
Riscos financeiros visiveis:
- Cliente unico consumindo muito IA (top_5_usuarios_mais_caros)
- Plano com custo IA proximo ou maior que receita
- Erros de geracao gerando custo sem retorno
- Crescimento de custo desproporcional ao MRR

## RECOMENDACOES
3-5 acoes concretas de:
- Otimizacao de custo (cache, modelo mais barato no plano X, etc)
- Ajuste de preco (se plano esta sem margem)
- Limites de uso por plano (se cliente unico consome demais)

## PROJECAO
Se o cenario atual continuar 30 dias mais: MRR esperado, custo IA esperado,
lucro liquido aproximado.

Regras:
- Use os numeros REAIS das metricas
- Nao invente valores
- Se MRR = 0 (sem clientes pagantes), foque em previsao de unit economics, nao receita
- Margem negativa = ALERTA CRITICO

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
  registerGeminiCall("agente-financeiro")
} catch (err) {
  warnExit(`Falha ao chamar Gemini: ${err.message}`)
}

salvarRelatorio(respostaTexto)
console.log("[FIN] Agente Financeiro finalizado.")
