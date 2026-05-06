import { GoogleGenAI } from "@google/genai";
import type { TokenUsage } from "@/lib/aiPricing";
import { logger } from "@/lib/logger";

const DEFAULT_MODEL = "gemini-2.0-flash-exp";

export type GeminiResult = {
  html: string | null;
  usage: TokenUsage;
  error?: string;
  model: string;
};

let cachedClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient) cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
}

export function isGeminiAvailable(): boolean {
  return Boolean(process.env.GOOGLE_API_KEY);
}

export function getGeminiModel(): string {
  return process.env.GOOGLE_MODEL || DEFAULT_MODEL;
}

export async function generateHtmlWithGemini(args: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}): Promise<GeminiResult> {
  const client = getClient();
  const model = getGeminiModel();

  if (!client) {
    return {
      html: null,
      usage: { inputTokens: 0, outputTokens: 0 },
      error: "GOOGLE_API_KEY ausente",
      model,
    };
  }

  try {
    const response = await client.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [{ text: args.userPrompt }],
        },
      ],
      config: {
        systemInstruction: args.systemPrompt,
        temperature: 0.85,
        maxOutputTokens: args.maxTokens ?? 16000,
      },
    });

    const text = response.text || "";
    const usageMeta = response.usageMetadata;
    const usage: TokenUsage = {
      inputTokens: usageMeta?.promptTokenCount ?? 0,
      outputTokens: usageMeta?.candidatesTokenCount ?? 0,
    };

    let html = text.trim();
    html = html.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "");
    if (!html.toLowerCase().startsWith("<!doctype")) {
      const idx = html.toLowerCase().indexOf("<!doctype");
      if (idx !== -1) html = html.slice(idx);
    }

    if (!html.toLowerCase().includes("<!doctype")) {
      return { html: null, usage, error: "resposta sem HTML válido", model };
    }

    return { html, usage, model };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "erro desconhecido";
    logger.error("gemini", "falha ao gerar HTML", error);
    return {
      html: null,
      usage: { inputTokens: 0, outputTokens: 0 },
      error: msg,
      model,
    };
  }
}
