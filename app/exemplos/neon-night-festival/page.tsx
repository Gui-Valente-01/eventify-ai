import Link from "next/link";
import type { Metadata } from "next";
import DomainBar from "@/components/DomainBar";

export const metadata: Metadata = {
  title: "Neon Night Festival — 14 nov · Marina da Glória",
  description: "Festival eletrizante com lineup internacional na Marina da Glória, Rio de Janeiro.",
};

const lineup = [
  { dj: "PEGGY GOU", horario: "22h00 — 00h00", palco: "MAIN", destaque: true },
  { dj: "FRED AGAIN..", horario: "00h00 — 02h00", palco: "MAIN", destaque: true },
  { dj: "ANYMA", horario: "02h00 — 04h00", palco: "MAIN", destaque: true },
  { dj: "VINTAGE CULTURE", horario: "21h00 — 23h00", palco: "BEACH" },
  { dj: "ALOK", horario: "23h00 — 01h00", palco: "BEACH" },
  { dj: "LIU", horario: "01h00 — 03h00", palco: "BEACH" },
  { dj: "VHOOR", horario: "21h00 — 23h00", palco: "UNDERGROUND" },
  { dj: "ML / MILLOS", horario: "23h00 — 01h00", palco: "UNDERGROUND" },
];

const estrutura = [
  { icon: "🎧", titulo: "3 palcos", desc: "Main · Beach · Underground com sets independentes" },
  { icon: "🍹", titulo: "Bar premium", desc: "Open-bar opcional + 18 bares pagos espalhados" },
  { icon: "🌭", titulo: "Food trucks", desc: "12 food trucks rolando das 21h às 04h" },
  { icon: "🛡️", titulo: "Segurança 24/7", desc: "Equipe especializada e atendimento médico no local" },
];

const ingressos = [
  { tipo: "PISTA", preco: "R$ 280", inclui: ["Acesso aos 3 palcos", "Open de água até 02h"], cor: "from-fuchsia-500 to-pink-500" },
  { tipo: "VIP", preco: "R$ 580", inclui: ["Tudo da Pista", "Camarote elevado", "Open bar premium", "Banheiro exclusivo"], cor: "from-purple-500 to-indigo-500", destaque: true },
  { tipo: "BACKSTAGE", preco: "R$ 1.290", inclui: ["Tudo do VIP", "Acesso aos artistas", "Welcome drink", "Brinde exclusivo"], cor: "from-amber-400 to-rose-500" },
];

export default function FestaPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <DomainBar domain="neonnight.fest" theme="dark" />

      {/* HERO GLITCH */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0030] via-black to-[#3a0a4a]" />
          <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-fuchsia-600/40 blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/30 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-700/40 blur-3xl animate-float" style={{ animationDelay: "1s" }} />

          {/* Grid noir */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a0030_1px,transparent_1px),linear-gradient(to_bottom,#1a0030_1px,transparent_1px)] bg-[size:80px_80px] opacity-30" />

          {/* Scan lines */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)]" />
        </div>

        <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-20">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-1.5 backdrop-blur animate-fade-up">
              <span className="inline-block h-2 w-2 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300">
                14.NOV.26 · RJ · 20H AS 05H
              </span>
            </div>
          </div>

          <h1 className="mt-10 animate-fade-up animate-delay-1">
            <span
              className="block text-7xl font-black leading-[0.85] tracking-tighter sm:text-8xl lg:text-[12rem]"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #c084fc 60%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 40px rgba(236, 72, 153, 0.4))",
              }}
            >
              NEON
            </span>
            <span
              className="-mt-4 block text-7xl font-black italic leading-[0.85] tracking-tighter text-transparent sm:text-8xl lg:text-[12rem]"
              style={{
                WebkitTextStroke: "2px #00f5ff",
                filter: "drop-shadow(0 0 24px rgba(0, 245, 255, 0.5))",
              }}
            >
              NIGHT
            </span>
            <span className="mt-2 block font-mono text-xl font-bold tracking-[0.5em] text-fuchsia-300 sm:text-2xl">
              ◤ FESTIVAL ◢
            </span>
          </h1>

          <p className="mt-12 max-w-2xl text-xl leading-8 text-white/80 animate-fade-up animate-delay-2">
            8 DJs internacionais. 3 palcos. Marina da Glória. Uma noite só.
            <br />
            <span className="font-mono text-fuchsia-400">// PEGGY GOU. FRED AGAIN. ANYMA. ALOK. //</span>
          </p>

          <div className="mt-12 flex flex-wrap gap-4 animate-fade-up animate-delay-3">
            <a href="#ingressos" className="group relative inline-flex min-h-14 items-center overflow-hidden rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-600 px-10 text-base font-black uppercase tracking-wider text-white shadow-[0_0_40px_rgba(236,72,153,0.4)] transition hover:shadow-[0_0_60px_rgba(236,72,153,0.6)]">
              <span className="relative z-10">Comprar ingresso →</span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-fuchsia-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
            <a href="#lineup" className="inline-flex min-h-14 items-center rounded-full border-2 border-cyan-400/50 bg-cyan-400/5 px-10 text-base font-black uppercase tracking-wider text-cyan-300 backdrop-blur transition hover:bg-cyan-400/15">
              Ver lineup
            </a>
          </div>

          <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 sm:grid-cols-4 animate-fade-up animate-delay-5">
            {[
              { v: "08", l: "DJs internacionais" },
              { v: "03", l: "palcos paralelos" },
              { v: "09H", l: "non-stop" },
              { v: "12K", l: "vagas totais" },
            ].map((s) => (
              <div key={s.l} className="bg-black/80 p-6 backdrop-blur">
                <p className="font-mono text-4xl font-black text-fuchsia-300">{s.v}</p>
                <p className="mt-2 text-xs uppercase tracking-wider text-white/60">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LINEUP */}
      <section id="lineup" className="relative border-y border-fuchsia-500/20 bg-black py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">/// LINEUP COMPLETO</p>
              <h2 className="mt-4 text-5xl font-black uppercase tracking-tight sm:text-6xl">
                <span className="text-white">Quem vai </span>
                <span style={{ background: "linear-gradient(90deg, #ec4899, #00f5ff)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  destruir
                </span>
              </h2>
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-white/50">
              SOUNDCHECK 18H · PORTÕES 20H · PRIMEIRO BEAT 21H
            </p>
          </div>

          <div className="mt-12 space-y-2">
            {lineup.map((dj) => (
              <div key={dj.dj} className={`group flex items-center gap-6 rounded-2xl border-2 p-6 transition hover:border-fuchsia-500 hover:bg-fuchsia-500/5 ${dj.destaque ? "border-fuchsia-500/40 bg-gradient-to-r from-fuchsia-500/10 via-purple-500/5 to-transparent" : "border-white/10 bg-white/[0.02]"}`}>
                <div className="hidden font-mono text-sm font-bold tracking-wider text-cyan-400 sm:block sm:w-40">
                  {dj.horario}
                </div>
                <div className="flex-1">
                  <h3 className={`font-black tracking-tight ${dj.destaque ? "text-3xl text-white sm:text-5xl" : "text-2xl text-white/80 sm:text-3xl"}`}>
                    {dj.dj}
                  </h3>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-fuchsia-400 sm:hidden">
                    {dj.horario}
                  </p>
                </div>
                <div className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-wider ${dj.palco === "MAIN" ? "border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-300" : dj.palco === "BEACH" ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-300" : "border-amber-400/50 bg-amber-500/15 text-amber-300"}`}>
                  {dj.palco}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESTRUTURA */}
      <section className="relative bg-gradient-to-br from-black via-[#1a0030] to-black py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">/// ESTRUTURA</p>
            <h2 className="mt-4 text-5xl font-black uppercase tracking-tight sm:text-6xl">
              Vai ter <span className="italic text-fuchsia-400">tudo</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {estrutura.map((e, i) => (
              <article
                key={e.titulo}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur transition hover:border-fuchsia-500/50"
              >
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-fuchsia-500/30 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                <span className="text-5xl">{e.icon}</span>
                <h3 className="mt-6 text-xl font-black uppercase tracking-tight">{e.titulo}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{e.desc}</p>
                <p className="mt-5 font-mono text-xs uppercase tracking-wider text-fuchsia-400/70">/// 0{i + 1}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MAPA DO FESTIVAL */}
      <section className="bg-black py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">/// MAPA</p>
            <h2 className="mt-4 text-5xl font-black uppercase tracking-tight sm:text-6xl">
              Marina da <span className="text-cyan-400">Glória</span>
            </h2>
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl border border-white/10">
            <iframe
              src="https://www.google.com/maps?q=Marina+da+Gloria+Rio+de+Janeiro&output=embed"
              width="100%"
              height="420"
              style={{ border: 0, filter: "invert(0.9) hue-rotate(180deg) saturate(0.8)" }}
              loading="lazy"
            />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-fuchsia-400">// Endereço</p>
              <p className="mt-3 font-bold">Marina da Glória s/n</p>
              <p className="text-sm text-white/60">Aterro do Flamengo · RJ</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-cyan-400">// Como chegar</p>
              <p className="mt-3 font-bold">Metrô Glória · 5 min a pé</p>
              <p className="text-sm text-white/60">Estacionamento + Uber zone</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-amber-400">// Faixa etária</p>
              <p className="mt-3 font-bold">18+ · Documento obrigatório</p>
              <p className="text-sm text-white/60">Menor não entra, sem exceção</p>
            </div>
          </div>
        </div>
      </section>

      {/* INGRESSOS */}
      <section id="ingressos" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/30 via-black to-cyan-900/20" />
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">/// INGRESSOS</p>
            <h2 className="mt-4 text-5xl font-black uppercase tracking-tight sm:text-6xl">
              Garante <span className="text-fuchsia-400 italic">teu rolê</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl font-mono text-xs uppercase tracking-wider text-white/60">
              Lote 2 disponível // próximo lote sobe 30%
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {ingressos.map((i) => (
              <article
                key={i.tipo}
                className={`group relative overflow-hidden rounded-3xl border-2 bg-black/60 p-8 backdrop-blur transition hover:scale-[1.02] ${
                  i.destaque ? "border-fuchsia-500/60 ring-2 ring-fuchsia-500/20" : "border-white/10 hover:border-cyan-500/40"
                }`}
              >
                {i.destaque && (
                  <span className="absolute -top-3 left-8 rounded-full bg-fuchsia-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                    Mais vendido
                  </span>
                )}
                <p className={`inline-block rounded-md bg-gradient-to-r ${i.cor} bg-clip-text px-0 font-mono text-sm font-black uppercase tracking-[0.3em] text-transparent`}>
                  {i.tipo}
                </p>
                <p className="mt-6 text-5xl font-black tracking-tight text-white">{i.preco}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-wider text-white/50">+ taxas</p>

                <ul className="mt-8 space-y-3 border-t border-white/10 pt-6">
                  {i.inclui.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-white/85">
                      <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-fuchsia-500/20 font-black text-fuchsia-300">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <button type="button" className={`mt-8 inline-flex w-full min-h-12 items-center justify-center rounded-full bg-gradient-to-r ${i.cor} px-6 text-sm font-black uppercase tracking-wider text-white shadow-xl transition group-hover:shadow-2xl`}>
                  Comprar →
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-fuchsia-500/20 bg-black py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-cyan-400">/// 2026.11.14 ///</p>
          <p
            className="mt-4 text-5xl font-black uppercase tracking-tighter sm:text-6xl"
            style={{
              background: "linear-gradient(90deg, #ec4899, #c084fc, #00f5ff)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            NEON NIGHT
          </p>
          <div className="mt-8 flex justify-center gap-6 text-xs uppercase tracking-wider text-white/50">
            <a href="#" className="transition hover:text-fuchsia-400">Instagram</a>
            <a href="#" className="transition hover:text-fuchsia-400">TikTok</a>
            <a href="#" className="transition hover:text-fuchsia-400">SoundCloud</a>
            <a href="#" className="transition hover:text-fuchsia-400">Spotify</a>
          </div>
          <p className="mt-10 text-xs text-white/40">
            neonnight.fest · Site criado com{" "}
            <Link href="/" className="font-bold text-fuchsia-400 hover:underline">Eventify AI</Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
