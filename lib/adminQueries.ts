import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";

type UsageRow = {
  id: string;
  user_id: string | null;
  evento_id: string | null;
  model: string;
  plan: string | null;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  cost_usd: string | number;
  provider?: string | null;
  generation_mode?: string | null;
  quality_score?: number | null;
  agent_run?: unknown;
  status: "ok" | "error";
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  plan: string;
  is_admin: boolean;
  created_at: string;
};

type EventoRow = {
  id: string;
  owner_id: string;
  nome: string;
  tipo: string;
  data: string;
  slug: string;
  status?: string | null;
  paid_plan?: string | null;
  created_at: string;
};

export type AdminSnapshot = {
  totals: {
    eventos: number;
    usuarios: number;
    custoUsd: number;
    custoUsdMes: number;
    custoUsd30d: number;
    callsMes: number;
    pagos: number;
    publicados: number;
    previews: number;
    receitaBrl: number;
    lucroEstimadoBrl: number;
    conversaoPreviewPago: number;
  };
  byPlan: Array<{ plan: string; usuarios: number; eventos: number; custoUsd: number }>;
  byModel: Array<{ model: string; calls: number; custoUsd: number; tokensIn: number; tokensOut: number }>;
  topUsuarios: Array<{
    userId: string;
    nome: string;
    plan: string;
    eventos: number;
    custoUsd: number;
  }>;
  diasGrafico: Array<{ dia: string; custoUsd: number; calls: number }>;
};

export type AdminUserDetail = {
  user: ProfileRow;
  email: string | null;
  eventos: EventoRow[];
  usage: UsageRow[];
  totalCustoUsd: number;
  totalCalls: number;
};

function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function startOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function planPrice(plan?: string | null) {
  return PLANS.find((p) => p.id === plan)?.preco ?? 0;
}

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase não configurado.");

  const [profilesRes, eventosRes, usageRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name, plan, is_admin, created_at"),
    supabase.from("eventos").select("id, owner_id, nome, tipo, data, slug, status, paid_plan, created_at"),
    supabase.from("usage_logs").select("*").order("created_at", { ascending: false }),
  ]);

  const profiles = (profilesRes.data ?? []) as ProfileRow[];
  const eventos = (eventosRes.data ?? []) as EventoRow[];
  const usage = (usageRes.data ?? []) as UsageRow[];

  const inicioMes = startOfMonth();
  const inicio30d = nDaysAgo(30);

  const usageMes = usage.filter((u) => u.created_at >= inicioMes);
  const usage30d = usage.filter((u) => u.created_at >= inicio30d);

  const sumCost = (rows: UsageRow[]) =>
    rows.reduce((acc, r) => acc + Number(r.cost_usd ?? 0), 0);

  const pagos = eventos.filter((e) => e.status === "paid" || e.status === "published").length;
  const publicados = eventos.filter((e) => e.status === "published").length;
  const previews = eventos.filter((e) => !e.status || e.status === "preview" || e.status === "draft").length;
  const receitaBrl = eventos.reduce((sum, e) => sum + planPrice(e.paid_plan), 0);
  const custoIaBrl = sumCost(usage) * 5.4;

  const totals = {
    eventos: eventos.length,
    usuarios: profiles.length,
    custoUsd: sumCost(usage),
    custoUsdMes: sumCost(usageMes),
    custoUsd30d: sumCost(usage30d),
    callsMes: usageMes.length,
    pagos,
    publicados,
    previews,
    receitaBrl,
    lucroEstimadoBrl: receitaBrl - custoIaBrl,
    conversaoPreviewPago: eventos.length > 0 ? Math.round((pagos / eventos.length) * 100) : 0,
  };

  // ----- Por plano -----
  const planMap = new Map<string, { usuarios: Set<string>; eventos: number; custoUsd: number }>();
  for (const p of profiles) {
    const key = p.plan ?? "free";
    if (!planMap.has(key)) planMap.set(key, { usuarios: new Set(), eventos: 0, custoUsd: 0 });
    planMap.get(key)!.usuarios.add(p.id);
  }
  const profilePlanById = new Map(profiles.map((p) => [p.id, p.plan ?? "free"]));
  for (const e of eventos) {
    const plan = profilePlanById.get(e.owner_id) ?? "free";
    if (!planMap.has(plan)) planMap.set(plan, { usuarios: new Set(), eventos: 0, custoUsd: 0 });
    planMap.get(plan)!.eventos += 1;
  }
  for (const u of usage) {
    const plan = u.plan ?? (u.user_id ? profilePlanById.get(u.user_id) ?? "free" : "free");
    if (!planMap.has(plan)) planMap.set(plan, { usuarios: new Set(), eventos: 0, custoUsd: 0 });
    planMap.get(plan)!.custoUsd += Number(u.cost_usd ?? 0);
  }
  const byPlan = Array.from(planMap.entries()).map(([plan, v]) => ({
    plan,
    usuarios: v.usuarios.size,
    eventos: v.eventos,
    custoUsd: v.custoUsd,
  }));

  // ----- Por modelo -----
  const modelMap = new Map<string, { calls: number; custoUsd: number; tokensIn: number; tokensOut: number }>();
  for (const u of usage) {
    if (!modelMap.has(u.model)) modelMap.set(u.model, { calls: 0, custoUsd: 0, tokensIn: 0, tokensOut: 0 });
    const m = modelMap.get(u.model)!;
    m.calls += 1;
    m.custoUsd += Number(u.cost_usd ?? 0);
    m.tokensIn += u.input_tokens;
    m.tokensOut += u.output_tokens;
  }
  const byModel = Array.from(modelMap.entries()).map(([model, v]) => ({ model, ...v }));

  // ----- Top usuários -----
  const userCost = new Map<string, number>();
  const userCalls = new Map<string, number>();
  for (const u of usage) {
    if (!u.user_id) continue;
    userCost.set(u.user_id, (userCost.get(u.user_id) ?? 0) + Number(u.cost_usd ?? 0));
    userCalls.set(u.user_id, (userCalls.get(u.user_id) ?? 0) + 1);
  }
  const userEventos = new Map<string, number>();
  for (const e of eventos) {
    userEventos.set(e.owner_id, (userEventos.get(e.owner_id) ?? 0) + 1);
  }
  const topUsuarios = profiles
    .map((p) => ({
      userId: p.id,
      nome: p.full_name || "(sem nome)",
      plan: p.plan ?? "free",
      eventos: userEventos.get(p.id) ?? 0,
      custoUsd: userCost.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.custoUsd - a.custoUsd)
    .slice(0, 10);

  // ----- Gráfico últimos 30 dias -----
  const diaMap = new Map<string, { custoUsd: number; calls: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    diaMap.set(key, { custoUsd: 0, calls: 0 });
  }
  for (const u of usage30d) {
    const key = u.created_at.slice(0, 10);
    if (!diaMap.has(key)) continue;
    const d = diaMap.get(key)!;
    d.custoUsd += Number(u.cost_usd ?? 0);
    d.calls += 1;
  }
  const diasGrafico = Array.from(diaMap.entries()).map(([dia, v]) => ({ dia, ...v }));

  return { totals, byPlan, byModel, topUsuarios, diasGrafico };
}

export async function getAllUsuarios() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase não configurado.");

  const [profilesRes, usageRes, eventosRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, plan, is_admin, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("usage_logs").select("user_id, cost_usd"),
    supabase.from("eventos").select("owner_id"),
  ]);

  const profiles = (profilesRes.data ?? []) as ProfileRow[];
  const usage = (usageRes.data ?? []) as Array<{ user_id: string | null; cost_usd: number }>;
  const eventos = (eventosRes.data ?? []) as Array<{ owner_id: string }>;

  const cost = new Map<string, number>();
  const calls = new Map<string, number>();
  for (const u of usage) {
    if (!u.user_id) continue;
    cost.set(u.user_id, (cost.get(u.user_id) ?? 0) + Number(u.cost_usd ?? 0));
    calls.set(u.user_id, (calls.get(u.user_id) ?? 0) + 1);
  }
  const events = new Map<string, number>();
  for (const e of eventos) {
    events.set(e.owner_id, (events.get(e.owner_id) ?? 0) + 1);
  }

  return profiles.map((p) => ({
    ...p,
    eventos: events.get(p.id) ?? 0,
    calls: calls.get(p.id) ?? 0,
    custoUsd: cost.get(p.id) ?? 0,
  }));
}

export async function getAllEventos() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase não configurado.");

  const [eventosRes, profilesRes] = await Promise.all([
    supabase
      .from("eventos")
      .select("id, owner_id, nome, tipo, data, slug, status, paid_plan, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("profiles").select("id, full_name, plan"),
  ]);

  const eventos = (eventosRes.data ?? []) as EventoRow[];
  const profiles = (profilesRes.data ?? []) as Pick<ProfileRow, "id" | "full_name" | "plan">[];
  const profMap = new Map(profiles.map((p) => [p.id, p]));

  return eventos.map((e) => ({
    ...e,
    dono: profMap.get(e.owner_id)?.full_name || "(sem nome)",
    plan: profMap.get(e.owner_id)?.plan || "free",
  }));
}

export async function getAllUsage(limit = 200) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase não configurado.");

  const [usageRes, profilesRes] = await Promise.all([
    supabase
      .from("usage_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase.from("profiles").select("id, full_name"),
  ]);

  const usage = (usageRes.data ?? []) as UsageRow[];
  const profiles = (profilesRes.data ?? []) as Array<{ id: string; full_name: string | null }>;
  const profMap = new Map(profiles.map((p) => [p.id, p.full_name]));

  return usage.map((u) => ({
    ...u,
    nome: u.user_id ? profMap.get(u.user_id) ?? "(sem nome)" : "(sem usuário)",
  }));
}
