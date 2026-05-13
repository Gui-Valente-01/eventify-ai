import Link from "next/link";
import type { Metadata } from "next";
import BrandHeader from "@/components/BrandHeader";
import { SAMPLE_EVENTS } from "@/lib/sampleEvents";

export const metadata: Metadata = {
  title: "Exemplos de sites — Casamento, Festa, Corporativo e mais",
  description:
    "Veja sites reais gerados pela IA para casamentos, aniversários, eventos corporativos, festas e celebrações religiosas.",
};

export default function ExemplosPage() {
  return (
    <main className="eventify-page">
      <BrandHeader />

      <section className="editorial-wrap py-24 text-center sm:py-32">
        <span className="eventify-kicker">Galeria de exemplos</span>
        <h1 className="eventify-title mx-auto mt-7 max-w-[18ch] text-[clamp(48px,6.4vw,88px)]">
          Cinco mundos. <em>Um clique cada.</em>
        </h1>
        <p className="mx-auto mt-7 max-w-[58ch] text-[18px] leading-[1.55] text-[color:var(--muted)]">
          Cada exemplo é um site real, com layout, copy e cores escolhidos pela IA para o tipo de evento.
        </p>
      </section>

      <section className="editorial-wrap pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_EVENTS.map((evento) => (
            <Link
              key={evento.slug}
              href={`/exemplos/${evento.slug}`}
              className="group relative overflow-hidden rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] transition-all hover:-translate-y-1 hover:border-[color:var(--hairline-2)] hover:shadow-[0_30px_50px_-30px_rgba(40,30,10,0.18)]"
            >
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                style={{ background: evento.imagemBg }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              </div>

              <div className="relative flex min-h-[420px] flex-col justify-between p-7 text-white">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10.5px] uppercase tracking-[0.18em] backdrop-blur-md">
                    {evento.tipo}
                  </span>
                  <span className="font-display text-[28px] italic text-[color:var(--gold)] drop-shadow-md">
                    {evento.emoji}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-[34px] font-light leading-[1.02] tracking-[-0.02em] drop-shadow sm:text-[38px]">
                    {evento.siteGerado?.heroTitle}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-[14px] leading-[1.55] text-white/85 drop-shadow">
                    {evento.destaque}
                  </p>
                  <div className="mt-7 flex items-center justify-between border-t border-white/25 pt-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/65">Cidade</p>
                      <p className="mt-1 font-display text-[16px] italic">{evento.endereco?.cidade}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[12px] font-medium text-[color:var(--ink)] transition-transform group-hover:translate-x-1">
                      Ver ao vivo <span aria-hidden>→</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="editorial-wrap pb-24">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[18px] bg-[color:var(--ink)] p-12 text-center text-white sm:p-16">
          <span className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
            Gostou?
          </span>
          <h2 className="mx-auto mt-5 max-w-[20ch] font-display text-[clamp(36px,4.8vw,60px)] font-light leading-[1.02] tracking-[-0.02em]">
            Faça o <em className="italic text-[color:var(--gold)]">seu agora.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-[44ch] text-[16px] text-white/65">
            Mesmo nível de polish, com seus dados, em minutos. A IA escreve, você aprova.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14.5px] font-medium text-[color:var(--ink)] transition-transform hover:-translate-y-px"
            >
              Criar meu site <span aria-hidden>→</span>
            </Link>
            <Link
              href="/precos"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-transparent px-6 py-3.5 text-[14.5px] text-white transition-colors hover:bg-white/5"
            >
              Ver planos
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
