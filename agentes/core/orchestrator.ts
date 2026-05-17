import { interpreterAgent } from "../specialists/interpreterAgent"
import { designerAgent } from "../specialists/designerAgent"
import { copywriterAgent } from "../specialists/copywriterAgent"

export interface EventBriefing {
  eventType: string
  style: string
  audience: string
  description: string
}

export interface AgentResult {
  agent: string
  result: string
}

export async function runAgents(
  briefing: EventBriefing
): Promise<AgentResult[]> {
  const results: AgentResult[] = []

  results.push(await interpreterAgent(briefing))
  results.push(await designerAgent(briefing))
  results.push(await copywriterAgent(briefing))

  return results
}