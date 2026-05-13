import Link from "next/link";
import type { Metadata } from "next";
import BrandHeader from "@/components/BrandHeader";
import { SAMPLE_EVENTS } from "@/lib/sampleEvents";

export const metadata: Metadata = {
  title: "Apresentação comercial · Eventify",
  description:
    "Apresentação profissional do Eventify, a plataforma que cria sites promocionais para eventos com agentes de inteligência artificial.",
};

const metrics: { value: string; label: string }[] = [
  { value: "minutos", label: "para criar um site de evento" },
  { value: "R$ 49/mês", label: "assinatura recorrente vendável" },
  { value: "5+", label: "estilos visuais prontos para escalar" },
  { value: "IA", label: "copy, layout, RSVP e otimização" },
];

const problems = [
  "Sites de eventos ainda dependem de designer, briefing longo e muita revisão manual.",
  "Pequenos organizadores querem vender melhor, mas não têm tempo ou equipe técnica.",
  "Convites digitais simples não entregam presença de marca, RSVP, mapa e conversão.",
];

const solutionFlow = [
  "Cliente informa os dados do evento",
  "Agentes interpretam objetivo, estilo e público",
  "IA gera textos, template, cores e experiência",
  "Cliente revisa, assina e publica",
];

const agentGroups = [
  {
    title: "Produto",
    description: "Transforma dados crus em site pronto para vender e convidar.",
    items: ["Interpretação", "Designer UI/UX", "Copywriter", "Gerador de site", "Imagens", "Localização", "RSVP"],
  },
  {
    title: "Crescimento",
    description: "Ajuda o negócio a atrair, converter e aumentar ticket médio.",
    items: ["Conteúdo", "Anúncios", "SEO", "Vendas", "Upsell", "Ofertas"],
  },
  {
    title: "Gestão",
    description: "Dá visão operacional para escalar como SaaS de verdade.",
    items: ["Financeiro", "Métricas", "Estratégia", "Operação", "Produto", "Suporte"],
  },
];

const audience = [
  "Cerimonialistas e assessorias",
  "Buffets e casas de festa",
  "Produtores de eventos",
  "Empresas e RH",
  "Igrejas e comunidades",
  "Criadores que vendem experiências",
];

const roadmap = [
  "Banco real e multiusuário",
  "Upload e banco de imagens",
  "Planos com Stripe, Pix e Mercado Pago",
  "Templates premium por nicho",
  "Domínio personalizado",
  "Dashboard de vendas e convidados",
];

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-5">
      <p className="font-display text-[28px] font-light leading-none tracking-[-0.02em] text-[color:var(--ink)]">
        {value}
      </p>
      <p className="mt-2 text-[13px] leading-[1.45] text-[color:var(--muted)]">{label}</p>
    </div>
  );
}

function MiniSiteMockup() {
  const event = SAMPLE_EVENTS[0];

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] ring-glow">
        <div className="flex items-center gap-2 border-b border-[color:var(--hairline)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--hairline-2)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--hairline-2)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--hairline-2)]" />
          <span className="ml-3 rounded-full bg-[color:var(--paper-2)] px-3 py-1 font-mono-tight text-[11px] text-[color:var(--muted)]">
            eventify.app/{event.slug}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-[color:var(--hairline)] p-7 lg:border-b-0 lg:border-r">
            <span className="rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--paper)] px-3 py-1 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--ink-2)]">
              {event.tipo}
            </span>
            <h3 className="mt-5 font-display text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-[color:var(--ink)]">
              {event.siteGerado?.heroTitle}
            </h3>
            <p className="mt-3 text-[13.5px] leading-[1.55] text-[color:var(--muted)]">
              {event.siteGerado?.subtitle}
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {event.siteGerado?.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-[8px] border border-[color:var(--hairline-2)] bg-[color:var(--paper)] p-3 text-center text-[11.5px] text-[color:var(--ink-2)]"
                >
                  {highlight}
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <span className="inline-flex min-h-10 items-center rounded-full bg-[color:var(--ink)] px-4 text-[12.5px] font-medium text-white">
                Confirmar presença
              </span>
              <span className="inline-flex min-h-10 items-center rounded-full border border-[color:var(--hairline-2)] px-4 text-[12.5px] text-[color:var(--ink)]">
                Ver local
              </span>
            </div>
          </div>

          <div className="relative min-h-[360px]" style={{ background: event.imagemBg }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/5" />
            <div className="absolute inset-x-5 bottom-5 rounded-[12px] border border-white/15 bg-white/85 p-5 backdrop-blur">
              <p className="text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--gold)]">Agentes ativos</p>
              <div className="mt-4 space-y-1">
                {["Copy refinada", "Template elegante", "Mapa gerado", "RSVP pronto"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between border-t border-[color:var(--hairline)] py-2 text-[12.5px] text-[color:var(--ink-2)]"
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

      <div className="absolute -bottom-7 -left-4 hidden max-w-[230px] rounded-[12px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-5 ring-glow sm:block">
        <p className="text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--green,#5B7A4F)]">
          Oportunidade
        </p>
        <p className="mt-2 font-display text-[22px] italic tracking-[-0.01em] text-[color:var(--ink)]">
          RSVP + upsell
        </p>
        <p className="mt-1 text-[12px] leading-[1.5] text-[color:var(--muted)]">
          Mais valor por evento, sem aumentar operação manual.
        </p>
      </div>
    </div>
  );
}

function AgentGroupCard({ group }: { group: (typeof agentGroups)[number] }) {
  return (
    <article className="overflow-hidden rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)]">
      <div className="h-[3px] bg-[color:var(--gold)]" />
      <div className="p-7">
        <h3 className="font-display text-[26px] italic tracking-[-0.01em] text-[color:var(--ink)]">
          {group.title}
        </h3>
        <p className="mt-3 text-[14px] leading-[1.6] text-[color:var(--muted)]">{group.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {group.items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[color:var(--hairline)] bg-[color:var(--paper)] px-3 py-1 text-[11.5px] text-[color:var(--ink-2)]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function ApresentacaoPage() {
  return (
    <main className="eventify-page">
      <BrandHeader
        actions={[
          { href: "/pitch", label: "Ver pitch", variant: "ghost" },
          { href: "/exemplos", label: "Exemplos", variant: "ghost" },
          { href: "/novo-evento", label: "Criar demo", variant: "primary" },
        ]}
      />

      {/* HERO */}
      <section className="relative overflow-hidden gradient-mesh">
        <div className="editorial-wrap grid items-center gap-14 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="eventify-kicker">Plataforma de IA para eventos</span>
            <h1 className="eventify-title mt-6 text-[clamp(44px,5.8vw,80px)]">
              Sites de evento, prontos para vender em <em>minutos.</em>
            </h1>
            <p className="mt-7 max-w-[58ch] text-[18px] leading-[1.6] text-[color:var(--muted)]">
              O Eventify transforma briefing, estilo e dados do evento em um site profissional com copy, design, mapa, RSVP e fluxo de publicação.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pitch" className="eventify-button eventify-button-primary">
                Abrir pitch deck
              </Link>
              <Link href="/exemplos" className="eventify-button eventify-button-ghost">
                Ver sites exemplo
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} value={metric.value} label={metric.label} />
              ))}
            </div>
          </div>

          <MiniSiteMockup />
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="editorial-wrap grid gap-10 py-24 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <span className="eventify-kicker">Problema real</span>
          <h2 className="eventify-title mt-6 text-[clamp(36px,4.6vw,60px)]">
            Criar um bom site de evento ainda é <em>lento, caro e manual.</em>
          </h2>
          <p className="mt-5 text-[16px] leading-[1.7] text-[color:var(--muted)]">
            Existe demanda recorrente em casamentos, aniversários, eventos corporativos, festas, igrejas e comunidades. O gargalo é transformar ideia em presença digital com velocidade e padrão profissional.
          </p>
        </div>

        <div className="grid gap-4">
          {problems.map((problem, index) => (
            <div
              key={problem}
              className="flex gap-5 rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-6"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--paper-2)] font-mono-tight text-[12px] text-[color:var(--gold)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-[16px] leading-[1.6] text-[color:var(--ink-2)]">{problem}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="border-y border-[color:var(--hairline)] bg-[color:var(--paper-2)] py-24">
        <div className="editorial-wrap">
          <div className="mx-auto max-w-[44ch] text-center">
            <span className="eventify-kicker">Como funciona</span>
            <h2 className="eventify-title mt-6 text-[clamp(36px,4.6vw,60px)]">
              Linha de produção <em>inteligente</em> para sites de eventos.
            </h2>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-4">
            {solutionFlow.map((step, index) => (
              <article
                key={step}
                className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-6"
              >
                <span className="text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                  Passo {index + 1}
                </span>
                <h3 className="mt-4 font-display text-[22px] font-normal leading-[1.2] tracking-[-0.01em] text-[color:var(--ink)]">
                  {step}
                </h3>
                <div className="mt-7 h-px w-full bg-[color:var(--gold)]" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* AGENTES */}
      <section className="editorial-wrap py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="eventify-kicker">Sistema de agentes</span>
            <h2 className="eventify-title mt-6 text-[clamp(36px,4.6vw,60px)]">
              Não é só um gerador. É uma <em>operação digital.</em>
            </h2>
          </div>
          <p className="text-[16px] leading-[1.7] text-[color:var(--muted)]">
            Cada agente tem uma função clara: entender o cliente, desenhar a página, escrever o texto, montar o site, otimizar, vender, medir e sugerir próximos passos para escalar o negócio.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {agentGroups.map((group) => (
            <AgentGroupCard key={group.title} group={group} />
          ))}
        </div>
      </section>

      {/* MODELO COMERCIAL */}
      <section className="bg-[color:var(--ink)] text-white">
        <div className="editorial-wrap grid gap-12 py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-[11.5px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
              Modelo comercial
            </span>
            <h2 className="mt-7 font-display text-[clamp(36px,4.6vw,60px)] font-light leading-[1.02] tracking-[-0.02em]">
              Simples de vender, com upsells <em className="italic text-[color:var(--gold)]">naturais.</em>
            </h2>
            <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.7] text-white/65">
              O cliente assina para publicar. Antes disso, ele pode criar, visualizar e ajustar. O valor percebido aumenta com RSVP, personalização, domínio, templates premium e suporte para eventos maiores.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Básico", "R$ 29", "Site simples"],
              ["Intermediário", "R$ 49", "Site + RSVP"],
              ["Premium", "R$ 79", "IA completa"],
            ].map(([plan, price, description]) => (
              <article key={plan} className="rounded-[14px] border border-white/10 bg-white/[0.04] p-6">
                <p className="text-[10.5px] uppercase tracking-[0.22em] text-white/60">{plan}</p>
                <p className="mt-4 font-display text-[36px] font-light leading-none tracking-[-0.02em]">
                  {price}
                  <span className="ml-1 text-[12px] font-normal text-white/55 font-sans">/mês</span>
                </p>
                <p className="mt-3 text-[13px] text-white/65">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PUBLICO + ROADMAP */}
      <section className="editorial-wrap grid gap-6 py-24 lg:grid-cols-2">
        <div className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-8">
          <span className="eventify-kicker">Público-alvo</span>
          <h2 className="eventify-title mt-5 text-[clamp(28px,3.4vw,40px)]">Quem compra</h2>
          <div className="mt-7 grid gap-2 sm:grid-cols-2">
            {audience.map((item) => (
              <div
                key={item}
                className="rounded-[8px] border border-[color:var(--hairline)] bg-[color:var(--paper)] p-3.5 text-[13px] text-[color:var(--ink-2)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-8">
          <span className="eventify-kicker">Roadmap</span>
          <h2 className="eventify-title mt-5 text-[clamp(28px,3.4vw,40px)]">O que deixa lucrativo</h2>
          <div className="mt-7 grid gap-2 sm:grid-cols-2">
            {roadmap.map((item) => (
              <div
                key={item}
                className="rounded-[8px] border border-[color:var(--hairline)] bg-[color:var(--paper-2)] p-3.5 text-[13px] text-[color:var(--ink-2)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="editorial-wrap pb-24">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[18px] bg-[color:var(--ink)] p-12 text-center text-white sm:p-16">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)]">Eventify</p>
          <h2 className="mx-auto mt-5 max-w-[22ch] font-display text-[clamp(36px,4.8vw,60px)] font-light leading-[1.02] tracking-[-0.02em]">
            Uma fábrica de sites de evento <em className="italic text-[color:var(--gold)]">pronta para virar SaaS.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-[48ch] text-[16px] leading-[1.6] text-white/65">
            A combinação de IA, templates, pagamento e dashboard cria um produto vendável para clientes finais e parceiros do mercado de eventos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/pitch"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14.5px] font-medium text-[color:var(--ink)] transition-transform hover:-translate-y-px"
            >
              Apresentar agora <span aria-hidden>→</span>
            </Link>
            <Link
              href="/novo-evento"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-[14.5px] text-white transition-colors hover:bg-white/5"
            >
              Criar demonstração
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
