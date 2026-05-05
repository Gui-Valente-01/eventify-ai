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

      <section className="eventify-section pb-12 text-center">
        <span className="eventify-kicker animate-fade-up">
          <span className="inline-block h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
          Galeria de exemplos
        </span>
        <h1 className="eventify-title mt-6 text-5xl sm:text-6xl animate-fade-up animate-delay-1">
          Cinco mundos. <span className="text-gradient-aurora font-display italic">Um clique cada.</span>
        </h1>
        <p className="eventify-muted mx-auto mt-4 max-w-2xl text-xl animate-fade-up animate-delay-2">
          Cada exemplo é um site real, com layout, copy e cores escolhidos pela IA Claude para o tipo de evento.
        </p>
      </section>

      <section className="eventify-section pt-0">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_EVENTS.map((evento, i) => (
            <Link
              key={evento.slug}
              href={`/exemplos/${evento.slug}`}
              className={`group relative overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl animate-fade-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                style={{ background: evento.imagemBg }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              </div>

              <div className="relative flex min-h-[420px] flex-col justify-between p-7 text-white">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                    {evento.tipo}
                  </span>
                  <span className="text-4xl drop-shadow-2xl">{evento.emoji}</span>
                </div>

                <div>
                  <h3 className="text-3xl font-black drop-shadow-lg sm:text-4xl">
                    {evento.siteGerado?.heroTitle}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/90 drop-shadow line-clamp-2">
                    {evento.destaque}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-white/30 pt-5">
                    <div className="text-xs">
                      <p className="font-bold uppercase tracking-wider text-white/80">Cidade</p>
                      <p className="mt-1 font-black">{evento.endereco?.cidade}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#090814] shadow-lg transition group-hover:translate-x-1">
                      Ver ao vivo →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="eventify-section pt-0">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0b3a] via-[#3a0e6e] to-[#7a1aab] p-12 text-center text-white shadow-2xl">
          <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-fuchsia-500/40 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-amber-400/40 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />

          <div className="relative">
            <h2 className="text-4xl font-black sm:text-5xl">Gostou? Faça o seu agora.</h2>
            <p className="mx-auto mt-5 max-w-xl text-white/90">
              Mesmo nível de polish, com seus dados, em minutos. A IA escreve, você aprova.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/cadastro" className="inline-flex min-h-12 items-center rounded-xl bg-white px-7 text-base font-black text-[#090814] shadow-xl transition hover:scale-105">
                Criar meu site →
              </Link>
              <Link href="/precos" className="inline-flex min-h-12 items-center rounded-xl border border-white/30 bg-white/10 px-7 font-black backdrop-blur transition hover:bg-white/20">
                Ver planos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
