// Verificação manual de assinatura HMAC-SHA256 do Stripe.
// Extraído da rota pra ser testável em isolado.

import { logger } from "@/lib/logger";

export const WEBHOOK_TOLERANCE_SECONDS = 300;

export type VerifyOptions = {
  /** Sobrescreve "agora" pra testes determinísticos. Em segundos unix. */
  nowSeconds?: number;
  /** Tolerância em segundos. Default 5min. */
  toleranceSeconds?: number;
};

export async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string,
  options: VerifyOptions = {}
): Promise<boolean> {
  try {
    const elements = signature.split(",").reduce<Record<string, string>>((acc, item) => {
      const [k, v] = item.split("=");
      if (k && v) acc[k] = v;
      return acc;
    }, {});
    const timestamp = elements.t;
    const v1 = elements.v1;
    if (!timestamp || !v1) return false;

    const tsSeconds = parseInt(timestamp, 10);
    if (!Number.isFinite(tsSeconds)) return false;

    const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
    const tolerance = options.toleranceSeconds ?? WEBHOOK_TOLERANCE_SECONDS;
    if (Math.abs(nowSeconds - tsSeconds) > tolerance) {
      logger.warn("stripe-webhook", "timestamp fora da tolerância (replay rejeitado)", {
        ageSeconds: nowSeconds - tsSeconds,
        tolerance,
      });
      return false;
    }

    const signedPayload = `${timestamp}.${payload}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(signedPayload));
    const expected = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return timingSafeEqual(expected, v1);
  } catch (err) {
    logger.error("stripe-webhook", "erro ao validar assinatura", err);
    return false;
  }
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Helper de teste: gera assinatura Stripe-compatível pra um payload+secret+timestamp.
 * Em produção, NÃO use isso pra nada além de testes — Stripe assina do lado deles.
 */
export async function buildStripeSignature(
  payload: string,
  secret: string,
  timestampSeconds: number
): Promise<string> {
  const enc = new TextEncoder();
  const signed = `${timestampSeconds}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(signed));
  const v1 = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `t=${timestampSeconds},v1=${v1}`;
}
