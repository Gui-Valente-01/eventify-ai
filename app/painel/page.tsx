"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEventos } from "@/hooks/useEventos";
import { useEventViews } from "@/hooks/useEventViews";
import { useAuth } from "@/hooks/useAuth";
import { gerarSlug } from "@/lib/utils";
import { gerarSiteAPI } from "@/lib/api";
import { getStatusLabel, isPublishedStatus } from "@/lib/publication";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";
import { getPlanDisplayName, getSelectedPlanFromEvento, normalizePlanId } from "@/lib/planStrategy";
import { getTemplate } from "@/lib/templateGallery";

type Filtro = "todos" | "publicados" | "rascunhos";

function PainelInner() {
  const searchParams = useSearchParams();
  const { eventos, atualizarEvento, deletarEvento, isLoading } = useEventos();
  const { signOut, user } = useAuth();
  const eventoIds = useMemo(
    () => eventos.map((e) => e.id).filter((id): id is string => Boolean(id)),
    [eventos]
  );
  const { counts: viewCounts } = useEventViews(eventoIds);
  const [regenerandoId, setRegenerandoId] = useState<string | null>(null);
  const [publicandoId, setPublicandoId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok" | "aviso"; texto: string } | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [menuAberto, setMenuAberto] = useState<string | null>(null);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const bypass = searchParams.get("bypass");
    if (checkout === "success") {
      if (bypass === "admin") {
        setAviso({
          tipo: "ok",
          texto: "Evento publicado como admin · bypass de pagamento aplicado.",
        });
      } else if (bypass === "plan") {
        setAviso({
          tipo: "ok",
          texto: "Evento publicado · você já tinha plano ativo, nada cobrado.",
        });
      } else {
        setAviso({
          tipo: "ok",
          texto: "Assinatura confirmada! Assim que o Stripe avisar o webhook, o site fica publicado.",
        });
      }
    } else if (checkout === "cancel") {
      setAviso({ tipo: "aviso", texto: "Checkout cancelado. Você pode tentar novamente quando quiser." });
    }
  }, [searchParams]);

  const metricas = useMemo(() => {
    const totalConvidados = eventos.reduce((sum, e) => sum + (e.convidados?.length || 0), 0);
    const totalViews = eventos.reduce((sum, e) => sum + (e.id ? viewCounts[e.id] ?? 0 : 0), 0);
    const agora = new Date();
    const eventosMes = eventos.filter((e) => {
      if (!e.data) return false;
      const d = new Date(`${e.data}T00:00:00`);
      return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
    }).length;
    const publicados = eventos.filter((e) => isPublishedStatus(e.status)).length;
    const rascunhos = eventos.length - publicados;
    // estimativa de receita: cada evento publicado * preço médio do plano
    const receita = eventos
      .filter((e) => isPublishedStatus(e.status))
      .reduce((sum, e) => {
        const plan = normalizePlanId(getSelectedPlanFromEvento(e));
        const price = plan === "premium" ? 79 : plan === "intermediario" ? 49 : 29;
        return sum + price;
      }, 0);

    return {
      total: eventos.length,
      publicados,
      rascunhos,
      totalConvidados,
      totalViews,
      eventosMes,
      receita,
    };
  }, [eventos, viewCounts]);

  const eventosFiltrados = useMemo(() => {
    let list = eventos;
    if (filtro === "publicados") list = list.filter((e) => isPublishedStatus(e.status));
    if (filtro === "rascunhos") list = list.filter((e) => !isPublishedStatus(e.status));
    if (busca.trim()) {
      const q = busca.trim().toLowerCase();
      list = list.filter((e) => e.nome.toLowerCase().includes(q) || e.tipo?.toLowerCase().includes(q));
    }
    return list;
  }, [eventos, filtro, busca]);

  async function apagarEvento(idx: number) {
    if (!confirm("Tem certeza que deseja apagar este evento?")) return;
    try {
      await deletarEvento(idx);
      setMenuAberto(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao apagar.";
      setAviso({ tipo: "erro", texto: msg });
    }
  }

  async function regenerarSite(idx: number) {
    const evento = eventos[idx];
    if (!evento?.id || regenerandoId) return;
    setRegenerandoId(evento.id);
    setAviso(null);
    setMenuAberto(null);

    const resultado = await gerarSiteAPI(evento);

    if (resultado.siteGerado && evento.id) {
      try {
        await atualizarEvento(evento.id, {
          siteGerado: resultado.siteGerado,
          ...(resultado.siteHtml ? { siteHtml: resultado.siteHtml } : {}),
        });
        setAviso({
          tipo: resultado.aiAvailable ? "ok" : "aviso",
          texto: resultado.aiAvailable
            ? "Conteúdo regenerado pela IA com sucesso."
            : "Conteúdo regenerado em modo básico. A IA avançada está temporariamente indisponível.",
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Erro ao salvar.";
        setAviso({ tipo: "erro", texto: msg });
      }
    } else {
      setAviso({ tipo: "erro", texto: resultado.erro || "Não foi possível regenerar o conteúdo." });
    }

    setRegenerandoId(null);
    setTimeout(() => setAviso(null), 5000);
  }

  async function publicarEvento(idx: number) {
    const evento = eventos[idx];
    if (!evento?.id || publicandoId) return;
    setPublicandoId(evento.id);
    setAviso(null);
    setMenuAberto(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: normalizePlanId(getSelectedPlanFromEvento(evento)),
          eventId: evento.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAviso({ tipo: "erro", texto: data.error || "Não foi possível iniciar o checkout." });
      } else if (data.url) {
        window.location.assign(data.url);
        return;
      } else {
        setAviso({
          tipo: "aviso",
          texto: data.message || "Configure o Stripe para ativar assinatura e publicação.",
        });
      }
    } catch {
      setAviso({ tipo: "erro", texto: "Erro de rede ao iniciar checkout." });
    } finally {
      setPublicandoId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="grid h-screen grid-cols-1 lg:grid-cols-[220px_1fr]">
        <PainelSidebar nomeUsuario={user?.email ?? ""} onSair={signOut} />
        <div className="flex items-center justify-center text-[14px] text-[color:var(--muted)]">
          Carregando eventos...
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-[color:var(--paper)] lg:grid-cols-[220px_1fr]">
      <PainelSidebar nomeUsuario={user?.email ?? ""} onSair={signOut} totais={metricas} />

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="flex h-[60px] items-center justify-between gap-3 border-b border-[color:var(--hairline)] bg-[color:var(--paper)]/85 px-6 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[15px] font-medium text-[color:var(--ink)]">Eventos</h1>
            <span className="rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-2 py-0.5 text-[11px] font-mono-tight text-[color:var(--muted)]">
              {metricas.total}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="hidden h-9 items-center gap-2 rounded-[8px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-3 text-[13px] text-[color:var(--muted)] sm:flex">
              <span aria-hidden>⌕</span>
              <input
                placeholder="Buscar evento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-[160px] bg-transparent outline-none placeholder:text-[color:var(--muted-2)]"
              />
              <span className="rounded-[4px] border border-[color:var(--hairline)] px-1.5 py-0.5 font-mono-tight text-[10px] text-[color:var(--muted-2)]">
                ⌘K
              </span>
            </div>
            <Link href="/novo-evento" className="eventify-button eventify-button-primary text-[12.5px]">
              + Novo evento
            </Link>
          </div>
        </header>

        {/* Aviso */}
        {aviso && (
          <div
            className={`border-y px-6 py-3 text-[13.5px] ${
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

        {/* Metrics */}
        <section className="m-6 mb-0 grid grid-cols-1 overflow-hidden rounded-[12px] border border-[color:var(--hairline)] sm:grid-cols-2 lg:grid-cols-4 lg:gap-px lg:bg-[color:var(--hairline)]">
          <Metric label="Eventos no mês" value={String(metricas.eventosMes).padStart(2, "0")} delta={`${metricas.total} no total`} trend="flat" />
          <Metric label="RSVPs confirmados" value={String(metricas.totalConvidados)} delta={metricas.totalConvidados > 0 ? "+confirmações ativas" : "aguardando convidados"} trend="up" />
          <Metric label="Sites publicados" value={String(metricas.publicados).padStart(2, "0")} delta={`${metricas.rascunhos} rascunhos`} trend="flat" />
          <Metric label="Receita do mês" value={`R$ ${metricas.receita}`} delta={metricas.publicados > 0 ? `${metricas.publicados} assinaturas ativas` : "—"} trend={metricas.publicados > 0 ? "up" : "flat"} />
        </section>

        {/* Filters */}
        {eventos.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 px-6 pt-5">
            <div className="flex gap-0.5 rounded-[8px] bg-[color:var(--paper-2)] p-0.5">
              {(
                [
                  { id: "todos" as const, label: "Todos", count: metricas.total },
                  { id: "publicados" as const, label: "Publicados", count: metricas.publicados },
                  { id: "rascunhos" as const, label: "Rascunhos", count: metricas.rascunhos },
                ]
              ).map((f) => {
                const ativo = filtro === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFiltro(f.id)}
                    className={`inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-[12.5px] transition ${
                      ativo
                        ? "bg-[color:var(--surface)] text-[color:var(--ink)] font-medium shadow-[0_1px_2px_rgba(11,11,18,0.06)]"
                        : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                    }`}
                  >
                    {f.label}
                    <span className="font-mono-tight text-[10.5px] text-[color:var(--muted-2)]">{f.count}</span>
                  </button>
                );
              })}
            </div>
            <span className="hidden h-[18px] w-px bg-[color:var(--hairline)] sm:block" />
            <div className="ml-auto text-[12px] text-[color:var(--muted)]">
              Ordenar por <span className="text-[color:var(--ink-2)]">Data ▾</span>
            </div>
          </div>
        )}

        {/* Lista */}
        <section className="flex-1 px-6 pb-8 pt-5">
          {eventos.length === 0 ? (
            <EmptyState
              icon="✦"
              title="Você ainda não criou nenhum evento"
              description="Em 4 etapas a IA monta um site completo, com RSVP, mapa e QR Code. Sem cartão pra começar."
              action={{ label: "Criar meu primeiro evento →", href: "/novo-evento", variant: "primary" }}
              secondaryAction={{ label: "Ver exemplos", href: "/exemplos", variant: "ghost" }}
              className="mx-auto max-w-2xl"
            />
          ) : (
            <div className="overflow-hidden rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--surface)]">
              {/* Header */}
              <div className="grid grid-cols-[56px_1.6fr_1fr_1.1fr_0.9fr_0.9fr_40px] items-center gap-3 border-b border-[color:var(--hairline)] bg-[color:var(--paper)] px-4 py-2.5 text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
                <span />
                <span>Evento</span>
                <span>Data</span>
                <span>Local</span>
                <span>RSVP</span>
                <span>Status</span>
                <span />
              </div>

              {eventosFiltrados.length === 0 ? (
                <div className="p-12 text-center text-[13.5px] text-[color:var(--muted)]">
                  Nenhum evento corresponde aos filtros.
                </div>
              ) : (
                eventosFiltrados.map((evento, i) => {
                  const realIndex = eventos.indexOf(evento);
                  const publicado = isPublishedStatus(evento.status);
                  const slug = gerarSlug(evento.nome);
                  const rsvpCount = evento.convidados?.length ?? 0;
                  const limite = capacidadePorPlano(getSelectedPlanFromEvento(evento));
                  const tpl = evento.briefing?.templateId ? getTemplate(evento.briefing.templateId) : undefined;
                  const accent = tpl?.accent ?? "#B8935A";
                  const isMenuOpen = menuAberto === evento.id;
                  const isRegenerando = regenerandoId === evento.id;
                  const isPublicando = publicandoId === evento.id;

                  return (
                    <div
                      key={evento.id || i}
                      className={`group relative grid grid-cols-[56px_1.6fr_1fr_1.1fr_0.9fr_0.9fr_40px] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[color:var(--paper-2)] ${
                        i < eventosFiltrados.length - 1 ? "border-b border-[color:var(--hairline)]" : ""
                      }`}
                    >
                      {/* Thumbnail */}
                      <div
                        className="h-[44px] w-[36px] rounded-[5px] border border-[color:var(--hairline)] overflow-hidden"
                        style={{ background: `linear-gradient(160deg, ${accent}33, ${tpl?.base ?? "#fff"} 75%)` }}
                      >
                        {evento.imagem && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={evento.imagem} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>

                      {/* Nome + tipo + template */}
                      <Link href={`/evento/${slug}/pronto`} className="min-w-0">
                        <div className="truncate text-[14px] font-medium text-[color:var(--ink)] group-hover:text-[color:var(--ink)]">
                          {evento.nome}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-[color:var(--muted)]">
                          <span>{evento.tipo}</span>
                          {tpl && (
                            <>
                              <span className="text-[color:var(--muted-2)]">·</span>
                              <span className="font-mono-tight text-[10.5px]">{tpl.nome}</span>
                            </>
                          )}
                        </div>
                      </Link>

                      {/* Data */}
                      <div className="font-mono-tight text-[12.5px] text-[color:var(--ink-2)]">
                        {evento.data ? formatarDataMono(evento.data) : "—"}
                      </div>

                      {/* Local */}
                      <div className="truncate text-[13px] text-[color:var(--muted)]">
                        {[evento.endereco?.cidade, evento.endereco?.estado].filter(Boolean).join(" · ") || "—"}
                      </div>

                      {/* RSVP */}
                      <div className="font-mono-tight text-[12.5px] text-[color:var(--ink-2)]">
                        {rsvpCount} / {limite}
                      </div>

                      {/* Status */}
                      <div>
                        <StatusBadge
                          status={evento.status}
                          regenerando={isRegenerando}
                          publicando={isPublicando}
                          published={publicado}
                        />
                      </div>

                      {/* Menu */}
                      <div className="relative flex items-center justify-end">
                        <button
                          onClick={() => setMenuAberto(isMenuOpen ? null : evento.id ?? null)}
                          className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[color:var(--muted)] transition hover:bg-[color:var(--paper)] hover:text-[color:var(--ink)]"
                          aria-label="Ações"
                        >
                          ···
                        </button>
                        {isMenuOpen && (
                          <>
                            <button
                              onClick={() => setMenuAberto(null)}
                              className="fixed inset-0 z-30 cursor-default"
                              aria-label="Fechar menu"
                            />
                            <div className="absolute right-0 top-full z-40 mt-1 w-[210px] rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--surface)] py-1 shadow-[0_20px_40px_-20px_rgba(40,30,10,0.18)]">
                              <MenuLink href={`/evento/${slug}/pronto`}>Abrir editor</MenuLink>
                              <MenuLink href={`/personalizar/${slug}`}>Personalizar cores</MenuLink>
                              <MenuLink href={`/evento/${slug}`}>Página do evento</MenuLink>
                              {publicado ? (
                                <MenuLink href={`/cliente/${slug}`}>Página do cliente</MenuLink>
                              ) : (
                                <MenuLink href={`/promocional/${slug}`}>Ver prévia</MenuLink>
                              )}
                              <MenuLink href={`/editar-evento/${slug}`}>Editar briefing</MenuLink>
                              <MenuButton onClick={() => regenerarSite(realIndex)} disabled={!!regenerandoId}>
                                {isRegenerando ? "Regenerando..." : "✦ Regenerar com IA"}
                              </MenuButton>
                              {!publicado && (
                                <MenuButton onClick={() => publicarEvento(realIndex)} disabled={!!publicandoId} primary>
                                  {isPublicando ? "Abrindo checkout..." : "Assinar & publicar"}
                                </MenuButton>
                              )}
                              {evento.id && rsvpCount > 0 && (
                                <a
                                  href={`/api/eventos/${evento.id}/convidados.csv`}
                                  download
                                  className="block px-3.5 py-2 text-[12.5px] text-[color:var(--ink)] hover:bg-[color:var(--paper-2)]"
                                  onClick={() => setMenuAberto(null)}
                                >
                                  ↓ Export CSV
                                </a>
                              )}
                              <hr className="my-1 border-[color:var(--hairline)]" />
                              <MenuButton onClick={() => apagarEvento(realIndex)} danger>
                                Apagar evento
                              </MenuButton>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// ============================================================================
// Sidebar
// ============================================================================
function PainelSidebar({
  nomeUsuario,
  onSair,
  totais,
}: {
  nomeUsuario: string;
  onSair?: () => Promise<void>;
  totais?: { total: number; totalConvidados: number };
}) {
  const navMain = [
    { ic: "◧", label: "Eventos", href: "/painel", active: true, count: totais?.total },
    { ic: "◔", label: "Templates", href: "/templates", active: false },
    { ic: "◐", label: "Convidados", href: "#", active: false, count: totais?.totalConvidados },
    { ic: "◑", label: "Pagamentos", href: "/perfil", active: false },
    { ic: "⌗", label: "Analytics", href: "#", active: false },
  ];

  return (
    <aside className="hidden flex-col gap-5 border-r border-[color:var(--hairline)] bg-[color:var(--paper)] p-4 lg:flex lg:sticky lg:top-0 lg:h-screen">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2.5 px-2 py-1">
        <span className="flex h-5 w-5 items-center justify-center rounded-[4px] border border-[color:var(--ink)]">
          <span className="block h-1.5 w-1.5 rounded-[1px] bg-[color:var(--ink)]" />
        </span>
        <span className="font-display text-[18px] tracking-[-0.005em] text-[color:var(--ink)]">Eventify</span>
      </Link>

      {/* Nav */}
      <div>
        <p className="px-2 pb-1.5 text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--muted-2)]">Workspace</p>
        {navMain.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-[7px] px-2.5 py-1.5 text-[13px] transition ${
              item.active
                ? "bg-[color:var(--surface)] text-[color:var(--ink)] font-medium shadow-[0_1px_0_var(--hairline),0_0_0_1px_var(--hairline)]"
                : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"
            }`}
          >
            <span className="w-3.5 text-center text-[color:var(--muted-2)]">{item.ic}</span>
            <span className="flex-1">{item.label}</span>
            {typeof item.count === "number" && item.count > 0 && (
              <span className="font-mono-tight text-[10.5px] text-[color:var(--muted-2)]">{item.count}</span>
            )}
          </Link>
        ))}
      </div>

      <div>
        <p className="px-2 pb-1.5 text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--muted-2)]">Conta</p>
        <Link href="/perfil" className="block px-2.5 py-1.5 text-[13px] text-[color:var(--muted)] hover:text-[color:var(--ink)]">
          Perfil
        </Link>
        <Link href="/precos" className="block px-2.5 py-1.5 text-[13px] text-[color:var(--muted)] hover:text-[color:var(--ink)]">
          Plano · Intermediário
        </Link>
        <Link href="#" className="block px-2.5 py-1.5 text-[13px] text-[color:var(--muted)] hover:text-[color:var(--ink)]">
          Configurações
        </Link>
      </div>

      {/* Upgrade card */}
      <div className="mt-auto rounded-[8px] border border-dashed border-[color:var(--hairline-2)] bg-[color:var(--surface)] p-3">
        <p className="text-[12px] font-medium text-[color:var(--ink)]">Upgrade pra Premium</p>
        <p className="mt-1 text-[11.5px] leading-[1.45] text-[color:var(--muted)]">
          Marca branca, eventos ilimitados e suporte humano.
        </p>
        <Link href="/precos" className="eventify-button eventify-button-primary mt-2.5 w-full justify-center text-[12px]">
          Ver planos
        </Link>
      </div>

      {nomeUsuario && (
        <div className="flex items-center gap-2 border-t border-[color:var(--hairline)] pt-3 text-[11.5px] text-[color:var(--muted)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--paper-2)] font-display italic text-[color:var(--gold)]">
            {nomeUsuario.charAt(0).toUpperCase()}
          </span>
          <span className="flex-1 truncate">{nomeUsuario}</span>
          {onSair && (
            <button onClick={() => onSair()} className="text-[color:var(--muted)] hover:text-[color:var(--ink)]">
              sair
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

// ============================================================================
// Componentes auxiliares
// ============================================================================
function Metric({
  label,
  value,
  delta,
  trend = "flat",
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "flat";
}) {
  return (
    <div className="bg-[color:var(--surface)] px-5 py-4">
      <p className="text-[11.5px] text-[color:var(--muted)]">{label}</p>
      <p className="mt-1.5 font-mono-tight text-[26px] font-medium tracking-[-0.02em] text-[color:var(--ink)]">{value}</p>
      {delta && (
        <p className={`mt-1 text-[11.5px] ${trend === "up" ? "text-[color:var(--green,#5B7A4F)]" : "text-[color:var(--muted)]"}`}>
          {trend === "up" && "↗ "}
          {delta}
        </p>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  regenerando,
  publicando,
  published,
}: {
  status: string | undefined;
  regenerando: boolean;
  publicando: boolean;
  published: boolean;
}) {
  if (regenerando) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--gold)] bg-[var(--gold-soft)] px-2.5 py-0.5 text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--gold-2)]">
        <Spinner className="h-2.5 w-2.5" />
        Gerando
      </span>
    );
  }
  if (publicando) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--gold)] bg-[var(--gold-soft)] px-2.5 py-0.5 text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--gold-2)]">
        <Spinner className="h-2.5 w-2.5" />
        Checkout
      </span>
    );
  }
  if (published) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--green,#5B7A4F)] bg-[rgba(91,122,79,0.08)] px-2.5 py-0.5 text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--green,#5B7A4F)]">
        ● Publicado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--paper)] px-2.5 py-0.5 text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
      ○ {getStatusLabel(status)}
    </span>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-3.5 py-2 text-[12.5px] text-[color:var(--ink)] hover:bg-[color:var(--paper-2)]">
      {children}
    </Link>
  );
}

function MenuButton({
  onClick,
  children,
  disabled,
  primary,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`block w-full px-3.5 py-2 text-left text-[12.5px] transition disabled:cursor-not-allowed disabled:opacity-60 ${
        danger
          ? "text-[color:var(--rose,#A85462)] hover:bg-[rgba(168,84,98,0.06)]"
          : primary
            ? "font-medium text-[color:var(--gold-2)] hover:bg-[var(--gold-soft)]"
            : "text-[color:var(--ink)] hover:bg-[color:var(--paper-2)]"
      }`}
    >
      {children}
    </button>
  );
}

function formatarDataMono(data: string) {
  const d = new Date(`${data}T00:00:00`);
  if (isNaN(d.getTime())) return data;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd} · ${mm} · ${yy}`;
}

function capacidadePorPlano(plan: string | undefined): number {
  const normalized = normalizePlanId(plan);
  return normalized === "premium" ? 999 : normalized === "intermediario" ? 250 : 80;
}

export default function Painel() {
  return (
    <Suspense
      fallback={
        <main className="flex h-screen items-center justify-center text-[14px] text-[color:var(--muted)]">
          Carregando...
        </main>
      }
    >
      <PainelInner />
    </Suspense>
  );
}
