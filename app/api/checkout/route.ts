import { NextResponse } from "next/server";
import { PLANS, PlanId } from "@/lib/plans";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const STRIPE_PRICE_IDS: Record<PlanId, string | undefined> = {
  basico: process.env.STRIPE_PRICE_BASICO,
  intermediario: process.env.STRIPE_PRICE_INTERMEDIARIO,
  premium: process.env.STRIPE_PRICE_PREMIUM,
};

export async function POST(req: Request) {
  let body: { planId?: PlanId; eventId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const planId = body.planId;
  if (!planId || !PLANS.some((p) => p.id === planId)) {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = STRIPE_PRICE_IDS[planId];

  if (!stripeKey || !priceId) {
    return NextResponse.json(
      {
        message:
          "Assinaturas ainda não estão ativas. Configure STRIPE_SECRET_KEY e STRIPE_PRICE_* recorrentes no .env.local para ativar o checkout.",
        configurado: false,
      },
      { status: 200 }
    );
  }

  const supabase = await getSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  let evento: { id: string; slug: string; nome: string } | null = null;
  let stripeCustomerId: string | null = null;

  if (user && supabase) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();
    stripeCustomerId = profile?.stripe_customer_id ?? null;
  }

  if (body.eventId) {
    if (!user || !supabase) {
      return NextResponse.json({ error: "Faça login para publicar este evento." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("eventos")
      .select("id, slug, nome, status")
      .eq("id", body.eventId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Evento não encontrado ou sem permissão." }, { status: 404 });
    }

    evento = data as { id: string; slug: string; nome: string };
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const kind = evento ? "event_publish" : "plan_purchase";
    const params = new URLSearchParams({
      "mode": "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "success_url": evento
        ? `${origin}/painel?checkout=success&event=${evento.id}`
        : `${origin}/painel?checkout=success&plan=${planId}`,
      "cancel_url": evento
        ? `${origin}/painel?checkout=cancel&event=${evento.id}`
        : `${origin}/precos?checkout=cancel`,
    });
    if (stripeCustomerId) {
      params.append("customer", stripeCustomerId);
    } else if (user?.email) {
      params.append("customer_email", user.email);
    }
    if (user?.id) params.append("client_reference_id", user.id);
    params.append("metadata[plan]", planId);
    params.append("metadata[kind]", kind);
    params.append("subscription_data[metadata][plan]", planId);
    params.append("subscription_data[metadata][kind]", kind);
    if (user?.id) params.append("metadata[user_id]", user.id);
    if (user?.id) params.append("subscription_data[metadata][user_id]", user.id);
    if (evento?.id) {
      params.append("metadata[event_id]", evento.id);
      params.append("subscription_data[metadata][event_id]", evento.id);
    }
    if (evento?.slug) {
      params.append("metadata[event_slug]", evento.slug);
      params.append("subscription_data[metadata][event_slug]", evento.slug);
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const stripeData = await stripeRes.json();
    if (!stripeRes.ok) {
      logger.error("checkout", "Stripe rejeitou criação da sessão", null, { stripeError: stripeData });
      return NextResponse.json(
        { error: stripeData.error?.message || "Erro do Stripe." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: stripeData.url, configurado: true });
  } catch (error) {
    logger.error("checkout", "erro inesperado no checkout", error);
    return NextResponse.json({ error: "Erro inesperado no checkout." }, { status: 500 });
  }
}
