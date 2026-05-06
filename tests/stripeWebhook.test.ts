import { describe, it, expect } from "vitest";
import {
  verifyStripeSignature,
  buildStripeSignature,
  timingSafeEqual,
  WEBHOOK_TOLERANCE_SECONDS,
} from "@/lib/stripeWebhook";

const SECRET = "whsec_test_dummy_secret";
const PAYLOAD = JSON.stringify({
  type: "checkout.session.completed",
  data: { object: { id: "cs_test_123" } },
});

describe("verifyStripeSignature", () => {
  it("aceita assinatura válida com timestamp recente", async () => {
    const now = 1700000000;
    const sig = await buildStripeSignature(PAYLOAD, SECRET, now);
    const ok = await verifyStripeSignature(PAYLOAD, sig, SECRET, { nowSeconds: now });
    expect(ok).toBe(true);
  });

  it("rejeita assinatura com timestamp muito antigo (replay)", async () => {
    const old = 1700000000;
    const now = old + WEBHOOK_TOLERANCE_SECONDS + 60; // > 5min depois
    const sig = await buildStripeSignature(PAYLOAD, SECRET, old);
    const ok = await verifyStripeSignature(PAYLOAD, sig, SECRET, { nowSeconds: now });
    expect(ok).toBe(false);
  });

  it("rejeita assinatura com timestamp muito no futuro", async () => {
    const future = 1800000000;
    const now = future - WEBHOOK_TOLERANCE_SECONDS - 60;
    const sig = await buildStripeSignature(PAYLOAD, SECRET, future);
    const ok = await verifyStripeSignature(PAYLOAD, sig, SECRET, { nowSeconds: now });
    expect(ok).toBe(false);
  });

  it("rejeita payload modificado (tampering)", async () => {
    const now = 1700000000;
    const sig = await buildStripeSignature(PAYLOAD, SECRET, now);
    const tampered = PAYLOAD.replace("cs_test_123", "cs_test_HACK");
    const ok = await verifyStripeSignature(tampered, sig, SECRET, { nowSeconds: now });
    expect(ok).toBe(false);
  });

  it("rejeita assinatura com secret errado", async () => {
    const now = 1700000000;
    const sig = await buildStripeSignature(PAYLOAD, "secret-do-atacante", now);
    const ok = await verifyStripeSignature(PAYLOAD, sig, SECRET, { nowSeconds: now });
    expect(ok).toBe(false);
  });

  it("rejeita header sem t= ou v1=", async () => {
    expect(await verifyStripeSignature(PAYLOAD, "lixo", SECRET)).toBe(false);
    expect(await verifyStripeSignature(PAYLOAD, "t=123", SECRET)).toBe(false);
    expect(await verifyStripeSignature(PAYLOAD, "v1=abc", SECRET)).toBe(false);
  });

  it("rejeita timestamp não-numérico", async () => {
    const ok = await verifyStripeSignature(
      PAYLOAD,
      "t=invalido,v1=abcdef",
      SECRET
    );
    expect(ok).toBe(false);
  });

  it("aceita exatamente no limite de tolerância (300s)", async () => {
    const now = 1700000000;
    const sig = await buildStripeSignature(PAYLOAD, SECRET, now - WEBHOOK_TOLERANCE_SECONDS);
    const ok = await verifyStripeSignature(PAYLOAD, sig, SECRET, { nowSeconds: now });
    expect(ok).toBe(true);
  });
});

describe("timingSafeEqual", () => {
  it("retorna true pra strings iguais", () => {
    expect(timingSafeEqual("abc123", "abc123")).toBe(true);
  });

  it("retorna false pra tamanhos diferentes", () => {
    expect(timingSafeEqual("abc", "abcd")).toBe(false);
  });

  it("retorna false pra strings diferentes do mesmo tamanho", () => {
    expect(timingSafeEqual("abcdef", "abcdeg")).toBe(false);
  });

  it("aceita string vazia", () => {
    expect(timingSafeEqual("", "")).toBe(true);
  });
});
