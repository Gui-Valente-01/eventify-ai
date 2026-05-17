import dotenv from "dotenv"
dotenv.config({ path: "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai/.env.local" })

import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import { GoogleGenAI } from "@google/genai"
import { checkGeminiQuota, registerGeminiCall } from "../lib/geminiQuota.js"

const PROJETO = "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai"
const OBSIDIAN = "C:/Users/Win 11/Desktop/eventify"
const DATA = new Date().toISOString().slice(0, 10)
const PASTA_AGENTES = path.join(OBSIDIAN, "21 - AUTOMACOES", "AGENTES AUTOMATICOS")

function salvarArquivo(caminho, conteudo) {
  fs.mkdirSync(path.dirname(caminho), { recursive: true })
  fs.writeFileSync(caminho, conteudo, "utf8")
}

function rodarComando(comando) {
  try {
    return execSync(comando, { cwd: PROJETO, encoding: "utf8", stdio: "pipe" })
  } catch (error) {
    return (error.stdout || "") + "\n" + (error.stderr || "")
  }
}

function lerArquivo(caminho) {
  if (!fs.existsSync(caminho)) return ""
  return fs.readFileSync(caminho, "utf8")
}

function ultimoRelatorio(prefixo) {
  if (!fs.existsSync(PASTA_AGENTES)) return { nome: "", conteudo: "" }
  const arquivos = fs
    .readdirSync(PASTA_AGENTES)
    .filter((f) => f.startsWith(prefixo) && f.endsWith(".md"))
    .sort()
    .reverse()
  if (!arquivos.length) return { nome: "", conteudo: "" }
  const escolhido = arquivos[0]
  return {
    nome: escolhido,
    conteudo: lerArquivo(path.join(PASTA_AGENTES, escolhido))
  }
}

function warnExit(motivo) {
  console.warn(`[CTO] AVISO: ${motivo}`)
  console.warn(`[CTO] Saindo com exit 0 (modo seguro).`)
  process.exit(0)
}

console.log("[CTO] Agente CTO iniciado...")

const arquiteto = ultimoRelatorio("Agente Arquiteto")
const qa = ultimoRelatorio("Agente QA")

const roadmap = lerArquivo(
  path.join(OBSIDIAN, "Eventify", "ROADMAP", "Roadmap Principal.md.md")
)
const dashboard = lerArquivo(
  path.join(OBSIDIAN, "Eventify", "CENTRAL", "Dashboard Operacional.md.md")
)
const visaoGeral = lerArquivo(
  path.join(OBSIDIAN, "Eventify", "PRODUTO", "Visao Geral.md.md")
)
const ideias = lerArquivo(
  path.join(OBSIDIAN, "Eventify", "IDEIAS FUTURAS", "Ideias Futuras.md.md")
)

const commitsSemana = rodarComando('git log --since="7 days ago" --pretty=format:"%h %s"')
const branchAtual = rodarComando("git rev-parse --abbrev-ref HEAD").trim()

console.log(`[CTO] Último Arquiteto: ${arquiteto.nome || "(nenhum)"}`)
console.log(`[CTO] Último QA: ${qa.nome || "(nenhum)"}`)
console.log(`[CTO] Branch: ${branchAtual}`)

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
if (!GEMINI_KEY) {
  warnExit("GEMINI_API_KEY / GOOGLE_API_KEY não configurada.")
}

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY })

const contexto = `
Voce e o Agente CTO do projeto Eventify AI (SaaS Next.js para sites de eventos com IA).

Seu papel NAO e tecnico de baixo nivel (esse e o Arquiteto). Seu papel e estrategico:
- decidir o que fazer NESTA SEMANA
- decidir o que adiar
- identificar riscos macro (negocio, equipe, mercado, dependencias criticas)
- alinhar tecnico com roadmap e produto
- detectar quando o roadmap esta desatualizado vs realidade

Formato OBRIGATORIO de resposta:

## DECISOES DA SEMANA
- 3 a 5 decisoes acionaveis priorizadas (a primeira = mais importante)

## ADIAR / DESPRIORIZAR
- itens que estao no roadmap mas nao devem receber atencao agora, com motivo

## RISCOS MACRO
- riscos de negocio/operacao/dependencia que NAO sao bugs tecnicos

## DESALINHAMENTOS
- onde Arquiteto, QA, Roadmap ou Produto estao se contradizendo

## RECOMENDACAO FINAL
- uma frase com o foco principal da semana

Regras:
- seja direto, sem floreio
- nao invente fatos: se nao ha relatorio do Arquiteto ou do QA, diga isso
- priorize VALOR DE NEGOCIO sobre limpeza tecnica
- considere que o time e pequeno (provavelmente 1 dev), tempo e o recurso mais escasso

# Roadmap atual
${roadmap || "(roadmap nao encontrado)"}

# Visao de produto
${visaoGeral || "(visao geral nao encontrada)"}

# Ideias futuras (backlog)
${ideias || "(ideias futuras nao encontradas)"}

# Dashboard operacional
${dashboard || "(dashboard nao encontrado)"}

# Ultimo relatorio do Arquiteto (${arquiteto.nome || "nenhum"})
${arquiteto.conteudo || "(sem relatorio)"}

# Ultimo relatorio do QA (${qa.nome || "nenhum"})
${qa.conteudo || "(sem relatorio)"}

# Atividade Git (7 dias) - branch: ${branchAtual}
${commitsSemana || "(sem commits)"}
`

const quotaCheck = checkGeminiQuota("agente-cto")
if (!quotaCheck.ok) {
  warnExit(quotaCheck.message)
}

let respostaTexto = ""
try {
  const resposta = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contexto
  })
  respostaTexto = resposta.text || ""
  registerGeminiCall("agente-cto")
} catch (err) {
  warnExit(`Falha ao chamar Gemini: ${err.message}`)
}

const saida = path.join(PASTA_AGENTES, `Agente CTO - ${DATA}.md`)

salvarArquivo(
  saida,
  `# AGENTE CTO - ${DATA}

**Branch:** \`${branchAtual}\`
**Fontes:** Arquiteto: \`${arquiteto.nome || "—"}\` | QA: \`${qa.nome || "—"}\`

${respostaTexto}

---

# RELACIONAMENTOS

- [[Roadmap Principal]]
- [[Visao Geral]]
- [[Ideias Futuras]]
- [[Dashboard Operacional]]
- [[Arquitetura]]
- [[Git Hooks]]
`
)

console.log(`[CTO] Relatório salvo: ${saida}`)
console.log("[CTO] Agente CTO finalizado.")
