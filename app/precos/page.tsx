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
      <section className="relative overflow-hidden gradient-mesh">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-300 via-purple-300 to-amber-200 opacity-30 blur-3xl animate-float-slow" />
        <div className="eventify-section relative pb-12 text-center">
          <span className="eventify-kicker animate-fade-up">✦ Planos transparentes</span>
          <h1 className="eventify-title mt-6 text-5xl sm:text-6xl animate-fade-up animate-delay-1">
            Preços <span className="text-gradient-aurora font-display italic">simples</span>, sem surpresas
          </h1>
          <p className="eventify-muted mx-auto mt-5 max-w-xl text-xl animate-fade-up animate-delay-2">
            Assine um plano mensal, crie sites de eventos e publique quando aprovar.
          </p>
        </div>
      </section>

      <section className="eventify-section pt-0">
        {aviso && (
          <div className="mx-auto mb-8 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm font-semibold text-amber-700">
            {aviso}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plano) => (
            <article
              key={plano.id}
              className={`eventify-card relative p-8 ${
                plano.destaque ? "ring-2 ring-[#8847e7] shadow-2xl shadow-purple-200" : ""
              }`}
            >
              {plano.destaque && (
                <span className="absolute -top-4 left-8 rounded-full bg-[#8847e7] px-4 py-1 text-xs font-black uppercase tracking-widest text-white">
                  Mais popular
                </span>
              )}
              <h2 className="text-2xl font-black text-[#090814]">{plano.nome}</h2>
              <p className="eventify-muted mt-2 text-sm">{plano.descricao}</p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black text-[#090814]">{plano.precoFormatado}</span>
                <span className="eventify-muted text-sm font-semibold">assinatura mensal</span>
              </div>

              <ul className="mt-8 space-y-3">
                {plano.recursos.map((recurso) => (
                  <li key={recurso} className="flex items-start gap-3 text-sm text-[#3a3548]">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-600">
                      ✓
                    </span>
                    {recurso}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => assinar(plano.id)}
                disabled={carregando !== null}
                className={`mt-8 inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-xl font-black transition disabled:cursor-not-allowed disabled:opacity-70 ${
                  plano.destaque
                    ? "bg-gradient-to-br from-[#8847e7] to-[#cf67ee] text-white shadow-lg shadow-purple-200 hover:opacity-95"
                    : "border border-[#e8e3f1] bg-white text-[#090814] hover:bg-[#faf9ff]"
                }`}
              >
                {carregando === plano.id ? <><Spinner className="h-4 w-4" /> Processando...</> : <>{plano.cta} →</>}
              </button>
            </article>
          ))}
        </div>

        <p className="eventify-muted mx-auto mt-12 max-w-2xl text-center text-sm">
          Assinatura recorrente via Stripe. Cancele quando quiser.{" "}
          <Link href="/painel" className="font-bold text-[#8847e7]">
            Voltar ao painel
          </Link>
        </p>
      </section>
    </main>
  );
}
