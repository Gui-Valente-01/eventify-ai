import Link from "next/link";
import { getAdminSnapshot } from "@/lib/adminQueries";
import { formatBRL, formatUSD } from "@/lib/aiPricing";
import { StatCard } from "@/components/admin/StatCard";
import { BarChart } from "@/components/admin/BarChart";

export default async function AdminDashboard() {
  const snap = await getAdminSnapshot();

  return (
    <div className="space-y-12">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)]">Dashboard</p>
        <h1 className="mt-3 font-display text-[clamp(40px,5vw,60px)] font-light leading-[1.02] tracking-[-0.02em]">
          Visão <em className="italic text-[color:var(--gold)]">geral.</em>
        </h1>
        <p className="mt-3 text-[15px] text-white/65">Tudo que está acontecendo na plataforma.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Eventos criados" value={snap.totals.eventos.toLocaleString("pt-BR")} />
        <StatCard
          label="Sites pagos"
          value={snap.totals.pagos.toLocaleString("pt-BR")}
          hint={`${snap.totals.publicados} publicados · ${snap.totals.conversaoPreviewPago}% conversão`}
        />
        <StatCard
          label="Receita estimada"
          value={snap.totals.receitaBrl.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          hint={`Lucro estimado: ${snap.totals.lucroEstimadoBrl.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}`}
        />
        <StatCard
          label="Previews em aberto"
          value={snap.totals.previews.toLocaleString("pt-BR")}
          hint="oportunidade de venda"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Usuários cadastrados" value={snap.totals.usuarios.toLocaleString("pt-BR")} />
        <StatCard
          label="Custo IA — mês atual"
          value={formatUSD(snap.totals.custoUsdMes)}
          hint={`≈ ${formatBRL(snap.totals.custoUsdMes)} · ${snap.totals.callsMes} chamadas`}
        />
        <StatCard
          label="Custo IA — total"
          value={formatUSD(snap.totals.custoUsd)}
          hint={`Últimos 30d: ${formatUSD(snap.totals.custoUsd30d)}`}
        />
      </section>

      <section className="rounded-[14px] border border-white/10 bg-white/[0.03] p-7">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[22px] italic tracking-[-0.01em]">
            Custo da IA · últimos 30 dias
          </h2>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">USD por dia</p>
        </div>
        <div className="mt-6">
          <BarChart
            data={snap.diasGrafico.map((d) => ({
              label: d.dia,
              value: d.custoUsd,
            }))}
            formatValue={formatUSD}
          />
          <div className="mt-2 flex justify-between font-mono-tight text-[10px] text-white/45">
            <span>{snap.diasGrafico[0]?.dia.slice(5)}</span>
            <span>{snap.diasGrafico[snap.diasGrafico.length - 1]?.dia.slice(5)}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-7">
          <h2 className="font-display text-[22px] italic tracking-[-0.01em]">Por plano</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead className="text-[10.5px] uppercase tracking-[0.18em] text-white/55">
                <tr className="border-b border-white/10">
                  <th className="py-2.5 text-left font-medium">Plano</th>
                  <th className="py-2.5 text-right font-medium">Usuários</th>
                  <th className="py-2.5 text-right font-medium">Eventos</th>
                  <th className="py-2.5 text-right font-medium">Custo</th>
                </tr>
              </thead>
              <tbody>
                {snap.byPlan.map((p) => (
                  <tr key={p.plan} className="border-b border-white/5">
                    <td className="py-3 font-display italic capitalize">{p.plan}</td>
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

        <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-7">
          <h2 className="font-display text-[22px] italic tracking-[-0.01em]">Por modelo Claude</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead className="text-[10.5px] uppercase tracking-[0.18em] text-white/55">
                <tr className="border-b border-white/10">
                  <th className="py-2.5 text-left font-medium">Modelo</th>
                  <th className="py-2.5 text-right font-medium">Chamadas</th>
                  <th className="py-2.5 text-right font-medium">Tokens out</th>
                  <th className="py-2.5 text-right font-medium">Custo</th>
                </tr>
              </thead>
              <tbody>
                {snap.byModel.map((m) => (
                  <tr key={m.model} className="border-b border-white/5">
                    <td className="py-3 font-mono-tight text-[11.5px]">{m.model}</td>
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

      <section className="rounded-[14px] border border-white/10 bg-white/[0.03] p-7">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[22px] italic tracking-[-0.01em]">
            Top 10 usuários por custo
          </h2>
          <Link
            href="/admin/usuarios"
            className="text-[12px] text-[color:var(--gold)] underline decoration-current/40 underline-offset-4 hover:decoration-current"
          >
            Ver todos →
          </Link>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="text-[10.5px] uppercase tracking-[0.18em] text-white/55">
              <tr className="border-b border-white/10">
                <th className="py-2.5 text-left font-medium">Usuário</th>
                <th className="py-2.5 text-left font-medium">Plano</th>
                <th className="py-2.5 text-right font-medium">Eventos</th>
                <th className="py-2.5 text-right font-medium">Custo IA</th>
              </tr>
            </thead>
            <tbody>
              {snap.topUsuarios.map((u) => (
                <tr key={u.userId} className="border-b border-white/5">
                  <td className="py-3">{u.nome}</td>
                  <td className="py-3 capitalize text-white/65">{u.plan}</td>
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
