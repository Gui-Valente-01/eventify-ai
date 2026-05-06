import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";
import { SAMPLE_EVENTS } from "@/lib/sampleEvents";

const steps = [
  { icon: "✎", title: "Descreva", text: "Nome, data, local e tipo de evento. 30 segundos." },
  { icon: "✦", title: "IA gera", text: "Claude monta título, copy e seleciona o template ideal." },
  { icon: "✓", title: "Aprove", text: "Pré-visualize, edite o que quiser, regenere com 1 clique." },
  { icon: "↗", title: "Publique", text: "Compartilhe link + QR Code. Convidados confirmam direto." },
];

const benefits = [
  { icon: "⚡", title: "Pronto em minutos", text: "De zero ao site publicado mais rápido do que escolher buffet." },
  { icon: "🎨", title: "5 estilos visuais", text: "Casamento elegante, festa vibrante, corporativo minimalista, e mais." },
  { icon: "🤖", title: "IA Claude inclusa", text: "Conteúdo de marketing escrito sob medida pela IA mais avançada." },
  { icon: "📱", title: "100% mobile", text: "Convidado abre no celular, confirma presença em 2 toques." },
  { icon: "🔗", title: "QR Code automático", text: "Gerado e pronto pra colar em convite, banner ou story." },
  { icon: "📊", title: "Painel completo", text: "Lista de presença, métricas e export CSV pra organizar tudo." },
];

const tipos = [
  { titulo: "Casamentos", desc: "Convite editorial em rosé e dourado.", icon: "♡", grad: "from-rose-200 via-pink-100 to-amber-100" },
  { titulo: "Aniversários", desc: "Festa colorida, vibrante, divertida.", icon: "♕", grad: "from-amber-200 via-orange-200 to-rose-200" },
  { titulo: "Corporativos", desc: "Landing premium, minimalista e direta.", icon: "▣", grad: "from-blue-100 via-slate-50 to-indigo-100" },
  { titulo: "Festas e shows", desc: "Visual noturno, neon, impactante.", icon: "✦", grad: "from-violet-200 via-fuchsia-200 to-pink-200" },
  { titulo: "Religiosos", desc: "Sereno, acolhedor, comunitário.", icon: "✓", grad: "from-emerald-100 via-lime-100 to-white" },
];

const stats = [
  { valor: "2 min", label: "do briefing ao site publicado" },
  { valor: "5", label: "templates profissionais" },
  { valor: "100%", label: "mobile, responsivo e rápido" },
  { valor: "R$ 29", label: "por mês no plano inicial" },
];

export default function Home() {
  return (
    <main className="eventify-page">
      <BrandHeader />

      {/* HERO */}
      <section className="relative overflow-hidden gradient-mesh">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-fuchsia-300 via-purple-300 to-amber-200 opacity-50 blur-3xl animate-float-slow" />
          <div className="absolute top-40 -left-40 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-sky-200 via-violet-300 to-pink-200 opacity-40 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        </div>

        <div className="eventify-section flex min-h-[78vh] flex-col items-center justify-center text-center">
          <span className="eventify-kicker animate-fade-up">
            <span className="inline-block h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            Powered by Claude · Anthropic
          </span>

          <h1 className="eventify-title mt-10 max-w-5xl text-6xl sm:text-7xl lg:text-[clamp(3.5rem,8vw,7rem)] animate-fade-up animate-delay-1">
            Sites de eventos <br />
            criados em <span className="text-gradient-aurora font-display italic">minutos</span>
          </h1>

          <p className="eventify-muted mt-8 max-w-2xl text-xl leading-9 animate-fade-up animate-delay-2">
            Você descreve o evento. A IA escreve o conteúdo, escolhe o template, monta o site,
            gera o QR Code. Você só aprova e publica.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-up animate-delay-3">
            <Link href="/cadastro" className="eventify-button eventify-button-primary min-w-56 text-base">
              Criar grátis →
            </Link>
            <Link href="/exemplos" className="eventify-button eventify-button-ghost min-w-56 text-base">
              Ver exemplos ao vivo
            </Link>
          </div>

          <p className="eventify-muted mt-7 text-sm animate-fade-up animate-delay-4">
            ✓ Sem cartão para criar · ✓ Pré-visualização ilimitada · ✓ Assinatura mensal ao publicar
          </p>

          <div className="mt-20 grid w-full max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-3xl bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 sm:grid-cols-4 animate-fade-up animate-delay-5">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/95 px-5 py-7 text-left backdrop-blur">
                <div className="text-3xl font-black text-gradient">{s.valor}</div>
                <div className="eventify-muted mt-2 text-xs leading-5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE / EXEMPLOS */}
      <section className="eventify-section">
        <div className="text-center">
          <span className="eventify-kicker">✦ Exemplos reais</span>
          <h2 className="eventify-title mt-6 text-5xl sm:text-6xl">
            Veja antes de <span className="text-gradient">comprar</span>
          </h2>
          <p className="eventify-muted mx-auto mt-4 max-w-2xl text-xl">
            Cada tipo de evento tem um visual próprio. Clique e navegue pelo exemplo completo.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {SAMPLE_EVENTS.map((evento, i) => (
            <Link
              key={evento.slug}
              href={`/exemplos/${evento.slug}`}
              className={`group relative overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl ${
                i === 0 ? "lg:row-span-2 lg:min-h-[640px]" : ""
              }`}
            >
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                style={{ background: evento.imagemBg }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              </div>

              <div className="relative flex h-full min-h-[340px] flex-col justify-between p-7 text-white">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                    {evento.tipo}
                  </span>
                  <span className="text-4xl drop-shadow-lg">{evento.emoji}</span>
                </div>

                <div>
                  <h3 className={`font-black drop-shadow-lg ${i === 0 ? "text-5xl sm:text-6xl" : "text-3xl sm:text-4xl"}`}>
                    {evento.siteGerado?.heroTitle || evento.nome}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-white/90 drop-shadow line-clamp-2">
                    {evento.destaque}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/30 pt-5">
                    <span className="text-sm font-bold text-white/90">{evento.endereco?.cidade}</span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#090814] shadow-lg transition-transform group-hover:translate-x-1">
                      Ver site →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/exemplos" className="eventify-button eventify-button-ghost">
            Ver todos os exemplos →
          </Link>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-transparent via-purple-50/40 to-transparent">
        <div className="eventify-section">
          <div className="text-center">
            <span className="eventify-kicker">✦ Como funciona</span>
            <h2 className="eventify-title mt-6 text-5xl sm:text-6xl">
              Quatro passos. <span className="text-gradient">Pronto.</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <article
                key={step.title}
                className="eventify-card group relative px-7 py-9 transition hover:-translate-y-2"
              >
                <div className="absolute -top-4 left-7 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-black text-[#5f5a72] shadow-lg ring-1 ring-[var(--line)]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400 text-2xl font-black text-white shadow-lg shadow-purple-200 transition group-hover:scale-110 group-hover:rotate-3">
                  {step.icon}
                </span>
                <h3 className="mt-6 text-xl font-black text-[#090814]">{step.title}</h3>
                <p className="eventify-muted mt-3 leading-7">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TIPOS DE EVENTO */}
      <section className="eventify-section">
        <div className="text-center">
          <span className="eventify-kicker">✦ Para todo tipo de evento</span>
          <h2 className="eventify-title mt-6 text-5xl sm:text-6xl">
            5 templates, <span className="text-gradient">infinitas combinações</span>
          </h2>
          <p className="eventify-muted mx-auto mt-4 max-w-2xl text-xl">
            Cada estilo com paleta, tipografia e atmosfera próprias. A IA escolhe pra você.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tipos.map((t) => (
            <article
              key={t.titulo}
              className={`group relative overflow-hidden rounded-3xl border border-[var(--line)] bg-gradient-to-br ${t.grad} p-8 transition hover:-translate-y-2`}
            >
              <div className="text-6xl">{t.icon}</div>
              <h3 className="mt-7 text-2xl font-black text-[#090814]">{t.titulo}</h3>
              <p className="mt-3 text-sm leading-6 text-[#3a3548]">{t.desc}</p>
              <div className="mt-6 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg transition group-hover:translate-x-1">
                <span className="text-[#8847e7]">→</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="eventify-section">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="eventify-kicker">✦ Por que Eventify</span>
            <h2 className="eventify-title mt-6 text-5xl">
              Tudo que você precisa, <br />
              <span className="text-gradient">nada que você não usa.</span>
            </h2>
            <p className="eventify-muted mt-6 text-lg leading-8">
              Concorrentes te entregam um construtor genérico de sites. A gente entrega o site
              <strong> já pronto</strong>, com o conteúdo escrito pela IA, e você só aprova.
            </p>
            <div className="mt-10">
              <Link href="/cadastro" className="eventify-button eventify-button-primary">
                Começar grátis agora →
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="eventify-card p-6 transition hover:-translate-y-1"
              >
                <span className="text-3xl">{b.icon}</span>
                <h3 className="mt-4 text-base font-black text-[#090814]">{b.title}</h3>
                <p className="eventify-muted mt-2 text-sm leading-6">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="eventify-section pt-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a0b3a] via-[#3a0e6e] to-[#7a1aab] px-8 py-20 text-white shadow-2xl">
          <div className="absolute inset-0 -z-10 opacity-40">
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-fuchsia-500 blur-3xl animate-float-slow" />
            <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-amber-400 blur-3xl animate-float-slow" style={{ animationDelay: "3s" }} />
          </div>

          <div className="relative text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Beta aberto · Vagas limitadas
            </span>
            <h2 className="mt-8 text-5xl font-black sm:text-6xl">
              Pronto para criar?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/85">
              Crie sua conta em 30 segundos. Assine só quando estiver pronto para publicar.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/cadastro" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-8 text-base font-black text-[#090814] shadow-2xl transition hover:scale-105">
                Criar minha conta →
              </Link>
              <Link href="/precos" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 text-base font-black text-white backdrop-blur transition hover:bg-white/20">
                Ver planos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] py-10 text-center text-sm text-[#5f5a72]">
        Eventify AI © 2026 · Powered by Claude (Anthropic) ·{" "}
        <Link href="/precos" className="font-bold text-[#8847e7] hover:underline">Planos</Link>
        {" · "}
        <Link href="/exemplos" className="font-bold text-[#8847e7] hover:underline">Exemplos</Link>
      </footer>
    </main>
  );
}
