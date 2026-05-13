"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import EmptyState from "@/components/EmptyState";
import { useEventoPublico } from "@/hooks/useEventoPublico";
import { useTrackView } from "@/hooks/useTrackView";
import { formatarData, getTemplateId } from "@/lib/utils";
import { isPublishedStatus, getStatusLabel } from "@/lib/publication";
import { CLIENT_VISUALS, TemplateId } from "@/lib/visuals";

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
            <a href={`/promocional/${slug}`} className="eventify-button eventify-button-ghost">
              Ver preview
            </a>
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
  const visual = CLIENT_VISUALS[getTemplateId(evento) as TemplateId] || CLIENT_VISUALS.festa;
  const site = evento.siteGerado;

  return (
    <main className={visual.page}>
      <BrandHeader />
      <section className={visual.section}>
        <div className="space-y-9">
          <div className={visual.kicker}>
            {visual.label} · {evento.tipo || "Evento especial"}
          </div>

          <div>
            <p className={`${visual.muted} text-[11px] uppercase tracking-[0.28em]`}>Convite</p>
            <h1 className={`${visual.title} mt-5`}>{site?.heroTitle || evento.nome}</h1>
            <p className={`${visual.muted} mt-6 max-w-2xl text-[17px] leading-[1.65]`}>
              {site?.invitationMessage ||
                "Você está convidado para viver esse momento especial. Confira os detalhes abaixo e confirme sua presença."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`${visual.card} p-6`}>
              <p className={`${visual.muted} text-[10.5px] uppercase tracking-[0.22em]`}>Data</p>
              <p className="mt-3 font-display text-[26px] font-light leading-tight tracking-[-0.01em] text-[color:var(--ink)]">
                {formatarData(evento.data)}
              </p>
            </div>
            <div className={`${visual.card} p-6`}>
              <p className={`${visual.muted} text-[10.5px] uppercase tracking-[0.22em]`}>Local</p>
              <p className="mt-3 font-display text-[20px] font-normal leading-[1.3] tracking-[-0.005em] text-[color:var(--ink)]">
                {enderecoCompleto || "Local a confirmar"}
              </p>
            </div>
          </div>

          <form onSubmit={enviarPresenca} className={`${visual.card} p-6`}>
            <label
              htmlFor="nomeConvidado"
              className={`${visual.muted} block text-[10.5px] uppercase tracking-[0.22em]`}
            >
              Confirmar presença
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                id="nomeConvidado"
                type="text"
                value={nomeConvidado}
                onChange={(event) => setNomeConvidado(event.target.value)}
                placeholder="Seu nome completo"
                className="eventify-input flex-1"
              />
              <button type="submit" className={visual.button}>
                {site?.ctaLabel || "Confirmar"} <span aria-hidden>→</span>
              </button>
            </div>
            {mensagem && (
              <p
                className={`mt-4 border-y px-3 py-2 text-[13px] ${
                  mensagem.tipo === "erro"
                    ? "border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] text-[color:var(--rose,#A85462)]"
                    : "border-[color:var(--green,#5B7A4F)] bg-[rgba(91,122,79,0.06)] text-[color:var(--green,#5B7A4F)]"
                }`}
              >
                {mensagem.texto}
              </p>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <div className={`${visual.card} overflow-hidden p-3`}>
            {evento.imagem ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={evento.imagem} alt={evento.nome} className={`h-[420px] w-full object-cover ${visual.image}`} />
            ) : (
              <div
                className={`${visual.muted} ${visual.accent} flex h-[420px] items-center justify-center px-8 text-center font-display italic`}
              >
                Imagem do evento
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
            <div className={`${visual.card} p-6 text-center`}>
              <p className={`${visual.muted} text-[10.5px] uppercase tracking-[0.22em]`}>Confirmados</p>
              <p className="mt-3 font-display text-[44px] font-light leading-none tracking-[-0.02em] text-[color:var(--ink)]">
                {convidados.length}
              </p>
            </div>
            {mapaURL && (
              <div className={`${visual.card} overflow-hidden`}>
                <iframe
                  title={`Mapa de ${evento.nome}`}
                  src={mapaURL}
                  width="100%"
                  height="180"
                  style={{ border: 0 }}
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {qrCodeURL && (
            <div className={`${visual.card} flex flex-col gap-5 p-6 sm:flex-row sm:items-center`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeURL}
                alt="QR Code do evento"
                className="h-32 w-32 rounded-[10px] border border-[color:var(--hairline)] bg-white p-2"
              />
              <div>
                <p className="font-display text-[22px] font-normal tracking-[-0.01em] text-[color:var(--ink)]">
                  Compartilhe pelo <em className="italic text-[color:var(--gold)]">QR Code</em>
                </p>
                <p className={`${visual.muted} mt-2 break-all text-[12.5px] font-mono-tight`}>{linkEvento}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
