"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import AiSiteFrame from "@/components/AiSiteFrame";
import BrandHeader from "@/components/BrandHeader";
import ShareButtons from "@/components/ShareButtons";
import { useEventoPublico } from "@/hooks/useEventoPublico";
import { buildPromoData } from "@/lib/promotionalTemplates";
import { getTemplateId } from "@/lib/utils";
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
        <div className="eventify-section text-center eventify-muted">Carregando site promocional...</div>
      </main>
    );
  }

  if (!evento) {
    return (
      <main className="eventify-page">
        <BrandHeader />
        <section className="eventify-section flex justify-center">
          <div className="eventify-card max-w-xl p-10 text-center">
            <span className="eventify-kicker">Site promocional</span>
            <h1 className="eventify-title mt-5 text-4xl">Site não encontrado</h1>
            <p className="eventify-muted mt-3">Confira se o link está correto.</p>
            <Link href="/" className="eventify-button eventify-button-ghost mt-7">
              Voltar
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // Modo IA: site customizado gerado pelo Claude
  if (evento.siteHtml) {
    return (
      <main className="min-h-screen bg-black">
        <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-gradient-to-r from-[#1a0b3a] via-[#3a0e6e] to-[#7a1aab] px-4 py-2.5 text-white">
          <span className="text-xs font-bold sm:text-sm">
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Site gerado pela IA Claude
          </span>
          <div className="flex items-center gap-2">
            <Link href={`/cliente/${slug}`} className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur transition hover:bg-white/25">
              RSVP
            </Link>
            <Link href="/painel" className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#0a0414] transition hover:scale-105">
              ← Painel
            </Link>
          </div>
        </div>
        <AiSiteFrame html={evento.siteHtml} titulo={evento.nome} />
      </main>
    );
  }

  // Fallback: template-based
  const promoData = buildPromoData(evento);
  const visual = PROMO_VISUALS[getTemplateId(evento) as TemplateId] || PROMO_VISUALS.festa;
  const highlights = promoData.highlights?.length
    ? promoData.highlights
    : [promoData.cidade || "Local do evento", promoData.dataFormatada, promoData.highlight];

  return (
    <main className={visual.page}>
      <BrandHeader />

      <section className={visual.hero}>
        <div className="space-y-8">
          <span className={visual.kicker}>{visual.label} · {promoData.label}</span>
          <h1 className={visual.title}>{promoData.title}</h1>
          <p className={`${visual.muted} max-w-3xl text-xl leading-9`}>{promoData.subtitle}</p>
          <p className={`${visual.muted} max-w-3xl leading-8`}>{promoData.description}</p>
          <div className="flex flex-wrap gap-4">
            <Link href={`/cliente/${slug}`} className={visual.button}>
              {promoData.buttonText} →
            </Link>
          </div>
        </div>

        <div className={`${visual.card} p-8`}>
          <p className={`${visual.muted} text-sm font-black uppercase tracking-[0.2em]`}>Site gerado</p>
          <p className="mt-4 text-3xl font-black">{promoData.highlight}</p>
          <div className="mt-8 grid gap-3">
            <p className={`${visual.muted} rounded-xl bg-white/60 p-4`}>Data: {promoData.dataFormatada}</p>
            <p className={`${visual.muted} rounded-xl bg-white/60 p-4`}>Cidade: {promoData.cidade || "A confirmar"}</p>
            <p className={`${visual.muted} rounded-xl bg-white/60 p-4`}>Template: {promoData.label}</p>
          </div>
        </div>
      </section>

      <section className="eventify-section pt-4">
        <div className="grid gap-7 lg:grid-cols-3">
          {highlights.map((item, index) => (
            <article key={`${item}-${index}`} className={`${visual.card} p-8 text-center`}>
              <span className="text-5xl font-black">0{index + 1}</span>
              <h2 className="mt-6 text-xl font-black">{item}</h2>
            </article>
          ))}
        </div>
      </section>

      {qrCodeURL && (
        <section className="eventify-section pt-4">
          <div className={`${visual.card} mx-auto flex max-w-3xl flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left`}>
            <img src={qrCodeURL} alt="QR Code da página do cliente" className="h-36 w-36 rounded-xl border border-[#e8e3f1] bg-white p-2" />
            <div>
              <h2 className="text-3xl font-black">QR Code automático</h2>
              <p className={`${visual.muted} mt-3`}>Use este código em convites, banners, recepção ou WhatsApp.</p>
              <p className={`${visual.muted} mt-2 break-all text-sm`}>{linkCliente}</p>
              <ShareButtons url={linkCliente} titulo={`Convite: ${evento.nome}`} className="mt-4" />
            </div>
          </div>
        </section>
      )}

      <section className="eventify-section pt-4 text-center">
        <div className={`${visual.cta} mx-auto max-w-3xl`}>
          <h2 className="text-5xl font-black">Pronto para confirmar?</h2>
          <p className="mt-5 text-lg opacity-90">Abra a página do cliente e registre sua presença.</p>
          <Link href={`/cliente/${slug}`} className="mt-9 inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-8 font-black text-[#090814]">
            Confirmar presença →
          </Link>
        </div>
      </section>
    </main>
  );
}
