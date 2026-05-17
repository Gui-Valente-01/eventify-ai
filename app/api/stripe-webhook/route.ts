import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import type { PlanId } from "@/lib/plans";
import { verifyStripeSignature } from "@/lib/stripeWebhook";
import { enviarEmail } from "@/lib/email/resend";
import { templateBoasVindas } from "@/lib/email/templates";

export const runtime = "nodejs";

const STRIPE_PRICE_TO_PLAN = ([
  [process.env.STRIPE_PRICE_BASICO, "basico"],
  [process.env.STRIPE_PRICE_INTERMEDIARIO, "intermediario"],
  [process.env.STRIPE_PRICE_PREMIUM, "premium"],
] satisfies Array<[string | undefined, PlanId]>).reduce<Record<string, PlanId>>((acc, [priceId, plan]) => {
  if (priceId) acc[priceId] = plan;
  return acc;
}, {});

type CheckoutSession = {
  customer?: string;
  subscription?: string;
  client_reference_id?: string;
  metadata?: { plan?: string; user_id?: string; event_id?: string; kind?: string };
};

type StripeSubscription = {
  id?: string;
  customer?: string;
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
          const { error } = await admin
            .from("profiles")
            .update({
              plan,
              stripe_customer_id: session.customer ?? null,
              stripe_subscription_id: session.subscription ?? null,
            })
            .eq("id", userId);
          if (error) throw error;
        }
        let eventoSlug: string | null = null;
        let eventoNome: string | null = null;
        if (eventId) {
          const { data: eventoAtualizado, error } = await admin
            .from("eventos")
            .update({
              status: "published",
              paid_at: new Date().toISOString(),
              published_at: new Date().toISOString(),
              paid_plan: plan || null,
            })
            .eq("id", eventId)
            .select("slug, nome")
            .maybeSingle();
          if (error) throw error;
          eventoSlug = eventoAtualizado?.slug ?? null;
          eventoNome = eventoAtualizado?.nome ?? null;
        }
        logger.info("stripe-webhook", "checkout.session.completed processado", {
          userId,
          eventId,
          plan,
        });

        // ===== E-mail de boas-vindas (fire-and-forget, nunca quebra fluxo) =====
        if (userId && eventoSlug && eventoNome) {
          try {
            const { data: userData } = await admin.auth.admin.getUserById(userId);
            const email = userData?.user?.email;
            const nomeUsuario = (userData?.user?.user_metadata as { full_name?: string } | undefined)?.full_name || "";
            if (email) {
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://eventify.app";
              const { subject, html, text } = templateBoasVindas({
                nomeUsuario,
                nomeEvento: eventoNome,
                slug: eventoSlug,
                appUrl,
              });
              await enviarEmail({ to: email, subject, html, text });
            }
          } catch (emailErr) {
            logger.error("stripe-webhook", "falha ao enviar e-mail de boas-vindas", emailErr, {
              userId,
              eventId,
            });
            // Não retorna erro — webhook deve sempre retornar 200 pra Stripe não retentar
          }
        }
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
      const { error } = await admin
        .from("profiles")
        .update({
          plan: nextPlan,
          stripe_customer_id: subscription.customer ?? null,
          stripe_subscription_id: subscription.id ?? null,
          subscription_status: subscription.status ?? null,
        })
        .eq("id", userId);
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
