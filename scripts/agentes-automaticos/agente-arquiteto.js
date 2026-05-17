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

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
})

function salvarArquivo(caminho, conteudo) {
  fs.mkdirSync(path.dirname(caminho), { recursive: true })
  fs.writeFileSync(caminho, conteudo, "utf8")
}

function rodarComando(comando) {
  try {
    return execSync(comando, {
      cwd: PROJETO,
      encoding: "utf8",
      stdio: "pipe"
    })
  } catch (error) {
    return error.stdout + "\n" + error.stderr
  }
}

function lerArquivo(caminho) {
  if (!fs.existsSync(caminho)) return ""
  return fs.readFileSync(caminho, "utf8")
}

console.log("Agente Arquiteto iniciado...")

const estrutura = rodarComando("git ls-files")
const status = rodarComando("git status --short")
const commits = rodarComando("git log --oneline -5")

const dashboard = lerArquivo(path.join(OBSIDIAN, "Eventify", "CENTRAL", "Dashboard Operacional.md.md"))
const roadmap = lerArquivo(path.join(OBSIDIAN, "Eventify", "ROADMAP", "Roadmap Principal.md.md"))
const arquitetura = lerArquivo(path.join(OBSIDIAN, "Eventify", "DOCUMENTACAO TECNICA", "Arquitetura.md.md"))

const contexto = `
Voce e o Agente Arquiteto do projeto Eventify AI.

Sua funcao:
- analisar a arquitetura atual
- identificar gargalos
- sugerir refatoracoes
- sugerir proximos modulos
- apontar riscos tecnicos
- pensar como engenheiro senior

Regras:
- nao invente arquivos que nao existem
- nao sugira reescrever tudo
- priorize melhorias pequenas e seguras
- pense em SaaS, IA, Supabase, Stripe e Next.js

# Estrutura de arquivos do Git
${estrutura}

# Status atual do Git
${status}

# Ultimos commits
${commits}

# Dashboard Obsidian
${dashboard}

# Roadmap
${roadmap}

# Arquitetura documentada
${arquitetura}
`

const quotaCheck = checkGeminiQuota("agente-arquiteto")
if (!quotaCheck.ok) {
  console.warn(`[Arquiteto] ${quotaCheck.message}`)
  process.exit(0)
}

const resposta = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: contexto
})
registerGeminiCall("agente-arquiteto")

const saida = path.join(
  OBSIDIAN,
  "21 - AUTOMACOES",
  "AGENTES AUTOMATICOS",
  `Agente Arquiteto - ${DATA}.md`
)

salvarArquivo(
  saida,
  `# AGENTE ARQUITETO - ${DATA}

${resposta.text}

---

# RELACIONAMENTOS

- [[Arquitetura]]
- [[Roadmap Principal]]
- [[Estrutura Backend]]
- [[Estrutura Frontend]]
- [[Sistema de Automacao]]
- [[Dashboard Operacional]]
`
)

console.log("Agente Arquiteto finalizado:")
console.log(saida)