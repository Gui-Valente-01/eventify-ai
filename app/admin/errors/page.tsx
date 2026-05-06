import { getSupabaseServerClient } from "@/lib/supabase/server";
import ErrorListClient from "./ErrorListClient";

export const dynamic = "force-dynamic";

type ErrorRow = {
  id: string;
  scope: string;
  level: string;
  message: string;
  error_name: string | null;
  error_message: string | null;
  stack: string | null;
  url: string | null;
  user_id: string | null;
  user_agent: string | null;
  context: Record<string, unknown> | null;
  status: "open" | "investigating" | "resolved" | "ignored";
  ai_analysis: string | null;
  ai_suggested_fix: string | null;
  ai_severity: "low" | "medium" | "high" | "critical" | null;
  created_at: string;
};

export default async function AdminErrors() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return <div className="text-white/60">Supabase não configurado.</div>;
  }

  const { data, error } = await supabase
    .from("error_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const errors = (data ?? []) as ErrorRow[];

  const stats = {
    total: errors.length,
    open: errors.filter((e) => e.status === "open").length,
    investigating: errors.filter((e) => e.status === "investigating").length,
    resolved: errors.filter((e) => e.status === "resolved").length,
    critical: errors.filter((e) => e.ai_severity === "critical").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-purple-400">Monitoramento</p>
        <h1 className="mt-2 text-4xl font-black">Erros do app</h1>
        <p className="mt-2 text-white/60">
          Tudo que falhou em produção. Use o botão "Analisar com IA" pra ter
          diagnóstico e sugestão de correção em segundos.
        </p>
        {error && (
          <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            Não consegui ler error_logs. Rode o SQL <code>RODAR-ISSO-7.sql</code> no Supabase.
          </div>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Total" value={stats.total} accent="purple" />
        <KpiCard label="Abertos" value={stats.open} accent="amber" />
        <KpiCard label="Investigando" value={stats.investigating} accent="blue" />
        <KpiCard label="Resolvidos" value={stats.resolved} accent="green" />
        <KpiCard label="Críticos" value={stats.critical} accent="rose" />
      </section>

      <ErrorListClient errors={errors} />
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "purple" | "amber" | "blue" | "green" | "rose";
}) {
  const colors = {
    purple: "from-purple-500/20 border-purple-500/30",
    amber: "from-amber-500/20 border-amber-500/30",
    blue: "from-blue-500/20 border-blue-500/30",
    green: "from-emerald-500/20 border-emerald-500/30",
    rose: "from-rose-500/20 border-rose-500/30",
  };
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br to-transparent p-5 ${colors[accent]}`}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-white/60">{label}</p>
      <p className="mt-2 text-3xl font-black tabular-nums">{value}</p>
    </div>
  );
}
