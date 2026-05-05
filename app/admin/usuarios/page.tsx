import { getAllUsuarios } from "@/lib/adminQueries";
import { formatUSD } from "@/lib/aiPricing";

export default async function AdminUsuarios() {
  const usuarios = await getAllUsuarios();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-purple-400">Usuários</p>
        <h1 className="mt-2 text-4xl font-black">Todos os usuários</h1>
        <p className="mt-2 text-white/60">{usuarios.length} cadastrados.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase text-white/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Nome</th>
              <th className="px-4 py-3 text-left font-semibold">Plano</th>
              <th className="px-4 py-3 text-left font-semibold">Admin</th>
              <th className="px-4 py-3 text-right font-semibold">Eventos</th>
              <th className="px-4 py-3 text-right font-semibold">Chamadas IA</th>
              <th className="px-4 py-3 text-right font-semibold">Custo IA</th>
              <th className="px-4 py-3 text-left font-semibold">Cadastrado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-semibold">{u.full_name || "(sem nome)"}</td>
                <td className="px-4 py-3 capitalize text-white/70">{u.plan}</td>
                <td className="px-4 py-3">
                  {u.is_admin ? (
                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300">
                      ADMIN
                    </span>
                  ) : (
                    <span className="text-white/30">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{u.eventos}</td>
                <td className="px-4 py-3 text-right tabular-nums">{u.calls}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatUSD(u.custoUsd)}</td>
                <td className="px-4 py-3 text-xs text-white/50">
                  {new Date(u.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white/40">
                  Nenhum usuário ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
