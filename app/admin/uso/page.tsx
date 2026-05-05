import { getAllUsage } from "@/lib/adminQueries";
import { formatUSD } from "@/lib/aiPricing";

export default async function AdminUso() {
  const logs = await getAllUsage(300);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-purple-400">Uso da IA</p>
        <h1 className="mt-2 text-4xl font-black">Histórico de chamadas Claude</h1>
        <p className="mt-2 text-white/60">
          Últimas {logs.length} chamadas — cada linha é uma geração de site.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase text-white/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Quando</th>
              <th className="px-4 py-3 text-left font-semibold">Usuário</th>
              <th className="px-4 py-3 text-left font-semibold">Modelo</th>
              <th className="px-4 py-3 text-left font-semibold">Plano</th>
              <th className="px-4 py-3 text-right font-semibold">Tokens in</th>
              <th className="px-4 py-3 text-right font-semibold">Tokens out</th>
              <th className="px-4 py-3 text-right font-semibold">Custo</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-xs text-white/70">
                  {new Date(l.created_at).toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 font-semibold">{l.nome}</td>
                <td className="px-4 py-3 font-mono text-xs">{l.model}</td>
                <td className="px-4 py-3 capitalize text-white/70">{l.plan ?? "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {l.input_tokens.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {l.output_tokens.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatUSD(Number(l.cost_usd ?? 0))}
                </td>
                <td className="px-4 py-3">
                  {l.status === "ok" ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
                      OK
                    </span>
                  ) : (
                    <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300">
                      ERRO
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-white/40">
                  Nenhuma chamada registrada ainda. Gere um site pra começar a popular.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
