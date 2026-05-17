import fs from "fs"
import path from "path"

const OBSIDIAN = "C:/Users/Win 11/Desktop/eventify"
const INDICE = path.join(OBSIDIAN, "21 - AUTOMACOES", "RAG", "indice-rag.json")

const pergunta = process.argv.slice(2).join(" ").toLowerCase()

if (!pergunta) {
  console.log("Digite uma pergunta.")
  console.log('Exemplo: node .\\scripts\\rag\\buscar-rag.js "stripe checkout"')
  process.exit(1)
}

const indice = JSON.parse(fs.readFileSync(INDICE, "utf8"))

function pontuar(item) {
  const texto = `${item.arquivo} ${item.conteudo}`.toLowerCase()
  const palavras = pergunta.split(" ").filter(Boolean)

  let score = 0

  for (const palavra of palavras) {
    if (texto.includes(palavra)) score += 1
    if (item.arquivo.toLowerCase().includes(palavra)) score += 2
  }

  return score
}

const resultados = indice
  .map((item) => ({
    ...item,
    score: pontuar(item)
  }))
  .filter((item) => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 5)

console.log(`Resultados para: ${pergunta}`)
console.log("")

for (const item of resultados) {
  console.log("Arquivo:", item.arquivo)
  console.log("Score:", item.score)
  console.log("---")
}