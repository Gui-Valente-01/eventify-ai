import { runAgents } from "./core/orchestrator"

async function main() {
  const briefing = {
    eventType: "casamento",
    style: "elegante, romântico e moderno",
    audience: "familiares e amigos próximos",
    description: "Casamento de Guilherme e Laura em uma chácara ao pôr do sol."
  }

  const results = await runAgents(briefing)

  console.log("RESULTADO DOS AGENTES:")
  console.log(JSON.stringify(results, null, 2))
}

main()