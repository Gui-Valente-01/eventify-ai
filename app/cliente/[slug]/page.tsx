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

type RsvpStatusUI = "confirmado" | "talvez" | "recusou";

export default function PaginaCliente() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const { evento, isLoading, enviarRsvp } = useEventoPublico(slug);

  useTrackView({
    eventoId: evento?.id,
    slug,
    enabled: Boolean(evento?.id) && isPublishedStatus(evento?.status),
  });

  const [nomeConvidado, setNomeConvidado] = useState("");
  const [statusRsvp, setStatusRsvp] = useState<RsvpStatusUI>("confirmado");
  const [acompanhantes, setAcompanhantes] = useState(0);
  const [restricaoAlimentar, setRestricaoAlimentar] = useState("");
  const [recado, setRecado] = useState("");
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
      await enviarRsvp({
        nome,
        status: statusRsvp,
        acompanhantes: statusRsvp === "recusou" ? 0 : acompanhantes,
        restricaoAlimentar: statusRsvp === "recusou" ? undefined : restricaoAlimentar.trim() || undefined,
        recado: recado.trim() || undefined,
      });
      setNomeConvidado("");
      setAcompanhantes(0);
      setRestricaoAlimentar("");
      setRecado("");
      const msg =
        statusRsvp === "confirmado"
          ? "Presença confirmada. Obrigado!"
          : statusRsvp === "talvez"
            ? "Resposta registrada como talvez."
            : "Resposta registrada. Sentiremos sua falta!";
      setMensagem({ tipo: "ok", texto: msg });
    } catch (error) {
      const erroTxt = error instanceof Error ? error.message : "Erro ao confirmar.";
      setMensagem({ tipo: "erro", texto: erroTxt });
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
          {/* CTAs flutuantes */}
          <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Você está convidado para ${evento.nome}! Confirme presença e veja detalhes: ${linkEvento}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-emerald-600"
              aria-label="Compartilhar via WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Compartilhar
            </a>
            <button
              onClick={scrollToRsvp}
              className="rounded-full bg-[color:var(--ink)] px-6 py-3 text-[14px] font-medium text-white shadow-lg transition hover:scale-105"
              aria-label="Ir para confirmar presença"
            >
              ✓ Confirmar presença
            </button>
          </div>
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
            className="mx-auto max-w-xl space-y-5 rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-8"
          >
            {/* Nome */}
            <div>
              <label
                htmlFor="nomeConvidado"
                className="block text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]"
              >
                Seu nome
              </label>
              <input
                id="nomeConvidado"
                type="text"
                value={nomeConvidado}
                onChange={(event) => setNomeConvidado(event.target.value)}
                placeholder="Nome completo"
                className="eventify-input mt-2 w-full"
                required
              />
            </div>

            {/* Status */}
            <div>
              <span className="block text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Você vai?
              </span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {([
                  { val: "confirmado", label: "✓ Vou", cls: "border-[color:var(--green,#5B7A4F)] bg-[rgba(91,122,79,0.08)] text-[color:var(--green,#5B7A4F)]" },
                  { val: "talvez", label: "? Talvez", cls: "border-[color:var(--gold)] bg-[var(--gold-soft)] text-[color:var(--gold-2)]" },
                  { val: "recusou", label: "✗ Não vou", cls: "border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] text-[color:var(--rose,#A85462)]" },
                ] as const).map((opt) => {
                  const ativo = statusRsvp === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setStatusRsvp(opt.val)}
                      className={`rounded-[8px] border-2 py-2.5 text-[13px] font-medium transition ${
                        ativo
                          ? opt.cls
                          : "border-[color:var(--hairline)] bg-[color:var(--paper)] text-[color:var(--muted)] hover:border-[color:var(--ink-2)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Acompanhantes (só se vai ou talvez) */}
            {statusRsvp !== "recusou" && (
              <>
                <div>
                  <label
                    htmlFor="acompanhantes"
                    className="block text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]"
                  >
                    Vou levar acompanhantes
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAcompanhantes(Math.max(0, acompanhantes - 1))}
                      className="h-9 w-9 rounded-[6px] border border-[color:var(--hairline-2)] bg-[color:var(--paper)] text-[16px] text-[color:var(--ink)] hover:bg-[color:var(--paper-2)]"
                      aria-label="Menos um"
                    >
                      −
                    </button>
                    <input
                      id="acompanhantes"
                      type="number"
                      min={0}
                      max={20}
                      value={acompanhantes}
                      onChange={(e) =>
                        setAcompanhantes(Math.max(0, Math.min(20, Number(e.target.value) || 0)))
                      }
                      className="eventify-input w-20 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setAcompanhantes(Math.min(20, acompanhantes + 1))}
                      className="h-9 w-9 rounded-[6px] border border-[color:var(--hairline-2)] bg-[color:var(--paper)] text-[16px] text-[color:var(--ink)] hover:bg-[color:var(--paper-2)]"
                      aria-label="Mais um"
                    >
                      +
                    </button>
                    <span className="text-[12.5px] text-[color:var(--muted)]">
                      {acompanhantes === 0 ? "sozinho(a)" : acompanhantes === 1 ? "1 pessoa" : `${acompanhantes} pessoas`}
                    </span>
                  </div>
                </div>

                {/* Restrição alimentar */}
                <div>
                  <label
                    htmlFor="restricao"
                    className="block text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]"
                  >
                    Restrição alimentar <span className="normal-case opacity-60">(opcional)</span>
                  </label>
                  <input
                    id="restricao"
                    type="text"
                    value={restricaoAlimentar}
                    onChange={(e) => setRestricaoAlimentar(e.target.value)}
                    placeholder="vegetariano, sem lactose, alérgico a..."
                    maxLength={200}
                    className="eventify-input mt-2 w-full"
                  />
                </div>
              </>
            )}

            {/* Recado */}
            <div>
              <label
                htmlFor="recado"
                className="block text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]"
              >
                Recado <span className="normal-case opacity-60">(opcional)</span>
              </label>
              <textarea
                id="recado"
                value={recado}
                onChange={(e) => setRecado(e.target.value)}
                placeholder="parabéns, deixe uma mensagem carinhosa..."
                rows={2}
                maxLength={500}
                className="eventify-input mt-2 w-full resize-none"
              />
            </div>

            <button
              type="submit"
              className="eventify-button eventify-button-primary w-full justify-center"
            >
              Enviar resposta <span aria-hidden>→</span>
            </button>

            {mensagem && (
              <p
                className={`rounded-md border px-3 py-2 text-[13px] ${
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
