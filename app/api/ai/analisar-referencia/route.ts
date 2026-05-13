import { NextResponse } from "next/server";
import { analyzeImage } from "@/lib/agents/analyzeReference";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
// Limit do payload — 5 MB (imagens em base64 podem ser pesadas)
export const maxDuration = 30;

type Body = {
  /** Base64 puro da imagem (sem o prefixo data:image/jpeg;base64,) */
  imageBase64?: string;
  /** MIME type da imagem (default image/jpeg) */
  imageMimeType?: string;
  /** URL pública de uma imagem ou site de referência */
  imageUrl?: string;
  /** Descrição textual livre do estilo desejado */
  descricao?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { imageBase64, imageMimeType, imageUrl, descricao } = body;

  // Precisa ter pelo menos uma forma de referência
  if (!imageBase64 && !imageUrl && !descricao?.trim()) {
    return NextResponse.json(
      { error: "Envie pelo menos: imagem (base64), URL ou descrição." },
      { status: 400 }
    );
  }

  // Sanity check no tamanho do base64 (max ~4MB encodado = ~3MB de imagem)
  if (imageBase64 && imageBase64.length > 5_500_000) {
    return NextResponse.json(
      { error: "Imagem muito grande (máx ~4MB). Comprima antes de enviar." },
      { status: 413 }
    );
  }

  // Aceita base64 com OU sem prefixo "data:image/..."
  let cleanBase64 = imageBase64;
  let mime = imageMimeType;
  if (cleanBase64?.startsWith("data:")) {
    const match = cleanBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mime = mime || match[1];
      cleanBase64 = match[2];
    }
  }

  try {
    const result = await analyzeImage({
      imageBase64: cleanBase64,
      imageMimeType: mime,
      imageUrl,
      descricaoExtra: descricao,
    });

    if (!result.profile) {
      return NextResponse.json(
        { error: result.error || "Análise falhou" },
        { status: 502 }
      );
    }

    return NextResponse.json({ profile: result.profile, warning: result.error });
  } catch (error) {
    logger.error("analisar-referencia", "erro inesperado", error);
    const msg = error instanceof Error ? error.message : "erro inesperado";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
