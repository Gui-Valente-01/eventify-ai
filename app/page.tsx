import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";

const features = [
  {
    title: "Briefing inteligente",
    text: "Wizard de 4 etapas com perguntas específicas pro seu tipo de evento. Casamento, aniversário, festa, corporativo ou religioso.",
    icon: "✎",
  },
  {
    title: "IA criando texto sob medida",
    text: "Não é template genérico. A IA escreve copy autoral baseado nos seus detalhes — história do casal, tema da festa, agenda corporativa.",
    icon: "✦",
  },
  {
    title: "Site completo, não landing rasa",
    text: "Hero, sobre, programação, mapa, RSVP, FAQ, lista de presentes. Site rico em conteúdo, não 3 seções batidas.",
    icon: "▣",
  },
  {
    title: "RSVP em tempo real",
    text: "Convidado abre no celular, confirma com 1 toque. Você vê tudo no painel com export CSV.",
    icon: "✓",
  },
  {
    title: "QR Code automático",
    text: "Pronto pra colar em convite, banner ou story do Instagram. Compartilhamento sem fricção.",
    icon: "◈",
  },
  {
    title: "Mapa integrado",
    text: "Google Maps embutido. Convidado clica e já abre no GPS. Endereço, dress code e tudo no mesmo lugar.",
    icon: "◉",
  },
];

const tipos = [
  {
    titulo: "Casamentos",
    desc: "Convite editorial. Timeline da história do casal, lista de presentes/PIX, hospedagem, padrinhos.",
    grad: "from-rose-100 via-pink-50 to-amber-50",
    icon: "♡",
  },
  {
    titulo: "Aniversários",
    desc: "Tema vibrante. Mensagem do aniversariante, programação, dress code, lista de presentes.",
    grad: "from-amber-100 via-orange-50 to-rose-100",
    icon: "♕",
  },
  {
    titulo: "Corporativos",
    desc: "Site profissional. Agenda hora-a-hora, palestrantes, patrocinadores, link de inscrição.",
    grad: "from-slate-100 via-zinc-50 to-blue-50",
    icon: "▣",
  },
  {
    titulo: "Festas e shows",
    desc: "Visual noturno. Line-up por horário, ingressos por lote, regras, idade mínima.",
    grad: "from-violet-100 via-fuchsia-50 to-pink-100",
    icon: "✦",
  },
  {
    titulo: "Religiosos",
    desc: "Sereno e acolhedor. Liturgia, versículo central, padrinhos, recepção.",
    grad: "from-emerald-50 via-lime-50 to-white",
    icon: "✓",
  },
];

const passos = [
  { n: "01", titulo: "Descreva seu evento", desc: "Wizard guiado de 4 etapas. Nome, local, briefing criativo e detalhes específicos do tipo." },
  { n: "02", titulo: "IA monta o site", desc: "Em segundos a IA escreve copy, escolhe paleta, monta layout e seções." },
  { n: "03", titulo: "Refine se quiser", desc: "Edite, regenere com 1 clique, ajuste o que precisar até ficar do jeito que você quer." },
  { n: "04", titulo: "Publique e compartilhe", desc: "Pague o plano, libera link final + QR Code. Marca d'água some e vai pro ar." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <BrandHeader />

      {/* ====================== HERO ====================== */}
      <section className="relative overflow-hidden border-b border-black/5">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 lg:px-12 lg:pt-24 lg:pb-32">
          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-black/70">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Powered by IA · 100% automático
              </div>

              <h1 className="mt-8 text-[clamp(2.75rem,7vw,5.5rem)] font-black leading-[0.95] tracking-[-0.03em]">
                Crie um site
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                  para seu evento
                </span>
                <br />
                em minutos.
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-8 text-black/60 lg:text-xl lg:leading-9">
                Briefing rápido, IA escreve o site inteiro com copy autoral, RSVP, mapa e QR Code. Sem template genérico, sem código.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/cadastro"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-black px-8 text-base font-bold text-white transition-transform hover:scale-[1.02] hover:bg-black/90"
                >
                  Começar grátis →
                </Link>
                <Link
                  href="/exemplos"
                  className="inline-flex h-14 items-center justify-center rounded-full border-2 border-black/10 bg-white px-8 text-base font-bold text-black transition-colors hover:border-black"
                >
                  Ver exemplos
                </Link>
              </div>

              <p className="mt-6 text-sm text-black/40">
                Sem cartão pra testar · Briefing em 2 minutos · Cancela quando quiser
              </p>
            </div>

            {/* Hero visual mockup */}
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-violet-100 via-pink-50 to-amber-50 p-8 shadow-2xl">
                <div className="absolute inset-0 opacity-50">
                  <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-fuchsia-300 blur-3xl" />
                  <div className="absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-violet-300 blur-3xl" />
                </div>
                <div className="relative flex h-full flex-col">
                  <div className="rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur">
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
                      ✦ Casamento
                    </p>
                    <p className="mt-3 font-display text-3xl font-black leading-tight text-black">
                      Mariana &<br />Lucas
                    </p>
                    <p className="mt-2 text-sm text-black/60">
                      14 de fevereiro de 2026 · Búzios, RJ
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/90 p-4 shadow-md backdrop-blur">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                        Confirmados
                      </p>
                      <p className="mt-2 text-2xl font-black">142</p>
                    </div>
                    <div className="rounded-2xl bg-black p-4 shadow-md text-white">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                        Status
                      </p>
                      <p className="mt-2 text-sm font-black">Publicado</p>
                    </div>
                  </div>

                  <div className="mt-auto rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black">RSVP aberto</p>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase text-emerald-700">
                        ao vivo
                      </span>
                    </div>
                    <div className="mt-3 flex -space-x-2">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full border-2 border-white"
                          style={{
                            background: `linear-gradient(135deg, hsl(${260 + i * 20}, 70%, 70%), hsl(${300 + i * 20}, 70%, 80%))`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 top-12 hidden rotate-6 rounded-2xl bg-black px-5 py-3 text-white shadow-xl lg:block">
                <p className="text-xs font-bold uppercase tracking-widest text-white/60">
                  Tempo médio
                </p>
                <p className="mt-1 text-3xl font-black">2 min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="border-t border-black/5 bg-black/[0.02]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-6 px-6 py-8 text-center text-sm font-bold uppercase tracking-widest text-black/40 lg:px-12">
            <span>2 min do briefing ao site</span>
            <span className="hidden sm:inline">•</span>
            <span>5 templates profissionais</span>
            <span className="hidden sm:inline">•</span>
            <span>100% mobile</span>
            <span className="hidden sm:inline">•</span>
            <span>RSVP em tempo real</span>
          </div>
        </div>
      </section>

      {/* ====================== COMO FUNCIONA ====================== */}
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Como funciona</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Do briefing ao site publicado
              <br />
              em 4 passos.
            </h2>
          </div>

          <div className="mt-16 grid gap-px bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
            {passos.map((p) => (
              <div key={p.n} className="bg-white p-8 lg:p-10">
                <p className="font-mono text-sm font-bold text-violet-700">{p.n}</p>
                <p className="mt-6 text-2xl font-black tracking-tight">{p.titulo}</p>
                <p className="mt-3 text-base text-black/60 leading-7">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== TIPOS DE EVENTO ====================== */}
      <section className="border-b border-black/5 bg-black/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">5 nichos</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Cada tipo de evento
              <br />
              tem seu próprio jeito.
            </h2>
            <p className="mt-6 max-w-xl text-lg text-black/60">
              A IA pergunta o que importa pra cada nicho, escolhe paleta e copy adequados. Casamento não fica com cara de festa eletrônica.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tipos.map((t) => (
              <div
                key={t.titulo}
                className={`group relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br ${t.grad} p-8 transition-transform hover:-translate-y-1 hover:shadow-2xl`}
              >
                <div className="text-5xl">{t.icon}</div>
                <h3 className="mt-8 text-2xl font-black tracking-tight">{t.titulo}</h3>
                <p className="mt-3 text-base text-black/70 leading-7">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/exemplos"
              className="inline-flex h-14 items-center justify-center rounded-full border-2 border-black/10 bg-white px-8 text-base font-bold transition-colors hover:border-black"
            >
              Ver exemplos reais →
            </Link>
          </div>
        </div>
      </section>

      {/* ====================== FEATURES ====================== */}
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Tudo incluso</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Mais do que um site.
              <br />
              Um centro de comando do seu evento.
            </h2>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-2xl text-white">
                  {f.icon}
                </div>
                <h3 className="mt-6 text-xl font-black tracking-tight">{f.title}</h3>
                <p className="mt-3 text-base text-black/60 leading-7">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== CTA FINAL ====================== */}
      <section className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
                Comece agora
              </p>
              <h2 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Seu próximo evento
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  merece um site à altura.
                </span>
              </h2>
              <p className="mt-8 max-w-xl text-lg text-white/60 leading-8">
                Cadastro grátis. Crie seu primeiro evento e veja a IA trabalhar antes de pagar qualquer centavo.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/cadastro"
                className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-black transition-transform hover:scale-[1.02]"
              >
                Criar conta grátis →
              </Link>
              <Link
                href="/precos"
                className="inline-flex h-14 items-center justify-center rounded-full border-2 border-white/20 bg-transparent px-8 text-base font-bold text-white transition-colors hover:border-white"
              >
                Ver planos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-black/50 sm:flex-row sm:items-center sm:justify-between lg:px-12">
          <p>© {new Date().getFullYear()} Eventify AI · Todos os direitos reservados</p>
          <div className="flex gap-6">
            <Link href="/precos" className="hover:text-black">Planos</Link>
            <Link href="/exemplos" className="hover:text-black">Exemplos</Link>
            <Link href="/login" className="hover:text-black">Entrar</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
