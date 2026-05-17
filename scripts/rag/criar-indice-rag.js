import fs from "fs"
import path from "path"

const PROJETO = "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai"
const OBSIDIAN = "C:/Users/Win 11/Desktop/eventify"

const PASTAS = [
  "app",
  "lib",
  "components",
  "agentes",
  "scripts"
]

const EXTENSOES = [".ts", ".tsx", ".js", ".jsx", ".json", ".md"]

const IGNORAR = ["node_modules", ".next", ".git", "package-lock.json"]

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

function lerArquivo(caminho) {
  try {
    return fs.readFileSync(caminho, "utf8").slice(0, 6000)
  } catch {
    return ""
  }
}

const indice = []

for (const pasta of PASTAS) {
  const caminhoPasta = path.join(PROJETO, pasta)
  const arquivos = listarArquivos(caminhoPasta)

  for (const arquivo of arquivos) {
    const relativo = path.relative(PROJETO, arquivo)
    const conteudo = lerArquivo(arquivo)

    indice.push({
      arquivo: relativo,
      conteudo
    })
  }
}

const saidaJson = path.join(OBSIDIAN, "21 - AUTOMACOES", "RAG", "indice-rag.json")
const saidaMd = path.join(OBSIDIAN, "21 - AUTOMACOES", "RAG", "Indice RAG.md")

fs.mkdirSync(path.dirname(saidaJson), { recursive: true })

fs.writeFileSync(saidaJson, JSON.stringify(indice, null, 2), "utf8")

fs.writeFileSync(
  saidaMd,
  `# INDICE RAG EVENTIFY

Arquivos indexados: ${indice.length}

Este arquivo representa a memoria pesquisavel do projeto Eventify AI.

# RELACIONAMENTOS

- [[Dashboard Operacional]]
- [[Sistema de Automacao]]
- [[Arquitetura]]
- [[Sistema de Agentes]]
`,
  "utf8"
)

console.log("Indice RAG criado com sucesso!")
console.log(saidaJson)