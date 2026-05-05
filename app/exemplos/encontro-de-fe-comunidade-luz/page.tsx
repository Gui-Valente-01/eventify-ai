import Link from "next/link";
import type { Metadata } from "next";
import DomainBar from "@/components/DomainBar";

export const metadata: Metadata = {
  title: "Encontro de Fé · Comunidade Luz — 1º de dezembro",
  description: "Um momento de comunhão, gratidão e renovação em Salvador.",
};

const programacao = {
  manha: [
    { hora: "08h00", titulo: "Acolhida e café", desc: "Recepção com chá, café e pão caseiro" },
    { hora: "09h00", titulo: "Oração inicial", desc: "Coral da comunidade conduzindo o louvor" },
    { hora: "10h00", titulo: "Mensagem da Pastora Cláudia", desc: "Tema: 'Recomeçar com gratidão'" },
    { hora: "11h00", titulo: "Roda de partilha", desc: "Pequenos grupos compartilham testemunhos" },
  ],
  tarde: [
    { hora: "12h30", titulo: "Almoço comunitário", desc: "Cada família traz um prato. Mesa farta." },
    { hora: "14h00", titulo: "Oficina infantil", desc: "Atividades para crianças de 4 a 12 anos" },
    { hora: "14h30", titulo: "Painel: Família e fé hoje", desc: "Com Pe. Antonio e Diaconisa Helena" },
    { hora: "16h00", titulo: "Momento de oração silenciosa", desc: "Capela aberta para meditação individual" },
  ],
  noite: [
    { hora: "17h00", titulo: "Celebração de encerramento", desc: "Bênção final com toda a comunidade" },
    { hora: "18h00", titulo: "Cantata do coral", desc: "Repertório especial preparado para o dia" },
    { hora: "19h00", titulo: "Despedida com bênção", desc: "Confraternização e abraços de paz" },
  ],
};

const ministerios = [
  { nome: "Coral Vozes da Luz", lider: "Maria Helena", icon: "🎵", desc: "Conduz os momentos de louvor" },
  { nome: "Acolhida & Hospitalidade", lider: "Família Sousa", icon: "🤝", desc: "Recepciona cada visitante" },
  { nome: "Pastoral da Criança", lider: "Diaconisa Cláudia", icon: "🌱", desc: "Cuida dos pequeninos" },
  { nome: "Pastoral Familiar", lider: "Casal Cardoso", icon: "🏡", desc: "Apoia famílias em sua caminhada" },
];

const lideres = [
  { nome: "Pastora Cláudia Albuquerque", papel: "Liderança principal", iniciais: "CA" },
  { nome: "Padre Antonio Vargas", papel: "Convidado especial", iniciais: "AV" },
  { nome: "Diaconisa Helena Reis", papel: "Pastoral familiar", iniciais: "HR" },
];

export default function ReligiosoPage() {
  return (
    <main className="min-h-screen bg-[#f5ebe0] text-[#1f3a2e]">
      <DomainBar domain="comunidadeluz.com.br" />

      {/* HERO COM VERSÍCULO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#e9efe2] via-[#f5ebe0] to-[#f5ebe0]" />
          <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl animate-float-slow" style={{ animationDelay: "3s" }} />
        </div>

        <div className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7f9f7f]/30 bg-white/60 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-[#3a5a40] backdrop-blur animate-fade-up">
            ✦ comunidade luz · salvador ✦
          </div>

          <h1 className="font-display mt-12 text-5xl leading-[1.1] tracking-tight text-[#1f3a2e] sm:text-7xl lg:text-8xl animate-fade-up animate-delay-1">
            Encontro <br />
            <span className="italic text-[#5d8a5e]">de Fé</span>
          </h1>

          <div className="mt-12 max-w-2xl animate-fade-up animate-delay-2">
            <div className="text-3xl text-[#c97d5c]">"</div>
            <p className="font-display text-2xl italic leading-relaxed text-[#3a5a40] sm:text-3xl">
              Vinde a mim, todos vós que estais cansados e oprimidos,<br />
              e eu vos aliviarei.
            </p>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-[#7f9f7f]">— Mateus 11:28</p>
          </div>

          <div className="mt-12 flex items-center gap-6 text-sm font-bold uppercase tracking-[0.25em] text-[#3a5a40] animate-fade-up animate-delay-3">
            <span>1 · DEZ · 2026</span>
            <span className="h-px w-8 bg-[#c97d5c]" />
            <span>SALVADOR · BA</span>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3 animate-fade-up animate-delay-4">
            <a href="#confirmar" className="inline-flex min-h-12 items-center rounded-full bg-[#3a5a40] px-8 text-sm font-bold tracking-wider text-[#f5ebe0] shadow-lg transition hover:bg-[#2c4a32]">
              Confirmar presença
            </a>
            <a href="#programacao" className="inline-flex min-h-12 items-center rounded-full border border-[#3a5a40]/30 bg-white/70 px-8 text-sm font-bold tracking-wider text-[#3a5a40] backdrop-blur transition hover:bg-white">
              Ver programação
            </a>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="bg-white/70 py-24 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-14 lg:grid-cols-[0.4fr_0.6fr]">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#c97d5c]">— Sobre o encontro —</p>
              <h2 className="font-display mt-6 text-4xl leading-tight text-[#1f3a2e] sm:text-5xl">
                Um dia para <br />
                <span className="italic text-[#5d8a5e]">respirar fundo</span>
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-[#3a5a40]">
              <p>
                Há quinze anos a Comunidade Luz se reúne no primeiro fim de semana de
                dezembro para celebrar o ano que passa e renovar as forças para o
                próximo. Este é o nosso encontro mais importante.
              </p>
              <p>
                Vai ter mensagem, música, partilha e — claro — comida boa. Vem com
                a família. Tem espaço para os pequeninos. Tem espaço para você
                também.
              </p>
              <p className="border-l-4 border-[#c97d5c] pl-5 font-display italic text-[#1f3a2e]">
                "Sua presença ilumina nosso encontro."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMAÇÃO */}
      <section id="programacao" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#c97d5c]">— Programação completa —</p>
            <h2 className="font-display mt-6 text-4xl leading-tight text-[#1f3a2e] sm:text-5xl">
              Manhã, tarde e noite <br />
              <span className="italic text-[#5d8a5e]">de mãos dadas</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              { nome: "Manhã", icon: "☀️", lista: programacao.manha, cor: "from-amber-100 to-amber-50" },
              { nome: "Tarde", icon: "🌿", lista: programacao.tarde, cor: "from-emerald-100 to-emerald-50" },
              { nome: "Noite", icon: "✨", lista: programacao.noite, cor: "from-rose-100 to-rose-50" },
            ].map((bloco) => (
              <div key={bloco.nome} className={`rounded-3xl bg-gradient-to-br ${bloco.cor} p-7 shadow-lg`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{bloco.icon}</span>
                  <h3 className="font-display text-3xl italic text-[#1f3a2e]">{bloco.nome}</h3>
                </div>
                <div className="mt-6 space-y-4">
                  {bloco.lista.map((item) => (
                    <div key={item.titulo} className="border-l-2 border-[#c97d5c]/40 pl-4">
                      <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#c97d5c]">{item.hora}</p>
                      <p className="mt-1 font-bold text-[#1f3a2e]">{item.titulo}</p>
                      <p className="mt-1 text-sm text-[#3a5a40]/80">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUEM CONDUZ */}
      <section className="bg-[#1f3a2e] py-24 text-[#f5ebe0]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#c97d5c]">— Quem conduz —</p>
            <h2 className="font-display mt-6 text-4xl leading-tight sm:text-5xl">
              Liderança que <br />
              <span className="italic text-[#a8d4a8]">caminha junto</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {lideres.map((l) => (
              <article key={l.nome} className="text-center">
                <div className="relative mx-auto h-32 w-32">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#a8d4a8]/30 to-[#c97d5c]/20 backdrop-blur" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-4xl italic text-[#a8d4a8]">{l.iniciais}</span>
                  </div>
                </div>
                <h3 className="font-display mt-6 text-2xl italic">{l.nome}</h3>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-[#a8d4a8]">{l.papel}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MINISTÉRIOS */}
      <section className="bg-white/70 py-24 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#c97d5c]">— Nossos ministérios —</p>
            <h2 className="font-display mt-6 text-4xl leading-tight text-[#1f3a2e] sm:text-5xl">
              Quem faz o <span className="italic text-[#5d8a5e]">encontro acontecer</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {ministerios.map((m) => (
              <article key={m.nome} className="flex items-start gap-5 rounded-2xl border border-[#7f9f7f]/20 bg-white p-6 shadow-sm transition hover:border-[#7f9f7f] hover:shadow-md">
                <span className="text-4xl">{m.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-[#1f3a2e]">{m.nome}</h3>
                  <p className="mt-1 text-sm font-bold text-[#c97d5c]">{m.lider}</p>
                  <p className="mt-2 text-sm leading-6 text-[#3a5a40]">{m.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* COMO CHEGAR */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 lg:grid-cols-[0.6fr_0.4fr] lg:items-center">
            <div className="overflow-hidden rounded-3xl border border-[#7f9f7f]/30 shadow-xl">
              <iframe
                src="https://www.google.com/maps?q=Centro+de+Convivencia+Vila+Esperanca+Salvador+BA&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#c97d5c]">— Como chegar —</p>
              <h2 className="font-display mt-6 text-4xl italic text-[#1f3a2e]">
                Centro de <br />Convivência
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#3a5a40]">
                Vila Esperança, 45<br />
                Salvador · Bahia<br />
                CEP 40020-000
              </p>
              <p className="mt-6 text-sm leading-6 text-[#3a5a40]/80">
                Estacionamento gratuito · Acessível para cadeirantes ·
                Próximo ao terminal de ônibus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONFIRMAR PRESENÇA */}
      <section id="confirmar" className="bg-gradient-to-br from-[#e9efe2] via-[#f5ebe0] to-[#fdf2e9] py-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-3xl border border-[#7f9f7f]/30 bg-white/80 p-10 shadow-xl backdrop-blur">
            <div className="text-center">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#c97d5c]">— Confirme —</p>
              <h2 className="font-display mt-6 text-4xl italic text-[#1f3a2e]">
                Você vem celebrar?
              </h2>
              <p className="mt-4 text-[#3a5a40]/80">
                Pra ajudar a planejar o almoço, confirme até 25 de novembro.
              </p>
            </div>

            <form className="mt-10 grid gap-4">
              <input type="text" placeholder="Seu nome" className="h-14 w-full rounded-full border border-[#7f9f7f]/30 bg-white px-5 text-[#1f3a2e] outline-none transition focus:border-[#5d8a5e] focus:ring-4 focus:ring-[#a8d4a8]/30" />
              <input type="text" placeholder="Família ou comunidade" className="h-14 w-full rounded-full border border-[#7f9f7f]/30 bg-white px-5 text-[#1f3a2e] outline-none transition focus:border-[#5d8a5e] focus:ring-4 focus:ring-[#a8d4a8]/30" />
              <input type="number" placeholder="Quantas pessoas (incluindo você)" className="h-14 w-full rounded-full border border-[#7f9f7f]/30 bg-white px-5 text-[#1f3a2e] outline-none transition focus:border-[#5d8a5e] focus:ring-4 focus:ring-[#a8d4a8]/30" />
              <textarea placeholder="O que você vai trazer para o almoço comunitário?" rows={3} className="w-full rounded-3xl border border-[#7f9f7f]/30 bg-white p-5 text-[#1f3a2e] outline-none transition focus:border-[#5d8a5e] focus:ring-4 focus:ring-[#a8d4a8]/30" />
              <button type="button" className="mt-4 inline-flex min-h-14 items-center justify-center rounded-full bg-[#3a5a40] px-8 text-sm font-bold uppercase tracking-[0.2em] text-[#f5ebe0] shadow-lg transition hover:bg-[#2c4a32]">
                Confirmar com gratidão ✦
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* MENSAGEM FINAL */}
      <section className="bg-[#1f3a2e] py-20 text-center text-[#f5ebe0]">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-5xl text-[#c97d5c]">"</div>
          <p className="font-display mt-4 text-3xl italic leading-relaxed sm:text-4xl">
            Onde dois ou três estiverem reunidos em meu nome,
            ali estarei no meio deles.
          </p>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-[#a8d4a8]">— Mateus 18:20</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#7f9f7f]/20 bg-[#f5ebe0] py-14 text-center">
        <p className="font-display text-3xl italic text-[#3a5a40]">Comunidade Luz</p>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-[#7f9f7f]">
          Salvador · Bahia · desde 2010
        </p>
        <p className="mt-8 text-sm text-[#3a5a40]/70">
          comunidadeluz.com.br · Site criado com{" "}
          <Link href="/" className="font-bold text-[#5d8a5e] hover:underline">Eventify AI</Link>
        </p>
      </footer>
    </main>
  );
}
