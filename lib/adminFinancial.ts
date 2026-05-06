import { getSupabaseServerClient } from "@/lib/supabase/server";
import { listAllInvoicesSince, type StripeInvoice } from "@/lib/stripe";
import { PLANS, type PlanId } from "@/lib/plans";

const USD_TO_BRL = 5.4;

const PLAN_PRICE_BRL: Record<string, number> = {
  basico: PLANS.find((p) => p.id === "basico")?.preco ?? 29,
  intermediario: PLANS.find((p) => p.id === "intermediario")?.preco ?? 49,
  premium: PLANS.find((p) => p.id === "premium")?.preco ?? 79,
};

type ProfileRow = {
  id: string;
  plan: string | null;
  subscription_status: string | null;
  created_at: string;
};

type UsageRow = {
  cost_usd: string | number;
  created_at: string;
};

export type MesFinanceiro = {
  mes: string;           // "2026-05"
  label: string;         // "Mai 2026"
  receitaBrl: number;
  custoIaUsd: number;
  custoIaBrl: number;
  lucroBrl: number;
  pagamentos: number;
  margemPct: number;     // (lucro / receita) * 100
};

export type FinancialSnapshot = {
  // KPIs principais (mês atual)
  mrrBrl: number;                  // assinaturas ativas × preço do plano
  receitaMesBrl: number;           // somatório de invoices pagas no mês
  custoIaMesBrl: number;
  lucroMesBrl: number;
  margemMesPct: number;
  ticketMedioBrl: number;          // receitaMes / pagamentosMes

  // Crescimento vs mês anterior
  crescimentoReceitaPct: number;
  crescimentoLucroPct: number;

  // Contadores
  assinantesAtivos: number;
  totalUsuarios: number;
  conversaoFreeParaPagoPct: number;

  // Histórico (últimos 6 meses)
  historicoMensal: MesFinanceiro[];

  // Por plano (assinantes ativos)
  porPlano: Array<{ plan: PlanId; count: number; mrrBrl: number }>;

  // Saúde
  stripeConectado: boolean;
};

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function labelMes(d: Date) {
  return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(".", "");
}

function isAtiva(status: string | null) {
  return status === "active" || status === "trialing" || status === "past_due";
}

export async function getFinancialSnapshot(): Promise<FinancialSnapshot> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase não configurado");

  // 6 meses atrás (start of month)
  const now = new Date();
  const seisMesesAtras = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const sinceUnix = Math.floor(seisMesesAtras.getTime() / 1000);

  const [profilesRes, usageRes, invoices] = await Promise.all([
    supabase.from("profiles").select("id, plan, subscription_status, created_at"),
    supabase
      .from("usage_logs")
      .select("cost_usd, created_at")
      .gte("created_at", seisMesesAtras.toISOString()),
    listAllInvoicesSince(sinceUnix),
  ]);

  const profiles = (profilesRes.data ?? []) as ProfileRow[];
  const usage = (usageRes.data ?? []) as UsageRow[];

  // -------- MRR e assinantes ativos --------
  const planoCounts: Record<string, number> = {};
  let assinantesAtivos = 0;
  let mrrBrl = 0;
  for (const p of profiles) {
    const plano = p.plan ?? "free";
    if (plano !== "free" && isAtiva(p.subscription_status)) {
      assinantesAtivos += 1;
      planoCounts[plano] = (planoCounts[plano] ?? 0) + 1;
      mrrBrl += PLAN_PRICE_BRL[plano] ?? 0;
    }
  }

  const porPlano = (["basico", "intermediario", "premium"] as PlanId[]).map((plan) => ({
    plan,
    count: planoCounts[plan] ?? 0,
    mrrBrl: (planoCounts[plan] ?? 0) * (PLAN_PRICE_BRL[plan] ?? 0),
  }));

  // -------- Histórico mensal (6 meses) --------
  const historicoMap = new Map<string, MesFinanceiro>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = ymd(d);
    historicoMap.set(key, {
      mes: key,
      label: labelMes(d),
      receitaBrl: 0,
      custoIaUsd: 0,
      custoIaBrl: 0,
      lucroBrl: 0,
      pagamentos: 0,
      margemPct: 0,
    });
  }

  // Receita por mês (Stripe invoices)
  for (const inv of invoices as StripeInvoice[]) {
    const d = new Date(inv.created * 1000);
    const key = ymd(d);
    const m = historicoMap.get(key);
    if (!m) continue;
    m.receitaBrl += inv.amountPaid / 100;
    m.pagamentos += 1;
  }

  // Custo IA por mês
  for (const u of usage) {
    const d = new Date(u.created_at);
    const key = ymd(d);
    const m = historicoMap.get(key);
    if (!m) continue;
    const usd = Number(u.cost_usd ?? 0);
    m.custoIaUsd += usd;
  }

  // Calcula custo BRL e lucro
  const historicoMensal = Array.from(historicoMap.values());
  for (const m of historicoMensal) {
    m.custoIaBrl = m.custoIaUsd * USD_TO_BRL;
    m.lucroBrl = m.receitaBrl - m.custoIaBrl;
    m.margemPct = m.receitaBrl > 0 ? (m.lucroBrl / m.receitaBrl) * 100 : 0;
  }

  const mesAtual = historicoMensal[historicoMensal.length - 1];
  const mesAnterior = historicoMensal[historicoMensal.length - 2];

  const crescimento = (atual: number, anterior: number) =>
    anterior > 0 ? ((atual - anterior) / anterior) * 100 : atual > 0 ? 100 : 0;

  const totalUsuarios = profiles.length;
  const conversaoFreeParaPagoPct =
    totalUsuarios > 0 ? Math.round((assinantesAtivos / totalUsuarios) * 100) : 0;

  return {
    mrrBrl,
    receitaMesBrl: mesAtual?.receitaBrl ?? 0,
    custoIaMesBrl: mesAtual?.custoIaBrl ?? 0,
    lucroMesBrl: mesAtual?.lucroBrl ?? 0,
    margemMesPct: mesAtual?.margemPct ?? 0,
    ticketMedioBrl:
      mesAtual && mesAtual.pagamentos > 0
        ? mesAtual.receitaBrl / mesAtual.pagamentos
        : 0,
    crescimentoReceitaPct: crescimento(
      mesAtual?.receitaBrl ?? 0,
      mesAnterior?.receitaBrl ?? 0
    ),
    crescimentoLucroPct: crescimento(
      mesAtual?.lucroBrl ?? 0,
      mesAnterior?.lucroBrl ?? 0
    ),
    assinantesAtivos,
    totalUsuarios,
    conversaoFreeParaPagoPct,
    historicoMensal,
    porPlano,
    stripeConectado: Boolean(process.env.STRIPE_SECRET_KEY),
  };
}

export function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatPct(v: number, signed = false): string {
  const s = `${Math.abs(v).toFixed(1)}%`;
  if (!signed) return s;
  if (v > 0) return `+${s}`;
  if (v < 0) return `−${s}`;
  return s;
}
