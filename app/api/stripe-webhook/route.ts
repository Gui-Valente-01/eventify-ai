import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import type { PlanId } from "@/lib/plans";

export const runtime = "nodejs";

const WEBHOOK_TOLERANCE_SECONDS = 300;

const STRIPE_PRICE_TO_PLAN = ([
  [process.env.STRIPE_PRICE_BASICO, "basico"],
  [process.env.STRIPE_PRICE_INTERMEDIARIO, "intermediario"],
  [process.env.STRIPE_PRICE_PREMIUM, "premium"],
] satisfies Array<[string | undefined, PlanId]>).reduce<Record<string, PlanId>>((acc, [priceId, plan]) => {
  if (priceId) acc[priceId] = plan;
  return acc;
}, {});

type CheckoutSession = {
  client_reference_id?: string;
  metadata?: { plan?: string; user_id?: string; event_id?: string; kind?: string };
};

type StripeSubscription = {
  status?: string;
  metadata?: { plan?: string; user_id?: string; event_id?: string; kind?: string };
  items?: {
    data?: Array<{
      price?: {
        id?: string;
      };
    }>;
  };
};

function getPlanFromSubscription(subscription: StripeSubscription) {
  const plan = subscription.metadata?.plan;
  if (plan === "basico" || plan === "intermediario" || plan === "premium") return plan;
  const priceId = subscription.items?.data?.[0]?.price?.id;
  return priceId ? STRIPE_PRICE_TO_PLAN[priceId] : undefined;
}

function shouldDowngradeSubscription(status?: string) {
  return status === "canceled" || status === "unpaid" || status === "incomplete_expired";
}

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe não configurado (STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET)." },
      { status: 503 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 });
  }

  const rawBody = await req.text();
  const verified = await verifyStripeSignature(rawBody, signature, webhookSecret);
  if (!verified) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as CheckoutSession;
    const userId = session.metadata?.user_id || session.client_reference_id;
    const plan = session.metadata?.plan;
    const eventId = session.metadata?.event_id;

    if (supabaseUrl && serviceRoleKey) {
      const admin = createClient(supabaseUrl, serviceRoleKey);
      try {
        if (userId && plan) {
          const { error } = await admin.from("profiles").update({ plan }).eq("id", userId);
          if (error) throw error;
        }
        if (eventId) {
          const { error } = await admin
            .from("eventos")
            .update({
              status: "published",
              paid_at: new Date().toISOString(),
              published_at: new Date().toISOString(),
              paid_plan: plan || null,
            })
            .eq("id", eventId);
          if (error) throw error;
        }
        logger.info("stripe-webhook", "checkout.session.completed processado", {
          userId,
          eventId,
          plan,
        });
      } catch (err) {
        logger.error("stripe-webhook", "falha ao atualizar Supabase após pagamento", err, {
          userId,
          eventId,
          plan,
        });
        return NextResponse.json({ error: "Falha ao processar." }, { status: 500 });
      }
    } else {
      logger.warn("stripe-webhook", "Supabase não configurado — pagamento ignorado", { eventId });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as StripeSubscription;
    const userId = subscription.metadata?.user_id;
    const plan = getPlanFromSubscription(subscription);
    const nextPlan = event.type === "customer.subscription.deleted" || shouldDowngradeSubscription(subscription.status)
      ? "free"
      : plan;

    if (supabaseUrl && serviceRoleKey && userId && nextPlan) {
      const admin = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await admin.from("profiles").update({ plan: nextPlan }).eq("id", userId);
      if (error) {
        logger.error("stripe-webhook", "falha ao atualizar plano da assinatura", error, {
          userId,
          plan: nextPlan,
          status: subscription.status,
        });
        return NextResponse.json({ error: "Falha ao processar assinatura." }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}

async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const elements = signature.split(",").reduce<Record<string, string>>((acc, item) => {
      const [k, v] = item.split("=");
      if (k && v) acc[k] = v;
      return acc;
    }, {});
    const timestamp = elements.t;
    const v1 = elements.v1;
    if (!timestamp || !v1) return false;

    // Anti-replay: rejeita se timestamp > 5 min
    const tsSeconds = parseInt(timestamp, 10);
    if (!Number.isFinite(tsSeconds)) return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - tsSeconds) > WEBHOOK_TOLERANCE_SECONDS) {
      logger.warn("stripe-webhook", "timestamp fora da tolerância (replay rejeitado)", {
        ageSeconds: nowSeconds - tsSeconds,
        tolerance: WEBHOOK_TOLERANCE_SECONDS,
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

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
