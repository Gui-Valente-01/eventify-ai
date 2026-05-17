import dotenv from "dotenv"
dotenv.config({ path: "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai/.env.local" })

import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import { GoogleGenAI } from "@google/genai"

const PROJETO = "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai"
const OBSIDIAN = "C:/Users/Win 11/Desktop/eventify"
const DATA = new Date().toISOString().slice(0, 10)

const args = process.argv.slice(2)
const fullBuild = args.includes("--full")
const argMode = args.includes("--blocking") ? "blocking" : null
const argLevel = args.includes("--critical") ? "critical" : args.includes("--high") ? "high" : args.includes("--medium") ? "medium" : null
const QA_MODE = (argMode || process.env.QA_MODE || "warn-only").toLowerCase()
const QA_BLOCK_LEVEL = (argLevel || process.env.QA_BLOCK_LEVEL || "high").toLowerCase()

const SEVERITY_RANK = { none: 0, low: 1, medium: 2, high: 3, critical: 4 }
const blockRank = SEVERITY_RANK[QA_BLOCK_LEVEL] ?? SEVERITY_RANK.high

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

class WarnExit extends Error {
  constructor(motivo) { super(motivo); this.name = "WarnExit" }
}
function warnExit(motivo) { throw new WarnExit(motivo) }

async function main() {
console.log(`[QA] Agente QA iniciado (modo: ${QA_MODE}, threshold: ${QA_BLOCK_LEVEL})`)

const checkCmd = fullBuild ? "npm run build" : "npx tsc --noEmit"
console.log(`[QA] Rodando: ${checkCmd}`)
const buildOut = rodarComando(checkCmd)

console.log(`[QA] Rodando: npm run lint`)
const lintOut = rodarComando("npm run lint")

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
if (!GEMINI_KEY) {
  warnExit("GEMINI_API_KEY / GOOGLE_API_KEY não configurada. Pulando análise IA.")
}

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY })

const contexto = `
Voce e o Agente QA do projeto Eventify AI (SaaS Next.js para sites de eventos com IA).

Sua resposta DEVE comecar com um bloco de veredito estruturado, no formato exato abaixo, e depois uma analise livre.

FORMATO OBRIGATORIO (copie e preencha):

## VEREDITO
\`\`\`json
{
  "severity": "none|low|medium|high|critical",
  "blockers": ["lista curta de problemas que justificam bloquear push, ou array vazio"],
  "summary": "uma frase resumindo o estado do projeto"
}
\`\`\`

## ANALISE
<texto livre: riscos, sugestoes, checklist, etc>

Criterios de severidade:
- critical: build falhou, type-check com erros graves, dependencia quebrada
- high: erros de lint, testes falhando, regressao funcional provavel
- medium: warnings repetidos, codigo morto, code smell consistente
- low: melhorias estilisticas, sugestoes opcionais
- none: tudo limpo

# Resultado do type-check / build (${checkCmd})
${buildOut}

# Resultado do lint
${lintOut}
`

let respostaTexto = ""
try {
  const resposta = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contexto
  })
  respostaTexto = resposta.text || ""
} catch (err) {
  warnExit(`Falha ao chamar Gemini: ${err.message}`)
}

function extrairVeredito(texto) {
  const m = texto.match(/```json\s*([\s\S]*?)```/)
  if (!m) return null
  try {
    const parsed = JSON.parse(m[1])
    if (typeof parsed.severity !== "string") return null
    return {
      severity: parsed.severity.toLowerCase(),
      blockers: Array.isArray(parsed.blockers) ? parsed.blockers : [],
      summary: typeof parsed.summary === "string" ? parsed.summary : ""
    }
  } catch {
    return null
  }
}

const veredito = extrairVeredito(respostaTexto)
const severity = veredito?.severity ?? "low"
const severityRank = SEVERITY_RANK[severity] ?? SEVERITY_RANK.low

const saida = path.join(
  OBSIDIAN,
  "21 - AUTOMACOES",
  "AGENTES AUTOMATICOS",
  `Agente QA - ${DATA}.md`
)

salvarArquivo(
  saida,
  `# AGENTE QA - ${DATA}

**Severidade detectada:** \`${severity}\`
**Modo:** \`${QA_MODE}\` | **Threshold de bloqueio:** \`${QA_BLOCK_LEVEL}\`
${veredito?.summary ? `**Resumo:** ${veredito.summary}` : ""}

${respostaTexto}

---

# RELACIONAMENTOS

- [[Checklist de Testes]]
- [[Deploy e Producao]]
- [[Sistema de Automacao]]
- [[Dashboard Operacional]]
- [[Git Hooks]]
`
)

console.log(`[QA] Relatorio salvo: ${saida}`)
console.log(`[QA] Severidade: ${severity}`)
if (veredito?.blockers?.length) {
  console.log(`[QA] Blockers:`)
  veredito.blockers.forEach((b) => console.log(`  - ${b}`))
}

const deveriaBlocar = severityRank >= blockRank
if (!veredito) {
  console.warn(`[QA] AVISO: Veredito JSON nao encontrado/invalido na resposta do Gemini. Tratado como severity=low.`)
}

if (deveriaBlocar && QA_MODE === "blocking") {
  console.error(`[QA] BLOQUEADO: severidade '${severity}' >= threshold '${QA_BLOCK_LEVEL}'.`)
  process.exitCode = 1
  return
}

if (deveriaBlocar) {
  console.warn(`[QA] Em modo blocking, isso bloquearia o push. (Modo atual: ${QA_MODE})`)
}

console.log(`[QA] Agente QA finalizado com exit 0.`)

}

main().catch((err) => {
  if (err instanceof WarnExit) {
    console.warn(`[QA] AVISO: ${err.message}`)
    console.warn(`[QA] Saindo com exit 0 (modo seguro).`)
    process.exitCode = 0
    return
  }
  console.error("[QA] Erro inesperado:", err)
  process.exitCode = 1
})
