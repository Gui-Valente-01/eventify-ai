import Anthropic from "@anthropic-ai/sdk"

export type AIProvider = "mock" | "anthropic" | "gemini"

export interface AIMessage {
  role: "system" | "user"
  content: string
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function callAI(
  messages: AIMessage[],
  provider: AIProvider = "mock"
): Promise<string> {
  if (provider === "mock") {
    return messages
      .map((message) => `[${message.role}] ${message.content}`)
      .join("\n\n")
  }

  if (provider === "anthropic") {
    const systemMessage = messages.find((message) => message.role === "system")
    const userMessages = messages.filter((message) => message.role === "user")

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
      max_tokens: 1000,
      system: systemMessage?.content || "",
      messages: userMessages.map((message) => ({
        role: "user",
        content: message.content
      }))
    })

    const text = response.content
      .map((block) => {
        if (block.type === "text") return block.text
        return ""
      })
      .join("\n")

    return text
  }

  if (provider === "gemini") {
    throw new Error("Gemini ainda nao conectado.")
  }

  throw new Error("Provider de IA invalido.")
}