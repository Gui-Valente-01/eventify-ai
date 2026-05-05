"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEventos } from "@/hooks/useEventos";
import { gerarSlug } from "@/lib/utils";
import { gerarSiteAPI } from "@/lib/api";
import { getStatusLabel, isPublishedStatus } from "@/lib/publication";
import BrandHeader from "@/components/BrandHeader";
import Spinner from "@/components/Spinner";

function PainelInner() {
  const searchParams = useSearchParams();
  const { eventos, atualizarEvento, deletarEvento, isLoading } = useEventos();
  const [regenerandoIndex, setRegenerandoIndex] = useState<number | null>(null);
  const [publicandoIndex, setPublicandoIndex] = useState<number | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok" | "aviso"; texto: string } | null>(null);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      setAviso({ tipo: "ok", texto: "Pagamento confirmado! Assim que o Stripe avisar o webhook, o site fica publicado." });
    } else if (checkout === "cancel") {
      setAviso({ tipo: "aviso", texto: "Pagamento cancelado. Você pode tentar novamente quando quiser." });
    }
  }, [searchParams]);

  const metricas = useMemo(() => {
    const totalConvidados = eventos.reduce((sum, e) => sum + (e.convidados?.length || 0), 0);
    const sitesComIa = eventos.filter((e) => e.siteGerado).length;
    const sitesClaude = eventos.filter((e) => e.siteGerado?.generatedBy === "claude").length;
    const agora = new Date();
    const eventosMes = eventos.filter((e) => {
      if (!e.data) return false;
      const d = new Date(`${e.data}T00:00:00`);
      return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
    }).length;
    const eventosFuturos = eventos.filter((e) => {
      if (!e.data) return false;
      const d = new Date(`${e.data}T00:00:00`);
      return d.getTime() >= agora.setHours(0, 0, 0, 0);
    }).length;
    const mediaConvidados = eventos.length > 0 ? Math.round(totalConvidados / eventos.length) : 0;

    return {
      totalEventos: eventos.length,
      totalConvidados,
      sitesComIa,
      sitesClaude,
      eventosMes,
      eventosFuturos,
      mediaConvidados,
    };
  }, [eventos]);

  async function apagarEvento(index: number) {
    if (!confirm("Tem certeza que deseja apagar este evento?")) return;
    try {
      await deletarEvento(index);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao apagar.";
      setAviso({ tipo: "erro", texto: msg });
    }
  }

  async function regenerarSite(index: number) {
    if (regenerandoIndex !== null) return;
    setRegenerandoIndex(index);
    setAviso(null);

    const evento = eventos[index];
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
            ? "Conteúdo regenerado pelo Claude com sucesso."
            : "Conteúdo regenerado pelo agente local. Configure ANTHROPIC_API_KEY para usar Claude.",
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Erro ao salvar.";
        setAviso({ tipo: "erro", texto: msg });
      }
    } else {
      setAviso({ tipo: "erro", texto: resultado.erro || "Não foi possível regenerar o conteúdo." });
    }

    setRegenerandoIndex(null);
    setTimeout(() => setAviso(null), 5000);
  }

  async function publicarEvento(index: number) {
    if (publicandoIndex !== null) return;
    const evento = eventos[index];
    if (!evento?.id) {
      setAviso({ tipo: "erro", texto: "Evento sem identificador. Salve novamente antes de publicar." });
      return;
    }

    setPublicandoIndex(index);
    setAviso(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "intermediario", eventId: evento.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAviso({ tipo: "erro", texto: data.error || "Não foi possível iniciar o checkout." });
      } else if (data.url) {
        window.location.href = data.url;
        return;
      } else {
        setAviso({
          tipo: "aviso",
          texto: data.message || "Configure o Stripe para ativar a publicação paga.",
        });
      }
    } catch {
      setAviso({ tipo: "erro", texto: "Erro de rede ao iniciar checkout." });
    } finally {
      setPublicandoIndex(null);
    }
  }

  if (isLoading) {
    return (
      <main className="eventify-page">
        <BrandHeader />
        <div className="eventify-section text-center">
          <p>Carregando eventos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="eventify-page">
      <BrandHeader />
      <div className="eventify-section">
        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eventify-kicker">✦ Painel de eventos</span>
            <h1 className="eventify-title mt-6 text-5xl">Seus eventos em um só lugar</h1>
            <p className="eventify-muted mt-4 text-lg">Edite seus eventos e abra a página do cliente em um clique.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/precos" className="eventify-button eventify-button-ghost">
              Planos
            </Link>
            <Link href="/novo-evento" className="eventify-button eventify-button-primary">
              Novo evento →
            </Link>
          </div>
        </header>

        {aviso && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm font-semibold ${
              aviso.tipo === "erro"
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : aviso.tipo === "aviso"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {aviso.texto}
          </div>
        )}

        <section className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card label="Eventos" value={metricas.totalEventos} hint={`${metricas.eventosFuturos} futuros`} />
          <Card label="Convidados" value={metricas.totalConvidados} hint={`média ${metricas.mediaConvidados} por evento`} />
          <Card label="Sites com IA" value={metricas.sitesComIa} hint={`${metricas.sitesClaude} via Claude`} />
          <Card label="Este mês" value={metricas.eventosMes} hint="eventos agendados" />
        </section>

        {eventos.length === 0 ? (
          <div className="eventify-card border-dashed p-14 text-center">
            <p className="text-2xl font-black">Nenhum evento criado ainda.</p>
            <p className="eventify-muted mt-3">Comece criando o primeiro evento para testar o painel e o RSVP.</p>
            <Link href="/novo-evento" className="eventify-button eventify-button-primary mt-6">
              Criar primeiro evento →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {eventos.map((evento, index) => (
              <article key={evento.id || index} className="eventify-card overflow-hidden transition hover:-translate-y-1">
                <div className="relative h-60 overflow-hidden bg-[#f1eef8]">
                  {evento.imagem ? (
                    <img src={evento.imagem} alt={evento.nome} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#f1eef8] text-[#8b849a]">
                      <span>Sem imagem</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-black text-[#090814]">{evento.nome}</h2>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#f0ddff] px-3 py-1 text-sm font-bold text-[#8847e7]">{evento.tipo}</span>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-bold ${
                          isPublishedStatus(evento.status)
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {getStatusLabel(evento.status)}
                      </span>
                    </div>
                  </div>
                  <div className="eventify-muted mt-4 space-y-2 text-sm">
                    <p>📅 {evento.data}</p>
                    {evento.endereco && (evento.endereco.rua || evento.endereco.cidade) && (
                      <p>📍 {[evento.endereco.rua, evento.endereco.numero, evento.endereco.cidade].filter(Boolean).join(", ")}</p>
                    )}
                    <p>👥 {evento.convidados?.length || 0} convidados</p>
                    <p>
                      🤖{" "}
                      {evento.siteGerado
                        ? `Site gerado via ${evento.siteGerado.generatedBy === "claude" ? "Claude" : evento.siteGerado.generatedBy}`
                        : "Site ainda não gerado — clique em Regenerar IA"}
                    </p>
                    {typeof evento.siteGerado?.qualityScore === "number" && (
                      <p>Qualidade dos agentes: {evento.siteGerado.qualityScore}/100</p>
                    )}
                  </div>
                  {!isPublishedStatus(evento.status) && (
                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-black text-amber-800">Preview gratuito ativo</p>
                      <p className="mt-1 text-sm text-amber-700">
                        Publique para liberar o link final dos convidados, QR Code limpo e remover a marca d'água.
                      </p>
                    </div>
                  )}
                  {evento.convidados && evento.convidados.length > 0 && (
                    <div className="mt-5 rounded-2xl border border-[#e8e3f1] bg-[#faf9ff] p-4">
                      <p className="text-sm font-black text-[#090814]">Convidados confirmados</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {evento.convidados.slice(0, 6).map((c) => (
                          <span key={c} className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#5f5a72]">
                            {c}
                          </span>
                        ))}
                        {evento.convidados.length > 6 && (
                          <span className="rounded-full bg-[#f0ddff] px-3 py-1 text-sm font-bold text-[#8847e7]">
                            +{evento.convidados.length - 6}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={`/evento/${gerarSlug(evento.nome)}`} className="rounded-xl border border-[#e8e3f1] bg-white px-4 py-2 text-sm font-bold text-[#090814] transition hover:bg-[#faf9ff]">
                      Ver evento
                    </Link>
                    <Link href={`/cliente/${gerarSlug(evento.nome)}`} className="rounded-xl bg-gradient-to-br from-[#8847e7] to-[#cf67ee] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90">
                      Página do cliente
                    </Link>
                    <Link href={`/promocional/${gerarSlug(evento.nome)}`} className="rounded-xl border border-[#e8e3f1] bg-white px-4 py-2 text-sm font-bold text-[#8847e7] transition hover:bg-[#faf9ff]">
                      Site promocional
                    </Link>
                    <Link href={`/editar-evento/${gerarSlug(evento.nome)}`} className="rounded-xl border border-[#e8e3f1] bg-white px-4 py-2 text-sm font-bold text-[#090814] transition hover:bg-[#faf9ff]">
                      Editar
                    </Link>
                    <button
                      onClick={() => regenerarSite(index)}
                      disabled={regenerandoIndex !== null}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#e8e3f1] bg-gradient-to-br from-[#f0ddff] to-white px-4 py-2 text-sm font-bold text-[#8847e7] transition hover:from-[#e6cdff] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {regenerandoIndex === index ? (
                        <>
                          <Spinner className="h-4 w-4" /> Regenerando...
                        </>
                      ) : (
                        <>✨ Regenerar IA</>
                      )}
                    </button>
                    {!isPublishedStatus(evento.status) && (
                      <button
                        onClick={() => publicarEvento(index)}
                        disabled={publicandoIndex !== null}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {publicandoIndex === index ? (
                          <>
                            <Spinner className="h-4 w-4" /> Abrindo checkout...
                          </>
                        ) : (
                          <>Publicar por R$49</>
                        )}
                      </button>
                    )}
                    <button onClick={() => apagarEvento(index)} className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100">
                      Apagar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Card({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="eventify-card p-6">
      <p className="eventify-muted text-sm font-bold uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-3 text-4xl font-black text-[#090814]">{value}</p>
      {hint && <p className="eventify-muted mt-1 text-xs">{hint}</p>}
    </div>
  );
}

export default function Painel() {
  return (
    <Suspense fallback={<main className="eventify-page"><div className="eventify-section text-center eventify-muted">Carregando...</div></main>}>
      <PainelInner />
    </Suspense>
  );
}
