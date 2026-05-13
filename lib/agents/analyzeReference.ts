/**
 * Análise de referência visual — extrai design tokens (paleta, fontes, vibe)
 * de uma imagem/print/URL/descrição enviada pelo usuário.
 *
 * Anti-cópia:
 *   - O agente extrai APENAS tokens abstratos (cores, categorias de fonte,
 *     vibe label, estilo de seções).
 *   - NUNCA pede pra IA reproduzir HTML/CSS/layout literal.
 *   - O cliente vai aplicar esses tokens num template NOSSO (curado).
 *   - O resultado final tem identidade própria, inspirada no estilo da
 *     referência mas não cópia.
 */

import { GoogleGenAI } from "@google/genai";
import { logger } from "@/lib/logger";

export type ReferenceVibe =
  | "romantico"
  | "moderno"
  | "luxo"
  | "minimalista"
  | "divertido"
  | "corporativo"
  | "elegante"
  | "boemio"
  | "vintage"
  | "tropical"
  | "dark"
  | "editorial";

export type ReferenceProfile = {
  /** Paleta extraída — 5 cores em ordem do fundo ao acento */
  paleta: string[];
  /** Vibe geral identificada */
  vibe: ReferenceVibe;
  /** Descrição em português curta do estilo (1-2 frases) */
  estilo: string;
  /** Categoria de fonte sugerida pra display (títulos) */
  fontDisplay: "serif" | "sans-serif" | "display";
  /** Categoria de fonte sugerida pra body (corpo) */
  fontBody: "serif" | "sans-serif";
  /** ID sugerido de fonte do nosso catálogo (lib/livePalette FONT_CATALOG) */
  fontDisplayId?: string;
  fontBodyId?: string;
  /** Características visuais detectadas */
  caracteristicas: {
    layoutDenso: boolean;
    fundoEscuro: boolean;
    serifNoTitulo: boolean;
    botaoRetangular: boolean;
    espacamentoGeneroso: boolean;
    fotografiaProminente: boolean;
  };
  /** Texto curto de inspiração que vai pro prompt do agente de geração */
  inspiracaoParaIA: string;
  /** Fonte da análise — qual modelo usado */
  source: "gemini-vision" | "gemini-text" | "fallback";
};

const SYSTEM_PROMPT = `Você é um designer sênior analisando uma REFERÊNCIA VISUAL pra extrair tokens de design.

⚠️ REGRAS ABSOLUTAS:
1. NÃO copie a referência literalmente. Extraia só CATEGORIAS abstratas.
2. O resultado vai INSPIRAR um template DIFERENTE, não recriar a referência.
3. Não cite marcas, nomes próprios ou URLs específicos da referência.
4. Não retorne HTML/CSS literal. SÓ tokens semânticos.

🎯 SUA TAREFA:
Analise a referência e retorne JSON com:
- paleta: array de 5 cores hex em ordem do FUNDO (mais claro/escuro do site) ao ACENTO (cor de destaque)
- vibe: uma das opções [romantico, moderno, luxo, minimalista, divertido, corporativo, elegante, boemio, vintage, tropical, dark, editorial]
- estilo: 1 frase curta em pt-BR descrevendo o estilo abstrato (ex: "Editorial elegante com serif clássica e paleta marfim")
- fontDisplay: "serif" / "sans-serif" / "display" — categoria das fontes de título
- fontBody: "serif" / "sans-serif" — categoria do corpo de texto
- fontDisplayId: id sugerido [cormorant-garamond, fraunces, playfair-display, instrument-serif, inter, space-grotesk, manrope, bebas, bricolage]
- fontBodyId: id sugerido [inter, manrope, space-grotesk, cormorant-garamond, fraunces]
- caracteristicas: objeto com booleans (layoutDenso, fundoEscuro, serifNoTitulo, botaoRetangular, espacamentoGeneroso, fotografiaProminente)
- inspiracaoParaIA: 2-3 frases em pt-BR descrevendo o tom emocional/estético que a IA deve adotar ao escrever copy (sem mencionar a referência diretamente)

🚫 PROIBIDO:
- Mencionar nomes de marcas, sites ou pessoas reais
- Copiar texto/copy da referência
- Retornar URLs, IDs, ou referências específicas
- Retornar HTML, CSS ou markup

Retorne SOMENTE o JSON, sem markdown.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    paleta: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 6 },
    vibe: { type: "string" },
    estilo: { type: "string" },
    fontDisplay: { type: "string" },
    fontBody: { type: "string" },
    fontDisplayId: { type: "string" },
    fontBodyId: { type: "string" },
    caracteristicas: {
      type: "object",
      properties: {
        layoutDenso: { type: "boolean" },
        fundoEscuro: { type: "boolean" },
        serifNoTitulo: { type: "boolean" },
        botaoRetangular: { type: "boolean" },
        espacamentoGeneroso: { type: "boolean" },
        fotografiaProminente: { type: "boolean" },
      },
      required: [
        "layoutDenso",
        "fundoEscuro",
        "serifNoTitulo",
        "botaoRetangular",
        "espacamentoGeneroso",
        "fotografiaProminente",
      ],
    },
    inspiracaoParaIA: { type: "string" },
  },
  required: ["paleta", "vibe", "estilo", "fontDisplay", "fontBody", "caracteristicas", "inspiracaoParaIA"],
};

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/**
 * Analisa uma imagem (base64 ou URL pública) e retorna o ReferenceProfile.
 */
export async function analyzeImage(input: {
  imageBase64?: string;
  imageMimeType?: string;
  imageUrl?: string;
  descricaoExtra?: string;
}): Promise<{ profile: ReferenceProfile | null; error?: string }> {
  const client = getClient();
  if (!client) {
    return { profile: fallbackProfile(input.descricaoExtra), error: "Gemini não configurado — usando fallback heurístico" };
  }

  try {
    const userParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (input.imageBase64) {
      userParts.push({
        inlineData: {
          mimeType: input.imageMimeType || "image/jpeg",
          data: input.imageBase64,
        },
      });
    }

    const userText = [
      input.imageUrl ? `Referência (URL): ${input.imageUrl}` : "",
      input.descricaoExtra ? `Descrição adicional do cliente: ${input.descricaoExtra}` : "",
      "Analise e retorne o JSON com os tokens de design.",
    ]
      .filter(Boolean)
      .join("\n\n");
    userParts.push({ text: userText });

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts: userParts }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA as unknown as Record<string, unknown>,
      },
    });

    const text = response.text || "";
    if (!text) {
      return { profile: fallbackProfile(input.descricaoExtra), error: "Resposta vazia do Gemini" };
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { profile: fallbackProfile(input.descricaoExtra), error: "Resposta inválida (não é JSON)" };
    }

    const profile = validateProfile(parsed, input.imageBase64 ? "gemini-vision" : "gemini-text");
    return { profile };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "erro desconhecido";
    logger.error("analyze-reference", "Gemini falhou ao analisar referência", error, { detail: msg });
    return { profile: fallbackProfile(input.descricaoExtra), error: msg };
  }
}

/**
 * Análise só por descrição textual (sem imagem).
 * Útil quando o cliente só descreve em palavras o que quer.
 */
export async function analyzeFromDescription(descricao: string): Promise<{
  profile: ReferenceProfile | null;
  error?: string;
}> {
  return analyzeImage({ descricaoExtra: descricao });
}

/**
 * Análise heurística simples — usada quando Gemini não tá disponível.
 * Tenta inferir o estilo pelo texto da descrição usando keywords.
 */
function fallbackProfile(descricao?: string): ReferenceProfile {
  const desc = (descricao || "").toLowerCase();
  let vibe: ReferenceVibe = "elegante";
  let paleta = ["#F5EDE2", "#E8D4C3", "#B7895C", "#2B1D17", "#C8A96A"];
  let fontDisplay: "serif" | "sans-serif" | "display" = "serif";
  let fontDisplayId = "cormorant-garamond";
  let fontBodyId = "inter";

  if (desc.match(/(luxo|premium|opulent|caro|sofistic)/)) {
    vibe = "luxo";
    paleta = ["#0A0A0A", "#1A1A1A", "#5B4A28", "#C8A96A", "#F4E9C8"];
    fontDisplayId = "playfair-display";
  } else if (desc.match(/(minimal|clean|simples|silencioso)/)) {
    vibe = "minimalista";
    paleta = ["#FFFFFF", "#F5F5F5", "#A8A8A8", "#0A0A0A", "#1F1F1F"];
    fontDisplay = "sans-serif";
    fontDisplayId = "inter";
  } else if (desc.match(/(moderno|tech|digital|futur)/)) {
    vibe = "moderno";
    paleta = ["#0B0E1A", "#161B2C", "#5046E5", "#7C76EE", "#EEEDFD"];
    fontDisplay = "sans-serif";
    fontDisplayId = "space-grotesk";
  } else if (desc.match(/(divert|festa|colorido|aniver|infant)/)) {
    vibe = "divertido";
    paleta = ["#FFFDF5", "#FFD93D", "#E63946", "#2563EB", "#1F1F1F"];
    fontDisplay = "display";
    fontDisplayId = "bricolage";
  } else if (desc.match(/(romant|delicad|suav|casamento)/)) {
    vibe = "romantico";
    paleta = ["#F5EDE2", "#E8D4C3", "#B7895C", "#2B1D17", "#C8A96A"];
    fontDisplayId = "cormorant-garamond";
  } else if (desc.match(/(corporat|business|profis|empresa)/)) {
    vibe = "corporativo";
    paleta = ["#FFFFFF", "#F0F4FA", "#7A9AD0", "#1E63D5", "#0A2456"];
    fontDisplay = "sans-serif";
    fontDisplayId = "inter";
  } else if (desc.match(/(dark|noturn|night|neon)/)) {
    vibe = "dark";
    paleta = ["#0A0814", "#1F1438", "#7C3AED", "#FF4FCB", "#E5E5FF"];
    fontDisplay = "sans-serif";
    fontDisplayId = "space-grotesk";
  }

  return {
    paleta,
    vibe,
    estilo: gerarEstiloDescricao(vibe),
    fontDisplay,
    fontBody: "sans-serif",
    fontDisplayId,
    fontBodyId,
    caracteristicas: {
      layoutDenso: (vibe as ReferenceVibe) === "editorial" || vibe === "corporativo",
      fundoEscuro: vibe === "dark" || vibe === "luxo",
      serifNoTitulo: fontDisplay === "serif",
      botaoRetangular: (vibe as ReferenceVibe) === "editorial" || vibe === "luxo",
      espacamentoGeneroso: vibe === "minimalista" || vibe === "elegante",
      fotografiaProminente: vibe === "elegante" || vibe === "romantico",
    },
    inspiracaoParaIA: gerarInspiracao(vibe),
    source: "fallback",
  };
}

function gerarEstiloDescricao(v: ReferenceVibe): string {
  const map: Record<ReferenceVibe, string> = {
    romantico: "Romântico atemporal com serif clássica e paleta marfim+dourado",
    moderno: "Moderno tech com sans geométrica e gradientes sutis",
    luxo: "Luxo black-tie com paleta dark e dourado",
    minimalista: "Minimal silencioso, preto e branco, muito ar",
    divertido: "Divertido festivo com cores primárias e tipografia bricolage",
    corporativo: "Corporativo profissional, paleta navy/branco, sans clean",
    elegante: "Elegante refinado com serif e paleta neutra",
    boemio: "Boêmio natural com tons terrosos e ilustrações botânicas",
    vintage: "Vintage romântico com ornamentos clássicos e paleta sépia",
    tropical: "Tropical vibrante com palm leaves e cores quentes",
    dark: "Dark noturno com neon e tipografia condensada",
    editorial: "Editorial magazine com serif refinada e fotografia grande",
  };
  return map[v] ?? map.elegante;
}

function gerarInspiracao(v: ReferenceVibe): string {
  const map: Record<ReferenceVibe, string> = {
    romantico:
      "Escreva com tom poético e nostálgico. Use imagens sensoriais (luz dourada do entardecer, perfume, abraço). Frases curtas e líricas.",
    moderno:
      "Tom direto, contemporâneo, confiante. Linguagem precisa, sem ornamentação. Inclua referências a tecnologia ou inovação quando fizer sentido.",
    luxo:
      "Tom sofisticado e formal. Vocabulário refinado, frases pausadas. Sugira exclusividade sem ostentar.",
    minimalista:
      "Diga muito com pouco. Frases curtas, espaços confortáveis, zero clichês. O silêncio entre as palavras importa tanto quanto as palavras.",
    divertido:
      "Tom alegre, brincalhão, energético. Uso de exclamações com moderação. Inclua pequenos momentos de humor.",
    corporativo:
      "Tom profissional e objetivo. Frases claras, ação clara, sem firulas. Foco em valor entregue.",
    elegante:
      "Tom refinado e acolhedor. Cuide do ritmo das frases. Linguagem cuidadosa, fluida, com pausa pra respirar.",
    boemio:
      "Tom natural, livre, ligado à natureza. Inclua imagens orgânicas (flores, terra, céu, vento). Linguagem sensorial.",
    vintage:
      "Tom nostálgico e atemporal. Vocabulário levemente formal. Sugira tradição e memória afetiva.",
    tropical:
      "Tom solar, leve, vibrante. Inclua imagens de natureza tropical e sensações de verão.",
    dark:
      "Tom enigmático, urbano, noturno. Frases curtas, ritmadas. Sugira mistério e energia da madrugada.",
    editorial:
      "Tom de revista premium. Frases longas e bem construídas. Parágrafos densos com narrativa cinematográfica.",
  };
  return map[v] ?? map.elegante;
}

function validateProfile(
  raw: Record<string, unknown>,
  source: "gemini-vision" | "gemini-text"
): ReferenceProfile {
  const paleta = Array.isArray(raw.paleta) ? (raw.paleta as string[]).slice(0, 6) : [];
  const validHexes = paleta.filter((c) => /^#[0-9a-f]{3,8}$/i.test(c));
  const finalPaleta = validHexes.length >= 4 ? validHexes.slice(0, 5) : ["#F5EDE2", "#E8D4C3", "#B7895C", "#2B1D17", "#C8A96A"];

  const vibe = (raw.vibe as string) ?? "elegante";
  const validVibes: ReferenceVibe[] = [
    "romantico", "moderno", "luxo", "minimalista", "divertido", "corporativo",
    "elegante", "boemio", "vintage", "tropical", "dark", "editorial",
  ];
  const finalVibe: ReferenceVibe = validVibes.includes(vibe as ReferenceVibe)
    ? (vibe as ReferenceVibe)
    : "elegante";

  const car = (raw.caracteristicas as Record<string, boolean>) || {};

  return {
    paleta: finalPaleta,
    vibe: finalVibe,
    estilo: (raw.estilo as string) || gerarEstiloDescricao(finalVibe),
    fontDisplay: ["serif", "sans-serif", "display"].includes(raw.fontDisplay as string)
      ? (raw.fontDisplay as "serif" | "sans-serif" | "display")
      : "serif",
    fontBody: ["serif", "sans-serif"].includes(raw.fontBody as string)
      ? (raw.fontBody as "serif" | "sans-serif")
      : "sans-serif",
    fontDisplayId: (raw.fontDisplayId as string) || "cormorant-garamond",
    fontBodyId: (raw.fontBodyId as string) || "inter",
    caracteristicas: {
      layoutDenso: Boolean(car.layoutDenso),
      fundoEscuro: Boolean(car.fundoEscuro),
      serifNoTitulo: Boolean(car.serifNoTitulo),
      botaoRetangular: Boolean(car.botaoRetangular),
      espacamentoGeneroso: Boolean(car.espacamentoGeneroso),
      fotografiaProminente: Boolean(car.fotografiaProminente),
    },
    inspiracaoParaIA: (raw.inspiracaoParaIA as string) || gerarInspiracao(finalVibe),
    source,
  };
}
