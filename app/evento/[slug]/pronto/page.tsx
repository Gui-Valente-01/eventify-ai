"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AiSiteFrame from "@/components/AiSiteFrame";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";
import { useEventos } from "@/hooks/useEventos";
import { gerarSiteAPI } from "@/lib/api";
import { gerarSlug } from "@/lib/utils";
import { isPublishedStatus } from "@/lib/publication";
import { PLANS, type PlanId } from "@/lib/plans";
import { getPlanDisplayName, getSelectedPlanFromEvento, normalizePlanId } from "@/lib/planStrategy";
import { getTemplate } from "@/lib/templateGallery";

type Viewport = "desktop" | "tablet" | "mobile";

const SECOES = [
  { id: "hero", titulo: "Hero", icone: "♡", default: true },
  { id: "convite", titulo: "Convite", icone: "✎" },
  { id: "programacao", titulo: "Programação", icone: "⌖" },
  { id: "presentes", titulo: "Lista de presentes", icone: "◇" },
  { id: "como-chegar", titulo: "Como chegar", icone: "◎" },
  { id: "rsvp", titulo: "RSVP", icone: "✓" },
];

const TABS = ["Seções", "Estilo", "SEO"] as const;
type Tab = (typeof TABS)[number];

export default function EventoEditor() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const { eventos, isLoading, encontrarIndexPorSlug, atualizarEvento } = useEventos();

  const [tab, setTab] = useState<Tab>("Seções");
  const [secaoAtiva, setSecaoAtiva] = useState("hero");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [refinePrompt, setRefinePrompt] = useState("");
  const [publicandoPlan, setPublicandoPlan] = useState<PlanId | null>(null);
  const [regenerando, setRegenerando] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok" | "aviso"; texto: string } | null>(null);

  const index = encontrarIndexPorSlug(slug);
  const evento = index !== -1 ? eventos[index] : null;
  const template = useMemo(
    () => (evento?.briefing?.templateId ? getTemplate(evento.briefing.templateId) : undefined),
    [evento]
  );
  const published = evento ? isPublishedStatus(evento.status) : false;
  const selectedPlan = evento ? normalizePlanId(getSelectedPlanFromEvento(evento)) : "basico";

  // Faz "saved at" tick a cada 5s pra UI ficar viva
  useEffect(() => {
    if (!evento) return;
    if (!savedAt) setSavedAt(new Date());
    const t = setInterval(() => setSavedAt(new Date()), 5000);
    return () => clearInterval(t);
  }, [evento, savedAt]);

  async function regenerarSecao() {
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
      setSavedAt(new Date());
      setAviso({
        tipo: resultado.aiAvailable ? "ok" : "aviso",
        texto: resultado.aiAvailable
          ? "Site regenerado com sucesso."
          : "Regenerado em modo básico. IA avançada indisponível.",
      });
      setRefinePrompt("");
    } catch (error) {
      setAviso({ tipo: "erro", texto: error instanceof Error ? error.message : "Erro ao salvar." });
    } finally {
      setRegenerando(false);
      setTimeout(() => setAviso(null), 4000);
    }
  }

  async function publicarComPlano(planId: PlanId) {
    if (!evento?.id || publicandoPlan) return;
    setPublicandoPlan(planId);
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
        setAviso({ tipo: "aviso", texto: data.message || "Configure o Stripe pra ativar publicação." });
      }
    } catch {
      setAviso({ tipo: "erro", texto: "Erro de rede ao abrir checkout." });
    } finally {
      setPublicandoPlan(null);
    }
  }

  if (isLoading) {
    return (
      <main className="flex h-screen items-center justify-center text-[14px] text-[color:var(--muted)]">
        Carregando resultado...
      </main>
    );
  }

  if (!evento) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--paper)] px-6">
        <EmptyState
          icon="?"
          title="Evento não encontrado"
          description="Esse evento pode ter sido apagado ou nunca existiu nessa conta."
          action={{ label: "Voltar ao painel", href: "/painel", variant: "ghost" }}
          secondaryAction={{ label: "Criar novo evento", href: "/novo-evento", variant: "primary" }}
          className="max-w-xl"
        />
      </main>
    );
  }

  const viewportWidth =
    viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px";

  return (
    <main className="min-h-screen bg-[color:var(--paper-2)]">
      {/* Dark topbar — sticky no topo */}
      <header className="sticky top-0 z-50 flex h-[52px] items-center justify-between gap-3 border-b border-white/10 bg-[color:var(--ink)] px-4 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/painel" className="flex items-center gap-2 text-[13px]">
            <span className="flex h-5 w-5 items-center justify-center rounded-[4px] border border-white/30">
              <span className="block h-1.5 w-1.5 rounded-[1px] bg-white" />
            </span>
            <span className="font-display tracking-[-0.005em]">Eventify</span>
          </Link>
          <span className="text-white/30">/</span>
          <span className="truncate text-[13px]">{evento.nome} · preview</span>
          {template && (
            <span className="hidden rounded-full border border-[color:var(--gold)] bg-[var(--gold-soft)] px-2.5 py-0.5 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--gold)] sm:inline-flex">
              {template.nome}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport toggle */}
          <div className="hidden rounded-[7px] bg-white/10 p-0.5 sm:flex">
            {(
              [
                { id: "desktop" as const, label: "◧" },
                { id: "tablet" as const, label: "◰" },
                { id: "mobile" as const, label: "▯" },
              ]
            ).map((v) => (
              <button
                key={v.id}
                onClick={() => setViewport(v.id)}
                className={`flex h-7 w-7 items-center justify-center rounded-[5px] text-[13px] transition ${
                  viewport === v.id ? "bg-white/15 text-white" : "text-white/55 hover:text-white"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <span className="hidden h-[18px] w-px bg-white/10 sm:block" />
          <Link
            href={`/personalizar/${gerarSlug(evento.nome)}`}
            className="inline-flex h-8 items-center rounded-[6px] border border-white/15 px-3 text-[12.5px] text-white transition hover:bg-white/5"
          >
            Personalizar
          </Link>
          <button
            onClick={regenerarSecao}
            disabled={regenerando}
            className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-white/15 px-3 text-[12.5px] text-white transition hover:bg-white/5 disabled:opacity-60"
          >
            {regenerando ? (
              <>
                <Spinner className="h-3 w-3" /> Regenerando...
              </>
            ) : (
              "✦ Regenerar"
            )}
          </button>
          {published ? (
            <Link
              href={`/cliente/${gerarSlug(evento.nome)}`}
              target="_blank"
              className="inline-flex h-8 items-center rounded-[6px] bg-white px-3 text-[12.5px] font-medium text-[color:var(--ink)] transition hover:-translate-y-px"
            >
              Abrir link final →
            </Link>
          ) : (
            <button
              onClick={() => setPublishModalOpen(true)}
              className="inline-flex h-8 items-center rounded-[6px] bg-white px-3 text-[12.5px] font-medium text-[color:var(--ink)] transition hover:-translate-y-px"
            >
              Publicar →
            </button>
          )}
        </div>
      </header>

      {/* Aviso */}
      {aviso && (
        <div
          className={`border-b px-6 py-2.5 text-[12.5px] ${
            aviso.tipo === "erro"
              ? "border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] text-[color:var(--rose,#A85462)]"
              : aviso.tipo === "aviso"
                ? "border-[color:var(--gold)] bg-[var(--gold-soft)] text-[color:var(--gold-2)]"
                : "border-[color:var(--green,#5B7A4F)] bg-[rgba(91,122,79,0.06)] text-[color:var(--green,#5B7A4F)]"
          }`}
        >
          {aviso.texto}
        </div>
      )}

      {/* Body — sem overflow interno; só a página scrolla */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
        {/* Canvas */}
        <div className="bg-[color:var(--paper-2)] p-5">
          <div
            className="mx-auto overflow-hidden rounded-[12px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] shadow-[0_30px_60px_-40px_rgba(11,11,18,0.2)] transition-[width]"
            style={{ maxWidth: viewportWidth }}
          >
            {/* Browser chrome */}
            <div className="flex h-[30px] items-center gap-2.5 border-b border-[color:var(--hairline)] bg-[color:var(--paper)] px-3">
              <div className="flex gap-1.5">
                {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                  <span key={c} className="h-2 w-2 rounded-full opacity-85" style={{ background: c }} />
                ))}
              </div>
              <div className="flex-1 truncate font-mono-tight text-[11px] text-[color:var(--muted)]">
                🔒 eventify.app/{slug}
              </div>
              {!published && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--gold)] bg-[var(--gold-soft)] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[color:var(--gold-2)]">
                  Prévia
                </span>
              )}
            </div>

            {evento.siteHtml ? (
              <AiSiteFrame html={evento.siteHtml} titulo={evento.nome} />
            ) : (
              <div className="flex h-[600px] flex-col items-center justify-center bg-[color:var(--paper)] p-8 text-center">
                <p className="font-display text-[28px] italic text-[color:var(--gold)]">✦</p>
                <p className="mt-4 font-display text-[24px] font-light tracking-[-0.01em] text-[color:var(--ink)]">
                  Aguardando o site ser gerado.
                </p>
                <p className="mt-2 text-[13px] text-[color:var(--muted)]">
                  Clique em &ldquo;Regenerar&rdquo; no topo pra a IA criar o site.
                </p>
                <button
                  onClick={regenerarSecao}
                  disabled={regenerando}
                  className="eventify-button eventify-button-primary mt-6 disabled:opacity-60"
                >
                  {regenerando ? (
                    <>
                      <Spinner className="h-4 w-4" /> Gerando...
                    </>
                  ) : (
                    <>✦ Gerar agora</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Inspector — sticky no desktop, fica visível enquanto a página scrolla */}
        <aside className="flex flex-col border-l border-[color:var(--hairline)] bg-[color:var(--surface)] lg:sticky lg:top-[52px] lg:h-[calc(100vh-52px)]">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-[color:var(--hairline)] p-2">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-[6px] px-2 py-1.5 text-[12px] transition ${
                  tab === t
                    ? "bg-[color:var(--paper-2)] font-medium text-[color:var(--ink)]"
                    : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Content — internal scroll só dentro do inspector, com scrollbar escondida */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-3">
            {tab === "Seções" && (
              <>
                <p className="px-2 pb-2 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  Seções
                </p>
                {SECOES.map((s) => {
                  const ativa = secaoAtiva === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSecaoAtiva(s.id)}
                      className={`mb-0.5 flex w-full items-center gap-2 rounded-[7px] px-2.5 py-2 text-left text-[13px] transition ${
                        ativa
                          ? "border border-[color:var(--gold)] bg-[var(--gold-soft)] text-[color:var(--ink)] font-medium"
                          : "border border-transparent text-[color:var(--ink-2)] hover:bg-[color:var(--paper-2)]"
                      }`}
                    >
                      <span
                        className={`w-4 text-center ${ativa ? "text-[color:var(--gold)]" : "text-[color:var(--muted)]"}`}
                      >
                        {s.icone}
                      </span>
                      <span className="flex-1">{s.titulo}</span>
                      <span className="font-mono-tight text-[9.5px] uppercase text-[color:var(--muted)]">
                        {ativa ? "ativo" : "gerado"}
                      </span>
                    </button>
                  );
                })}

                {/* Refinar com IA */}
                <div className="mt-4 rounded-[8px] border border-[color:var(--hairline)] bg-[color:var(--paper)] p-3">
                  <div className="flex items-center gap-1.5 text-[12px] font-medium">
                    <span className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-[color:var(--gold)] text-[10px] text-white">
                      ✦
                    </span>
                    Refinar com IA
                  </div>
                  <p className="mt-2 text-[11.5px] leading-[1.5] text-[color:var(--muted)]">
                    Diga em uma frase o que mudar nesta seção. Ex.: &ldquo;mais íntimo, sem mencionar o local&rdquo;.
                  </p>
                  <textarea
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt(e.target.value)}
                    placeholder="tornar mais quente e pessoal..."
                    rows={3}
                    className="mt-2 w-full resize-none rounded-[6px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-2 text-[12px] outline-none placeholder:text-[color:var(--muted-2)] focus:border-[color:var(--ink)]"
                  />
                  <button
                    onClick={regenerarSecao}
                    disabled={regenerando}
                    className="eventify-button eventify-button-primary mt-2 w-full justify-center text-[12px] disabled:opacity-60"
                  >
                    {regenerando ? (
                      <>
                        <Spinner className="h-3 w-3" /> Regenerando...
                      </>
                    ) : (
                      "Regenerar seção"
                    )}
                  </button>
                </div>
              </>
            )}

            {tab === "Estilo" && (
              <div className="space-y-4">
                <div>
                  <p className="px-2 pb-2 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    Template
                  </p>
                  <div className="rounded-[8px] border border-[color:var(--hairline)] bg-[color:var(--paper-2)] p-3">
                    <p className="font-display text-[18px] italic tracking-[-0.01em]">
                      {template?.nome ?? "Sem template"}
                    </p>
                    <p className="mt-1 font-mono-tight text-[10.5px] text-[color:var(--muted)]">
                      {template?.tom ?? "—"}
                    </p>
                  </div>
                </div>

                {template && (
                  <div>
                    <p className="px-2 pb-2 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                      Paleta
                    </p>
                    <div className="flex gap-1">
                      {template.paleta.map((c) => (
                        <span key={c} className="h-10 flex-1 rounded-[4px] border border-black/[0.06]" style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-[color:var(--hairline)] pt-3 text-[12px] text-[color:var(--muted)]">
                  Trocar template ou paleta — em breve.
                </div>
              </div>
            )}

            {tab === "SEO" && (
              <div className="space-y-3 text-[12.5px] text-[color:var(--muted)]">
                <p className="px-1 text-[10.5px] uppercase tracking-[0.16em]">SEO &amp; compartilhamento</p>
                <p>Título, descrição e imagem de preview do site — em breve nesta aba.</p>
                <p>Por enquanto, edite no briefing pelo botão &ldquo;Editar briefing&rdquo; abaixo.</p>
                <Link
                  href={`/editar-evento/${gerarSlug(evento.nome)}`}
                  className="eventify-button eventify-button-ghost mt-2 w-full justify-center text-[12.5px]"
                >
                  Editar briefing
                </Link>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 border-t border-[color:var(--hairline)] px-3 py-2.5 text-[11.5px] text-[color:var(--muted)]">
            <span>Salvo automaticamente</span>
            <span className="font-mono-tight">{savedAt ? formatTempoRelativo(savedAt) : "—"}</span>
          </div>
        </aside>
      </div>

      {/* Publish modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--ink)]/55 backdrop-blur-sm">
          <button
            onClick={() => setPublishModalOpen(false)}
            className="absolute inset-0 cursor-default"
            aria-label="Fechar"
          />
          <div className="relative mx-4 w-full max-w-2xl rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] shadow-[0_40px_80px_-30px_rgba(11,11,18,0.4)]">
            <div className="flex items-center justify-between border-b border-[color:var(--hairline)] px-7 py-5">
              <div>
                <p className="eventify-eyebrow">Publicar evento</p>
                <h2 className="mt-1.5 font-display text-[28px] font-light tracking-[-0.01em] text-[color:var(--ink)]">
                  Escolha um <em className="italic text-[color:var(--gold)]">plano.</em>
                </h2>
              </div>
              <button
                onClick={() => setPublishModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[16px] text-[color:var(--muted)] hover:bg-[color:var(--paper-2)] hover:text-[color:var(--ink)]"
              >
                ×
              </button>
            </div>
            <div className="grid gap-3 p-7">
              {PLANS.map((plano) => {
                const escolhido = plano.id === selectedPlan;
                const isPubli = publicandoPlan === plano.id;
                return (
                  <button
                    key={plano.id}
                    onClick={() => publicarComPlano(plano.id)}
                    disabled={!!publicandoPlan}
                    className={`flex w-full items-start justify-between gap-4 rounded-[10px] border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      escolhido
                        ? "border-[color:var(--gold)] bg-[var(--gold-soft)] shadow-[inset_0_0_0_1px_var(--gold)]"
                        : "border-[color:var(--hairline)] bg-[color:var(--paper)] hover:border-[color:var(--hairline-2)]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display text-[20px] italic tracking-[-0.01em]">{plano.nome}</p>
                        {escolhido && (
                          <span className="rounded-full bg-[color:var(--gold)] px-2 py-0.5 text-[9.5px] uppercase tracking-[0.14em] text-white">
                            Escolhido
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] text-[color:var(--muted)]">{plano.descricao}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-[26px] font-light leading-none tracking-[-0.02em]">
                        {plano.precoFormatado}
                      </p>
                      <p className="mt-1 text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--muted)]">
                        mensal
                      </p>
                      {isPubli && <Spinner className="ml-auto mt-2 h-4 w-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="border-t border-[color:var(--hairline)] px-7 py-3 text-center text-[11.5px] text-[color:var(--muted)]">
              Plano atual escolhido no briefing: {getPlanDisplayName(selectedPlan)}. Você pode trocar a qualquer momento.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function formatTempoRelativo(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 5) return "agora";
  if (diff < 60) return `há ${diff}s`;
  const min = Math.floor(diff / 60);
  if (min < 60) return `há ${min}min`;
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
