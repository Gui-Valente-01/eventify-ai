import { watch } from "chokidar"
import { exec } from "child_process"

const PROJETO = "C:/Users/Win 11/Desktop/eventify/SITE/eventify-ai"
const OBSIDIAN = "C:/Users/Win 11/Desktop/eventify"

const DEBOUNCE_MS = 5000
const GEMINI_MIN_INTERVAL_MS = 5 * 60 * 1000

let timer = null
let rodando = false
let ultimoGemini = 0

function ts() {
  return new Date().toTimeString().slice(0, 8)
}

function log(msg) {
  console.log(`[${ts()}] ${msg}`)
}

function rodar(comando, nome) {
  return new Promise((resolve) => {
    const inicio = Date.now()
    log(`▶ ${nome}…`)
    exec(comando, { cwd: PROJETO, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      const dur = ((Date.now() - inicio) / 1000).toFixed(1)
      if (stdout?.trim()) console.log(stdout.trim())
      if (stderr?.trim()) console.error(stderr.trim())
      if (error) {
        log(`✗ ${nome} falhou (${dur}s): ${error.message}`)
      } else {
        log(`✓ ${nome} (${dur}s)`)
      }
      resolve()
    })
  })
}

async function pipelineCerebro() {
  if (rodando) {
    log("⚠ Pipeline já em execução. Pulando.")
    return
  }
  rodando = true
  log("━━━━━━━━━━ Pipeline do cérebro iniciado ━━━━━━━━━━")

  await rodar(
    'powershell -ExecutionPolicy Bypass -File ".\\scripts\\atualizar-cerebro.ps1"',
    "atualizar-cerebro"
  )

  await rodar('node ".\\scripts\\rag\\criar-indice-rag.js"', "criar-indice-rag")

  await rodar(
    'node ".\\scripts\\agentes-automaticos\\indexar-projeto.js"',
    "indexar-projeto"
  )

  await rodar('node ".\\scripts\\gerar-dashboard-ia.js"', "gerar-dashboard-ia")

  await rodar(
    'node ".\\scripts\\agentes-automaticos\\atualizar-dashboard-operacional.js"',
    "atualizar-dashboard-operacional"
  )

  const desdeUltimoGemini = Date.now() - ultimoGemini
  if (desdeUltimoGemini >= GEMINI_MIN_INTERVAL_MS) {
    await rodar('node ".\\scripts\\auto-evoluir-cerebro.js"', "auto-evoluir-cerebro (Gemini)")
    ultimoGemini = Date.now()
  } else {
    const faltam = Math.ceil((GEMINI_MIN_INTERVAL_MS - desdeUltimoGemini) / 1000)
    log(`· auto-evoluir-cerebro pulado (rate-limit Gemini: ${faltam}s restantes)`)
  }

  log("━━━━━━━━━━ Pipeline finalizado ━━━━━━━━━━\n")
  rodando = false
}

function agendarPipeline() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(pipelineCerebro, DEBOUNCE_MS)
}

const pastas = [
  `${PROJETO}/app`,
  `${PROJETO}/lib`,
  `${PROJETO}/components`,
  `${PROJETO}/agentes`,
  `${PROJETO}/scripts`,
  `${OBSIDIAN}/Eventify`
]

const ignorar = [
  "**/node_modules/**",
  "**/.next/**",
  "**/.git/**",
  "**/.obsidian/**",
  "**/14 - BUGS/**",
  "**/21 - AUTOMACOES/**",
  "**/22 - GITHUB/**",
  "**/dashboard-ia/dados.json"
]

watch(pastas, { ignored: ignorar, ignoreInitial: true }).on("all", agendarPipeline)

log("Watcher do cérebro iniciado.")
log(`Debounce: ${DEBOUNCE_MS}ms | Rate-limit Gemini: ${GEMINI_MIN_INTERVAL_MS / 1000}s`)
log("Observando:")
pastas.forEach((p) => log(`  • ${p}`))
