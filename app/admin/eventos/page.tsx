import Link from "next/link";
import { getAllEventos } from "@/lib/adminQueries";

export default async function AdminEventos() {
  const eventos = await getAllEventos();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-purple-400">Eventos</p>
        <h1 className="mt-2 text-4xl font-black">Todos os eventos</h1>
        <p className="mt-2 text-white/60">
          Mostrando os {eventos.length} eventos mais recentes.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase text-white/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Nome</th>
              <th className="px-4 py-3 text-left font-semibold">Tipo</th>
              <th className="px-4 py-3 text-left font-semibold">Data evento</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Dono</th>
              <th className="px-4 py-3 text-left font-semibold">Plano</th>
              <th className="px-4 py-3 text-left font-semibold">Criado</th>
              <th className="px-4 py-3 text-right font-semibold">Site</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((e) => (
              <tr key={e.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-semibold">{e.nome}</td>
                <td className="px-4 py-3 text-white/70">{e.tipo}</td>
                <td className="px-4 py-3 text-white/70">
                  {new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold uppercase text-white/70">
                    {e.status ?? "preview"}
                  </span>
                </td>
                <td className="px-4 py-3">{e.dono}</td>
                <td className="px-4 py-3 capitalize text-white/70">{e.plan}</td>
                <td className="px-4 py-3 text-xs text-white/50">
                  {new Date(e.created_at).toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/cliente/${e.slug}`}
                    target="_blank"
                    className="text-xs font-bold text-purple-400 hover:underline"
                  >
                    Abrir →
                  </Link>
                </td>
              </tr>
            ))}
            {eventos.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-white/40">
                  Nenhum evento ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
