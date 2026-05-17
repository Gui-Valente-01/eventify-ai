import dotenv from "dotenv"
dotenv.config({ path: "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai/.env.local" })

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

const PASTAS_PARA_LER = [
  "app",
  "lib",
  "components",
  "agentes",
  "scripts"
]

const EXTENSOES = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md"
]

const IGNORAR = [
  "node_modules",
  ".next",
  ".git",
  "package-lock.json"
]

function deveIgnorar(caminho) {
  return IGNORAR.some((item) => caminho.includes(item))
}

function listarArquivos(dir, arquivos = []) {
  if (!fs.existsSync(dir)) return arquivos

  for (const item of fs.readdirSync(dir)) {
    const completo = path.join(dir, item)

    if (deveIgnorar(completo)) continue

    const stat = fs.statSync(completo)

    if (stat.isDirectory()) {
      listarArquivos(completo, arquivos)
    } else {
      const ext = path.extname(completo)

      if (EXTENSOES.includes(ext)) {
        arquivos.push(completo)
      }
    }
  }

  return arquivos
}

function lerArquivoSeguro(caminho) {
  try {
    const conteudo = fs.readFileSync(caminho, "utf8")

    return conteudo.slice(0, 4000)
  } catch {
    return ""
  }
}

function salvarArquivo(caminho, conteudo) {
  fs.mkdirSync(path.dirname(caminho), { recursive: true })
  fs.writeFileSync(caminho, conteudo, "utf8")
}

console.log("Indexando projeto Eventify AI...")

let resumoArquivos = ""

for (const pasta of PASTAS_PARA_LER) {
  const caminhoPasta = path.join(PROJETO, pasta)
  const arquivos = listarArquivos(caminhoPasta)

  for (const arquivo of arquivos) {
    const relativo = path.relative(PROJETO, arquivo)
    const conteudo = lerArquivoSeguro(arquivo)

    resumoArquivos += `

# ARQUIVO: ${relativo}

${conteudo}

---`
  }
}

const contexto = `
Voce e um agente indexador do projeto Eventify AI.

Sua funcao:
- ler os arquivos do projeto
- explicar a estrutura geral
- identificar modulos principais
- identificar riscos
- identificar partes importantes
- criar um mapa tecnico simples

Regras:
- nao invente arquivos
- nao exponha segredos
- nao copie chaves de API
- seja objetivo
- pense como engenheiro senior

# Arquivos lidos
${resumoArquivos}
`

const quotaCheckIdx = checkGeminiQuota("indexar-projeto")
if (!quotaCheckIdx.ok) {
  console.warn(`[INDEX] ${quotaCheckIdx.message}`)
  process.exit(0)
}

const resposta = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: contexto
})
registerGeminiCall("indexar-projeto")

const saida = path.join(
  OBSIDIAN,
  "21 - AUTOMACOES",
  "INDICE DO PROJETO",
  `Indice Projeto - ${DATA}.md`
)

salvarArquivo(
  saida,
  `# INDICE DO PROJETO EVENTIFY AI - ${DATA}

${resposta.text}

---

# RELACIONAMENTOS

- [[Arquitetura]]
- [[Estrutura Backend]]
- [[Estrutura Frontend]]
- [[Sistema de Agentes]]
- [[Sistema de Automacao]]
- [[Dashboard Operacional]]
`
)

console.log("Indice do projeto criado:")
console.log(saida)