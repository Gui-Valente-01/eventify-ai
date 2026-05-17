import type { EventBriefing, AgentResult } from "../core/orchestrator"
import { callAI } from "../core/aiClient"

export async function designerAgent(
  briefing: EventBriefing
): Promise<AgentResult> {
  const result = await callAI([
    {
      role: "system",
      content:
        "Voce e o Agente Designer do Eventify AI. Sua funcao e transformar briefing em direcao visual, paleta, tipografia e layout."
    },
    {
      role: "user",
      content: `
Tipo de evento: ${briefing.eventType}
Estilo desejado: ${briefing.style}
Publico: ${briefing.audience}
Descricao: ${briefing.description}

Crie uma direcao visual objetiva para esse site de evento.
Inclua:
- paleta sugerida
- tipografia sugerida
- estilo de layout
- sensacao visual
- cuidados de UX
`
    }
  ])

  return {
    agent: "Designer",
    result
  }
}