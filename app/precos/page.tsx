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
    <main className="eventify-page">
      <BrandHeader />

      {/* HERO */}
      <section className="editorial-wrap py-24 text-center sm:py-32">
        <span className="eventify-kicker">Planos &amp; preços</span>
        <h1 className="eventify-title mx-auto mt-7 max-w-[18ch] text-[clamp(48px,6.4vw,88px)]">
          Pague só quando <em>publicar.</em>
        </h1>
        <p className="mx-auto mt-7 max-w-[54ch] text-[18px] leading-[1.55] text-[color:var(--muted)]">
          Criar, gerar e editar o site é grátis pra sempre. Você só assina quando decide ir pro mundo. Sem fidelidade. Sem multa. Cancele em 1 clique.
        </p>
      </section>

      {/* PLANOS */}
      <section className="pb-32">
        <div className="editorial-wrap">
          {aviso && (
            <div className="mx-auto mb-12 max-w-3xl border-y border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] px-5 py-3 text-center text-[13.5px] text-[color:var(--rose,#A85462)]">
              {aviso}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((plano) => {
              const destaque = plano.destaque;
              return (
                <article
                  key={plano.id}
                  className={`relative flex flex-col rounded-[16px] border p-9 transition-transform hover:-translate-y-1 ${
                    destaque
                      ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-white"
                      : "border-[color:var(--hairline)] bg-[color:var(--surface)] text-[color:var(--ink)]"
                  }`}
                >
                  {destaque && (
                    <span className="absolute -top-px right-6 rounded-b-[8px] bg-[color:var(--gold)] px-3 py-1.5 text-[10.5px] uppercase tracking-[0.18em] text-white">
                      Mais popular
                    </span>
                  )}

                  <div className="font-display text-[24px] italic tracking-[-0.01em]">
                    {plano.nome}
                  </div>
                  <p className={`mt-2 text-[14px] ${destaque ? "text-white/60" : "text-[color:var(--muted)]"}`}>
                    {plano.descricao}
                  </p>

                  <div className="mt-8 flex items-baseline gap-1.5">
                    <span className={`font-display text-[22px] ${destaque ? "text-white/60" : "text-[color:var(--muted)]"}`}>
                      R$
                    </span>
                    <span className="font-display text-[72px] font-light leading-none tracking-[-0.02em]">
                      {plano.precoFormatado.replace(/[^0-9]/g, "")}
                    </span>
                  </div>
                  <p className={`mt-1 text-[13px] ${destaque ? "text-white/60" : "text-[color:var(--muted)]"}`}>
                    por mês · cancele quando quiser
                  </p>

                  <button
                    onClick={() => assinar(plano.id)}
                    disabled={carregando !== null}
                    className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full border px-0 py-3.5 text-[14.5px] font-medium transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70 ${
                      destaque
                        ? "border-white bg-white text-[color:var(--ink)]"
                        : "border-[color:var(--ink)] bg-transparent text-[color:var(--ink)] hover:bg-[color:var(--ink)] hover:text-white"
                    }`}
                  >
                    {carregando === plano.id ? (
                      <>
                        <Spinner className="h-4 w-4" /> Processando...
                      </>
                    ) : (
                      <>{plano.cta} <span aria-hidden>→</span></>
                    )}
                  </button>

                  <ul className="mt-8 flex-1 list-none p-0">
                    {plano.recursos.map((recurso) => (
                      <li
                        key={recurso}
                        className={`flex gap-3 py-3 text-[14px] ${
                          destaque
                            ? "border-t border-white/12"
                            : "border-t border-[color:var(--hairline)]"
                        }`}
                      >
                        <span className="font-mono-tight text-[color:var(--gold)] leading-[1.4]">+</span>
                        <span className={destaque ? "text-white/90" : "text-[color:var(--ink-2)]"}>
                          {recurso}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <p className="mx-auto mt-16 max-w-[60ch] text-center text-[14px] text-[color:var(--muted)]">
            Assinatura recorrente via Stripe. Cancele quando quiser direto no painel.
            <br />
            <Link
              href="/painel"
              className="mt-2 inline-flex text-[color:var(--ink)] underline decoration-[color:var(--gold)] underline-offset-4 hover:decoration-[color:var(--ink)]"
            >
              Voltar ao painel →
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-[color:var(--hairline)] bg-[color:var(--paper-2)] py-32">
        <div className="editorial-wrap">
          <span className="eventify-kicker">Dúvidas frequentes</span>
          <h2 className="eventify-title mt-6 max-w-[20ch] text-[clamp(36px,4.6vw,64px)]">
            Pequenas <em>dúvidas</em> grandes.
          </h2>
          <p className="mt-5 max-w-[56ch] text-[16px] leading-[1.6] text-[color:var(--muted)]">
            Se não respondermos aqui, escreve pra gente — a gente lê tudo.
          </p>

          <div className="mt-12 border-t border-[color:var(--hairline)]">
            <Faq
              open
              q="Posso testar antes de pagar?"
              a="Sim. Criar o evento, gerar o site, editar — tudo é grátis pra sempre. Você só paga no momento de publicar pro mundo, e pode cancelar logo depois."
            />
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
              q="Stripe é seguro?"
              a="O pagamento é processado direto pela Stripe (mesma usada por Shopify, Lyft, X). Seus dados de cartão nunca passam pelo nosso servidor."
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[color:var(--ink)] py-32 text-center text-white">
        <div className="editorial-wrap">
          <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(40px,5.4vw,72px)] font-light leading-none tracking-[-0.02em]">
            Comece grátis. Pague quando <em className="font-light italic text-[color:var(--gold)]">fizer sentido.</em>
          </h2>
          <p className="mx-auto mt-7 max-w-[48ch] text-[17px] text-white/65">
            5 minutos pro briefing. 30 segundos pra IA gerar. Você decide o resto.
          </p>
          <div className="mt-9 flex justify-center">
            <Link
              href="/novo-evento"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14.5px] font-medium text-[color:var(--ink)] transition-transform hover:-translate-y-px"
            >
              Criar meu site agora <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[color:var(--hairline)] bg-[color:var(--paper)] py-12">
        <div className="editorial-wrap flex flex-col gap-4 text-center text-[13px] text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>© {new Date().getFullYear()} Eventify · Todos os direitos reservados</p>
          <div className="flex justify-center gap-6 sm:justify-end">
            <Link href="/" className="hover:text-[color:var(--ink)]">
              Home
            </Link>
            <Link href="/exemplos" className="hover:text-[color:var(--ink)]">
              Exemplos
            </Link>
            <Link href="/login" className="hover:text-[color:var(--ink)]">
              Entrar
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Faq({ open = false, q, a }: { open?: boolean; q: string; a: string }) {
  return (
    <details open={open} className="group border-b border-[color:var(--hairline)] py-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-[22px] font-normal tracking-[-0.01em] text-[color:var(--ink)]">
        {q}
        <span className="font-mono-tight text-[18px] text-[color:var(--gold)] transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3.5 max-w-[74ch] text-[15px] leading-[1.6] text-[color:var(--muted)]">{a}</p>
    </details>
  );
}
