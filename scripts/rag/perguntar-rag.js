import dotenv from "dotenv"
dotenv.config({ path: "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai/.env.local" })

import fs from "fs"
import path from "path"
import { GoogleGenAI } from "@google/genai"

const OBSIDIAN = "C:/Users/Win 11/Desktop/eventify"

const INDICE = path.join(
  OBSIDIAN,
  "21 - AUTOMACOES",
  "RAG",
  "indice-rag.json"
)

const pergunta = process.argv.slice(2).join(" ")

if (!pergunta) {
  console.log("Digite uma pergunta.")
  process.exit(1)
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
})

const indice = JSON.parse(fs.readFileSync(INDICE, "utf8"))

function pontuar(item) {
  const texto = `${item.arquivo} ${item.conteudo}`.toLowerCase()

  const palavras = pergunta.toLowerCase().split(" ")

  let score = 0

  for (const palavra of palavras) {
    if (texto.includes(palavra)) score += 1
    if (item.arquivo.toLowerCase().includes(palavra)) score += 2
  }

  return score
}

const relevantes = indice
  .map((item) => ({
    ...item,
    score: pontuar(item)
  }))
  .filter((item) => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 5)

const contexto = relevantes
  .map(
    (item) => `
# ARQUIVO
${item.arquivo}

# CONTEUDO
${item.conteudo}
`
  )
  .join("\n\n")

const prompt = `
Voce e a memoria inteligente do projeto Eventify AI.

Responda usando SOMENTE os arquivos fornecidos.

Pergunta:
${pergunta}

Contexto:
${contexto}
`

const resposta = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt
})

console.log("")
console.log("RESPOSTA IA:")
console.log("")
console.log(resposta.text)