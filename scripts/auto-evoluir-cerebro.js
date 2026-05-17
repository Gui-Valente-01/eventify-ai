import dotenv from "dotenv"
dotenv.config({ path: "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai/.env.local" })

import fs from "fs"
import path from "path"
import { GoogleGenAI } from "@google/genai"
import { checkGeminiQuota, registerGeminiCall } from "./lib/geminiQuota.js"

const OBSIDIAN = "C:\\Users\\Win 11\\Desktop\\eventify"
const VAULT = path.join(OBSIDIAN, "Eventify")
const PASTA_AGENTES = path.join(OBSIDIAN, "21 - AUTOMACOES", "AGENTES AUTOMATICOS")
const PASTA_GITHUB = path.join(OBSIDIAN, "22 - GITHUB")
const PASTA_AUTO_EVO = path.join(OBSIDIAN, "21 - AUTOMACOES", "AUTO EVOLUCAO")
const PASTA_LOG_CLAUDE = path.join(VAULT, "CENTRAL", "LOG CLAUDE")
const DATA = new Date().toISOString().slice(0, 10)
const LIMITE_POR_ARQUIVO = 5000

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
})

function ler(caminho) {
  try {
    if (!fs.existsSync(caminho)) return ""
    return fs.readFileSync(caminho, "utf8").slice(0, LIMITE_POR_ARQUIVO)
  } catch {
    return ""
  }
}

function ultimoEm(pasta, prefixo = "") {
  if (!fs.existsSync(pasta)) return null
  const arquivos = fs
    .readdirSync(pasta)
    .filter((f) => f.endsWith(".md") && (!prefixo || f.startsWith(prefixo)))
    .sort()
    .reverse()
  return arquivos[0] ? path.join(pasta, arquivos[0]) : null
}

function listarArvore(dir, profundidade = 2, nivel = 0) {
  if (!fs.existsSync(dir) || nivel >= profundidade) return []
  const itens = []
  for (const nome of fs.readdirSync(dir)) {
    const completo = path.join(dir, nome)
    try {
      const stat = fs.statSync(completo)
      if (stat.isDirectory()) {
        itens.push(`${"  ".repeat(nivel)}📁 ${nome}/`)
        itens.push(...listarArvore(completo, profundidade, nivel + 1))
      } else if (nome.endsWith(".md")) {
        itens.push(`${"  ".repeat(nivel)}📄 ${nome}`)
      }
    } catch {}
  }
  return itens
}

console.log("[AUTO-EVO] Coletando contexto do cérebro...")

const docs = {
  "Visao Geral (PRODUTO)": ler(path.join(VAULT, "PRODUTO", "Visao Geral.md.md")),
  "Roadmap Principal": ler(path.join(VAULT, "ROADMAP", "Roadmap Principal.md.md")),
  "Ideias Futuras": ler(path.join(VAULT, "IDEIAS FUTURAS", "Ideias Futuras.md.md")),
  "Arquitetura": ler(path.join(VAULT, "DOCUMENTACAO TECNICA", "Arquitetura.md.md")),
  "Git Hooks": ler(path.join(VAULT, "DOCUMENTACAO TECNICA", "Git Hooks.md")),
  "Watcher do Cerebro": ler(path.join(VAULT, "DOCUMENTACAO TECNICA", "Watcher do Cerebro.md")),
  "Agentes": ler(path.join(VAULT, "IA E AGENTES", "Agentes.md.md")),
  "Dashboard Operacional": ler(path.join(VAULT, "CENTRAL", "Dashboard Operacional.md.md")),
  "Integracao Claude": ler(path.join(VAULT, "CENTRAL", "Integracao Claude.md")),
  "Estrutura Backend": ler(path.join(VAULT, "BACKEND", "Estrutura Backend.md.md")),
  "Estrutura Frontend": ler(path.join(VAULT, "FRONTEND", "Estrutura Frontend.md.md")),
  "Sistema Stripe": ler(path.join(VAULT, "STRIPE", "Sistema Stripe.md.md")),
  "Sistema Supabase": ler(path.join(VAULT, "SUPABASE", "Sistema Supabase.md.md")),
  "Sistema Templates": ler(path.join(VAULT, "TEMPLATE", "Sistema Templates.md.md")),
  "Editor Visual do Cliente": ler(path.join(VAULT, "EDITOR VISUAL", "Editor Visual do Cliente.md.md"))
}

const ultimoLogClaude = ultimoEm(PASTA_LOG_CLAUDE)
const ultimoArquiteto = ultimoEm(PASTA_AGENTES, "Agente Arquiteto")
const ultimoQA = ultimoEm(PASTA_AGENTES, "Agente QA")
const ultimoCTO = ultimoEm(PASTA_AGENTES, "Agente CTO")
const ultimoProduto = ultimoEm(PASTA_AGENTES, "Agente Produto")
const ultimoCliente = ultimoEm(PASTA_AGENTES, "Agente Cliente")
const ultimoGitHub = ultimoEm(PASTA_GITHUB)
const ultimaEvolucao = ultimoEm(PASTA_AUTO_EVO)

const relatorios = {
  "Último LOG Claude": ler(ultimoLogClaude),
  "Último Arquiteto": ler(ultimoArquiteto),
  "Último QA": ler(ultimoQA),
  "Último CTO": ler(ultimoCTO),
  "Último Produto": ler(ultimoProduto),
  "Último Cliente": ler(ultimoCliente),
  "Último GitHub": ler(ultimoGitHub),
  "Última auto-evolução (anterior)": ler(ultimaEvolucao)
}

const arvore = listarArvore(VAULT, 2).join("\n")

const totalChars = Object.values(docs).reduce((a, b) => a + b.length, 0) +
                   Object.values(relatorios).reduce((a, b) => a + b.length, 0)
console.log(`[AUTO-EVO] Contexto: ${Object.keys(docs).length} docs + ${Object.keys(relatorios).length} relatórios = ${totalChars} chars`)

function bloco(titulo, conteudo) {
  if (!conteudo || !conteudo.trim()) return `## ${titulo}\n(arquivo ausente ou vazio)\n`
  return `## ${titulo}\n${conteudo.trim()}\n`
}

const contexto = `
Voce e o AGENTE AUTOEVOLUIDOR do cerebro Obsidian do projeto Eventify AI.

Seu papel:
- Analisar o estado REAL do cerebro (que ja tem muito conteudo, NAO esta vazio)
- Identificar GAPS de cobertura — assuntos importantes que faltam
- Identificar CONEXOES faltando entre notas (linkagem Obsidian)
- Detectar INCONSISTENCIAS entre docs (ex: roadmap dizendo X, mas codigo fazendo Y)
- Sugerir EVOLUCOES concretas e implementaveis

Regras IMPORTANTES:
- O cerebro NAO esta vazio. NAO sugira criar notas que ja existem.
- Use os nomes REAIS das notas listadas na arvore abaixo. Use [[Nome Real da Nota]].
- Seja especifico: cite trechos das notas para justificar suas sugestoes.
- Priorize qualidade > quantidade. 3 sugestoes profundas > 15 superficiais.

Formato OBRIGATORIO da resposta:

## ESTADO DO CEREBRO
2-3 paragrafos descrevendo o que o cerebro JA cobre bem e onde tem fragilidades.

## GAPS DE COBERTURA
- Lista de 3-5 topicos importantes ausentes ou subdesenvolvidos. Para cada um, diga onde a nota deveria viver (pasta) e que perguntas ela deveria responder.

## CONEXOES FALTANDO
- Lista de 3-5 pares de notas que deveriam estar linkadas entre si mas nao estao. Justifique.

## INCONSISTENCIAS DETECTADAS
- Contradições entre docs, ou entre docs e relatorios de agentes. Pode ser zero se nao houver.

## EVOLUCOES SUGERIDAS PARA ESTA SEMANA
- 3 acoes concretas de melhoria do cerebro (nao do codigo) priorizadas. Cada uma com: o que fazer, em qual arquivo, que impacto traz.

# ARVORE DO VAULT (estrutura real)
\`\`\`
${arvore}
\`\`\`

# DOCS PRINCIPAIS DO CEREBRO

${Object.entries(docs).map(([k, v]) => bloco(k, v)).join("\n")}

# ULTIMOS RELATORIOS DE AGENTES E LOGS

${Object.entries(relatorios).map(([k, v]) => bloco(k, v)).join("\n")}
`

console.log("[AUTO-EVO] Chamando Gemini...")

const quotaCheckEvo = checkGeminiQuota("auto-evoluir")
let texto = ""
if (!quotaCheckEvo.ok) {
  console.warn(`[AUTO-EVO] ${quotaCheckEvo.message}`)
  texto = `> ${quotaCheckEvo.message}`
} else {
  try {
    const resposta = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contexto
    })
    texto = resposta.text || ""
    registerGeminiCall("auto-evoluir")
  } catch (err) {
    console.error("[AUTO-EVO] Falha no Gemini:", err.message)
    texto = `> Falha ao chamar Gemini: ${err.message}`
  }
}

const saida = path.join(PASTA_AUTO_EVO, `Auto Evolucao - ${DATA}.md`)
fs.mkdirSync(path.dirname(saida), { recursive: true })

fs.writeFileSync(
  saida,
  `# AUTO EVOLUCAO DO CEREBRO - ${DATA}

**Contexto enviado:** ${Object.keys(docs).length} docs do vault + ${Object.keys(relatorios).length} relatorios recentes (~${Math.round(totalChars / 1000)}k chars)

${texto}

---

# RELACIONAMENTOS

- [[Dashboard Operacional]]
- [[Roadmap Principal]]
- [[Integracao Claude]]
- [[Agentes]]
`,
  "utf8"
)

console.log("[AUTO-EVO] Salvo:", saida)
