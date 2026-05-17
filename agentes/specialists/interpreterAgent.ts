import type { EventBriefing, AgentResult } from "../core/orchestrator"
import { callAI } from "../core/aiClient"

export async function interpreterAgent(
  briefing: EventBriefing
): Promise<AgentResult> {
  const result = await callAI(
    [
      {
        role: "system",
        content:
          "Voce e o Agente Interprete do Eventify AI. Sua funcao e transformar briefing de evento em direcao criativa clara."
      },
      {
        role: "user",
        content: `
Tipo de evento: ${briefing.eventType}
Estilo desejado: ${briefing.style}
Publico: ${briefing.audience}
Descricao: ${briefing.description}

Interprete esse briefing e gere uma direcao criativa objetiva.
`
      }
    ],
    "mock"
  )

  return {
    agent: "Interpreter",
    result
  }
}