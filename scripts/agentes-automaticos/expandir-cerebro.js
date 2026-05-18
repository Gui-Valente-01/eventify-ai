import dotenv from "dotenv"
dotenv.config({ path: "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai/.env.local" })

import fs from "fs"
import path from "path"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

const OBSIDIAN = "C:/Users/Win 11/Desktop/eventify"

const notas = [
  {
    pasta: "CLIENTES",
    nome: "Dores dos Clientes.md",
    tema: "dores e dificuldades dos clientes do Eventify AI"
  },
  {
    pasta: "PRODUTO",
    nome: "Planos e Beneficios.md",
    tema: "planos do Eventify AI e beneficios de cada plano"
  },
  {
    pasta: "MARKETING",
    nome: "Posicionamento da Marca.md",
    tema: "posicionamento do Eventify AI no mercado"
  },
  {
    pasta: "EMPRESA",
    nome: "Modelo de Negocio.md",
    tema: "modelo de negocio SaaS do Eventify AI"
  },
  {
    pasta: "CLIENTES",
    nome: "Jornada do Cliente.md",
    tema: "jornada do cliente dentro do Eventify AI"
  }
]

function salvarArquivo(caminho, conteudo) {
  fs.mkdirSync(path.dirname(caminho), { recursive: true })
  fs.writeFileSync(caminho, conteudo, "utf8")
}

console.log("Expandindo cerebro Obsidian...")

for (const nota of notas) {
  const prompt = `
Voce e um especialista em produto SaaS e IA.

Crie uma nota Obsidian profissional sobre:
${nota.tema}

Contexto:
O Eventify AI e um SaaS que cria sites de eventos com inteligencia artificial.

A nota deve:
- ser organizada
- ser util
- conter ideias reais
- conter exemplos
- conter estrategia
- ajudar futuras IAs entenderem o negocio

Adicione:
- titulos
- listas
- insights
- proximas ideias
- relacionamentos Obsidian
`

  const resposta = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  })

  const caminho = path.join(
    OBSIDIAN,
    nota.pasta,
    nota.nome
  )

  salvarArquivo(
    caminho,
    `# ${nota.nome.replace(".md", "")}

${resposta.text}

---

# RELACIONAMENTOS

- [[Dashboard Operacional]]
- [[Roadmap Principal]]
- [[Visao Geral]]
- [[Arquitetura]]
- [[Sistema de Automacao]]
`
  )

  console.log(`Nota criada: ${nota.nome}`)
}

console.log("")
console.log("Cerebro expandido com sucesso.")