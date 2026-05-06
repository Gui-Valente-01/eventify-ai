"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import Spinner from "@/components/Spinner";
import { useEventos } from "@/hooks/useEventos";
import { gerarSiteAPI } from "@/lib/api";
import { gerarSlug } from "@/lib/utils";
import { getStatusLabel, isPublishedStatus } from "@/lib/publication";
import { PLANS, type PlanId } from "@/lib/plans";
import { getPlanDisplayName, getSelectedPlanFromEvento, normalizePlanId } from "@/lib/planStrategy";

export default function EventoProntoPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const { eventos, isLoading, encontrarIndexPorSlug, atualizarEvento } = useEventos();
  const [regenerando, setRegenerando] = useState(false);
  const [publicando, setPublicando] = useState<PlanId | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok" | "aviso"; texto: string } | null>(null);

  const index = encontrarIndexPorSlug(slug);
  const evento = index !== -1 ? eventos[index] : null;

  async function regenerar() {
    if (!evento?.id || regenerando) return;
    setRegenerando(true);
    setAviso(null);
    const resultado = await gerarSiteAPI(evento);

    if (!resultado.siteGerado) {
      setAviso({ tipo: "erro", texto: resultado.erro || "Não foi possível regenerar o site." });
      setRegenerando(false);
      return;
    }

    try {
      await atualizarEvento(evento.id, {
        siteGerado: resultado.siteGerado,
        ...(resultado.siteHtml ? { siteHtml: resultado.siteHtml } : {}),
      });
      setAviso({
        tipo: resultado.aiAvailable ? "ok" : "aviso",
        texto: resultado.aiAvailable
          ? "Site regenerado com sucesso."
          : "Site regenerado em modo básico. A IA avançada está temporariamente indisponível.",
      });
    } catch (error) {
      setAviso({ tipo: "erro", texto: error instanceof Error ? error.message : "Erro ao salvar." });
    } finally {
      setRegenerando(false);
    }
  }

  async function publicarComPlano(planId: PlanId) {
    if (!evento?.id || publicando) return;
    setPublicando(planId);
    setAviso(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, eventId: evento.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAviso({ tipo: "erro", texto: data.error || "Não foi possível iniciar o checkout." });
      } else if (data.url) {
        window.location.assign(data.url);
        return;
      } else {
        setAviso({ tipo: "aviso", texto: data.message || "Configure o Stripe para ativar assinaturas." });
      }
    } catch {
      setAviso({ tipo: "erro", texto: "Erro de rede ao abrir checkout." });
    } finally {
      setPublicando(null);
    }
  }

  if (isLoading) {
    return (
      <main className="eventify-page">
        <BrandHeader />
        <div className="eventify-section text-center eventify-muted">Carregando resultado...</div>
      </main>
    );
  }

  if (!evento) {
    return (
      <main className="eventify-page">
        <BrandHeader />
        <section className="eventify-section flex justify-center">
          <div className="eventify-card max-w-xl p-10 text-center">
            <span className="eventify-kicker">Evento</span>
            <h1 className="eventify-title mt-5 text-4xl">Evento não encontrado</h1>
            <Link href="/painel" className="eventify-button eventify-button-ghost mt-7">
              Voltar ao painel
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const quality = evento.siteGerado?.qualityScore ?? evento.siteGerado?.agentRun?.quality.score;
  const warnings = evento.siteGerado?.qualityWarnings ?? evento.siteGerado?.agentRun?.quality.warnings ?? [];
  const suggestions = evento.siteGerado?.businessSuggestions ?? evento.siteGerado?.agentRun?.business.upsells ?? [];
  const eventSlug = gerarSlug(evento.nome);
  const published = isPublishedStatus(evento.status);
  const selectedPlan = normalizePlanId(getSelectedPlanFromEvento(evento));

  return (
    <main className="eventify-page">
      <BrandHeader />
      <section className="eventify-section">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="eventify-kicker">Site pronto</span>
            <h1 className="eventify-title mt-6 text-5xl sm:text-6xl">{evento.nome}</h1>
            <p className="eventify-muted mx-auto mt-5 max-w-2xl text-lg">
              Seu preview foi gerado. Publique para liberar o link final dos convidados, QR Code limpo e remover a marca d'água.
            </p>
          </div>

          {aviso && (
            <div className={`mx-auto mt-8 max-w-3xl rounded-2xl border p-4 text-center text-sm font-semibold ${
              aviso.tipo === "erro"
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : aviso.tipo === "aviso"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}>
              {aviso.texto}
            </div>
          )}

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="eventify-card p-6">
              <p className="eventify-muted text-sm font-bold uppercase tracking-[0.2em]">Status</p>
              <p className="mt-3 text-3xl font-black text-[#090814]">{getStatusLabel(evento.status)}</p>
            </div>
            <div className="eventify-card p-6">
              <p className="eventify-muted text-sm font-bold uppercase tracking-[0.2em]">Qualidade</p>
              <p className="mt-3 text-3xl font-black text-[#090814]">{typeof quality === "number" ? `${quality}/100` : "—"}</p>
            </div>
            <div className="eventify-card p-6">
              <p className="eventify-muted text-sm font-bold uppercase tracking-[0.2em]">Template</p>
              <p className="mt-3 text-3xl font-black text-[#090814]">{evento.siteGerado?.templateName || evento.tipo}</p>
            </div>
            <div className="eventify-card p-6">
              <p className="eventify-muted text-sm font-bold uppercase tracking-[0.2em]">Plano</p>
              <p className="mt-3 text-3xl font-black text-[#090814]">{getPlanDisplayName(selectedPlan)}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="eventify-card overflow-hidden p-4">
              <div className="flex items-center justify-between gap-3 border-b border-[#e8e3f1] pb-4">
                <div>
                  <p className="text-sm font-black text-[#090814]">Preview gratuito</p>
                  <p className="eventify-muted text-xs">Com marca Eventify AI até publicar.</p>
                </div>
                <Link href={`/promocional/${eventSlug}`} target="_blank" className="eventify-button eventify-button-ghost">
                  Abrir preview
                </Link>
              </div>
              <div className="mt-4 rounded-2xl border border-[#e8e3f1] bg-[#faf9ff] p-6">
                <h2 className="text-3xl font-black text-[#090814]">{evento.siteGerado?.heroTitle || evento.nome}</h2>
                <p className="eventify-muted mt-3">{evento.siteGerado?.subtitle || "Site gerado para seu evento."}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(evento.siteGerado?.highlights || []).slice(0, 3).map((h) => (
                    <span key={h} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#5f5a72]">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="eventify-card p-6">
                <h2 className="text-2xl font-black text-[#090814]">
                  {published ? "Site publicado ✓" : "Escolha seu plano"}
                </h2>
                <p className="eventify-muted mt-2 text-sm">
                  {published
                    ? "Seu site está no ar. Compartilhe o link final com os convidados."
                    : "Selecione o plano para liberar o link final, sem marca d'água."}
                </p>

                {!published && (
                  <div className="mt-5 space-y-3">
                    {PLANS.map((plano) => (
                      <button
                        key={plano.id}
                        type="button"
                        onClick={() => publicarComPlano(plano.id)}
                        disabled={!!publicando}
                        className={`flex w-full items-start justify-between gap-3 rounded-2xl border-2 p-4 text-left transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${
                          plano.id === selectedPlan
                            ? "border-purple-500 bg-purple-50"
                            : "border-[#e8e3f1] bg-white hover:border-purple-300"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-base font-black text-[#090814]">{plano.nome}</p>
                            {plano.id === selectedPlan && (
                              <span className="rounded-full bg-purple-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                Escolhido
                              </span>
                            )}
                          </div>
                          <p className="eventify-muted mt-1 text-xs">{plano.descricao}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-[#090814]">{plano.precoFormatado}</p>
                          <p className="eventify-muted text-[10px]">mensal</p>
                          {publicando === plano.id && (
                            <Spinner className="ml-auto mt-1 h-4 w-4" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {published && (
                  <Link
                    href={`/cliente/${eventSlug}`}
                    target="_blank"
                    className="eventify-button eventify-button-primary mt-5 w-full justify-center"
                  >
                    Abrir link final →
                  </Link>
                )}
              </div>

              <div className="eventify-card p-6">
                <h2 className="text-xl font-black text-[#090814]">Ajustes</h2>
                <div className="mt-4 flex flex-col gap-3">
                  <Link href={`/editar-evento/${eventSlug}`} className="eventify-button eventify-button-ghost">
                    Editar briefing
                  </Link>
                  <button
                    onClick={regenerar}
                    disabled={regenerando}
                    className="eventify-button eventify-button-ghost disabled:opacity-60"
                  >
                    {regenerando ? (
                      <>
                        <Spinner className="h-4 w-4" /> Regenerando...
                      </>
                    ) : (
                      "Regenerar IA"
                    )}
                  </button>
                </div>
              </div>
            </aside>
          </div>

          {(warnings.length > 0 || suggestions.length > 0) && (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="eventify-card p-6">
                <h2 className="text-xl font-black text-[#090814]">Alertas dos agentes</h2>
                <ul className="eventify-muted mt-4 space-y-2 text-sm">
                  {(warnings.length ? warnings : ["Nenhum alerta crítico."]).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="eventify-card p-6">
                <h2 className="text-xl font-black text-[#090814]">Upsells sugeridos</h2>
                <ul className="eventify-muted mt-4 space-y-2 text-sm">
                  {(suggestions.length ? suggestions : ["Domínio personalizado", "Galeria premium", "RSVP avançado"]).slice(0, 4).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
