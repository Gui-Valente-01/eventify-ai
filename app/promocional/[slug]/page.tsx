"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import AiSiteFrame from "@/components/AiSiteFrame";
import BrandHeader from "@/components/BrandHeader";
import ShareButtons from "@/components/ShareButtons";
import { useEventoPublico } from "@/hooks/useEventoPublico";
import { buildPromoData } from "@/lib/promotionalTemplates";
import { getTemplateId } from "@/lib/utils";
import { getStatusLabel, isPublishedStatus } from "@/lib/publication";
import { PROMO_VISUALS, TemplateId } from "@/lib/visuals";

export default function Promocional() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const { evento, isLoading } = useEventoPublico(slug);

  const linkCliente =
    typeof window !== "undefined" && slug ? `${window.location.origin}/cliente/${slug}` : "";
  const qrCodeURL = linkCliente
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(linkCliente)}`
    : "";

  if (isLoading) {
    return (
      <main className="eventify-page">
        <BrandHeader />
        <div className="editorial-wrap py-32 text-center text-[color:var(--muted)]">
          Carregando site promocional...
        </div>
      </main>
    );
  }

  if (!evento) {
    return (
      <main className="eventify-page">
        <BrandHeader />
        <section className="editorial-narrow py-32 text-center">
          <span className="eventify-kicker">Site promocional</span>
          <h1 className="eventify-title mt-6 text-[clamp(40px,5vw,64px)]">
            Site <em>não encontrado.</em>
          </h1>
          <p className="mt-4 text-[16px] text-[color:var(--muted)]">
            Confira se o link está correto, ou volte e crie um novo evento.
          </p>
          <Link href="/" className="eventify-button eventify-button-ghost mt-10">
            Voltar pro início
          </Link>
        </section>
      </main>
    );
  }

  // MODO IA — site customizado gerado pela IA, renderizado em iframe
  if (evento.siteHtml) {
    const publicado = isPublishedStatus(evento.status);
    return (
      <main className="min-h-screen bg-[color:var(--ink)]">
        {/* Owner toolbar */}
        <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[color:var(--ink)] px-5 py-3 text-white">
          <span className="flex items-center gap-2.5 text-[12.5px]">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                publicado ? "bg-[color:var(--green,#5B7A4F)]" : "bg-[color:var(--gold)]"
              }`}
            />
            <span className="font-display italic">
              {publicado
                ? "Site publicado por Eventify"
                : `Prévia · ${getStatusLabel(evento.status)}`}
            </span>
          </span>
          <div className="flex items-center gap-2">
            {publicado ? (
              <Link
                href={`/cliente/${slug}`}
                className="rounded-full border border-white/15 px-3.5 py-1.5 text-[12.5px] text-white transition hover:bg-white/10"
              >
                Página de RSVP
              </Link>
            ) : (
              <Link
                href="/painel"
                className="rounded-full bg-[color:var(--gold)] px-3.5 py-1.5 text-[12.5px] font-medium text-white transition hover:bg-[color:var(--gold-2)]"
              >
                Publicar →
              </Link>
            )}
            <Link
              href="/painel"
              className="rounded-full bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[color:var(--ink)] transition hover:bg-[color:var(--paper-2)]"
            >
              ← Painel
            </Link>
          </div>
        </div>

        {!publicado && (
          <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center">
            <span className="rounded-full border border-white/15 bg-black/55 px-5 py-2 text-[11px] uppercase tracking-[0.22em] text-white/80 backdrop-blur">
              Prévia · Eventify
            </span>
          </div>
        )}

        <AiSiteFrame html={evento.siteHtml} titulo={evento.nome} />
      </main>
    );
  }

  // FALLBACK — template baseado em PROMO_VISUALS (legacy)
  const promoData = buildPromoData(evento);
  const visual = PROMO_VISUALS[getTemplateId(evento) as TemplateId] || PROMO_VISUALS.festa;
  const publicado = isPublishedStatus(evento.status);
  const highlights = promoData.highlights?.length
    ? promoData.highlights
    : [promoData.cidade || "Local do evento", promoData.dataFormatada, promoData.highlight];

  return (
    <main className={visual.page}>
      <BrandHeader />
      {!publicado && (
        <div className="sticky top-[68px] z-30 border-y border-[color:var(--gold)] bg-[var(--gold-soft)] px-5 py-3 text-center text-[12.5px] text-[color:var(--gold-2)]">
          Prévia Eventify · este site ainda não está publicado. Publique no painel para liberar o link final e remover a marca d&apos;água.
        </div>
      )}

      <section className={visual.hero}>
        <div className="space-y-7">
          <span className={visual.kicker}>
            {visual.label} · {promoData.label}
          </span>
          <h1 className={visual.title}>{promoData.title}</h1>
          <p className={`${visual.muted} max-w-3xl text-[19px] leading-[1.6]`}>{promoData.subtitle}</p>
          <p className={`${visual.muted} max-w-3xl leading-[1.7]`}>{promoData.description}</p>
          <div className="flex flex-wrap gap-4">
            <Link href={`/cliente/${slug}`} className={visual.button}>
              {promoData.buttonText} →
            </Link>
          </div>
        </div>

        <div className={`${visual.card} p-8`}>
          <p className={`${visual.muted} text-[11px] uppercase tracking-[0.22em]`}>Site gerado</p>
          <p className="mt-4 font-display text-[32px] font-light leading-tight tracking-[-0.01em]">
            {promoData.highlight}
          </p>
          <div className="mt-7 grid gap-3 text-[14px]">
            <p className={`${visual.muted} rounded-[10px] bg-white/60 px-4 py-3`}>
              Data: {promoData.dataFormatada}
            </p>
            <p className={`${visual.muted} rounded-[10px] bg-white/60 px-4 py-3`}>
              Cidade: {promoData.cidade || "A confirmar"}
            </p>
            <p className={`${visual.muted} rounded-[10px] bg-white/60 px-4 py-3`}>
              Template: {promoData.label}
            </p>
          </div>
        </div>
      </section>

      <section className="eventify-section pt-4">
        <div className="grid gap-6 lg:grid-cols-3">
          {highlights.map((item, index) => (
            <article key={`${item}-${index}`} className={`${visual.card} p-8 text-center`}>
              <span className="font-display text-[48px] font-light leading-none tracking-[-0.02em]">
                0{index + 1}
              </span>
              <h2 className="mt-5 font-display text-[22px] italic">{item}</h2>
            </article>
          ))}
        </div>
      </section>

      {qrCodeURL && (
        <section className="eventify-section pt-4">
          <div
            className={`${visual.card} mx-auto flex max-w-3xl flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeURL}
              alt="QR Code da página do cliente"
              className="h-36 w-36 rounded-[12px] border border-[color:var(--hairline)] bg-white p-2"
            />
            <div>
              <h2 className="font-display text-[28px] font-light tracking-[-0.01em]">
                QR Code <em className="italic text-[color:var(--gold)]">automático</em>
              </h2>
              <p className={`${visual.muted} mt-3`}>
                Use este código em convites, banners, recepção ou WhatsApp.
              </p>
              <p className={`${visual.muted} mt-2 break-all text-[13px] font-mono-tight`}>
                {linkCliente}
              </p>
              <ShareButtons url={linkCliente} titulo={`Convite: ${evento.nome}`} className="mt-4" />
            </div>
          </div>
        </section>
      )}

      <section className="eventify-section pt-4 text-center">
        <div className={`${visual.cta} mx-auto max-w-3xl`}>
          <h2 className="font-display text-[44px] font-light leading-none tracking-[-0.02em]">
            Pronto pra <em className="italic text-[color:var(--gold)]">confirmar?</em>
          </h2>
          <p className="mt-5 text-[16px] opacity-90">
            Abra a página do cliente e registre sua presença em segundos.
          </p>
          <Link
            href={`/cliente/${slug}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14.5px] font-medium text-[color:var(--ink)] transition hover:-translate-y-px"
          >
            Confirmar presença <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
