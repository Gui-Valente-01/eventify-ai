import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import BrandHeader from "@/components/BrandHeader";

export const metadata: Metadata = {
  title: "Pitch Deck · Eventify",
  description:
    "Pitch deck profissional do Eventify para apresentar a plataforma de sites automáticos para eventos com inteligência artificial.",
};

const slides = [
  "Visão",
  "Problema",
  "Solução",
  "Produto",
  "Agentes",
  "Mercado",
  "Receita",
  "Diferenciais",
  "Roadmap",
  "Próxima etapa",
];

const productPillars = [
  { title: "Briefing rápido", text: "Nome, tipo, data, cidade, imagem e detalhes do evento." },
  { title: "IA criativa", text: "Texto, estilo, template e sugestões comerciais automaticamente." },
  { title: "Site publicado", text: "Página com hero, mapa, RSVP, QR Code e CTA de pagamento." },
];

const agentMap: [string, string][] = [
  ["Interpreta", "Entende o cliente e transforma pedidos vagos em direção clara."],
  ["Desenha", "Define layout, cores, hierarquia visual e experiência responsiva."],
  ["Escreve", "Cria copy emocional, corporativa ou promocional conforme o evento."],
  ["Monta", "Renderiza site, RSVP, mapa, QR Code e página pública."],
  ["Otimiza", "Melhora qualidade, clareza, conversão e valor percebido."],
  ["Vende", "Gera ofertas, upsells, campanhas e argumentos comerciais."],
];

const revenueLines: [string, string][] = [
  ["Assinatura mensal", "R$ 29 a R$ 79 por mês"],
  ["Planos premium", "Templates, domínio, RSVP avançado"],
  ["Parcerias B2B", "Cerimonialistas, buffets e produtoras"],
  ["Serviços extras", "Setup assistido, fotos, copy premium"],
];

const roadmap = [
  "Banco de dados real e multiusuário",
  "Checkout completo com Pix/cartão",
  "Upload de imagens e biblioteca premium",
  "Analytics de convidados e conversão",
  "Templates por nicho e por cidade",
  "Domínio personalizado e marketplace",
];

function SlideShell({
  number,
  kicker,
  title,
  children,
  tone = "light",
}: {
  number: number;
  kicker: string;
  title: string;
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <section
      className={
        dark
          ? "min-h-[calc(100vh-68px)] scroll-mt-24 bg-[color:var(--ink)] text-white"
          : "min-h-[calc(100vh-68px)] scroll-mt-24 bg-[color:var(--paper)] text-[color:var(--ink)] border-b border-[color:var(--hairline)]"
      }
      id={`slide-${number}`}
    >
      <div className="editorial-wrap flex min-h-[calc(100vh-68px)] flex-col justify-center py-16">
        <div className="mb-9 flex items-center justify-between gap-4">
          <span
            className={
              dark
                ? "inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-[11.5px] uppercase tracking-[0.22em] text-[color:var(--gold)]"
                : "eventify-kicker"
            }
          >
            {kicker}
          </span>
          <span
            className={
              dark
                ? "font-mono-tight text-[11.5px] tracking-[0.12em] text-white/40"
                : "font-mono-tight text-[11.5px] tracking-[0.12em] text-[color:var(--muted-2)]"
            }
          >
            {String(number).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>

        <h1
          className={
            dark
              ? "max-w-[24ch] font-display text-[clamp(40px,5.8vw,88px)] font-light leading-[1.02] tracking-[-0.02em]"
              : "eventify-title max-w-[24ch] text-[clamp(40px,5.8vw,88px)]"
          }
        >
          {title}
        </h1>

        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

function BrowserMockup() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] ring-glow">
      <div className="flex items-center gap-2 border-b border-[color:var(--hairline)] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--hairline-2)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--hairline-2)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--hairline-2)]" />
        <span className="ml-3 rounded-full bg-[color:var(--paper-2)] px-3 py-1 text-[11px] font-mono-tight text-[color:var(--muted)]">
          eventify.app/evento/corporativo
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr]">
        <div className="border-b border-[color:var(--hairline)] p-9 lg:border-b-0 lg:border-r">
          <span className="rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--paper)] px-3 py-1 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--ink-2)]">
            Summit Tech AI 2026
          </span>
          <h3 className="mt-5 font-display text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-[color:var(--ink)]">
            Conferência <em className="italic text-[color:var(--gold)]">premium</em> gerada pela IA.
          </h3>
          <p className="mt-4 max-w-md text-[14px] leading-[1.55] text-[color:var(--muted)]">
            Uma página completa com posicionamento, agenda, mapa, confirmação de presença e CTA para reservar lugar.
          </p>
          <div className="mt-7 grid gap-2.5 sm:grid-cols-3">
            {["Keynotes", "Networking", "Credenciamento"].map((item) => (
              <div
                key={item}
                className="rounded-[8px] border border-[color:var(--hairline-2)] bg-[color:var(--paper)] p-3.5 text-center text-[12.5px] text-[color:var(--ink-2)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[color:var(--paper-2)] p-8">
          <div className="rounded-[12px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-6">
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
              Score de qualidade
            </p>
            <p className="mt-3 font-display text-[72px] font-light leading-none tracking-[-0.02em] text-[color:var(--ink)]">
              94
            </p>
            <div className="mt-6 space-y-2">
              {["Copy alinhada", "Template editorial", "CTA forte"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between border-t border-[color:var(--hairline)] py-2.5 text-[12.5px] text-[color:var(--ink-2)]"
                >
                  <span>{item}</span>
                  <span className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--green,#5B7A4F)]">
                    ok
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PitchPage() {
  return (
    <main className="eventify-page">
      <BrandHeader
        actions={[
          { href: "/apresentacao", label: "Resumo comercial", variant: "ghost" },
          { href: "/exemplos", label: "Exemplos", variant: "ghost" },
          { href: "/novo-evento", label: "Criar demo", variant: "primary" },
        ]}
      />

      <nav className="sticky top-[68px] z-30 hidden border-b border-[color:var(--hairline)] bg-[color:var(--paper)]/85 backdrop-blur-md lg:block">
        <div className="editorial-wrap flex gap-2 overflow-x-auto py-3">
          {slides.map((slide, index) => (
            <a
              key={slide}
              href={`#slide-${index + 1}`}
              className="shrink-0 rounded-full border border-[color:var(--hairline)] bg-[color:var(--surface)] px-3.5 py-1.5 text-[12px] text-[color:var(--muted)] transition hover:border-[color:var(--ink)] hover:text-[color:var(--ink)]"
            >
              {index + 1}. {slide}
            </a>
          ))}
        </div>
      </nav>

      <SlideShell
        number={1}
        kicker="Pitch deck"
        title="Eventify cria sites de eventos com inteligência artificial."
      >
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="max-w-[44ch] text-[20px] leading-[1.55] text-[color:var(--muted)]">
              Uma plataforma SaaS para transformar dados de eventos em sites promocionais completos, bonitos e vendáveis em minutos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/apresentacao" className="eventify-button eventify-button-primary">
                Ver resumo comercial
              </Link>
              <Link href="/exemplos" className="eventify-button eventify-button-ghost">
                Ver exemplos
              </Link>
            </div>
          </div>
          <BrowserMockup />
        </div>
      </SlideShell>

      <SlideShell
        number={2}
        kicker="Problema"
        title="O mercado de eventos compra rapidez, mas ainda recebe processo manual."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            ["Tempo", "Briefing, design, revisões e publicação atrasam eventos que precisam ir ao ar rápido."],
            ["Custo", "Um site personalizado costuma depender de freelancer, agência ou ferramenta genérica."],
            ["Conversão", "Convites simples não resolvem mapa, presença, copy, CTA e valor percebido."],
          ].map(([title, text]) => (
            <article
              key={title}
              className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-8"
            >
              <h3 className="font-display text-[32px] font-light italic tracking-[-0.01em] text-[color:var(--ink)]">
                {title}
              </h3>
              <p className="mt-4 text-[15px] leading-[1.65] text-[color:var(--muted)]">{text}</p>
            </article>
          ))}
        </div>
      </SlideShell>

      <SlideShell
        number={3}
        kicker="Solução"
        title="Uma fábrica automatizada de sites promocionais para eventos."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {productPillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-8"
            >
              <span className="font-mono-tight text-[12px] tracking-[0.16em] text-[color:var(--gold)]">
                0{index + 1}
              </span>
              <h3 className="mt-5 font-display text-[28px] font-normal tracking-[-0.01em] text-[color:var(--ink)]">
                {pillar.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--muted)]">{pillar.text}</p>
            </article>
          ))}
        </div>
      </SlideShell>

      <SlideShell
        number={4}
        kicker="Produto"
        title="Do cadastro ao site publicado, tudo dentro do mesmo fluxo."
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-3">
            {["Criar evento", "Gerar com IA", "Editar e aprovar", "Assinar e publicar", "Receber RSVP"].map(
              (step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-5 rounded-[12px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-5"
                >
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--paper-2)] font-mono-tight text-[12px] text-[color:var(--gold)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="font-display text-[20px] italic tracking-[-0.01em] text-[color:var(--ink)]">
                    {step}
                  </p>
                </div>
              )
            )}
          </div>
          <BrowserMockup />
        </div>
      </SlideShell>

      <SlideShell
        number={5}
        kicker="Agentes"
        title="A IA trabalha como uma equipe, não como uma resposta única."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agentMap.map(([title, text]) => (
            <article
              key={title}
              className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-7"
            >
              <h3 className="font-display text-[24px] italic tracking-[-0.01em] text-[color:var(--ink)]">
                {title}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.6] text-[color:var(--muted)]">{text}</p>
            </article>
          ))}
        </div>
      </SlideShell>

      <SlideShell
        number={6}
        kicker="Mercado"
        title="O cliente já existe: quem organiza evento precisa aparecer melhor e mais rápido."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Casamentos", "Aniversários", "Corporativo", "Festas", "Religioso", "Formaturas", "Workshops", "Lojas locais"].map(
            (market) => (
              <article
                key={market}
                className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-6"
              >
                <p className="font-display text-[24px] italic tracking-[-0.01em] text-[color:var(--ink)]">
                  {market}
                </p>
                <p className="mt-3 text-[13px] leading-[1.55] text-[color:var(--muted)]">
                  Nicho recorrente com urgência, divulgação e necessidade de confirmação.
                </p>
              </article>
            )
          )}
        </div>
      </SlideShell>

      <SlideShell
        number={7}
        kicker="Receita"
        title="Monetização recorrente com aumento natural de ticket."
      >
        <div className="grid gap-5 lg:grid-cols-4">
          {revenueLines.map(([title, text]) => (
            <article
              key={title}
              className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-7"
            >
              <h3 className="font-display text-[24px] italic tracking-[-0.01em] text-[color:var(--ink)]">
                {title}
              </h3>
              <p className="mt-3 text-[14.5px] leading-[1.6] text-[color:var(--muted)]">{text}</p>
            </article>
          ))}
        </div>
      </SlideShell>

      <SlideShell
        number={8}
        kicker="Diferenciais"
        title="IA, design, publicação e negócio no mesmo produto."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-8">
            <h3 className="font-display text-[28px] italic tracking-[-0.01em] text-[color:var(--ink)]">
              Para o cliente
            </h3>
            <ul className="mt-5">
              {[
                "Não precisa escrever textos",
                "Não precisa escolher layout do zero",
                "Não precisa contratar técnico",
                "Publica quando aprovar",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 border-t border-[color:var(--hairline)] py-3 text-[14px] text-[color:var(--ink-2)]"
                >
                  <span className="font-mono-tight text-[color:var(--gold)]">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-8">
            <h3 className="font-display text-[28px] italic tracking-[-0.01em] text-[color:var(--ink)]">
              Para o negócio
            </h3>
            <ul className="mt-5">
              {[
                "Baixo custo operacional",
                "Venda escalável",
                "Templates reaproveitáveis",
                "Upsells claros",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 border-t border-[color:var(--hairline)] py-3 text-[14px] text-[color:var(--ink-2)]"
                >
                  <span className="font-mono-tight text-[color:var(--gold)]">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </SlideShell>

      <SlideShell
        number={9}
        kicker="Roadmap"
        title="O caminho para virar uma plataforma completa de eventos."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roadmap.map((item, index) => (
            <article
              key={item}
              className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-7"
            >
              <span className="text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                Fase {index + 1}
              </span>
              <h3 className="mt-3 font-display text-[22px] font-normal leading-[1.2] tracking-[-0.01em] text-[color:var(--ink)]">
                {item}
              </h3>
            </article>
          ))}
        </div>
      </SlideShell>

      <SlideShell
        number={10}
        kicker="Próxima etapa"
        title="Do protótipo a um produto vendável, medido e escalável."
        tone="dark"
      >
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="max-w-[44ch] text-[19px] leading-[1.6] text-white/65">
              A base já tem eventos, página promocional, templates, agentes, admin, pagamento e publicação. O próximo salto é lapidar onboarding, checkout, métricas e distribuição comercial.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/novo-evento"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14.5px] font-medium text-[color:var(--ink)] transition-transform hover:-translate-y-px"
              >
                Criar demonstração <span aria-hidden>→</span>
              </Link>
              <Link
                href="/apresentacao"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-[14.5px] text-white transition-colors hover:bg-white/5"
              >
                Ver apresentação
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Foco", "Venda real para nichos de eventos"],
              ["Prova", "Sites exemplo + assinatura mensal"],
              ["Escala", "Templates, agentes e parcerias B2B"],
              ["Meta", "SaaS de criação automática de sites"],
            ].map(([title, text]) => (
              <article
                key={title}
                className="rounded-[14px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
              >
                <h3 className="font-display text-[22px] italic tracking-[-0.01em] text-white">{title}</h3>
                <p className="mt-3 text-[13.5px] leading-[1.55] text-white/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </SlideShell>
    </main>
  );
}
