import {
  formatBRL,
  formatPct,
  getFinancialSnapshot,
  type MesFinanceiro,
} from "@/lib/adminFinancial";
import { StatCard } from "@/components/admin/StatCard";

export default async function AdminFinanceiro() {
  const snap = await getFinancialSnapshot();

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-widest text-purple-400">Financeiro</p>
        <h1 className="mt-2 text-4xl font-black">Saúde do negócio</h1>
        <p className="mt-2 text-white/60">
          Receita real (Stripe), custo de IA e lucro líquido. Atualizado em tempo real.
        </p>
        {!snap.stripeConectado && (
          <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            ⚠️ Stripe não configurado — receita está em zero. Adicione <code className="font-mono">STRIPE_SECRET_KEY</code> nas envs.
          </div>
        )}
      </div>

      {/* KPIs principais — mês atual */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/50">
          Mês atual
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Receita do mês"
            value={formatBRL(snap.receitaMesBrl)}
            hint={`${formatPct(snap.crescimentoReceitaPct, true)} vs mês anterior`}
            accent="green"
          />
          <StatCard
            label="Custo IA do mês"
            value={formatBRL(snap.custoIaMesBrl)}
            hint="Anthropic + Google Gemini"
            accent="amber"
          />
          <StatCard
            label="Lucro líquido"
            value={formatBRL(snap.lucroMesBrl)}
            hint={`Margem ${snap.margemMesPct.toFixed(1)}% · ${formatPct(snap.crescimentoLucroPct, true)}`}
            accent={snap.lucroMesBrl >= 0 ? "blue" : "amber"}
          />
          <StatCard
            label="Ticket médio"
            value={formatBRL(snap.ticketMedioBrl)}
            hint="Receita / pagamentos no mês"
            accent="purple"
          />
        </div>
      </section>

      {/* MRR e assinantes */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/50">
          Recorrência
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="MRR"
            value={formatBRL(snap.mrrBrl)}
            hint="Soma das assinaturas ativas"
            accent="green"
          />
          <StatCard
            label="Assinantes ativos"
            value={snap.assinantesAtivos.toLocaleString("pt-BR")}
            hint="Status active/trialing"
            accent="blue"
          />
          <StatCard
            label="Total de usuários"
            value={snap.totalUsuarios.toLocaleString("pt-BR")}
            hint="Cadastrados no app"
            accent="purple"
          />
          <StatCard
            label="Conversão para pago"
            value={`${snap.conversaoFreeParaPagoPct}%`}
            hint="Cadastrados que assinam"
            accent="amber"
          />
        </div>
      </section>

      {/* Por plano */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">MRR por plano</h2>
          <p className="text-xs text-white/50">{snap.assinantesAtivos} assinantes ativos</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-white/50">
              <tr className="border-b border-white/10">
                <th className="py-2 text-left font-semibold">Plano</th>
                <th className="py-2 text-right font-semibold">Assinantes</th>
                <th className="py-2 text-right font-semibold">MRR</th>
                <th className="py-2 text-right font-semibold">% MRR</th>
              </tr>
            </thead>
            <tbody>
              {snap.porPlano.map((p) => {
                const share =
                  snap.mrrBrl > 0 ? Math.round((p.mrrBrl / snap.mrrBrl) * 100) : 0;
                return (
                  <tr key={p.plan} className="border-b border-white/5">
                    <td className="py-3 font-bold capitalize">{p.plan}</td>
                    <td className="py-3 text-right tabular-nums">{p.count}</td>
                    <td className="py-3 text-right tabular-nums">{formatBRL(p.mrrBrl)}</td>
                    <td className="py-3 text-right tabular-nums text-white/70">{share}%</td>
                  </tr>
                );
              })}
              {snap.porPlano.every((p) => p.count === 0) && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-white/40">
                    Nenhum assinante ativo ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Histórico mensal */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Histórico — últimos 6 meses</h2>
          <p className="text-xs text-white/50">Receita Stripe vs custo IA</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-white/50">
              <tr className="border-b border-white/10">
                <th className="py-2 text-left font-semibold">Mês</th>
                <th className="py-2 text-right font-semibold">Pagamentos</th>
                <th className="py-2 text-right font-semibold">Receita</th>
                <th className="py-2 text-right font-semibold">Custo IA</th>
                <th className="py-2 text-right font-semibold">Lucro</th>
                <th className="py-2 text-right font-semibold">Margem</th>
              </tr>
            </thead>
            <tbody>
              {snap.historicoMensal.map((m, i) => (
                <RowMes key={m.mes} mes={m} highlight={i === snap.historicoMensal.length - 1} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-white/40">
          Receita: pagamentos confirmados na Stripe (BRL). Custo IA: somatório de
          usage_logs convertido em BRL (1 USD = 5,40 BRL). Lucro líquido = Receita − Custo IA.
        </p>
      </section>
    </div>
  );
}

function RowMes({ mes, highlight }: { mes: MesFinanceiro; highlight: boolean }) {
  const lucroPositivo = mes.lucroBrl >= 0;
  return (
    <tr
      className={`border-b border-white/5 ${highlight ? "bg-purple-500/5" : ""}`}
    >
      <td className="py-3 font-bold">
        {mes.label}
        {highlight && (
          <span className="ml-2 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-purple-300">
            atual
          </span>
        )}
      </td>
      <td className="py-3 text-right tabular-nums">{mes.pagamentos}</td>
      <td className="py-3 text-right tabular-nums">{formatBRL(mes.receitaBrl)}</td>
      <td className="py-3 text-right tabular-nums text-amber-300">
        {formatBRL(mes.custoIaBrl)}
      </td>
      <td
        className={`py-3 text-right tabular-nums font-bold ${
          lucroPositivo ? "text-emerald-300" : "text-rose-300"
        }`}
      >
        {formatBRL(mes.lucroBrl)}
      </td>
      <td className="py-3 text-right tabular-nums text-white/70">
        {mes.receitaBrl > 0 ? `${mes.margemPct.toFixed(1)}%` : "—"}
      </td>
    </tr>
  );
}
