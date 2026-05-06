import Link from "next/link";
import { redirect } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";
import { formatUSD } from "@/lib/aiPricing";

export const dynamic = "force-dynamic";

const PLAN_INFO: Record<
  string,
  { nome: string; modeloIA: string; cor: string; descricao: string }
> = {
  free: {
    nome: "Gratuito",
    modeloIA: "IA Básica",
    cor: "bg-slate-100 text-slate-700 border-slate-200",
    descricao: "Acesso para experimentar a plataforma. Site gerado com IA básica.",
  },
  basico: {
    nome: "Básico",
    modeloIA: "IA Rápida",
    cor: "bg-blue-100 text-blue-700 border-blue-200",
    descricao: "Site simples e responsivo, gerado com IA rápida.",
  },
  intermediario: {
    nome: "Intermediário",
    modeloIA: "IA Avançada",
    cor: "bg-purple-100 text-purple-700 border-purple-200",
    descricao: "Site completo com IA avançada, RSVP e mapa integrado.",
  },
  premium: {
    nome: "Premium",
    modeloIA: "IA Premium",
    cor: "bg-amber-100 text-amber-700 border-amber-200",
    descricao: "IA mais avançada, copy autoral e regeneração ilimitada.",
  },
};

export default async function Perfil() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login?next=/perfil");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/perfil");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan, is_admin, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const plano = (profile?.plan as keyof typeof PLAN_INFO) || "free";
  const info = PLAN_INFO[plano] || PLAN_INFO.free;
  const planoPago = PLANS.find((p) => p.id === plano);

  const [eventosRes, usageRes] = await Promise.all([
    supabase
      .from("eventos")
      .select("id, nome, tipo, data, slug, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("usage_logs")
      .select("cost_usd, created_at, model")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const eventos = eventosRes.data ?? [];
  const usage = usageRes.data ?? [];

  const totalCustoUsd = usage.reduce((acc, u) => acc + Number(u.cost_usd ?? 0), 0);
  const sitesGerados = usage.length;

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const sitesNoMes = usage.filter((u) => new Date(u.created_at) >= inicioMes).length;

  const cadastradoEm = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("pt-BR")
    : "—";

  return (
    <main className="eventify-page">
      <BrandHeader />
      <div className="eventify-section max-w-5xl">
        <div className="mb-10">
          <span className="eventify-kicker">✦ Meu perfil</span>
          <h1 className="eventify-title mt-6 text-5xl">Sua conta</h1>
          <p className="eventify-muted mt-4 text-lg">
            Aqui você vê seu plano, seus dados e seu histórico de uso.
          </p>
        </div>

        {/* Cabeçalho do perfil */}
        <div className="eventify-card grid gap-6 p-8 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-3xl font-black text-white">
            {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-2xl font-black text-[#090814]">
              {profile?.full_name || "(sem nome)"}
            </p>
            <p className="eventify-muted text-sm">{user.email}</p>
            <p className="eventify-muted mt-1 text-xs">Cliente desde {cadastradoEm}</p>
            {profile?.is_admin && (
              <span className="mt-2 inline-block rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-700">
                ADMIN
              </span>
            )}
          </div>
          <Link
            href="/painel"
            className="eventify-button eventify-button-ghost justify-self-end"
          >
            Voltar ao painel
          </Link>
        </div>

        {/* Plano atual */}
        <section className="mt-8">
          <h2 className="text-xl font-black text-[#090814]">Seu plano</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div
              className={`rounded-2xl border-2 p-6 ${info.cor.replace("text-", "border-").replace("100", "300").split(" ")[2] || ""}`}
              style={{
                background:
                  "linear-gradient(135deg, rgba(136, 71, 231, 0.08), rgba(136, 71, 231, 0.02))",
                borderColor: "#e0d8f5",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${info.cor}`}
                >
                  {info.nome}
                </span>
                {planoPago && (
                  <span className="text-2xl font-black text-[#090814]">
                    {planoPago.precoFormatado}
                    <span className="text-sm font-medium text-[#5f5a72]">/mês</span>
                  </span>
                )}
              </div>
              <p className="eventify-muted mt-3 text-sm">{info.descricao}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md bg-white/80 px-2.5 py-1 font-mono font-semibold text-purple-700 shadow-sm">
                  IA: {info.modeloIA}
                </span>
              </div>
              {planoPago && (
                <ul className="mt-5 space-y-2 text-sm text-[#3a3650]">
                  {planoPago.recursos.map((r) => (
                    <li key={r} className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/precos"
                className="eventify-button eventify-button-primary justify-center"
              >
                {plano === "premium" ? "Gerenciar plano" : "Fazer upgrade →"}
              </Link>
              <Link
                href="/novo-evento"
                className="eventify-button eventify-button-ghost justify-center"
              >
                Criar novo evento
              </Link>
            </div>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="mt-8">
          <h2 className="text-xl font-black text-[#090814]">Seu uso</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e8e3f1] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#5f5a72]">
                Eventos criados
              </p>
              <p className="mt-3 text-4xl font-black text-[#090814] tabular-nums">
                {eventos.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e8e3f1] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#5f5a72]">
                Sites gerados pela IA
              </p>
              <p className="mt-3 text-4xl font-black text-[#090814] tabular-nums">
                {sitesGerados}
              </p>
              <p className="eventify-muted mt-1 text-xs">{sitesNoMes} neste mês</p>
            </div>
            <div className="rounded-2xl border border-[#e8e3f1] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#5f5a72]">
                Custo IA acumulado
              </p>
              <p className="mt-3 text-4xl font-black text-[#090814] tabular-nums">
                {formatUSD(totalCustoUsd)}
              </p>
              <p className="eventify-muted mt-1 text-xs">Pago pela plataforma</p>
            </div>
          </div>
        </section>

        {/* Eventos recentes */}
        <section className="mt-8">
          <h2 className="text-xl font-black text-[#090814]">Seus eventos</h2>
          {eventos.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-[#e8e3f1] bg-[#faf9ff] p-10 text-center">
              <p className="eventify-muted">Você ainda não criou nenhum evento.</p>
              <Link
                href="/novo-evento"
                className="eventify-button eventify-button-primary mt-4 inline-flex"
              >
                Criar meu primeiro evento →
              </Link>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-[#e8e3f1] bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#faf9ff] text-xs uppercase text-[#5f5a72]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Nome</th>
                    <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                    <th className="px-4 py-3 text-left font-semibold">Data</th>
                    <th className="px-4 py-3 text-right font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.slice(0, 10).map((e) => (
                    <tr key={e.id} className="border-t border-[#e8e3f1]">
                      <td className="px-4 py-3 font-bold text-[#090814]">{e.nome}</td>
                      <td className="px-4 py-3 text-[#5f5a72]">{e.tipo}</td>
                      <td className="px-4 py-3 text-[#5f5a72]">
                        {new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/cliente/${e.slug}`}
                          target="_blank"
                          className="text-xs font-bold text-purple-700 hover:underline"
                        >
                          Abrir →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {eventos.length > 10 && (
                <div className="border-t border-[#e8e3f1] bg-[#faf9ff] px-4 py-3 text-center text-xs text-[#5f5a72]">
                  + {eventos.length - 10} eventos. Veja todos no{" "}
                  <Link href="/painel" className="font-bold text-purple-700 hover:underline">
                    painel
                  </Link>
                  .
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
