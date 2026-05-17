import type { EventBriefing, AgentResult } from "../core/orchestrator"
import { callAI } from "../core/aiClient"

export async function copywriterAgent(
  briefing: EventBriefing
): Promise<AgentResult> {
  const result = await callAI([
    {
      role: "system",
      content:
        "Voce e o Agente Copywriter do Eventify AI. Sua funcao e criar textos persuasivos, emocionais e profissionais para sites de eventos."
    },
    {
      role: "user",
      content: `
Tipo de evento: ${briefing.eventType}
Estilo desejado: ${briefing.style}
Publico: ${briefing.audience}
Descricao: ${briefing.description}

Crie uma copy objetiva para esse site.
Inclua:
- titulo principal
- subtitulo
- texto de convite
- CTA
- tom de voz recomendado
`
    }
  ])

  return {
    agent: "Copywriter",
    result
  }
}