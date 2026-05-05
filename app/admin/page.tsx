import Link from "next/link";
import { getAdminSnapshot } from "@/lib/adminQueries";
import { formatBRL, formatUSD } from "@/lib/aiPricing";
import { StatCard } from "@/components/admin/StatCard";
import { BarChart } from "@/components/admin/BarChart";

export default async function AdminDashboard() {
  const snap = await getAdminSnapshot();

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-widest text-purple-400">Dashboard</p>
        <h1 className="mt-2 text-4xl font-black">Visão geral</h1>
        <p className="mt-2 text-white/60">Tudo que está acontecendo na plataforma.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Eventos criados"
          value={snap.totals.eventos.toLocaleString("pt-BR")}
          accent="purple"
        />
        <StatCard
          label="Sites pagos"
          value={snap.totals.pagos.toLocaleString("pt-BR")}
          hint={`${snap.totals.publicados} publicados · ${snap.totals.conversaoPreviewPago}% conversão`}
          accent="green"
        />
        <StatCard
          label="Receita estimada"
          value={snap.totals.receitaBrl.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          hint={`Lucro estimado: ${snap.totals.lucroEstimadoBrl.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}
          accent="blue"
        />
        <StatCard
          label="Previews em aberto"
          value={snap.totals.previews.toLocaleString("pt-BR")}
          hint="oportunidade de venda"
          accent="amber"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Usuários cadastrados"
          value={snap.totals.usuarios.toLocaleString("pt-BR")}
          accent="blue"
        />
        <StatCard
          label="Custo IA — mês atual"
          value={formatUSD(snap.totals.custoUsdMes)}
          hint={`≈ ${formatBRL(snap.totals.custoUsdMes)} • ${snap.totals.callsMes} chamadas`}
          accent="amber"
        />
        <StatCard
          label="Custo IA — total"
          value={formatUSD(snap.totals.custoUsd)}
          hint={`Últimos 30d: ${formatUSD(snap.totals.custoUsd30d)}`}
          accent="green"
        />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Custo da IA — últimos 30 dias</h2>
          <p className="text-xs text-white/50">USD por dia</p>
        </div>
        <div className="mt-6">
          <BarChart
            data={snap.diasGrafico.map((d) => ({
              label: d.dia,
              value: d.custoUsd,
            }))}
            formatValue={formatUSD}
          />
          <div className="mt-2 flex justify-between text-[10px] text-white/40">
            <span>{snap.diasGrafico[0]?.dia.slice(5)}</span>
            <span>{snap.diasGrafico[snap.diasGrafico.length - 1]?.dia.slice(5)}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-lg font-bold">Por plano</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-white/50">
                <tr className="border-b border-white/10">
                  <th className="py-2 text-left font-semibold">Plano</th>
                  <th className="py-2 text-right font-semibold">Usuários</th>
                  <th className="py-2 text-right font-semibold">Eventos</th>
                  <th className="py-2 text-right font-semibold">Custo</th>
                </tr>
              </thead>
              <tbody>
                {snap.byPlan.map((p) => (
                  <tr key={p.plan} className="border-b border-white/5">
                    <td className="py-3 font-bold capitalize">{p.plan}</td>
                    <td className="py-3 text-right tabular-nums">{p.usuarios}</td>
                    <td className="py-3 text-right tabular-nums">{p.eventos}</td>
                    <td className="py-3 text-right tabular-nums">{formatUSD(p.custoUsd)}</td>
                  </tr>
                ))}
                {snap.byPlan.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-white/40">
                      Sem dados ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-lg font-bold">Por modelo Claude</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-white/50">
                <tr className="border-b border-white/10">
                  <th className="py-2 text-left font-semibold">Modelo</th>
                  <th className="py-2 text-right font-semibold">Chamadas</th>
                  <th className="py-2 text-right font-semibold">Tokens out</th>
                  <th className="py-2 text-right font-semibold">Custo</th>
                </tr>
              </thead>
              <tbody>
                {snap.byModel.map((m) => (
                  <tr key={m.model} className="border-b border-white/5">
                    <td className="py-3 font-mono text-xs">{m.model}</td>
                    <td className="py-3 text-right tabular-nums">{m.calls}</td>
                    <td className="py-3 text-right tabular-nums">
                      {m.tokensOut.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 text-right tabular-nums">{formatUSD(m.custoUsd)}</td>
                  </tr>
                ))}
                {snap.byModel.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-white/40">
                      Sem chamadas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Top 10 usuários por custo</h2>
          <Link href="/admin/usuarios" className="text-xs text-purple-400 hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-white/50">
              <tr className="border-b border-white/10">
                <th className="py-2 text-left font-semibold">Usuário</th>
                <th className="py-2 text-left font-semibold">Plano</th>
                <th className="py-2 text-right font-semibold">Eventos</th>
                <th className="py-2 text-right font-semibold">Custo IA</th>
              </tr>
            </thead>
            <tbody>
              {snap.topUsuarios.map((u) => (
                <tr key={u.userId} className="border-b border-white/5">
                  <td className="py-3 font-semibold">{u.nome}</td>
                  <td className="py-3 capitalize text-white/70">{u.plan}</td>
                  <td className="py-3 text-right tabular-nums">{u.eventos}</td>
                  <td className="py-3 text-right tabular-nums">{formatUSD(u.custoUsd)}</td>
                </tr>
              ))}
              {snap.topUsuarios.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-white/40">
                    Sem usuários ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
