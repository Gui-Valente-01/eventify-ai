import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe nao configurado. Configure STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase nao configurado." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Faca login para gerenciar a assinatura." }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    logger.error("customer-portal", "falha ao ler perfil", error, { userId: user.id });
    return NextResponse.json({ error: "Nao foi possivel carregar sua conta." }, { status: 500 });
  }

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Nenhuma assinatura Stripe encontrada para esta conta. Assine um plano primeiro." },
      { status: 404 }
    );
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const params = new URLSearchParams({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/perfil`,
  });

  try {
    const stripeRes = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await stripeRes.json();
    if (!stripeRes.ok) {
      logger.error("customer-portal", "Stripe rejeitou portal", null, { stripeError: data });
      return NextResponse.json(
        { error: data.error?.message || "Erro ao abrir portal Stripe." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (err) {
    logger.error("customer-portal", "erro inesperado", err, { userId: user.id });
    return NextResponse.json({ error: "Erro inesperado ao abrir portal." }, { status: 500 });
  }
}
