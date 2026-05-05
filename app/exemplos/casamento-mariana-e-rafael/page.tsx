import Link from "next/link";
import type { Metadata } from "next";
import DomainBar from "@/components/DomainBar";

export const metadata: Metadata = {
  title: "Mariana & Rafael — 15 de agosto de 2026",
  description: "Site oficial do casamento de Mariana e Rafael em Curitiba.",
};

const padrinhos = [
  { nome: "Júlia & Caio", papel: "Madrinha & Padrinho", iniciais: "JC" },
  { nome: "Leandro & Sofia", papel: "Padrinho & Madrinha", iniciais: "LS" },
  { nome: "Helena & Tiago", papel: "Madrinha & Padrinho", iniciais: "HT" },
  { nome: "Camila & Otávio", papel: "Madrinha & Padrinho", iniciais: "CO" },
  { nome: "Ana & Pedro", papel: "Madrinha & Padrinho", iniciais: "AP" },
  { nome: "Fernanda & Bruno", papel: "Madrinha & Padrinho", iniciais: "FB" },
];

const historia = [
  { ano: "2019", titulo: "Onde tudo começou", texto: "Um café em Curitiba que virou tarde inteira. Cinco anos depois, ainda estamos conversando." },
  { ano: "2021", titulo: "Primeira viagem", texto: "Florianópolis. Ele perdeu o voo de volta. Ela ficou. O resto é um tipo bonito de história." },
  { ano: "2024", titulo: "O pedido", texto: "Numa trilha em Morretes, com chuva fina, anel quase caindo no rio. Mas ficou." },
  { ano: "2026", titulo: "O sim oficial", texto: "Vinhedo Bella Vista. Pôr do sol. Vocês com a gente." },
];

const presentes = [
  { nome: "Cota Lua de mel", emoji: "✈️", desc: "Bali · 14 dias", link: "#" },
  { nome: "Lista Casas Bahia", emoji: "🏡", desc: "Eletrodomésticos", link: "#" },
  { nome: "Lista Amazon", emoji: "📦", desc: "Itens de cozinha", link: "#" },
  { nome: "Pix carinho", emoji: "💝", desc: "Chave: marierafa@pix", link: "#" },
];

const mensagens = [
  { autor: "Tia Lúcia", texto: "Vocês foram feitos um para o outro. Que essa história continue linda como começou." },
  { autor: "João, padrinho", texto: "Lembro do dia que o Rafa me ligou: 'cara, é ela'. Acertou na primeira." },
  { autor: "Mariana e Rafael", texto: "Obrigada por fazerem parte do nosso começo. Sua presença é o presente." },
];

export default function CasamentoPage() {
  return (
    <main className="min-h-screen bg-[#fdfaf6] text-[#2c1810]">
      <DomainBar domain="mariana-e-rafael.eventify.app" />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fbe9e7] via-[#fdfaf6] to-[#fff3d6]" />
          <div className="absolute top-1/4 -right-20 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 -left-32 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl animate-float-slow" style={{ animationDelay: "3s" }} />
        </div>

        <div className="mx-auto flex min-h-[88vh] max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.4em] text-[#b76e79] animate-fade-up">
            ◆ celebração matrimonial ◆
          </p>

          <h1 className="font-display mt-10 text-7xl italic leading-none text-[#2c1810] sm:text-9xl lg:text-[12rem] animate-fade-up animate-delay-1">
            Mariana
            <span className="my-1 block text-[#c9a961]">&</span>
            Rafael
          </h1>

          <div className="mt-12 flex items-center gap-6 text-sm font-bold uppercase tracking-[0.3em] text-[#5d3a25] animate-fade-up animate-delay-2">
            <span>15.08.26</span>
            <span className="h-px w-12 bg-[#c9a961]" />
            <span>Curitiba</span>
          </div>

          <p className="mx-auto mt-12 max-w-xl font-display text-2xl italic leading-relaxed text-[#5d3a25]/90 animate-fade-up animate-delay-3">
            "Que a festa do nosso amor seja apenas o começo de uma vida inteira de festa."
          </p>

          <div className="mt-14 flex flex-wrap justify-center gap-4 animate-fade-up animate-delay-4">
            <a href="#confirmar" className="inline-flex min-h-12 items-center rounded-none border-2 border-[#2c1810] bg-[#2c1810] px-8 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-transparent hover:text-[#2c1810]">
              Confirmar presença
            </a>
            <a href="#historia" className="inline-flex min-h-12 items-center rounded-none border-2 border-[#2c1810] bg-transparent px-8 text-sm font-black uppercase tracking-[0.2em] text-[#2c1810] transition hover:bg-[#2c1810] hover:text-white">
              Nossa história
            </a>
          </div>

          <div className="mt-20 animate-pulse text-2xl text-[#c9a961]">↓</div>
        </div>
      </section>

      {/* CONTAGEM REGRESSIVA */}
      <section className="border-y border-[#e8dfcc] bg-[#fdfaf6]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-16 md:grid-cols-4">
          {[
            { v: "100", l: "dias para o sim" },
            { v: "5", l: "anos juntos" },
            { v: "180", l: "convidados" },
            { v: "1", l: "amor único" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-display text-6xl text-[#c9a961]">{s.v}</p>
              <p className="mt-3 font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#5d3a25]">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NOSSA HISTÓRIA — TIMELINE */}
      <section id="historia" className="mx-auto max-w-5xl px-6 py-24">
        <div className="text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.4em] text-[#b76e79]">— Nossa história —</p>
          <h2 className="font-display mt-6 text-5xl italic text-[#2c1810] sm:text-6xl">
            Sete anos em quatro capítulos
          </h2>
        </div>

        <div className="relative mt-16 space-y-12 before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-gradient-to-b before:from-transparent before:via-[#c9a961] before:to-transparent md:before:block">
          {historia.map((h, i) => (
            <div key={h.ano} className={`grid gap-8 md:grid-cols-2 md:items-center ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div className={i % 2 === 0 ? "md:text-right" : ""}>
                <p className="font-display text-5xl italic text-[#c9a961]">{h.ano}</p>
                <h3 className="mt-4 text-2xl font-bold text-[#2c1810]">{h.titulo}</h3>
                <p className="mt-3 leading-7 text-[#5d3a25]">{h.texto}</p>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="absolute left-1/2 -translate-x-1/2 inline-flex h-4 w-4 rounded-full bg-[#c9a961] ring-8 ring-[#fdfaf6]" />
                <div className="hidden h-48 w-full max-w-xs rounded bg-gradient-to-br from-rose-100 via-amber-50 to-white shadow-[0_20px_60px_rgba(199,121,79,0.15)] md:block" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CERIMÔNIA & RECEPÇÃO */}
      <section className="bg-[#2c1810] py-24 text-[#fdfaf6]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.4em] text-[#c9a961]">— O grande dia —</p>
            <h2 className="font-display mt-6 text-5xl italic sm:text-6xl">
              Onde tudo acontece
            </h2>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-[#c9a961]/30 md:grid-cols-2">
            <div className="bg-[#2c1810] p-10">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#c9a961]">Cerimônia</p>
              <p className="font-display mt-6 text-5xl italic">17h00</p>
              <div className="mt-6 h-px w-16 bg-[#c9a961]" />
              <p className="mt-6 text-lg leading-8 text-[#fdfaf6]/80">
                Vinhedo Bella Vista<br />
                Estrada do Cerne, 320<br />
                Bairro Tijuca · Curitiba/PR
              </p>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-[#c9a961]/70">
                Estacionamento gratuito · Recepção a partir das 16h30
              </p>
            </div>

            <div className="bg-[#2c1810] p-10">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#c9a961]">Recepção</p>
              <p className="font-display mt-6 text-5xl italic">19h00</p>
              <div className="mt-6 h-px w-16 bg-[#c9a961]" />
              <p className="mt-6 text-lg leading-8 text-[#fdfaf6]/80">
                Mesmo local da cerimônia<br />
                Salão das Vinhas<br />
                Jantar harmonizado + DJ até 03h
              </p>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-[#c9a961]/70">
                Dress code: Black tie opcional
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <a href="https://www.google.com/maps?q=Vinhedo+Bella+Vista+Curitiba" target="_blank" className="rounded-none border-2 border-[#c9a961] bg-transparent px-7 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#c9a961] transition hover:bg-[#c9a961] hover:text-[#2c1810]">
              Ver no mapa
            </a>
            <button className="rounded-none border-2 border-[#fdfaf6] bg-transparent px-7 py-3 text-sm font-black uppercase tracking-[0.2em] text-[#fdfaf6] transition hover:bg-[#fdfaf6] hover:text-[#2c1810]">
              Adicionar à agenda
            </button>
          </div>
        </div>
      </section>

      {/* PADRINHOS */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.4em] text-[#b76e79]">— Padrinhos & Madrinhas —</p>
          <h2 className="font-display mt-6 text-5xl italic text-[#2c1810] sm:text-6xl">
            As pessoas que nos conduzem
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[#5d3a25]/80">
            Seis casais que ajudaram a escrever cada um dos nossos capítulos.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {padrinhos.map((p) => (
            <article key={p.nome} className="group text-center">
              <div className="relative mx-auto h-40 w-40">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-100 via-amber-50 to-white shadow-xl transition group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-5xl italic text-[#c9a961]">{p.iniciais}</span>
                </div>
              </div>
              <h3 className="mt-6 font-display text-2xl italic text-[#2c1810]">{p.nome}</h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-[#b76e79]">{p.papel}</p>
            </article>
          ))}
        </div>
      </section>

      {/* PRESENTES */}
      <section className="bg-gradient-to-br from-[#fbe9e7] via-[#fdfaf6] to-[#fff3d6] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.4em] text-[#b76e79]">— Lista de presentes —</p>
            <h2 className="font-display mt-6 text-5xl italic text-[#2c1810] sm:text-6xl">
              Sua presença é o presente
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[#5d3a25]/85">
              Mas se quiser nos ajudar a começar, deixamos algumas sugestões com muito carinho.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {presentes.map((p) => (
              <a key={p.nome} href={p.link} className="group block rounded-2xl border-2 border-[#c9a961]/30 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-[#c9a961] hover:shadow-xl">
                <span className="text-4xl">{p.emoji}</span>
                <h3 className="mt-4 font-display text-xl italic text-[#2c1810]">{p.nome}</h3>
                <p className="mt-2 text-sm text-[#5d3a25]/80">{p.desc}</p>
                <p className="mt-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#b76e79] transition group-hover:translate-x-1">Acessar →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CONFIRMAR PRESENÇA */}
      <section id="confirmar" className="mx-auto max-w-3xl px-6 py-24">
        <div className="rounded-[2rem] border-2 border-[#c9a961] bg-[#fdfaf6] p-10 shadow-[0_30px_80px_rgba(199,121,79,0.15)]">
          <p className="text-center font-mono text-xs font-bold uppercase tracking-[0.4em] text-[#b76e79]">— RSVP —</p>
          <h2 className="font-display mt-6 text-center text-4xl italic text-[#2c1810] sm:text-5xl">
            Você vem celebrar com a gente?
          </h2>
          <p className="mt-4 text-center text-[#5d3a25]/80">Confirme até 30 de junho de 2026.</p>

          <form className="mt-10 grid gap-4">
            <input type="text" placeholder="Seu nome completo" className="h-14 w-full rounded-none border-2 border-[#c9a961]/40 bg-white px-5 font-medium text-[#2c1810] outline-none transition focus:border-[#c9a961]" />
            <input type="email" placeholder="E-mail" className="h-14 w-full rounded-none border-2 border-[#c9a961]/40 bg-white px-5 font-medium text-[#2c1810] outline-none transition focus:border-[#c9a961]" />
            <select className="h-14 w-full rounded-none border-2 border-[#c9a961]/40 bg-white px-5 font-medium text-[#2c1810] outline-none transition focus:border-[#c9a961]">
              <option>Vou comparecer com prazer</option>
              <option>Vou levar acompanhante</option>
              <option>Não vou poder ir</option>
            </select>
            <textarea placeholder="Deixe um recado pra Mariana e Rafael" rows={3} className="w-full rounded-none border-2 border-[#c9a961]/40 bg-white p-5 font-medium text-[#2c1810] outline-none transition focus:border-[#c9a961]" />
            <button type="button" className="mt-4 inline-flex min-h-14 items-center justify-center rounded-none border-2 border-[#2c1810] bg-[#2c1810] px-8 text-sm font-black uppercase tracking-[0.3em] text-white transition hover:bg-transparent hover:text-[#2c1810]">
              Confirmar presença ◆
            </button>
          </form>
        </div>
      </section>

      {/* MURAL DE MENSAGENS */}
      <section className="border-y border-[#e8dfcc] bg-[#fdfaf6] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.4em] text-[#b76e79]">— Mural —</p>
            <h2 className="font-display mt-6 text-5xl italic text-[#2c1810] sm:text-6xl">Recados de quem ama</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {mensagens.map((m, i) => (
              <blockquote key={m.autor} className={`rounded-2xl bg-white p-7 shadow-lg ${i === 1 ? "md:-mt-6" : i === 2 ? "md:mt-6" : ""}`}>
                <p className="font-display text-lg italic leading-7 text-[#2c1810]">"{m.texto}"</p>
                <footer className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#b76e79]">— {m.autor}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#2c1810] py-16 text-center text-[#fdfaf6]/80">
        <p className="font-display text-3xl italic text-[#c9a961]">M & R</p>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em]">15.08.2026 · Curitiba/PR</p>
        <p className="mt-8 text-sm">
          mariana-e-rafael.eventify.app · Site criado com{" "}
          <Link href="/" className="font-bold text-[#c9a961] hover:underline">Eventify AI</Link>
        </p>
      </footer>
    </main>
  );
}
