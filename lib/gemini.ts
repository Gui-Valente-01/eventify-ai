import { GoogleGenAI } from "@google/genai";
import type { TokenUsage } from "@/lib/aiPricing";
import { logger } from "@/lib/logger";

// Cascata de modelos: tenta o primeiro, se falhar com 429/quota cai pro próximo.
// Ordenado do mais leve (mais cota free) pro mais robusto.
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-1.5-flash-8b",
  "gemini-1.5-flash-latest",
];

export type GeminiResult = {
  html: string | null;
  usage: TokenUsage;
  error?: string;
  model: string;
  triedModels: string[];
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

function buildModelList(): string[] {
  const override = process.env.GOOGLE_MODEL?.trim();
  if (!override) return MODEL_FALLBACK_CHAIN;
  // Coloca o override primeiro, depois o resto da cadeia (sem duplicar)
  return [override, ...MODEL_FALLBACK_CHAIN.filter((m) => m !== override)];
}

export function getGeminiModel(): string {
  return process.env.GOOGLE_MODEL || MODEL_FALLBACK_CHAIN[0];
}

function isQuotaOrAvailabilityError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /429|quota|RESOURCE_EXHAUSTED|404|NOT_FOUND|is not found|not supported|503|UNAVAILABLE|high demand|overloaded|500|INTERNAL/i.test(msg);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryGenerate(
  client: GoogleGenAI,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<{ ok: true; html: string | null; usage: TokenUsage } | { ok: false; error: unknown }> {
  try {
    const response = await client.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
        maxOutputTokens: maxTokens,
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
      return { ok: true, html: null, usage };
    }
    return { ok: true, html, usage };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function generateHtmlWithGemini(args: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}): Promise<GeminiResult> {
  const client = getClient();

  if (!client) {
    return {
      html: null,
      usage: { inputTokens: 0, outputTokens: 0 },
      error: "GOOGLE_API_KEY ausente",
      model: "",
      triedModels: [],
    };
  }

  const triedModels: string[] = [];
  const maxTokens = args.maxTokens ?? 16000;
  let lastError: unknown = null;

  for (const model of buildModelList()) {
    triedModels.push(model);

    // Tenta o mesmo modelo 2x (503 e 500 frequentemente são transientes)
    let result = await tryGenerate(client, model, args.systemPrompt, args.userPrompt, maxTokens);
    if (!result.ok && /503|UNAVAILABLE|500|INTERNAL|high demand|overloaded/i.test(result.error instanceof Error ? result.error.message : String(result.error))) {
      await sleep(800);
      result = await tryGenerate(client, model, args.systemPrompt, args.userPrompt, maxTokens);
    }

    if (result.ok && result.html) {
      logger.info("gemini", "HTML gerado", { model, tried: triedModels.length });
      return { html: result.html, usage: result.usage, model, triedModels };
    }

    if (result.ok) {
      logger.warn("gemini", "modelo respondeu mas sem HTML válido", { model });
      lastError = "resposta sem HTML válido";
      continue;
    }

    lastError = result.error;
    if (isQuotaOrAvailabilityError(result.error)) {
      logger.warn("gemini", `modelo ${model} indisponível, tentando próximo`, {
        message: result.error instanceof Error ? result.error.message.slice(0, 200) : String(result.error).slice(0, 200),
      });
      continue;
    }

    logger.error("gemini", `erro não-recuperável no modelo ${model}`, result.error);
    break;
  }

  const errMsg = lastError instanceof Error ? lastError.message : String(lastError);
  return {
    html: null,
    usage: { inputTokens: 0, outputTokens: 0 },
    error: `Todos modelos falharam (${triedModels.join(", ")}): ${errMsg.slice(0, 300)}`,
    model: triedModels[triedModels.length - 1] || "",
    triedModels,
  };
}
