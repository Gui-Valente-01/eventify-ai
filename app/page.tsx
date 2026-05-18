import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";
import { TEMPLATES } from "@/lib/templateGallery";

const features = [
  {
    title: "Briefing guiado",
    text: "4 etapas com perguntas específicas pro tipo do evento. Sem formulário genérico.",
    glyph: "a",
  },
  {
    title: "RSVP simples",
    text: "Convidado abre no celular e confirma presença com o nome. Você vê tudo no painel + exporta CSV.",
    glyph: "b",
  },
  {
    title: "QR Code automático",
    text: "Pronto pra colar em convite, banner ou story do Instagram. Compartilhamento sem fricção.",
    glyph: "c",
  },
  {
    title: "Mapa & endereço",
    text: "Google Maps embutido. Convidado clica e o GPS já abre o trajeto.",
    glyph: "d",
  },
  {
    title: "Convite por e-mail em massa",
    text: "Cola a lista, envia até 50 convites por vez com link e CTA pra confirmar presença.",
    glyph: "e",
  },
  {
    title: "Editor visual ao vivo",
    text: "Mude cores e tipografia com preview instantâneo. Sem regerar com IA, sem esperar.",
    glyph: "f",
  },
];

const passos = [
  { n: "01", titulo: "Conte do evento", desc: "Wizard guiado de 4 etapas. Nome, data, local e detalhes específicos." },
  { n: "02", titulo: "Escolha um template", desc: "Biblioteca curada por tipo de evento. Preview real, sem placeholder." },
  { n: "03", titulo: "IA gera o site", desc: "Copy, paleta e seções geradas pelo Claude em segundos." },
  { n: "04", titulo: "Publique e divulga", desc: "Link final + QR Code prontos pra compartilhar." },
];

const planos = [
  {
    nome: "Básico",
    valor: "29",
    items: [
      "Até 5 eventos publicados",
      "5 regenerações IA por evento",
      "RSVP ilimitado por evento",
      "QR Code + mapa + convite por e-mail",
    ],
    featured: false,
  },
  {
    nome: "Intermediário",
    valor: "49",
    items: [
      "Tudo do Básico",
      "Até 20 eventos publicados",
      "15 regenerações IA por evento",
      "Pra quem organiza vários eventos",
    ],
    featured: true,
  },
  {
    nome: "Premium",
    valor: "79",
    items: [
      "Tudo do Intermediário",
      "Eventos praticamente ilimitados",
      "Templates premium exclusivos",
      "Atendimento prioritário por e-mail",
    ],
    featured: false,
  },
];

// Templates em destaque na landing — 5 do registry
const TEMPLATES_DESTAQUE = ["editorial-romantic", "marigold", "brutalist-summit", "neon-night", "vesper"]
  .map((id) => TEMPLATES.find((t) => t.id === id))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function Home() {
  return (
    <main className="eventify-page">
      <BrandHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="editorial-wrap pt-20 pb-20">
          {/* Novo pill */}
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--hairline)] bg-[color:var(--surface)] py-1 pl-1 pr-3 text-[12px]">
            <span className="rounded-full bg-[var(--gold-soft)] px-2 py-0.5 text-[10.5px] font-medium text-[color:var(--gold-2)]">
              Novo
            </span>
            <span className="text-[color:var(--ink-2)]">Geração de copy com Claude — agora em todos os planos</span>
            <span aria-hidden className="text-[color:var(--muted)]">→</span>
          </span>

          <h1 className="eventify-title mt-7 max-w-[14ch] text-[clamp(48px,7.2vw,104px)]">
            Seu evento merece um site <em>à altura.</em>
          </h1>
          <p className="mt-2 max-w-[18ch] font-display text-[clamp(38px,5.2vw,72px)] font-light leading-[0.98] tracking-[-0.02em] text-[color:var(--muted-2)]">
            Montado em uma tarde.
          </p>

          <p className="mt-7 max-w-[54ch] text-[18px] leading-[1.55] text-[color:var(--muted)]">
            Descreva o que você está organizando. A Eventify escolhe um template editorial, escreve a copy com IA,
            organiza convidados e publica em minutos — sem template genérico, sem designer, sem código.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3.5">
            <Link href="/novo-evento" className="eventify-button eventify-button-primary">
              Criar meu site grátis <span aria-hidden>→</span>
            </Link>
            <Link href="/exemplos" className="eventify-button eventify-button-ghost">
              Ver exemplos
            </Link>
            <span className="ml-2 text-[12.5px] text-[color:var(--muted)]">
              Não pede cartão · pague só quando publicar
            </span>
          </div>

          {/* DEVICE PREVIEW */}
          <div className="mt-16 overflow-hidden rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] ring-glow">
            <div className="flex h-[34px] items-center gap-2.5 border-b border-[color:var(--hairline)] bg-[color:var(--paper)] px-3.5">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#FF5F57] opacity-85" />
                <span className="h-2 w-2 rounded-full bg-[#FEBC2E] opacity-85" />
                <span className="h-2 w-2 rounded-full bg-[#28C840] opacity-85" />
              </div>
              <span className="font-mono-tight text-[11px] text-[color:var(--muted)]">
                eventify.app/cliente/marina-e-rafael
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] text-[color:var(--green,#5B7A4F)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--green,#5B7A4F)]" />
                Ao vivo
              </span>
            </div>
            <div className="grid min-h-[380px] grid-cols-1 md:grid-cols-[1fr_1.1fr]">
              <div className="flex flex-col justify-center border-b border-[color:var(--hairline)] px-10 py-12 md:border-b-0 md:border-r">
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  Casamento · São Paulo
                </div>
                <h2 className="mt-3.5 font-display text-[60px] font-normal leading-[0.98] text-[color:var(--ink)]">
                  Marina <span className="font-display italic text-[color:var(--gold)]">&amp;</span> Rafael
                </h2>
                <div className="mt-3.5 font-mono-tight text-[13.5px] text-[color:var(--ink-2)]">
                  12 · 10 · 2026 — 16:30
                </div>
                <div className="mt-5 text-[13.5px] leading-[1.65] text-[color:var(--muted)]">
                  Cerimônia na Capela São Bento.
                  <br />
                  Recepção até 02h na Casa Petra.
                </div>
                <div className="mt-6 flex gap-2">
                  <Link
                    href="/exemplos/casamento-mariana-e-rafael"
                    className="inline-flex h-9 items-center rounded-[8px] bg-[color:var(--ink)] px-4 text-[12.5px] font-medium text-white"
                  >
                    Ver exemplo
                  </Link>
                  <Link
                    href="/exemplos"
                    className="inline-flex h-9 items-center rounded-[8px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-4 text-[12.5px] text-[color:var(--ink)]"
                  >
                    Mais exemplos
                  </Link>
                </div>
              </div>
              <div
                className="relative flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, var(--gold-soft) 0%, #fff 80%)",
                }}
              >
                <span className="absolute right-3.5 top-3.5 font-mono-tight text-[10.5px] uppercase tracking-[0.06em] text-[color:var(--muted)]">
                  made with eventify
                </span>
                <div
                  className="aspect-[4/5] w-[62%] rounded-[6px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg,rgba(0,0,0,.05),rgba(0,0,0,0)), url('https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=80')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: "0 30px 60px -30px rgba(60,40,20,.35)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Status fase beta — honestidade > vaidade */}
          <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-[color:var(--hairline)] bg-[color:var(--surface)] px-4 py-2 text-[12.5px] text-[color:var(--ink-2)]">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--gold)]" />
            Em fase inicial — atendendo os primeiros clientes pessoalmente
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" className="border-y border-[color:var(--hairline)] bg-[color:var(--paper)] py-24">
        <div className="editorial-wrap">
          <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
            <div>
              <div className="eventify-eyebrow">Como funciona</div>
              <h2 className="mt-3 font-display text-[34px] font-normal leading-[1.08] tracking-[-0.025em] text-[color:var(--ink)]">
                Quatro passos. <em className="italic text-[color:var(--gold)]">Zero</em> complicação.
              </h2>
              <p className="mt-4 text-[14.5px] leading-[1.6] text-[color:var(--muted)]">
                Do briefing ao link publicado em menos de uma tarde. Sem instalar nada, sem chamar designer, sem pagar adiantado.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[12px] border border-[color:var(--hairline)] bg-[color:var(--hairline)] sm:grid-cols-2">
              {passos.map((p) => (
                <div key={p.n} className="bg-[color:var(--surface)] p-6">
                  <div className="font-mono-tight text-[11px] text-[color:var(--muted-2)]">{p.n}</div>
                  <h3 className="mt-3 text-[17px] font-medium tracking-[-0.01em] text-[color:var(--ink)]">{p.titulo}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-[1.55] text-[color:var(--muted)]">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TEMPLATES STRIP */}
      <section id="exemplos" className="py-24">
        <div className="editorial-wrap">
          <div className="mb-7 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="eventify-eyebrow">Templates</div>
              <h2 className="mt-3 font-display text-[34px] font-normal leading-[1.08] tracking-[-0.025em] text-[color:var(--ink)]">
                Um template <em className="italic text-[color:var(--gold)]">diferente</em> pra cada ocasião.
              </h2>
            </div>
            <Link href="/exemplos" className="text-[13px] text-[color:var(--ink-2)] hover:underline">
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {TEMPLATES_DESTAQUE.map((tpl) => (
              <Link
                key={tpl.id}
                href="/novo-evento"
                className="group overflow-hidden rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--surface)] transition hover:-translate-y-0.5 hover:border-[color:var(--hairline-2)]"
              >
                <div
                  className="relative aspect-[4/5]"
                  style={{
                    background: `linear-gradient(160deg, ${tpl.accent}22, ${tpl.base} 70%)`,
                  }}
                >
                  <div
                    className="absolute inset-x-3 top-3 flex items-center justify-center rounded-[5px] border border-[color:var(--hairline)] bg-[color:var(--surface)] py-1.5 font-mono-tight text-[10px]"
                    style={{ color: tpl.accent }}
                  >
                    {tpl.tipos[0].toLowerCase()}
                  </div>
                  <div
                    className="absolute inset-x-3 bottom-3.5 font-display italic"
                    style={{
                      color: tpl.base.startsWith("#0") ? "#fff" : "#1F1B17",
                      fontSize: "20px",
                      lineHeight: 1.1,
                    }}
                  >
                    {tpl.nome}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 text-[11.5px] text-[color:var(--muted)]">
                  <span>{tpl.tipos[0]}</span>
                  <span className="font-mono-tight text-[10.5px]">{tpl.tom}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SPLIT FEATURES + QUOTE */}
      <section className="border-y border-[color:var(--hairline)] bg-[color:var(--paper-2)] py-24">
        <div className="editorial-wrap">
          <div className="eventify-eyebrow">Tudo num só lugar</div>
          <h2 className="mt-3 font-display text-[34px] font-normal leading-[1.08] tracking-[-0.025em] text-[color:var(--ink)]">
            Não é só um site. É a <em className="italic text-[color:var(--gold)]">operação inteira</em> do evento.
          </h2>

          <div className="mt-10 grid grid-cols-1 items-center gap-12 md:grid-cols-[1.05fr_1fr] md:gap-16">
            <div>
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className={`flex gap-5 py-5 ${i < features.length - 1 ? "border-b border-[color:var(--hairline)]" : ""}`}
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[color:var(--hairline-2)] font-display text-[16px] italic text-[color:var(--gold)]">
                    {f.glyph}
                  </span>
                  <div>
                    <h5 className="text-[15px] font-medium text-[color:var(--ink)]">{f.title}</h5>
                    <p className="mt-1.5 text-[14px] leading-[1.55] text-[color:var(--muted)]">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--paper)]">
              <div className="absolute inset-6 rounded-[10px] border border-[color:var(--hairline-2)]" />
              <span className="absolute left-10 top-10 text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted)]">
                A proposta
              </span>
              <p className="absolute inset-x-10 bottom-10 font-display text-[30px] font-light italic leading-[1.15] tracking-[-0.01em] text-[color:var(--ink)]">
                <span className="absolute -left-1.5 -top-3 text-[80px] not-italic text-[color:var(--gold)]">
                  &ldquo;
                </span>
                Você abre o link no almoço de família e ninguém acredita que foi feito em 12 minutos por IA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-b border-[color:var(--hairline)] bg-[color:var(--paper)] py-24">
        <div className="editorial-wrap">
          <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
            <div>
              <div className="eventify-eyebrow">Planos</div>
              <h2 className="mt-3 font-display text-[34px] font-normal leading-[1.08] tracking-[-0.025em] text-[color:var(--ink)]">
                Pague só quando <em className="italic text-[color:var(--gold)]">publicar.</em>
              </h2>
              <p className="mt-4 text-[14px] leading-[1.6] text-[color:var(--muted)]">
                Criar, gerar e editar é grátis. Cobramos no momento da publicação.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {planos.map((p) => (
                <div
                  key={p.nome}
                  className={`relative flex flex-col rounded-[12px] border bg-[color:var(--surface)] p-5 pt-5 transition ${
                    p.featured
                      ? "border-[color:var(--ink)] shadow-[0_20px_40px_-30px_rgba(11,11,18,0.2)]"
                      : "border-[color:var(--hairline-2)] hover:border-[color:var(--hairline-2)]"
                  }`}
                >
                  {p.featured && (
                    <span className="absolute -top-2.5 right-3.5 inline-flex items-center gap-1 rounded-full border border-[color:var(--gold)] bg-[var(--gold-soft)] px-2.5 py-0.5 text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--gold-2)]">
                      Mais popular
                    </span>
                  )}
                  <div className="text-[13px] font-medium text-[color:var(--ink)]">{p.nome}</div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-mono-tight text-[28px] font-medium tracking-[-0.02em]">R$ {p.valor}</span>
                    <span className="text-[12px] text-[color:var(--muted)]">/mês</span>
                  </div>
                  <ul className="mt-3.5 mb-4 flex-1 list-none p-0">
                    {p.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 py-1.5 text-[12.5px] text-[color:var(--ink-2)]"
                      >
                        <span className="font-mono-tight text-[color:var(--gold)]">+</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/precos"
                    className={
                      p.featured
                        ? "inline-flex h-9 items-center justify-center rounded-[8px] bg-[color:var(--ink)] px-3 text-[12.5px] font-medium text-white"
                        : "inline-flex h-9 items-center justify-center rounded-[8px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-3 text-[12.5px] text-[color:var(--ink)]"
                    }
                  >
                    Assinar {p.nome}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="border-b border-[color:var(--hairline)] py-24"
      >
        <div className="editorial-wrap">
          <div className="eventify-eyebrow">Dúvidas frequentes</div>
          <h2 className="mt-3 max-w-[20ch] font-display text-[34px] font-normal leading-[1.08] tracking-[-0.025em] text-[color:var(--ink)]">
            Antes que <em className="italic text-[color:var(--gold)]">você</em> pergunte.
          </h2>

          <div className="mt-10 max-w-[820px] border-t border-[color:var(--hairline)]">
            <Detail open question="Preciso saber programar?">
              Nada de código. Você responde um wizard de 4 etapas, escolhe um template e a IA monta o site sozinha. Depois, pra ajustar cores e fontes, é só usar o editor visual (sem regerar).
            </Detail>
            <Detail question="Qual o endereço (URL) do meu site?">
              O link fica em <span className="font-mono-tight">eventify.app/cliente/seu-evento</span>. Domínio próprio (ex: <span className="font-mono-tight">casamento.com.br</span>) ainda não está disponível — está no nosso roadmap.
            </Detail>
            <Detail question="Como funciona o RSVP?">
              Os convidados abrem o link, digitam o nome e confirmam presença. Você vê a lista em tempo real no painel e pode exportar em CSV. Por enquanto, o formulário é só nome — perguntas adicionais (acompanhantes, restrição alimentar) estão no nosso roadmap.
            </Detail>
            <Detail question="E se eu não gostar do site gerado?">
              Você pode ajustar cores e tipografia no editor visual sem custo nenhum (preview em tempo real). Pra regerar o conteúdo com novo briefing, cada plano tem um limite de regenerações por evento (5 no Básico, 15 no Intermediário, praticamente ilimitado no Premium). Você só paga quando decide publicar.
            </Detail>
            <Detail question="Posso convidar pessoas direto pelo sistema?">
              Sim. No painel do evento tem um botão &ldquo;Convidar por e-mail&rdquo; — cola a lista (até 50 por vez) e cada pessoa recebe um e-mail bonito com o link da página e CTA pra confirmar.
            </Detail>
            <Detail question="Posso cancelar a qualquer momento?">
              Sim. Sem fidelidade, sem multa. O site fica ativo até o fim do ciclo já pago. Reembolso integral em até 7 dias (art. 49 CDC).
            </Detail>
            <Detail question="Vocês têm clientes pagantes?">
              Estamos em fase inicial, atendendo os primeiros clientes pessoalmente por WhatsApp. Se você for um dos primeiros, ganha contato direto com o fundador.
            </Detail>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-[color:var(--ink)] py-28 text-center text-white">
        <span className="absolute left-1/2 top-12 -translate-x-1/2 font-mono-tight text-[11px] uppercase tracking-[0.22em] text-white/45">
          — Crie agora
        </span>
        <div className="editorial-wrap">
          <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(40px,5.4vw,72px)] font-light leading-[1.02] tracking-[-0.02em]">
            Pronto pra dar ao seu evento o site que ele <em className="italic font-light text-[color:var(--gold)]">merece</em>?
          </h2>
          <p className="mx-auto mt-6 max-w-[48ch] text-[16px] text-white/65">
            Comece grátis. Não pede cartão. Em 5 minutos você tem um site profissional gerado por IA.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/novo-evento"
              className="inline-flex items-center gap-2 rounded-[8px] bg-white px-6 py-3 text-[14px] font-medium text-[color:var(--ink)] transition-transform hover:-translate-y-px"
            >
              Criar meu site agora <span aria-hidden>→</span>
            </Link>
            <Link
              href="/exemplos"
              className="inline-flex items-center gap-2 rounded-[8px] border border-white/15 px-6 py-3 text-[14px] text-white transition-colors hover:bg-white/5"
            >
              Ver exemplos
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[color:var(--paper)] py-12">
        <div className="editorial-wrap flex flex-wrap items-center justify-between gap-4 text-[13px] text-[color:var(--muted)]">
          <div className="eventify-brand">
            <span className="eventify-mark" aria-hidden />
            <span>Eventify</span>
          </div>
          <span className="font-mono-tight text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted-2)]">
            © 2026 · made in São Paulo
          </span>
        </div>
      </footer>
    </main>
  );
}

function Detail({ open = false, question, children }: { open?: boolean; question: string; children: React.ReactNode }) {
  return (
    <details open={open} className="group border-b border-[color:var(--hairline)] py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-[20px] font-normal tracking-[-0.01em] text-[color:var(--ink)]">
        {question}
        <span className="font-mono-tight text-[16px] text-[color:var(--gold)] transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 max-w-[74ch] text-[14.5px] leading-[1.6] text-[color:var(--muted)]">{children}</p>
    </details>
  );
}
