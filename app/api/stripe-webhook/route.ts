import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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
    const session = event.data.object as {
      client_reference_id?: string;
      metadata?: { plan?: string; user_id?: string };
    };
    const userId = session.metadata?.user_id || session.client_reference_id;
    const plan = session.metadata?.plan;

    if (userId && plan && supabaseUrl && serviceRoleKey) {
      const admin = createClient(supabaseUrl, serviceRoleKey);
      await admin.from("profiles").update({ plan }).eq("id", userId);
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
  } catch {
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
