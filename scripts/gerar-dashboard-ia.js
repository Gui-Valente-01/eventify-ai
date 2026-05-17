import dotenv from "dotenv"
dotenv.config({ path: "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai/.env.local" })

import fs from "fs"
import path from "path"

const OBSIDIAN = "C:/Users/Win 11/Desktop/eventify"
const PROJETO = "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai"
const HOJE = new Date().toISOString().slice(0, 10)

function ultimoArquivo(pasta) {
  if (!fs.existsSync(pasta)) return null
  const arquivos = fs
    .readdirSync(pasta)
    .map((nome) => ({
      nome,
      caminho: path.join(pasta, nome),
      data: fs.statSync(path.join(pasta, nome)).mtime
    }))
    .filter((item) => fs.statSync(item.caminho).isFile())
    .sort((a, b) => b.data - a.data)
  return arquivos[0] || null
}

function ler(caminho) {
  if (!caminho || !fs.existsSync(caminho)) return "Nada encontrado."
  return fs.readFileSync(caminho, "utf8").slice(0, 2000)
}

function listarAgentesHoje() {
  const pasta = path.join(OBSIDIAN, "21 - AUTOMACOES", "AGENTES AUTOMATICOS")
  if (!fs.existsSync(pasta)) return []
  return fs
    .readdirSync(pasta)
    .filter((f) => f.includes(HOJE) && f.endsWith(".md"))
    .map((f) => f.replace(`- ${HOJE}.md`, "").trim())
}

const autoEvolucao = ultimoArquivo(path.join(OBSIDIAN, "21 - AUTOMACOES", "AUTO EVOLUCAO"))
const github = ultimoArquivo(path.join(OBSIDIAN, "22 - GITHUB"))
const agentes = ultimoArquivo(path.join(OBSIDIAN, "21 - AUTOMACOES", "AGENTES AUTOMATICOS"))
const prompts = ultimoArquivo(path.join(OBSIDIAN, "21 - AUTOMACOES", "PROMPTS CLAUDE"))

const agentesHoje = listarAgentesHoje()
const indiceRag = path.join(OBSIDIAN, "21 - AUTOMACOES", "RAG", "indice-rag.json")
const ragOk = fs.existsSync(indiceRag)

const dados = {
  atualizadoEm: new Date().toISOString(),
  atualizadoEmLocal: new Date().toLocaleString("pt-BR"),
  hoje: HOJE,
  sistema: {
    watcher: "indeterminado",
    rag: ragOk ? "ONLINE" : "INDISPONIVEL",
    gemini: (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) ? "CONFIGURADO" : "SEM CHAVE",
    supabase: process.env.SUPABASE_SERVICE_ROLE_KEY ? "CONFIGURADO" : "SEM CHAVE"
  },
  agentesHoje,
  arquivos: {
    ultimaAutoEvolucao: autoEvolucao?.nome || "Nenhuma",
    ultimoGitHub: github?.nome || "Nenhum",
    ultimoAgente: agentes?.nome || "Nenhum",
    ultimoPromptClaude: prompts?.nome || "Nenhum"
  },
  conteudo: {
    autoEvolucao: ler(autoEvolucao?.caminho),
    github: ler(github?.caminho),
    agente: ler(agentes?.caminho),
    promptClaude: ler(prompts?.caminho)
  }
}

const saida = path.join(PROJETO, "dashboard-ia", "dados.json")
fs.writeFileSync(saida, JSON.stringify(dados, null, 2), "utf8")
console.log("Dados do dashboard gerados:")
console.log(saida)
