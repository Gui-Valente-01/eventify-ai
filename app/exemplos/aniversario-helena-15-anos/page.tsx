import Link from "next/link";
import type { Metadata } from "next";
import DomainBar from "@/components/DomainBar";

export const metadata: Metadata = {
  title: "Helena 15 anos · 22 de setembro de 2026",
  description: "Festa de 15 anos da Helena em Belo Horizonte. Vem comemorar!",
};

const programacao = [
  { hora: "20h00", emoji: "🎀", titulo: "Recepção", desc: "Welcome drink e foto-cabine" },
  { hora: "21h00", emoji: "👑", titulo: "Entrada da Helena", desc: "A pista dos pais" },
  { hora: "21h30", emoji: "🍰", titulo: "Bolo & brinde", desc: "Cantar parabéns juntos" },
  { hora: "22h00", emoji: "🎧", titulo: "DJ entra na pista", desc: "Set funk + pop até 03h" },
  { hora: "00h00", emoji: "🌭", titulo: "Madruga food", desc: "Hot dog gourmet pra encarar" },
  { hora: "03h00", emoji: "✨", titulo: "Saideira", desc: "Foto coletiva e fim" },
];

const eras = [
  { idade: "5 anos", emoji: "🦄", desc: "Tudo era princesa" },
  { idade: "8 anos", emoji: "🎨", desc: "Fase pintora" },
  { idade: "11 anos", emoji: "📚", desc: "Lia até 2h da manhã" },
  { idade: "13 anos", emoji: "💃", desc: "Descobriu a dança" },
  { idade: "15 anos", emoji: "🌟", desc: "Pronta pra brilhar" },
];

const dressCode = [
  { titulo: "Para ela", look: "Vestido festa, salto baixo permitido", cor: "Tons de vinho, dourado, prata" },
  { titulo: "Para ele", look: "Camisa social ou polo + calça", cor: "Tons sóbrios, sapato limpo" },
  { titulo: "Tema noite", look: "Glitter, brilho, estrelas", cor: "Vai estar fluorescente, prepara!" },
];

export default function AniversarioPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffbeb] text-[#2d1b00]">
      <DomainBar domain="helena15.com.br" />

      {/* HERO COM 15 GIGANTE */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fef3c7] via-[#fde68a] to-[#fdba74] py-20">
        <div className="absolute inset-0 -z-10">
          {/* confetti dots */}
          <div className="absolute top-12 left-[10%] h-3 w-3 rounded-full bg-rose-500 animate-float-slow" />
          <div className="absolute top-32 right-[15%] h-4 w-4 rounded-full bg-purple-500 animate-float" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-60 left-[20%] h-2 w-2 rounded-full bg-emerald-500 animate-float-slow" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-20 right-[10%] h-5 w-5 rounded-full bg-orange-500 animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-40 left-[8%] h-3 w-3 rounded-full bg-blue-500 animate-float-slow" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 right-[25%] h-3 w-3 rounded-full bg-pink-500 animate-float" />
        </div>

        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#2d1b00] bg-white/90 px-5 py-2 text-sm font-black uppercase tracking-wider shadow-[6px_6px_0_#2d1b00] animate-fade-up">
            🎉 Salva a data!
          </div>

          <h1 className="relative mt-12 animate-fade-up animate-delay-1">
            <span className="block text-3xl font-black uppercase tracking-[0.2em] text-[#2d1b00] sm:text-4xl">A Helena chega aos</span>
            <span className="relative -mt-4 block text-[14rem] font-black leading-none text-transparent sm:text-[20rem] lg:text-[24rem]" style={{
              WebkitTextStroke: "4px #2d1b00",
              filter: "drop-shadow(8px 8px 0 #f97316) drop-shadow(16px 16px 0 #ec4899)",
            }}>
              15
            </span>
          </h1>

          <p className="mt-8 text-2xl font-black uppercase tracking-wider text-[#2d1b00] sm:text-3xl animate-fade-up animate-delay-2">
            22 · setembro · 2026
          </p>

          <div className="mt-4 inline-flex items-center gap-3 rounded-full bg-[#2d1b00] px-6 py-3 text-base font-bold text-[#fef3c7] animate-fade-up animate-delay-3">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
            Belo Horizonte · Espaço Sunset Hall
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-up animate-delay-4">
            <a href="#confirmar" className="inline-flex min-h-14 items-center rounded-full border-4 border-[#2d1b00] bg-[#2d1b00] px-8 text-base font-black uppercase text-[#fef3c7] shadow-[8px_8px_0_#f97316] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
              Eu vou! 🎉
            </a>
            <a href="#programacao" className="inline-flex min-h-14 items-center rounded-full border-4 border-[#2d1b00] bg-white px-8 text-base font-black uppercase text-[#2d1b00] shadow-[8px_8px_0_#ec4899] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
              Ver programação
            </a>
          </div>
        </div>
      </section>

      {/* SOBRE A HELENA - POLAROIDS */}
      <section className="bg-[#fffbeb] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <span className="inline-block rotate-[-2deg] rounded-full bg-pink-500 px-5 py-1 text-xs font-black uppercase tracking-wider text-white">
              ✦ minhas eras ✦
            </span>
            <h2 className="mt-8 text-5xl font-black uppercase text-[#2d1b00] sm:text-6xl lg:text-7xl">
              Quem é a <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Helena?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-[#5d3a00]">
              15 anos viraram 15 versões de mim. Aqui vai um spoiler.
            </p>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-6">
            {eras.map((e, i) => (
              <div
                key={e.idade}
                className={`relative w-44 rounded-sm border-2 border-[#2d1b00] bg-white p-3 shadow-xl transition hover:scale-110 hover:rotate-0 ${
                  i % 2 === 0 ? "rotate-[-4deg]" : "rotate-[4deg]"
                }`}
              >
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-amber-100 via-rose-100 to-orange-100 text-7xl">
                  {e.emoji}
                </div>
                <div className="mt-3 text-center">
                  <p className="font-black text-[#2d1b00]">{e.idade}</p>
                  <p className="mt-1 text-xs italic text-[#5d3a00]">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMAÇÃO */}
      <section id="programacao" className="bg-gradient-to-br from-[#2d1b00] via-[#451a03] to-[#1c0a00] py-24 text-[#fef3c7]">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#fef3c7] px-5 py-1 text-xs font-black uppercase tracking-wider text-[#2d1b00]">
              ⏰ programação ⏰
            </span>
            <h2 className="mt-8 text-5xl font-black uppercase sm:text-6xl">
              A noite vai ser <span className="text-orange-400">assim</span>
            </h2>
          </div>

          <div className="mt-16 space-y-3">
            {programacao.map((p, i) => (
              <div key={p.hora} className="group flex items-center gap-6 rounded-3xl border-2 border-[#fef3c7]/20 bg-[#fef3c7]/5 p-6 transition hover:border-orange-400 hover:bg-[#fef3c7]/10" style={{ marginLeft: `${i * 16}px` }}>
                <div className="flex-shrink-0 text-5xl">{p.emoji}</div>
                <div className="flex-shrink-0 font-mono text-2xl font-black text-orange-400 sm:text-3xl">
                  {p.hora}
                </div>
                <div className="flex-1">
                  <p className="text-xl font-black sm:text-2xl">{p.titulo}</p>
                  <p className="mt-1 text-sm text-[#fef3c7]/70">{p.desc}</p>
                </div>
                <div className="hidden text-2xl text-orange-400 transition group-hover:translate-x-1 sm:block">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DRESS CODE */}
      <section className="bg-gradient-to-br from-rose-200 via-pink-200 to-fuchsia-300 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <span className="inline-block rotate-[2deg] rounded-full bg-[#2d1b00] px-5 py-1 text-xs font-black uppercase tracking-wider text-white">
              💃 dress code 💃
            </span>
            <h2 className="mt-8 text-5xl font-black uppercase text-[#2d1b00] sm:text-6xl">
              Vem <span className="italic underline decoration-orange-500 decoration-8">arrasando</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {dressCode.map((d, i) => (
              <article
                key={d.titulo}
                className={`relative rounded-3xl border-2 border-[#2d1b00] bg-white p-7 shadow-[6px_6px_0_#2d1b00] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                  i === 1 ? "md:-mt-8" : ""
                }`}
              >
                <h3 className="text-3xl font-black uppercase text-[#2d1b00]">{d.titulo}</h3>
                <p className="mt-4 leading-7 text-[#5d3a00]">{d.look}</p>
                <p className="mt-4 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                  {d.cor}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LOCAL */}
      <section className="bg-[#fffbeb] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-block rounded-full bg-emerald-500 px-5 py-1 text-xs font-black uppercase tracking-wider text-white">
                📍 onde rola
              </span>
              <h2 className="mt-6 text-5xl font-black uppercase text-[#2d1b00] sm:text-6xl">
                Espaço <br /> Sunset Hall
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#5d3a00]">
                Av. Cristóvão Colombo, 180 · Funcionários, Belo Horizonte. <br />
                Estacionamento gratuito · Acessibilidade total · Espaço climatizado.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="https://www.google.com/maps?q=Sunset+Hall+BH" target="_blank" className="inline-flex items-center rounded-full border-2 border-[#2d1b00] bg-[#2d1b00] px-6 py-3 text-sm font-black uppercase text-white shadow-[5px_5px_0_#f97316] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                  Abrir no maps →
                </a>
                <a href="https://www.uber.com" target="_blank" className="inline-flex items-center rounded-full border-2 border-[#2d1b00] bg-white px-6 py-3 text-sm font-black uppercase text-[#2d1b00] shadow-[5px_5px_0_#ec4899] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                  Pedir Uber
                </a>
              </div>
            </div>

            <div className="relative aspect-square overflow-hidden rounded-[2rem] border-4 border-[#2d1b00] bg-gradient-to-br from-amber-200 via-orange-300 to-pink-300 shadow-[12px_12px_0_#2d1b00]">
              <div className="absolute inset-0 flex items-center justify-center text-9xl">🎉</div>
              <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-white/90 p-4 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-wider text-orange-600">Capacidade</p>
                <p className="mt-1 text-2xl font-black text-[#2d1b00]">200 pessoas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP */}
      <section id="confirmar" className="bg-gradient-to-br from-[#fde68a] via-[#fdba74] to-[#fb7185] py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-[2rem] border-4 border-[#2d1b00] bg-white p-10 shadow-[12px_12px_0_#2d1b00]">
            <div className="text-center">
              <span className="text-6xl">🎀</span>
              <h2 className="mt-4 text-5xl font-black uppercase text-[#2d1b00] sm:text-6xl">
                Você vai vir, né?
              </h2>
              <p className="mt-4 text-lg text-[#5d3a00]">Confirma até dia 10 de setembro pra ajudar a planejar.</p>
            </div>

            <form className="mt-10 grid gap-4">
              <input type="text" placeholder="Seu nome" className="h-14 w-full rounded-2xl border-2 border-[#2d1b00] bg-amber-50 px-5 font-bold text-[#2d1b00] outline-none transition focus:bg-white" />
              <input type="text" placeholder="Telefone (pra te chamar no zap)" className="h-14 w-full rounded-2xl border-2 border-[#2d1b00] bg-amber-50 px-5 font-bold text-[#2d1b00] outline-none transition focus:bg-white" />
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-[#2d1b00] bg-emerald-100 p-4 font-black uppercase text-[#2d1b00] transition hover:bg-emerald-200">
                  <input type="radio" name="presenca" className="accent-emerald-600" defaultChecked /> Sim 🎉
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-[#2d1b00] bg-amber-100 p-4 font-black uppercase text-[#2d1b00] transition hover:bg-amber-200">
                  <input type="radio" name="presenca" className="accent-amber-600" /> Talvez 🤔
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-[#2d1b00] bg-rose-100 p-4 font-black uppercase text-[#2d1b00] transition hover:bg-rose-200">
                  <input type="radio" name="presenca" className="accent-rose-600" /> Triste 😢
                </label>
              </div>
              <button type="button" className="mt-4 inline-flex min-h-14 items-center justify-center rounded-2xl border-4 border-[#2d1b00] bg-orange-500 px-8 text-lg font-black uppercase text-white shadow-[6px_6px_0_#2d1b00] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                Garantir minha vaga 🎀
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#2d1b00] py-16 text-center text-[#fef3c7]">
        <div className="text-7xl">🎀</div>
        <p className="mt-6 text-3xl font-black uppercase">Helena · 15 anos</p>
        <p className="mt-3 font-mono text-sm uppercase tracking-widest text-orange-400">22.09.2026 · BH</p>
        <p className="mt-8 text-sm text-[#fef3c7]/60">
          helena15.com.br · Site criado com{" "}
          <Link href="/" className="font-bold text-orange-400 hover:underline">Eventify AI</Link>
        </p>
      </footer>
    </main>
  );
}
