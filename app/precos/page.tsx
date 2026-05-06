"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import Spinner from "@/components/Spinner";
import { PLANS, PlanId } from "@/lib/plans";
import { useAuth } from "@/hooks/useAuth";

export default function PrecosPage() {
  const router = useRouter();
  const { isAuthenticated, isConfigured } = useAuth();
  const [carregando, setCarregando] = useState<PlanId | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function assinar(planId: PlanId) {
    setAviso(null);
    if (isConfigured && !isAuthenticated) {
      router.push("/login?redirect=/precos");
      return;
    }

    setCarregando(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAviso(data.error || "Não foi possível iniciar o checkout.");
      } else if (data.url) {
        window.location.assign(data.url);
      } else {
        setAviso(data.message || "Assinaturas ainda não estão ativas. Configure as variáveis Stripe.");
      }
    } catch {
      setAviso("Erro de rede. Tente novamente.");
    } finally {
      setCarregando(null);
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <BrandHeader />

      {/* HERO */}
      <section className="border-b border-black/5">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 text-center lg:px-12 lg:pt-28">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Planos</p>
          <h1 className="mt-4 text-5xl font-black leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            Preços simples,
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              sem letra miúda.
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-black/60 lg:text-xl">
            Assinatura mensal. Cancele quando quiser. Você só paga quando publica seu primeiro site.
          </p>
        </div>
      </section>

      {/* PLANOS */}
      <section className="bg-black/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-24">
          {aviso && (
            <div className="mx-auto mb-10 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm font-semibold text-amber-700">
              {aviso}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            {PLANS.map((plano) => {
              const destaque = plano.destaque;
              return (
                <article
                  key={plano.id}
                  className={`relative flex flex-col rounded-3xl p-8 lg:p-10 ${
                    destaque
                      ? "bg-black text-white shadow-2xl lg:-my-4 lg:scale-[1.02]"
                      : "border border-black/10 bg-white text-black"
                  }`}
                >
                  {destaque && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                      Mais popular
                    </span>
                  )}

                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{plano.nome}</h2>
                    <p className={`mt-2 text-sm ${destaque ? "text-white/60" : "text-black/60"}`}>
                      {plano.descricao}
                    </p>
                  </div>

                  <div className="mt-8 flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tight lg:text-6xl">
                      {plano.precoFormatado}
                    </span>
                    <span className={`text-sm font-semibold ${destaque ? "text-white/50" : "text-black/40"}`}>
                      /mês
                    </span>
                  </div>

                  <ul className="mt-10 flex-1 space-y-4">
                    {plano.recursos.map((recurso) => (
                      <li key={recurso} className="flex items-start gap-3 text-base">
                        <span
                          className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-black ${
                            destaque
                              ? "bg-white/15 text-white"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          ✓
                        </span>
                        <span className={destaque ? "text-white/90" : "text-black/80"}>
                          {recurso}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => assinar(plano.id)}
                    disabled={carregando !== null}
                    className={`mt-10 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                      destaque
                        ? "bg-white text-black hover:scale-[1.02]"
                        : "bg-black text-white hover:scale-[1.02]"
                    }`}
                  >
                    {carregando === plano.id ? (
                      <>
                        <Spinner className="h-4 w-4" /> Processando...
                      </>
                    ) : (
                      <>{plano.cta} →</>
                    )}
                  </button>
                </article>
              );
            })}
          </div>

          <p className="mx-auto mt-16 max-w-2xl text-center text-sm text-black/50">
            Assinatura recorrente via Stripe. Cancele quando quiser direto no painel.
            <br />
            <Link href="/painel" className="font-bold text-violet-700 hover:underline">
              Voltar ao painel →
            </Link>
          </p>
        </div>
      </section>

      {/* COMPARAR */}
      <section className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-12">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">FAQ</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Perguntas frequentes
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <Faq
              q="Posso cancelar a qualquer momento?"
              a="Sim. A assinatura é mensal e você pode cancelar pelo seu painel a qualquer momento. Acesso continua até o fim do ciclo já pago."
            />
            <Faq
              q="O que acontece com meus eventos se eu cancelar?"
              a="Os sites publicados ficam no ar até o fim do ciclo. Depois disso, voltam ao status de preview com marca d'água. Você pode reativar quando quiser."
            />
            <Faq
              q="Posso trocar de plano?"
              a="Sim, a qualquer momento. Upgrade libera os recursos imediatamente. Downgrade vale a partir do próximo ciclo."
            />
            <Faq
              q="A IA gera sites realmente diferentes?"
              a="Sim. O briefing tem perguntas específicas por tipo de evento. A IA usa todos os detalhes pra escrever copy autoral, sem template genérico."
            />
            <Faq
              q="Tem cartão de teste pra avaliar?"
              a="Sim. O cadastro é grátis e você pode criar 1 evento e ver o site gerado antes de assinar qualquer plano."
            />
            <Faq
              q="Stripe é seguro?"
              a="O pagamento é processado direto pela Stripe (mesma usada por Shopify, Lyft, X). Seus dados de cartão nunca passam pelo nosso servidor."
            />
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-black/50 sm:flex-row sm:items-center sm:justify-between lg:px-12">
          <p>© {new Date().getFullYear()} Eventify AI · Todos os direitos reservados</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-black">Home</Link>
            <Link href="/exemplos" className="hover:text-black">Exemplos</Link>
            <Link href="/login" className="hover:text-black">Entrar</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <h3 className="text-lg font-black tracking-tight">{q}</h3>
      <p className="mt-3 text-base text-black/60 leading-7">{a}</p>
    </div>
  );
}
