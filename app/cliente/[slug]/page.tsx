"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import AiSiteFrame from "@/components/AiSiteFrame";
import BrandHeader from "@/components/BrandHeader";
import EmptyState from "@/components/EmptyState";
import { useEventoPublico } from "@/hooks/useEventoPublico";
import { useTrackView } from "@/hooks/useTrackView";
import { formatarData } from "@/lib/utils";
import { isPublishedStatus, getStatusLabel } from "@/lib/publication";
import { FONT_CATALOG, type LivePalette } from "@/lib/livePalette";

function montarLivePalette(
  custom?: {
    paleta?: string[];
    fontDisplayId?: string;
    fontBodyId?: string;
  } | null
): LivePalette | null {
  if (!custom) return null;
  const tem = (custom.paleta && custom.paleta.length >= 4) || custom.fontDisplayId || custom.fontBodyId;
  if (!tem) return null;
  return {
    fundo: custom.paleta?.[0],
    superficie: custom.paleta?.[1],
    texto: custom.paleta?.[2],
    acento: custom.paleta?.[3],
    fontDisplay: custom.fontDisplayId ? FONT_CATALOG[custom.fontDisplayId] : undefined,
    fontBody: custom.fontBodyId ? FONT_CATALOG[custom.fontBodyId] : undefined,
  };
}

export default function PaginaCliente() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const { evento, isLoading, confirmarPresenca } = useEventoPublico(slug);

  useTrackView({
    eventoId: evento?.id,
    slug,
    enabled: Boolean(evento?.id) && isPublishedStatus(evento?.status),
  });

  const [nomeConvidado, setNomeConvidado] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const rsvpRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mensagem) return;
    const timer = setTimeout(() => setMensagem(null), 4000);
    return () => clearTimeout(timer);
  }, [mensagem]);

  if (isLoading) {
    return (
      <main className="eventify-page">
        <BrandHeader />
        <div className="editorial-wrap py-32 text-center text-[color:var(--muted)]">Carregando evento...</div>
      </main>
    );
  }

  if (!evento) {
    return (
      <main className="eventify-page">
        <BrandHeader />
        <section className="editorial-narrow py-24">
          <EmptyState
            icon="?"
            title="Evento não encontrado"
            description="Confira se o link está correto. Pode ter sido removido ou ainda não foi publicado."
            action={{ label: "Voltar pro início", href: "/", variant: "primary" }}
            className="max-w-xl"
          />
        </section>
      </main>
    );
  }

  if (!isPublishedStatus(evento.status)) {
    return (
      <main className="eventify-page">
        <BrandHeader />
        <section className="editorial-narrow py-24 text-center">
          <span className="eventify-kicker">Preview protegido</span>
          <h1 className="eventify-title mt-6 text-[clamp(40px,5vw,64px)]">
            Este site <em>ainda não foi publicado.</em>
          </h1>
          <p className="mt-5 text-[16px] leading-[1.6] text-[color:var(--muted)]">
            Status atual:{" "}
            <span className="rounded-full border border-[color:var(--gold)] bg-[var(--gold-soft)] px-2.5 py-0.5 text-[11.5px] uppercase tracking-[0.14em] text-[color:var(--gold-2)]">
              {getStatusLabel(evento.status)}
            </span>
            . O link final dos convidados fica liberado depois da assinatura/publicação.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a href="/painel" className="eventify-button eventify-button-primary">
              Publicar no painel <span aria-hidden>→</span>
            </a>
          </div>
        </section>
      </main>
    );
  }

  async function enviarPresenca(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nome = nomeConvidado.trim();
    if (!nome) {
      setMensagem({ tipo: "erro", texto: "Digite seu nome para confirmar." });
      return;
    }
    try {
      await confirmarPresenca(nome);
      setNomeConvidado("");
      setMensagem({ tipo: "ok", texto: "Presença confirmada. Obrigado!" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao confirmar.";
      setMensagem({ tipo: "erro", texto: msg });
    }
  }

  function scrollToRsvp() {
    rsvpRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const convidados = evento.convidados || [];
  const endereco = evento.endereco || {};
  const enderecoCompleto = [endereco.rua, endereco.numero, endereco.cidade, endereco.estado]
    .filter(Boolean)
    .join(", ");
  const mapaURL = enderecoCompleto
    ? `https://www.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&output=embed`
    : "";
  const linkEvento = typeof window !== "undefined" ? `${window.location.origin}/cliente/${slug}` : "";
  const qrCodeURL = linkEvento
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(linkEvento)}`
    : "";

  return (
    <main className="eventify-page">
      {/* Site da IA — tela inteira no topo */}
      {evento.siteHtml ? (
        <div className="relative">
          <AiSiteFrame
            html={evento.siteHtml}
            titulo={evento.nome}
            paletteOverride={montarLivePalette(evento.briefing?.customTemplate)}
          />
          <button
            onClick={scrollToRsvp}
            className="fixed bottom-6 right-6 z-40 rounded-full bg-[color:var(--ink)] px-6 py-3 text-[14px] font-medium text-white shadow-lg transition hover:scale-105"
            aria-label="Ir para confirmar presença"
          >
            ✓ Confirmar presença
          </button>
        </div>
      ) : (
        <section className="editorial-narrow py-16 text-center">
          <span className="eventify-kicker">Convite</span>
          <h1 className="eventify-title mt-6 text-[clamp(40px,5vw,64px)]">{evento.nome}</h1>
          <p className="mt-4 text-[color:var(--muted)]">
            {formatarData(evento.data)}
            {enderecoCompleto && ` · ${enderecoCompleto}`}
          </p>
        </section>
      )}

      {/* Seção de RSVP + mapa + QR — abaixo do site */}
      <section
        ref={rsvpRef}
        className="border-t border-[color:var(--hairline)] bg-[color:var(--paper)] py-16"
      >
        <div className="editorial-narrow space-y-10">
          <div className="text-center">
            <span className="eventify-kicker">Confirme sua presença</span>
            <h2 className="mt-4 font-display text-[clamp(32px,4vw,48px)] italic text-[color:var(--ink)]">
              Avise se vai estar lá
            </h2>
            <p className="mt-3 text-[14px] text-[color:var(--muted)]">
              {convidados.length} {convidados.length === 1 ? "pessoa já confirmou" : "pessoas já confirmaram"}
            </p>
          </div>

          <form
            onSubmit={enviarPresenca}
            className="mx-auto max-w-xl rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-8"
          >
            <label
              htmlFor="nomeConvidado"
              className="block text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]"
            >
              Seu nome
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                id="nomeConvidado"
                type="text"
                value={nomeConvidado}
                onChange={(event) => setNomeConvidado(event.target.value)}
                placeholder="Nome completo"
                className="eventify-input flex-1"
              />
              <button type="submit" className="eventify-button eventify-button-primary">
                Confirmar <span aria-hidden>→</span>
              </button>
            </div>
            {mensagem && (
              <p
                className={`mt-4 rounded-md border px-3 py-2 text-[13px] ${
                  mensagem.tipo === "erro"
                    ? "border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] text-[color:var(--rose,#A85462)]"
                    : "border-[color:var(--green,#5B7A4F)] bg-[rgba(91,122,79,0.06)] text-[color:var(--green,#5B7A4F)]"
                }`}
              >
                {mensagem.texto}
              </p>
            )}
          </form>

          {(mapaURL || qrCodeURL) && (
            <div className="grid gap-6 sm:grid-cols-2">
              {mapaURL && (
                <div className="overflow-hidden rounded-[12px] border border-[color:var(--hairline)] bg-white">
                  <div className="bg-[color:var(--paper-2)] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    Local
                  </div>
                  <iframe
                    title={`Mapa de ${evento.nome}`}
                    src={mapaURL}
                    width="100%"
                    height="220"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
              )}
              {qrCodeURL && (
                <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[color:var(--hairline)] bg-white p-6 text-center">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    Compartilhe pelo QR Code
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeURL}
                    alt="QR Code do evento"
                    className="h-36 w-36 rounded-[8px] border border-[color:var(--hairline)] p-1"
                  />
                  <p className="break-all text-[11px] font-mono-tight text-[color:var(--muted)]">
                    {linkEvento}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
