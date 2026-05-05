import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import BrandHeader from "@/components/BrandHeader";

export const metadata: Metadata = {
  title: "Pitch Deck | Eventify AI",
  description:
    "Pitch deck profissional do Eventify AI para apresentar a plataforma de sites automaticos para eventos com inteligencia artificial.",
};

const slides = [
  "Visao",
  "Problema",
  "Solucao",
  "Produto",
  "Agentes",
  "Mercado",
  "Receita",
  "Diferenciais",
  "Roadmap",
  "Proxima etapa",
];

const productPillars = [
  { title: "Briefing rapido", text: "Nome, tipo, data, cidade, imagem e detalhes do evento." },
  { title: "IA criativa", text: "Texto, estilo, template e sugestoes comerciais automaticamente." },
  { title: "Site publicado", text: "Pagina com hero, mapa, RSVP, QR Code e CTA de pagamento." },
];

const agentMap = [
  ["Interpreta", "Entende o cliente e transforma pedidos vagos em direcao clara."],
  ["Desenha", "Define layout, cores, hierarquia visual e experiencia responsiva."],
  ["Escreve", "Cria copy emocional, corporativa ou promocional conforme o evento."],
  ["Monta", "Renderiza site, RSVP, mapa, QR Code e pagina publica."],
  ["Otimiza", "Melhora qualidade, clareza, conversao e valor percebido."],
  ["Vende", "Gera ofertas, upsells, campanhas e argumentos comerciais."],
];

const revenueLines = [
  ["Publicacao avulsa", "R$29 a R$79 por evento"],
  ["Planos premium", "Templates, dominio, RSVP avancado"],
  ["Parcerias B2B", "Cerimonialistas, buffets e produtoras"],
  ["Servicos extras", "Setup assistido, fotos, copy premium"],
];

const roadmap = [
  "Banco de dados real e multiusuario",
  "Checkout completo com Pix/cartao",
  "Upload de imagens e biblioteca premium",
  "Analytics de convidados e conversao",
  "Templates por nicho e por cidade",
  "Dominio personalizado e marketplace",
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
          ? "min-h-[calc(100vh-82px)] scroll-mt-24 bg-[#090814] text-white"
          : "min-h-[calc(100vh-82px)] scroll-mt-24 bg-[#faf9ff] text-[#090814]"
      }
      id={`slide-${number}`}
    >
      <div className="eventify-section flex min-h-[calc(100vh-82px)] flex-col justify-center py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <span
            className={
              dark
                ? "rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/70"
                : "eventify-kicker"
            }
          >
            {kicker}
          </span>
          <span className={dark ? "text-sm font-black text-white/40" : "text-sm font-black text-[#a8a2c4]"}>
            {String(number).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>

        <h1 className={dark ? "max-w-5xl text-5xl font-black leading-tight sm:text-7xl" : "eventify-title max-w-5xl text-5xl sm:text-7xl"}>
          {title}
        </h1>

        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

function BrowserMockup() {
  return (
    <div className="eventify-card overflow-hidden p-3 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-[#e8e3f1] px-3 py-2">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 rounded-full bg-[#f3effb] px-3 py-1 text-xs font-bold text-[#5f5a72]">
          eventify.ai/evento/corporativo
        </span>
      </div>

      <div className="grid gap-0 overflow-hidden rounded-2xl bg-[#f8fbff] lg:grid-cols-[1fr_0.8fr]">
        <div className="p-8">
          <span className="rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-black uppercase tracking-widest text-[#2563eb]">
            Summit Tech AI 2026
          </span>
          <h3 className="mt-5 text-4xl font-black leading-tight text-[#0f172a]">Conferencia premium gerada pela IA.</h3>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#475569]">
            Uma pagina completa com posicionamento, agenda, mapa, confirmacao de presenca e CTA para reservar lugar.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {["Keynotes", "Networking", "Credenciamento"].map((item) => (
              <div key={item} className="rounded-2xl border border-[#c7d2fe] bg-white p-4 text-sm font-black text-[#1d4ed8]">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#dbeafe] via-[#c7d2fe] to-white p-8">
          <div className="rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur">
            <p className="text-xs font-black uppercase tracking-widest text-[#2563eb]">Score de qualidade</p>
            <p className="mt-2 text-6xl font-black text-[#0f172a]">94</p>
            <div className="mt-5 space-y-3">
              {["Copy alinhada", "Template corporativo", "CTA forte"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-xl bg-[#eff6ff] px-4 py-3 text-sm font-bold text-[#0f172a]">
                  <span>{item}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">ok</span>
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
    <main className="eventify-page bg-[#faf9ff]">
      <BrandHeader
        actions={[
          { href: "/apresentacao", label: "Resumo comercial", variant: "ghost" },
          { href: "/exemplos", label: "Exemplos", variant: "ghost" },
          { href: "/novo-evento", label: "Criar demo", variant: "primary" },
        ]}
      />

      <nav className="sticky top-[82px] z-20 hidden border-b border-[#e8e3f1] bg-white/80 px-6 py-3 backdrop-blur lg:block">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
          {slides.map((slide, index) => (
            <a
              key={slide}
              href={`#slide-${index + 1}`}
              className="rounded-full border border-[#e8e3f1] bg-white px-4 py-2 text-xs font-black text-[#5f5a72] transition hover:border-[#8847e7] hover:text-[#8847e7]"
            >
              {index + 1}. {slide}
            </a>
          ))}
        </div>
      </nav>

      <SlideShell number={1} kicker="Pitch deck" title="Eventify AI cria sites de eventos com inteligencia artificial.">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="eventify-muted max-w-2xl text-2xl leading-9">
              Uma plataforma SaaS para transformar dados de eventos em sites promocionais completos, bonitos e vendaveis em minutos.
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

      <SlideShell number={2} kicker="Problema" title="O mercado de eventos compra rapidez, mas ainda recebe processo manual.">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            ["Tempo", "Briefing, design, revisoes e publicacao atrasam eventos que precisam ir ao ar rapido."],
            ["Custo", "Um site personalizado costuma depender de freelancer, agencia ou ferramenta generica."],
            ["Conversao", "Convites simples nao resolvem mapa, presenca, copy, CTA e valor percebido."],
          ].map(([title, text]) => (
            <article key={title} className="eventify-card p-8">
              <h3 className="text-3xl font-black text-[#090814]">{title}</h3>
              <p className="eventify-muted mt-4 text-lg leading-8">{text}</p>
            </article>
          ))}
        </div>
      </SlideShell>

      <SlideShell number={3} kicker="Solucao" title="Uma fabrica automatizada de sites promocionais para eventos.">
        <div className="grid gap-5 lg:grid-cols-3">
          {productPillars.map((pillar, index) => (
            <article key={pillar.title} className="eventify-card p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8847e7] to-[#ec4899] text-xl font-black text-white">
                {index + 1}
              </span>
              <h3 className="mt-6 text-3xl font-black text-[#090814]">{pillar.title}</h3>
              <p className="eventify-muted mt-4 text-lg leading-8">{pillar.text}</p>
            </article>
          ))}
        </div>
      </SlideShell>

      <SlideShell number={4} kicker="Produto" title="Do cadastro ao site publicado, tudo dentro do mesmo fluxo.">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-4">
            {["Criar evento", "Gerar com IA", "Editar e aprovar", "Pagar para publicar", "Receber RSVP"].map((step, index) => (
              <div key={step} className="eventify-card flex items-center gap-5 p-5">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[#f3effb] text-lg font-black text-[#8847e7]">
                  {index + 1}
                </span>
                <p className="text-xl font-black text-[#2c2638]">{step}</p>
              </div>
            ))}
          </div>
          <BrowserMockup />
        </div>
      </SlideShell>

      <SlideShell number={5} kicker="Agentes" title="A IA trabalha como uma equipe, nao como uma resposta unica.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agentMap.map(([title, text]) => (
            <article key={title} className="eventify-card p-6">
              <h3 className="text-2xl font-black text-[#090814]">{title}</h3>
              <p className="eventify-muted mt-3 leading-7">{text}</p>
            </article>
          ))}
        </div>
      </SlideShell>

      <SlideShell number={6} kicker="Mercado" title="O cliente ja existe: quem organiza evento precisa aparecer melhor e mais rapido.">
        <div className="grid gap-5 lg:grid-cols-4">
          {["Casamentos", "Aniversarios", "Corporativo", "Festas", "Religioso", "Formaturas", "Workshops", "Lojas locais"].map((market) => (
            <article key={market} className="eventify-card p-6">
              <p className="text-2xl font-black text-[#090814]">{market}</p>
              <p className="eventify-muted mt-3 text-sm leading-6">Nicho recorrente com urgencia, divulgacao e necessidade de confirmacao.</p>
            </article>
          ))}
        </div>
      </SlideShell>

      <SlideShell number={7} kicker="Receita" title="Monetizacao direta por publicacao, com aumento natural de ticket.">
        <div className="grid gap-5 lg:grid-cols-4">
          {revenueLines.map(([title, text]) => (
            <article key={title} className="eventify-card p-7">
              <h3 className="text-2xl font-black text-[#090814]">{title}</h3>
              <p className="eventify-muted mt-4 text-lg leading-8">{text}</p>
            </article>
          ))}
        </div>
      </SlideShell>

      <SlideShell number={8} kicker="Diferenciais" title="O diferencial e juntar IA, design, publicacao e negocio no mesmo produto.">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="eventify-card p-8">
            <h3 className="text-3xl font-black text-[#090814]">Para o cliente</h3>
            <div className="mt-6 grid gap-3">
              {["Nao precisa escrever textos", "Nao precisa escolher layout do zero", "Nao precisa contratar tecnico", "Publica quando aprovar"].map((item) => (
                <p key={item} className="rounded-2xl bg-[#faf9ff] p-4 font-bold text-[#2c2638]">{item}</p>
              ))}
            </div>
          </article>
          <article className="eventify-card p-8">
            <h3 className="text-3xl font-black text-[#090814]">Para o negocio</h3>
            <div className="mt-6 grid gap-3">
              {["Baixo custo operacional", "Venda escalavel", "Templates reaproveitaveis", "Upsells claros"].map((item) => (
                <p key={item} className="rounded-2xl bg-[#faf9ff] p-4 font-bold text-[#2c2638]">{item}</p>
              ))}
            </div>
          </article>
        </div>
      </SlideShell>

      <SlideShell number={9} kicker="Roadmap" title="O caminho para virar uma plataforma completa de eventos.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roadmap.map((item, index) => (
            <article key={item} className="eventify-card p-7">
              <span className="text-sm font-black uppercase tracking-widest text-[#8847e7]">Fase {index + 1}</span>
              <h3 className="mt-4 text-2xl font-black leading-tight text-[#090814]">{item}</h3>
            </article>
          ))}
        </div>
      </SlideShell>

      <SlideShell number={10} kicker="Proxima etapa" title="Transformar o prototipo em produto vendavel, medido e escalavel." tone="dark">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="max-w-2xl text-2xl leading-9 text-white/75">
              A base ja tem eventos, pagina promocional, templates, agentes, admin, pagamento e publicacao. O proximo salto e lapidar onboarding, checkout, metricas e distribuicao comercial.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/novo-evento" className="inline-flex min-h-12 items-center rounded-xl bg-white px-7 font-black text-[#090814] shadow-xl transition hover:scale-105">
                Criar demonstracao
              </Link>
              <Link href="/apresentacao" className="inline-flex min-h-12 items-center rounded-xl border border-white/20 bg-white/10 px-7 font-black text-white backdrop-blur transition hover:bg-white/20">
                Ver apresentacao
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Foco", "Venda real para nichos de eventos"],
              ["Prova", "Sites exemplo + pagamento por publicacao"],
              ["Escala", "Templates, agentes e parcerias B2B"],
              ["Meta", "SaaS de criacao automatica de sites"],
            ].map(([title, text]) => (
              <article key={title} className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <h3 className="text-2xl font-black">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-white/70">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </SlideShell>
    </main>
  );
}
