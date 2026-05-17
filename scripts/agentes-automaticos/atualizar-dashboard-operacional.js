import fs from "fs"
import path from "path"

const OBSIDIAN = "C:/Users/Win 11/Desktop/eventify"
const PASTA_AGENTES = path.join(OBSIDIAN, "21 - AUTOMACOES", "AGENTES AUTOMATICOS")
const PASTA_AUTO_EVO = path.join(OBSIDIAN, "21 - AUTOMACOES", "AUTO EVOLUCAO")
const DASHBOARD = path.join(OBSIDIAN, "Eventify", "CENTRAL", "Dashboard Operacional.md.md")
const MARCADOR_INICIO = "<!-- AGENTES_SNAPSHOT_INICIO -->"
const MARCADOR_FIM = "<!-- AGENTES_SNAPSHOT_FIM -->"

function ultimoArquivo(pasta, prefixo) {
  if (!fs.existsSync(pasta)) return null
  const arquivos = fs
    .readdirSync(pasta)
    .filter((f) => f.endsWith(".md") && (!prefixo || f.startsWith(prefixo)))
    .sort()
    .reverse()
  return arquivos[0] ? path.join(pasta, arquivos[0]) : null
}

function lerComMtime(caminho) {
  if (!caminho || !fs.existsSync(caminho)) return { texto: "", quando: "—", nome: "—" }
  const texto = fs.readFileSync(caminho, "utf8")
  const stat = fs.statSync(caminho)
  return {
    texto,
    quando: stat.mtime.toLocaleString("pt-BR"),
    nome: path.basename(caminho)
  }
}

function extrairSecao(texto, titulo) {
  const re = new RegExp(`##\\s*${titulo}[\\s\\S]*?(?=\\n#\\s|\\n##\\s|\\n---|$)`, "i")
  const m = texto.match(re)
  if (!m) return null
  return m[0].replace(/^##\s*[^\n]+\n/, "").trim()
}

function primeirasLinhas(texto, n = 5) {
  if (!texto) return "_(vazio)_"
  return texto.split("\n").slice(0, n).join("\n").trim()
}

function extrairSeveridadeQA(texto) {
  const m = texto.match(/\*\*Severidade detectada:\*\*\s*`([^`]+)`/)
  return m ? m[1] : "—"
}

const arquiteto = lerComMtime(ultimoArquivo(PASTA_AGENTES, "Agente Arquiteto"))
const qa = lerComMtime(ultimoArquivo(PASTA_AGENTES, "Agente QA"))
const cto = lerComMtime(ultimoArquivo(PASTA_AGENTES, "Agente CTO"))
const produto = lerComMtime(ultimoArquivo(PASTA_AGENTES, "Agente Produto"))
const cliente = lerComMtime(ultimoArquivo(PASTA_AGENTES, "Agente Cliente"))
const evolucao = lerComMtime(ultimoArquivo(PASTA_AUTO_EVO))

const recomendacaoCTO = extrairSecao(cto.texto, "RECOMENDACAO FINAL") || extrairSecao(cto.texto, "RECOMENDA[ÇC][ÃA]O FINAL")
const decisoesCTO = extrairSecao(cto.texto, "DECIS[OÕ]ES DA SEMANA")
const alertasProduto = extrairSecao(produto.texto, "ALERTAS")
const insightsProduto = extrairSecao(produto.texto, "INSIGHTS")
const evolucoesAutoEvo = extrairSecao(evolucao.texto, "EVOLUC[OÕ]ES SUGERIDAS PARA ESTA SEMANA") || extrairSecao(evolucao.texto, "EVOLUCOES SUGERIDAS")
const severidadeQA = extrairSeveridadeQA(qa.texto)

const snapshot = `${MARCADOR_INICIO}

# Snapshot dos Agentes (gerado automaticamente)

> Atualizado a cada execução de \`node scripts/agentes-automaticos/atualizar-dashboard-operacional.js\` ou pelo watcher.

## 🤖 Status dos Agentes

| Agente | Último relatório | Quando |
|---|---|---|
| QA | \`${qa.nome}\` (severidade: **${severidadeQA}**) | ${qa.quando} |
| Arquiteto | \`${arquiteto.nome}\` | ${arquiteto.quando} |
| CTO | \`${cto.nome}\` | ${cto.quando} |
| Produto | \`${produto.nome}\` | ${produto.quando} |
| Cliente | \`${cliente.nome}\` | ${cliente.quando} |
| Auto-evolução | \`${evolucao.nome}\` | ${evolucao.quando} |

## 🎯 Recomendação do CTO

${recomendacaoCTO ? recomendacaoCTO : "_(sem recomendação extraída)_"}

## 📋 Decisões da Semana (CTO)

${decisoesCTO ? primeirasLinhas(decisoesCTO, 10) : "_(sem decisões extraídas)_"}

## 💡 Insights de Produto

${insightsProduto ? primeirasLinhas(insightsProduto, 8) : "_(sem insights extraídos)_"}

## ⚠️ Alertas de Produto

${alertasProduto ? primeirasLinhas(alertasProduto, 6) : "_(sem alertas)_"}

## 🧠 Evoluções Sugeridas pela Auto-Evolução

${evolucoesAutoEvo ? primeirasLinhas(evolucoesAutoEvo, 15) : "_(sem evoluções sugeridas)_"}

${MARCADOR_FIM}`

const conteudoAtual = fs.readFileSync(DASHBOARD, "utf8")

let novo
if (conteudoAtual.includes(MARCADOR_INICIO) && conteudoAtual.includes(MARCADOR_FIM)) {
  const regex = new RegExp(`${MARCADOR_INICIO}[\\s\\S]*?${MARCADOR_FIM}`, "g")
  novo = conteudoAtual.replace(regex, snapshot)
} else {
  novo = conteudoAtual.replace(
    /^# Status Geral/m,
    `${snapshot}\n\n---\n\n# Status Geral`
  )
}

fs.writeFileSync(DASHBOARD, novo, "utf8")
console.log("[DASH] Dashboard Operacional atualizado com snapshot dos agentes.")
console.log("[DASH] Arquivo:", DASHBOARD)
