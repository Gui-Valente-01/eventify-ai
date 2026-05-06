"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import { useEventoPublico } from "@/hooks/useEventoPublico";
import { formatarData, getTemplateId } from "@/lib/utils";
import { isPublishedStatus, getStatusLabel } from "@/lib/publication";
import { CLIENT_VISUALS, TemplateId } from "@/lib/visuals";

export default function PaginaCliente() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const { evento, isLoading, confirmarPresenca } = useEventoPublico(slug);

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
        <div className="eventify-section text-center eventify-muted">Carregando evento...</div>
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
            <p className="eventify-muted mt-3">Confira se o link recebido está correto.</p>
          </div>
        </section>
      </main>
    );
  }

  if (!isPublishedStatus(evento.status)) {
    return (
      <main className="eventify-page">
        <BrandHeader />
        <section className="eventify-section flex justify-center">
          <div className="eventify-card max-w-2xl p-10 text-center">
            <span className="eventify-kicker">Preview protegido</span>
            <h1 className="eventify-title mt-5 text-4xl">Este site ainda não foi publicado</h1>
            <p className="eventify-muted mt-4 text-lg">
              Status atual: <strong>{getStatusLabel(evento.status)}</strong>. O link final dos convidados fica liberado depois da assinatura/publicação.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={`/promocional/${slug}`} className="eventify-button eventify-button-ghost">
                Ver preview
              </a>
              <a href="/painel" className="eventify-button eventify-button-primary">
                Publicar no painel
              </a>
            </div>
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
  const enderecoCompleto = [endereco.rua, endereco.numero, endereco.cidade, endereco.estado].filter(Boolean).join(", ");
  const mapaURL = enderecoCompleto ? `https://www.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&output=embed` : "";
  const linkEvento = typeof window !== "undefined" ? `${window.location.origin}/cliente/${slug}` : "";
  const qrCodeURL = linkEvento ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(linkEvento)}` : "";
  const visual = CLIENT_VISUALS[getTemplateId(evento) as TemplateId] || CLIENT_VISUALS.festa;
  const site = evento.siteGerado;

  return (
    <main className={visual.page}>
      <BrandHeader />
      <section className={visual.section}>
        <div className="space-y-8">
          <div className={visual.kicker}>
            {visual.label} · {evento.tipo || "Evento especial"}
          </div>

          <div>
            <p className={`${visual.muted} text-sm font-bold uppercase tracking-[0.28em]`}>Convite</p>
            <h1 className={`${visual.title} mt-5`}>{site?.heroTitle || evento.nome}</h1>
            <p className={`${visual.muted} mt-6 max-w-2xl text-lg leading-8`}>
              {site?.invitationMessage || "Você está convidado para viver esse momento especial. Confira os detalhes abaixo e confirme sua presença."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`${visual.card} p-5`}>
              <p className={`${visual.muted} text-sm font-bold uppercase tracking-[0.2em]`}>Data</p>
              <p className="mt-3 text-2xl font-black text-[#090814]">{formatarData(evento.data)}</p>
            </div>
            <div className={`${visual.card} p-5`}>
              <p className={`${visual.muted} text-sm font-bold uppercase tracking-[0.2em]`}>Local</p>
              <p className="mt-3 text-lg font-black leading-7 text-[#090814]">{enderecoCompleto || "Local a confirmar"}</p>
            </div>
          </div>

          <form onSubmit={enviarPresenca} className={`${visual.card} p-5`}>
            <label htmlFor="nomeConvidado" className={`${visual.muted} text-sm font-bold uppercase tracking-[0.2em]`}>
              Confirmar presença
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                id="nomeConvidado"
                type="text"
                value={nomeConvidado}
                onChange={(event) => setNomeConvidado(event.target.value)}
                placeholder="Seu nome"
                className="eventify-input flex-1"
              />
              <button type="submit" className={visual.button}>
                {site?.ctaLabel || "Confirmar"} →
              </button>
            </div>
            {mensagem && (
              <p className={`mt-3 text-sm font-bold ${mensagem.tipo === "erro" ? "text-rose-500" : "text-emerald-600"}`}>
                {mensagem.texto}
              </p>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <div className={`${visual.card} overflow-hidden p-3`}>
            {evento.imagem ? (
              <img src={evento.imagem} alt={evento.nome} className={`h-[420px] w-full object-cover ${visual.image}`} />
            ) : (
              <div className={`${visual.muted} ${visual.accent} flex h-[420px] items-center justify-center px-8 text-center`}>
                Imagem do evento
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
            <div className={`${visual.card} p-5`}>
              <p className={`${visual.muted} text-sm font-bold uppercase tracking-[0.2em]`}>Confirmados</p>
              <p className="mt-3 text-4xl font-black text-[#090814]">{convidados.length}</p>
            </div>
            {mapaURL && (
              <div className={`${visual.card} overflow-hidden`}>
                <iframe title={`Mapa de ${evento.nome}`} src={mapaURL} width="100%" height="180" style={{ border: 0 }} loading="lazy" />
              </div>
            )}
          </div>

          {qrCodeURL && (
            <div className={`${visual.card} flex flex-col gap-5 p-5 sm:flex-row sm:items-center`}>
              <img src={qrCodeURL} alt="QR Code do evento" className="h-32 w-32 rounded-xl border border-[#e8e3f1] bg-white p-2" />
              <div>
                <p className="text-xl font-black text-[#090814]">Compartilhe pelo QR Code</p>
                <p className={`${visual.muted} mt-2 break-all text-sm`}>{linkEvento}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
