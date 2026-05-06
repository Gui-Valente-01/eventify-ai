import { GoogleGenAI } from "@google/genai";
import type { TokenUsage } from "@/lib/aiPricing";
import { logger } from "@/lib/logger";

// Model cascade: cheap/free-tier friendly first, stronger models after that.
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

type HtmlQuality = {
  ok: boolean;
  reasons: string[];
  metrics: {
    length: number;
    sectionCount: number;
    styleLength: number;
    scriptLength: number;
    hasDoctype: boolean;
    hasHtmlOpen: boolean;
    hasHtmlClose: boolean;
    hasHead: boolean;
    hasBody: boolean;
    hasStyle: boolean;
    hasScript: boolean;
    hasViewport: boolean;
    hasTitle: boolean;
    hasCountdown: boolean;
    hasRsvp: boolean;
    hasMap: boolean;
  };
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

function addGeminiUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheReadTokens: (a.cacheReadTokens ?? 0) + (b.cacheReadTokens ?? 0),
    cacheWriteTokens: (a.cacheWriteTokens ?? 0) + (b.cacheWriteTokens ?? 0),
  };
}

function stripMarkdownAndNoise(text: string): string {
  let html = text.trim();
  html = html.replace(/^```(?:html)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  if (!html.toLowerCase().startsWith("<!doctype")) {
    const idx = html.toLowerCase().indexOf("<!doctype");
    if (idx !== -1) html = html.slice(idx);
  }

  const closeIdx = html.toLowerCase().lastIndexOf("</html>");
  if (closeIdx !== -1) html = html.slice(0, closeIdx + 7);

  return html.trim();
}

function validateHtml(html: string): HtmlQuality {
  const lower = html.toLowerCase();
  const sectionCount = (lower.match(/<section[\s>]/g) || []).length;
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  const styleLength = styleMatch?.[1]?.trim().length ?? 0;
  const scriptLength = scriptMatch?.[1]?.trim().length ?? 0;

  const metrics = {
    length: html.length,
    sectionCount,
    styleLength,
    scriptLength,
    hasDoctype: lower.startsWith("<!doctype html>") || lower.startsWith("<!doctype"),
    hasHtmlOpen: /<html[^>]*lang=["']pt-br["'][^>]*>/i.test(html),
    hasHtmlClose: lower.includes("</html>"),
    hasHead: lower.includes("<head>") && lower.includes("</head>"),
    hasBody: /<body[\s>]/i.test(html) && lower.includes("</body>"),
    hasStyle: styleLength > 2500,
    hasScript: scriptLength > 500,
    hasViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    hasTitle: /<title>[^<]{5,}<\/title>/i.test(html),
    hasCountdown: /countdown|contagem|dias|horas|minutos|segundos/i.test(html),
    hasRsvp: /rsvp|confirmar presen[cç]a|presen[cç]a confirmada/i.test(html),
    hasMap: /google\.com\/maps|output=embed/i.test(html),
  };

  const reasons: string[] = [];
  if (!metrics.hasDoctype) reasons.push("precisa comecar com <!DOCTYPE html>");
  if (!metrics.hasHtmlOpen) reasons.push("precisa usar <html lang=\"pt-BR\">");
  if (!metrics.hasHtmlClose || !metrics.hasBody || !metrics.hasHead) reasons.push("documento HTML incompleto");
  if (!metrics.hasViewport || !metrics.hasTitle) reasons.push("head sem metadados basicos");
  if (!metrics.hasStyle) reasons.push("CSS inline ausente ou raso demais");
  if (!metrics.hasScript) reasons.push("JavaScript funcional ausente ou raso demais");
  if (metrics.length < 9000) reasons.push("HTML curto demais para um site completo");
  if (metrics.sectionCount < 8) reasons.push("poucas secoes para o padrao Eventify");
  if (!metrics.hasCountdown) reasons.push("contagem regressiva ausente");
  if (!metrics.hasRsvp) reasons.push("RSVP funcional ausente");
  if (!metrics.hasMap) reasons.push("mapa do local ausente");

  const forbiddenChecks: Array<[RegExp, string]> = [
    [/<script[^>]+src=["'][^"']*(tailwind|bootstrap|unpkg|cdn\.jsdelivr|cdnjs)/i, "usa framework/script externo proibido"],
    [/<link[^>]+href=["'][^"']*(bootstrap|tailwind|cdnjs|cdn\.jsdelivr|unpkg)/i, "usa CSS externo proibido"],
    [/class=["'][^"']*\b(bg-|text-|grid-cols-|rounded-|p-|m-|px-|py-|flex|items-|justify-)/i, "parece depender de classes Tailwind/utilitarias sem CSS proprio"],
    [/lorem ipsum|em breve|placeholder|exemplo de texto/i, "contem placeholder ou texto generico"],
    [/<img[^>]+src=["']https?:\/\/(?!images\.unsplash\.com|plus\.unsplash\.com|images\.pexels\.com|.*supabase)/i, "usa imagem externa possivelmente inventada"],
  ];

  for (const [pattern, reason] of forbiddenChecks) {
    if (pattern.test(html)) reasons.push(reason);
  }

  return { ok: reasons.length === 0, reasons, metrics };
}

function buildRepairPrompt(originalPrompt: string, html: string, quality: HtmlQuality): string {
  return `Corrija ou gere novamente o site Eventify abaixo e devolva SOMENTE o HTML final.

Problemas detectados:
${quality.reasons.map((reason) => `- ${reason}`).join("\n")}

Briefing original:
${originalPrompt}

Regras obrigatorias:
- Comece exatamente com <!DOCTYPE html> e termine com </html>.
- Use <html lang="pt-BR">, <head> completo, <meta name="viewport">, <title> e meta description.
- CSS puro dentro de <style> no <head>. Sem Tailwind, Bootstrap, CDN de CSS ou classes utilitarias sem definicao.
- JavaScript inline antes de </body> para contagem regressiva, RSVP com alerta e animacoes leves.
- Minimo de 8 secoes reais: hero, contagem, sobre, narrativa, agenda, pessoas, local com iframe Google Maps, informacoes praticas, RSVP, FAQ e footer.
- Sem placeholders, sem "em breve", sem lorem ipsum, sem texto fora do HTML.
- Preserve os dados, nome, data, endereco e tom do evento.

HTML anterior, se houver:
${html.slice(0, 22000)}`;
}

async function tryGenerate(
  client: GoogleGenAI,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<{ ok: true; html: string | null; usage: TokenUsage; quality?: HtmlQuality; rawHtml?: string } | { ok: false; error: unknown }> {
  try {
    const response = await client.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.72,
        maxOutputTokens: maxTokens,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = response.text || "";
    const usageMeta = response.usageMetadata;
    const usage: TokenUsage = {
      inputTokens: usageMeta?.promptTokenCount ?? 0,
      outputTokens: usageMeta?.candidatesTokenCount ?? 0,
    };

    const html = stripMarkdownAndNoise(text);
    const quality = validateHtml(html);

    logger.info("gemini", "HTML processado", {
      model,
      ...quality.metrics,
      reasons: quality.reasons,
      preview: html.slice(0, 120),
    });

    if (!quality.ok) {
      logger.warn("gemini", "HTML invalido/incompleto", {
        model,
        reasons: quality.reasons,
        ...quality.metrics,
      });
      return { ok: true, html: null, usage, quality, rawHtml: html };
    }

    return { ok: true, html, usage, quality, rawHtml: html };
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
  const maxTokens = args.maxTokens ?? 24000;
  let lastError: unknown = null;

  for (const model of buildModelList()) {
    triedModels.push(model);

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
      logger.warn("gemini", "modelo respondeu mas sem HTML valido; tentando reparo", {
        model,
        reasons: result.quality?.reasons ?? [],
      });

      const repairPrompt = buildRepairPrompt(
        args.userPrompt,
        result.rawHtml || "",
        result.quality || validateHtml(result.rawHtml || "")
      );
      const repair = await tryGenerate(
        client,
        model,
        "Voce e um diretor de arte e revisor tecnico de HTML. Corrija o site e devolva somente HTML final valido.",
        repairPrompt,
        maxTokens
      );

      if (repair.ok && repair.html) {
        logger.info("gemini", "HTML reparado", { model, tried: triedModels.length });
        return {
          html: repair.html,
          usage: addGeminiUsage(result.usage, repair.usage),
          model,
          triedModels,
        };
      }

      lastError = repair.ok
        ? `resposta sem HTML valido: ${(repair.quality?.reasons ?? result.quality?.reasons ?? []).join("; ")}`
        : repair.error;
      continue;
    }

    lastError = result.error;
    if (isQuotaOrAvailabilityError(result.error)) {
      logger.warn("gemini", `modelo ${model} indisponivel, tentando proximo`, {
        message: result.error instanceof Error ? result.error.message.slice(0, 200) : String(result.error).slice(0, 200),
      });
      continue;
    }

    logger.error("gemini", `erro nao-recuperavel no modelo ${model}`, result.error);
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
