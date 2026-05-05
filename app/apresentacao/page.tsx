import Link from "next/link";
import type { Metadata } from "next";
import BrandHeader from "@/components/BrandHeader";
import { SAMPLE_EVENTS } from "@/lib/sampleEvents";

export const metadata: Metadata = {
  title: "Apresentacao comercial | Eventify AI",
  description:
    "Apresentacao profissional do Eventify AI, a plataforma que cria sites promocionais para eventos com agentes de inteligencia artificial.",
};

const metrics = [
  { value: "minutos", label: "para criar um site de evento" },
  { value: "R$49+", label: "por publicacao vendavel" },
  { value: "5+", label: "estilos visuais prontos para escalar" },
  { value: "IA", label: "copy, layout, RSVP e otimizacao" },
];

const problems = [
  "Sites de eventos ainda dependem de designer, briefing longo e muita revisao manual.",
  "Pequenos organizadores querem vender melhor, mas nao tem tempo ou equipe tecnica.",
  "Convites digitais simples nao entregam presenca de marca, RSVP, mapa e conversao.",
];

const solutionFlow = [
  "Cliente informa os dados do evento",
  "Agentes interpretam objetivo, estilo e publico",
  "IA gera textos, template, cores e experiencia",
  "Cliente revisa, paga e publica",
];

const agentGroups = [
  {
    title: "Produto",
    description: "Transforma dados crus em site pronto para vender e convidar.",
    items: ["Interpretacao", "Designer UI/UX", "Copywriter", "Gerador de site", "Imagens", "Localizacao", "RSVP"],
    color: "from-[#8847e7] to-[#ec4899]",
  },
  {
    title: "Crescimento",
    description: "Ajuda o negocio a atrair, converter e aumentar ticket medio.",
    items: ["Conteudo", "Anuncios", "SEO", "Vendas", "Upsell", "Ofertas"],
    color: "from-[#0ea5e9] to-[#10b981]",
  },
  {
    title: "Gestao",
    description: "Da visao operacional para escalar como SaaS de verdade.",
    items: ["Financeiro", "Metricas", "Estrategia", "Operacao", "Produto", "Suporte"],
    color: "from-[#f59e0b] to-[#ec4899]",
  },
];

const audience = [
  "Cerimonialistas e assessorias",
  "Buffets e casas de festa",
  "Produtores de eventos",
  "Empresas e RH",
  "Igrejas e comunidades",
  "Criadores que vendem experiencias",
];

const roadmap = [
  "Banco real e multiusuario",
  "Upload e banco de imagens",
  "Planos com Stripe, Pix e Mercado Pago",
  "Templates premium por nicho",
  "Dominio personalizado",
  "Dashboard de vendas e convidados",
];

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="eventify-card p-5">
      <p className="text-3xl font-black text-[#090814]">{value}</p>
      <p className="eventify-muted mt-2 text-sm font-semibold leading-5">{label}</p>
    </div>
  );
}

function MiniSiteMockup() {
  const event = SAMPLE_EVENTS[0];

  return (
    <div className="relative">
      <div className="eventify-card overflow-hidden p-3 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-[#e8e3f1] px-3 py-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 rounded-full bg-[#f3effb] px-3 py-1 text-xs font-bold text-[#5f5a72]">
            eventify.ai/{event.slug}
          </span>
        </div>

        <div className="grid overflow-hidden rounded-2xl bg-white lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-7">
            <span className="rounded-full bg-[#fff3f6] px-3 py-1 text-xs font-black uppercase tracking-widest text-[#b76e79]">
              {event.tipo}
            </span>
            <h3 className="mt-5 text-4xl font-black leading-tight text-[#24151a]">
              {event.siteGerado?.heroTitle}
            </h3>
            <p className="mt-4 text-sm leading-6 text-[#5f5a72]">{event.siteGerado?.subtitle}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {event.siteGerado?.highlights.map((highlight) => (
                <div key={highlight} className="rounded-2xl border border-[#f4dce4] bg-[#fff8fb] p-3 text-xs font-bold text-[#6b2538]">
                  {highlight}
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex min-h-11 items-center rounded-xl bg-[#b76e79] px-5 text-sm font-black text-white">
                Confirmar presenca
              </span>
              <span className="inline-flex min-h-11 items-center rounded-xl border border-[#f0d7df] px-5 text-sm font-black text-[#24151a]">
                Ver local
              </span>
            </div>
          </div>

          <div className="relative min-h-[360px]" style={{ background: event.imagemBg }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/85 p-5 shadow-xl backdrop-blur">
              <p className="text-xs font-black uppercase tracking-widest text-[#b76e79]">Agentes ativos</p>
              <div className="mt-4 space-y-3">
                {["Copy refinada", "Template elegante", "Mapa gerado", "RSVP pronto"].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#24151a]">
                    <span>{item}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">ok</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-8 -left-5 hidden max-w-[230px] rounded-2xl border border-[#d8f3e7] bg-white p-5 shadow-2xl sm:block">
        <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Oportunidade</p>
        <p className="mt-2 text-2xl font-black text-[#090814]">RSVP + upsell</p>
        <p className="eventify-muted mt-1 text-xs leading-5">Mais valor por evento, sem aumentar operacao manual.</p>
      </div>
    </div>
  );
}

function AgentGroupCard({ group }: { group: (typeof agentGroups)[number] }) {
  return (
    <article className="eventify-card overflow-hidden p-0">
      <div className={`h-2 bg-gradient-to-r ${group.color}`} />
      <div className="p-7">
        <h3 className="text-2xl font-black text-[#090814]">{group.title}</h3>
        <p className="eventify-muted mt-3 text-sm leading-6">{group.description}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {group.items.map((item) => (
            <span key={item} className="rounded-full border border-[#e8e3f1] bg-[#faf9ff] px-3 py-1.5 text-xs font-black text-[#3a3548]">
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

      <section className="relative overflow-hidden gradient-mesh">
        <div className="eventify-section grid items-center gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="eventify-kicker animate-fade-up">Plataforma de IA para eventos</span>
            <h1 className="eventify-title mt-6 text-5xl sm:text-6xl lg:text-7xl animate-fade-up animate-delay-1">
              Sites promocionais de eventos, prontos para vender em minutos.
            </h1>
            <p className="eventify-muted mt-6 max-w-2xl text-xl leading-8 animate-fade-up animate-delay-2">
              O Eventify AI transforma briefing, estilo e dados do evento em um site profissional com copy, design, mapa, RSVP e fluxo de publicacao.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 animate-fade-up animate-delay-3">
              <Link href="/pitch" className="eventify-button eventify-button-primary">
                Abrir pitch deck
              </Link>
              <Link href="/exemplos" className="eventify-button eventify-button-ghost">
                Ver sites exemplo
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} value={metric.value} label={metric.label} />
              ))}
            </div>
          </div>

          <MiniSiteMockup />
        </div>
      </section>

      <section className="eventify-section grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <span className="eventify-kicker">Problema real</span>
          <h2 className="eventify-title mt-5 text-4xl sm:text-5xl">Criar um bom site de evento ainda e lento, caro e manual.</h2>
          <p className="eventify-muted mt-5 text-lg leading-8">
            Existe demanda recorrente em casamentos, aniversarios, eventos corporativos, festas, igrejas e comunidades. O gargalo e transformar ideia em presenca digital com velocidade e padrao profissional.
          </p>
        </div>

        <div className="grid gap-4">
          {problems.map((problem, index) => (
            <div key={problem} className="eventify-card flex gap-5 p-6">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-[#f3effb] text-lg font-black text-[#8847e7]">
                {index + 1}
              </span>
              <p className="text-lg font-bold leading-7 text-[#2c2638]">{problem}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e8e3f1] bg-white">
        <div className="eventify-section">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eventify-kicker">Como funciona</span>
            <h2 className="eventify-title mt-5 text-4xl sm:text-5xl">Uma linha de producao inteligente para sites de eventos.</h2>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {solutionFlow.map((step, index) => (
              <article key={step} className="eventify-card p-6">
                <span className="text-sm font-black uppercase tracking-widest text-[#8847e7]">Passo {index + 1}</span>
                <h3 className="mt-4 text-2xl font-black leading-tight text-[#090814]">{step}</h3>
                <div className="mt-8 h-2 rounded-full bg-gradient-to-r from-[#8847e7] via-[#ec4899] to-[#f59e0b]" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="eventify-section">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="eventify-kicker">Sistema de agentes</span>
            <h2 className="eventify-title mt-5 text-4xl sm:text-5xl">Nao e so um gerador. E uma operacao digital com agentes especializados.</h2>
          </div>
          <p className="eventify-muted text-lg leading-8">
            Cada agente tem uma funcao clara: entender o cliente, desenhar a pagina, escrever o texto, montar o site, otimizar, vender, medir e sugerir proximos passos para escalar o negocio.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {agentGroups.map((group) => (
            <AgentGroupCard key={group.title} group={group} />
          ))}
        </div>
      </section>

      <section className="bg-[#090814] text-white">
        <div className="eventify-section grid gap-10 lg:grid-cols-2">
          <div>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white">
              Modelo comercial
            </span>
            <h2 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">Produto simples de vender, com upsells naturais.</h2>
            <p className="mt-5 text-lg leading-8 text-white/75">
              O cliente paga para publicar. Antes disso, ele pode criar, visualizar e ajustar. O valor percebido aumenta com RSVP, personalizacao, dominio, templates premium e suporte para eventos maiores.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Basico", "R$29", "Site simples"],
              ["Intermediario", "R$49", "Site + RSVP"],
              ["Premium", "R$79", "IA completa"],
            ].map(([plan, price, description]) => (
              <article key={plan} className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <p className="text-sm font-black uppercase tracking-widest text-white/60">{plan}</p>
                <p className="mt-4 text-4xl font-black">{price}</p>
                <p className="mt-3 text-sm font-semibold text-white/70">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="eventify-section grid gap-8 lg:grid-cols-2">
        <div className="eventify-card p-8">
          <span className="eventify-kicker">Publico-alvo</span>
          <h2 className="eventify-title mt-5 text-4xl">Quem compra</h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {audience.map((item) => (
              <div key={item} className="rounded-2xl border border-[#e8e3f1] bg-white p-4 text-sm font-black text-[#2c2638]">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="eventify-card p-8">
          <span className="eventify-kicker">Roadmap</span>
          <h2 className="eventify-title mt-5 text-4xl">O que deixa lucrativo</h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {roadmap.map((item) => (
              <div key={item} className="rounded-2xl border border-[#e8e3f1] bg-[#faf9ff] p-4 text-sm font-black text-[#2c2638]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="eventify-section pt-0">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#8847e7] via-[#cf67ee] to-[#f59e0b] p-10 text-center text-white shadow-2xl sm:p-14">
          <div className="relative mx-auto max-w-3xl">
            <p className="text-sm font-black uppercase tracking-widest text-white/75">Eventify AI</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">Uma fabrica de sites de eventos pronta para virar SaaS.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/85">
              A combinacao de IA, templates, pagamento e dashboard cria um produto vendavel para clientes finais e parceiros do mercado de eventos.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/pitch" className="inline-flex min-h-12 items-center rounded-xl bg-white px-7 font-black text-[#090814] shadow-xl transition hover:scale-105">
                Apresentar agora
              </Link>
              <Link href="/novo-evento" className="inline-flex min-h-12 items-center rounded-xl border border-white/30 bg-white/10 px-7 font-black backdrop-blur transition hover:bg-white/20">
                Criar demonstracao
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
