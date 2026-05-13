import Link from "next/link";
import { redirect } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import ManageSubscriptionButton from "@/components/ManageSubscriptionButton";
import PaymentHistory from "@/components/PaymentHistory";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";
import { formatUSD } from "@/lib/aiPricing";
import { listInvoices } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const PLAN_INFO: Record<string, { nome: string; modeloIA: string; descricao: string }> = {
  free: {
    nome: "Gratuito",
    modeloIA: "IA Básica",
    descricao: "Acesso para experimentar a plataforma. Site gerado com IA básica.",
  },
  basico: {
    nome: "Básico",
    modeloIA: "IA Rápida",
    descricao: "Site simples e responsivo, gerado com IA rápida.",
  },
  intermediario: {
    nome: "Intermediário",
    modeloIA: "IA Avançada",
    descricao: "Site completo com IA avançada, RSVP e mapa integrado.",
  },
  premium: {
    nome: "Premium",
    modeloIA: "IA Premium · Templates exclusivos",
    descricao: "IA mais avançada, templates premium exclusivos por nicho, copy autoral e regeneração ilimitada.",
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
    .select("full_name, plan, is_admin, created_at, stripe_customer_id, subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  const plano = (profile?.plan as keyof typeof PLAN_INFO) || "free";
  const info = PLAN_INFO[plano] || PLAN_INFO.free;
  const planoPago = PLANS.find((p) => p.id === plano);

  const stripeCustomerId = profile?.stripe_customer_id ?? null;
  const [eventosRes, usageRes, invoices] = await Promise.all([
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
    stripeCustomerId ? listInvoices(stripeCustomerId, 24) : Promise.resolve([]),
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

  const inicial = (profile?.full_name || user.email || "U").charAt(0).toUpperCase();

  return (
    <main className="eventify-page">
      <BrandHeader />
      <div className="editorial-wrap max-w-[1080px] py-12 sm:py-16">
        {/* Header */}
        <div className="mb-12">
          <span className="eventify-kicker">Meu perfil</span>
          <h1 className="eventify-title mt-6 text-[clamp(40px,5.2vw,68px)]">
            Sua <em>conta.</em>
          </h1>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.6] text-[color:var(--muted)]">
            Aqui você vê seu plano, seus dados e o histórico de uso da plataforma.
          </p>
        </div>

        {/* Cabeçalho do perfil */}
        <div className="grid items-center gap-6 rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-8 sm:grid-cols-[auto_1fr_auto]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--paper-2)] font-display text-[28px] italic text-[color:var(--gold)]">
            {inicial}
          </div>
          <div>
            <p className="font-display text-[26px] font-normal tracking-[-0.01em] text-[color:var(--ink)]">
              {profile?.full_name || "(sem nome)"}
            </p>
            <p className="mt-1 text-[13.5px] text-[color:var(--muted)]">{user.email}</p>
            <p className="mt-0.5 text-[12px] text-[color:var(--muted-2)]">Cliente desde {cadastradoEm}</p>
            {profile?.is_admin && (
              <span className="mt-3 inline-block rounded-full border border-[color:var(--gold)] bg-[var(--gold-soft)] px-3 py-0.5 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--gold-2)]">
                Admin
              </span>
            )}
          </div>
          <Link href="/painel" className="eventify-button eventify-button-ghost justify-self-end">
            ← Voltar ao painel
          </Link>
        </div>

        {/* Plano atual */}
        <section className="mt-12">
          <h2 className="font-display text-[28px] italic tracking-[-0.01em] text-[color:var(--ink)]">
            Seu plano
          </h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-[14px] border border-[color:var(--gold)] bg-[var(--gold-soft)] p-7">
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="rounded-full border border-[color:var(--gold)] bg-[color:var(--surface)] px-3 py-1 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--gold-2)]">
                  {info.nome}
                </span>
                {planoPago && (
                  <span className="font-display text-[36px] font-light leading-none tracking-[-0.02em] text-[color:var(--ink)]">
                    {planoPago.precoFormatado}
                    <span className="ml-1 text-[13px] font-normal text-[color:var(--muted)] font-sans">
                      /mês
                    </span>
                  </span>
                )}
              </div>
              <p className="mt-4 text-[14px] leading-[1.55] text-[color:var(--ink-2)]">{info.descricao}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-[11.5px]">
                <span className="rounded-md border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-2.5 py-1 font-mono-tight text-[color:var(--ink-2)]">
                  IA: {info.modeloIA}
                </span>
                {profile?.subscription_status && (
                  <span className="rounded-md border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-2.5 py-1 font-mono-tight text-[color:var(--muted)]">
                    Stripe: {profile.subscription_status}
                  </span>
                )}
              </div>
              {planoPago && (
                <ul className="mt-5">
                  {planoPago.recursos.map((r) => (
                    <li
                      key={r}
                      className="flex gap-2.5 border-t border-[color:var(--hairline)] py-2 text-[13.5px] text-[color:var(--ink-2)]"
                    >
                      <span className="font-mono-tight text-[color:var(--gold)]">+</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <ManageSubscriptionButton enabled={Boolean(profile?.stripe_customer_id)} />
              <Link href="/precos" className="eventify-button eventify-button-primary justify-center">
                {plano === "premium" ? "Gerenciar plano" : "Fazer upgrade →"}
              </Link>
              <Link href="/novo-evento" className="eventify-button eventify-button-ghost justify-center">
                Criar novo evento
              </Link>
            </div>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="mt-12">
          <h2 className="font-display text-[28px] italic tracking-[-0.01em] text-[color:var(--ink)]">
            Seu uso
          </h2>
          <div className="mt-5 grid grid-cols-1 overflow-hidden rounded-[14px] border border-[color:var(--hairline)] sm:grid-cols-3 sm:gap-px sm:bg-[color:var(--hairline)]">
            <StatCard label="Eventos criados" value={eventos.length} />
            <StatCard
              label="Sites gerados pela IA"
              value={sitesGerados}
              hint={`${sitesNoMes} neste mês`}
            />
            <StatCard
              label="Custo IA acumulado"
              value={formatUSD(totalCustoUsd)}
              hint="Pago pela plataforma"
            />
          </div>
        </section>

        {/* Histórico de pagamentos */}
        <PaymentHistory invoices={invoices} />

        {/* Eventos recentes */}
        <section className="mt-12">
          <h2 className="font-display text-[28px] italic tracking-[-0.01em] text-[color:var(--ink)]">
            Seus eventos
          </h2>
          {eventos.length === 0 ? (
            <div className="mt-5 rounded-[14px] border border-dashed border-[color:var(--hairline-2)] bg-[color:var(--paper-2)] p-10 text-center">
              <p className="text-[14px] text-[color:var(--muted)]">Você ainda não criou nenhum evento.</p>
              <Link href="/novo-evento" className="eventify-button eventify-button-primary mt-5 inline-flex">
                Criar meu primeiro evento <span aria-hidden>→</span>
              </Link>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)]">
              <table className="w-full text-[14px]">
                <thead className="bg-[color:var(--paper-2)]">
                  <tr>
                    <th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)] font-medium">
                      Nome
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)] font-medium">
                      Tipo
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)] font-medium">
                      Data
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)] font-medium">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.slice(0, 10).map((e) => (
                    <tr key={e.id} className="border-t border-[color:var(--hairline)]">
                      <td className="px-5 py-3.5 font-display text-[17px] italic tracking-[-0.01em] text-[color:var(--ink)]">
                        {e.nome}
                      </td>
                      <td className="px-5 py-3.5 text-[color:var(--muted)]">{e.tipo}</td>
                      <td className="px-5 py-3.5 text-[color:var(--muted)] font-mono-tight">
                        {new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/cliente/${e.slug}`}
                          target="_blank"
                          className="text-[13px] text-[color:var(--ink)] underline decoration-[color:var(--gold)] underline-offset-4 hover:decoration-[color:var(--ink)]"
                        >
                          Abrir →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {eventos.length > 10 && (
                <div className="border-t border-[color:var(--hairline)] bg-[color:var(--paper-2)] px-5 py-3 text-center text-[12.5px] text-[color:var(--muted)]">
                  + {eventos.length - 10} eventos. Veja todos no{" "}
                  <Link
                    href="/painel"
                    className="text-[color:var(--ink)] underline decoration-[color:var(--gold)] underline-offset-4"
                  >
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

function StatCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="bg-[color:var(--surface)] p-7">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-3 font-display text-[42px] font-light leading-none tracking-[-0.02em] tabular-nums text-[color:var(--ink)]">
        {value}
      </p>
      {hint && <p className="mt-2 text-[12.5px] text-[color:var(--muted)]">{hint}</p>}
    </div>
  );
}
