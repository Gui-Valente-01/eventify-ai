// Helper minimalista pra Stripe API via fetch.
// Mantemos sem SDK pra economizar bundle e seguir padrão das outras rotas.

import { logger } from "@/lib/logger";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

export type StripeInvoice = {
  id: string;
  number: string | null;
  status: string | null;
  amountPaid: number; // centavos
  amountDue: number;
  currency: string;
  created: number; // unix seconds
  periodStart: number | null;
  periodEnd: number | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  description: string | null;
};

type RawInvoice = {
  id: string;
  number?: string | null;
  status?: string | null;
  amount_paid?: number;
  amount_due?: number;
  currency?: string;
  created?: number;
  period_start?: number | null;
  period_end?: number | null;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  lines?: { data?: Array<{ description?: string | null }> };
};

function getKey(): string | null {
  return process.env.STRIPE_SECRET_KEY?.trim() || null;
}

function normalizeInvoice(raw: RawInvoice): StripeInvoice {
  return {
    id: raw.id,
    number: raw.number ?? null,
    status: raw.status ?? null,
    amountPaid: raw.amount_paid ?? 0,
    amountDue: raw.amount_due ?? 0,
    currency: (raw.currency ?? "brl").toUpperCase(),
    created: raw.created ?? 0,
    periodStart: raw.period_start ?? null,
    periodEnd: raw.period_end ?? null,
    hostedInvoiceUrl: raw.hosted_invoice_url ?? null,
    invoicePdf: raw.invoice_pdf ?? null,
    description: raw.lines?.data?.[0]?.description ?? null,
  };
}

/**
 * Lista TODAS as invoices da conta criadas após `sinceUnix`.
 * Pagina internamente com starting_after até esgotar ou bater em `maxPages`.
 * Para painel financeiro do admin.
 */
export async function listAllInvoicesSince(
  sinceUnix: number,
  maxPages = 10
): Promise<StripeInvoice[]> {
  const key = getKey();
  if (!key) return [];

  const todas: StripeInvoice[] = [];
  let startingAfter: string | null = null;

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      limit: "100",
      "created[gte]": String(sinceUnix),
      status: "paid",
    });
    if (startingAfter) params.set("starting_after", startingAfter);

    try {
      const res = await fetch(`${STRIPE_API_BASE}/invoices?${params}`, {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
      });
      if (!res.ok) {
        logger.error("stripe", "falha ao listar invoices da conta", null, {
          status: res.status,
        });
        break;
      }
      const json = await res.json();
      const data: RawInvoice[] = Array.isArray(json?.data) ? json.data : [];
      if (data.length === 0) break;
      todas.push(...data.map(normalizeInvoice));
      if (!json.has_more) break;
      startingAfter = data[data.length - 1].id;
    } catch (err) {
      logger.error("stripe", "erro inesperado em listAllInvoicesSince", err);
      break;
    }
  }

  return todas;
}

export async function listInvoices(
  customerId: string,
  limit = 20
): Promise<StripeInvoice[]> {
  const key = getKey();
  if (!key || !customerId) return [];

  try {
    const url = `${STRIPE_API_BASE}/invoices?customer=${encodeURIComponent(customerId)}&limit=${limit}&status=paid`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
      // Stripe API responde rápido — sem cache pra ter fresh data
      cache: "no-store",
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      logger.error("stripe", "falha ao listar invoices", null, {
        status: res.status,
        body: errBody.slice(0, 200),
      });
      return [];
    }
    const json = await res.json();
    const data: RawInvoice[] = Array.isArray(json?.data) ? json.data : [];
    return data.map(normalizeInvoice);
  } catch (err) {
    logger.error("stripe", "erro inesperado ao listar invoices", err);
    return [];
  }
}

export function formatCentsBRL(cents: number, currency = "BRL"): string {
  const value = cents / 100;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency,
  });
}

export function formatStripeDate(unixSeconds: number): string {
  if (!unixSeconds) return "—";
  return new Date(unixSeconds * 1000).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
