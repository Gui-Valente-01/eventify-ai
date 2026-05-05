import Link from "next/link";
import type { Metadata } from "next";
import DomainBar from "@/components/DomainBar";

export const metadata: Metadata = {
  title: "Summit Tech AI 2026 — Conferência de IA · São Paulo",
  description: "A maior conferência de IA generativa do Brasil. 8 de outubro · Faria Lima.",
};

const speakers = [
  { nome: "Dr. Aline Mendes", cargo: "Head of AI Research", empresa: "Itaú", iniciais: "AM", cor: "from-blue-500 to-indigo-600" },
  { nome: "Carlos Drummond", cargo: "VP Engineering", empresa: "Nubank", iniciais: "CD", cor: "from-purple-500 to-pink-600" },
  { nome: "Patricia Yu", cargo: "Founder & CEO", empresa: "Datavision", iniciais: "PY", cor: "from-emerald-500 to-teal-600" },
  { nome: "Rafael Torres", cargo: "Principal Scientist", empresa: "Anthropic", iniciais: "RT", cor: "from-amber-500 to-orange-600" },
  { nome: "Beatriz Lima", cargo: "Product Director", empresa: "Stone", iniciais: "BL", cor: "from-rose-500 to-fuchsia-600" },
  { nome: "Diego Marquez", cargo: "CTO", empresa: "QuintoAndar", iniciais: "DM", cor: "from-cyan-500 to-blue-600" },
  { nome: "Marina Costa", cargo: "ML Engineering Lead", empresa: "iFood", iniciais: "MC", cor: "from-violet-500 to-purple-600" },
  { nome: "Thiago Andrade", cargo: "Director of AI", empresa: "PicPay", iniciais: "TA", cor: "from-orange-500 to-red-600" },
];

const trilhasCores = {
  blue: { badge: "bg-blue-500/15 text-blue-300", dot: "bg-blue-400", num: "1" },
  purple: { badge: "bg-purple-500/15 text-purple-300", dot: "bg-purple-400", num: "2" },
  emerald: { badge: "bg-emerald-500/15 text-emerald-300", dot: "bg-emerald-400", num: "3" },
} as const;

const trilhas = [
  {
    nome: "AI Generativa",
    cor: "blue" as const,
    sessoes: [
      { hora: "09h00", titulo: "Keynote: O futuro da IA aplicada", speaker: "Dr. Aline Mendes" },
      { hora: "10h30", titulo: "Construindo agentes autônomos com Claude", speaker: "Rafael Torres" },
      { hora: "14h00", titulo: "RAG em produção: lições do Nubank", speaker: "Carlos Drummond" },
      { hora: "16h00", titulo: "Painel: O ROI real da IA generativa", speaker: "Mesa redonda" },
    ],
  },
  {
    nome: "MLOps & Infraestrutura",
    cor: "purple" as const,
    sessoes: [
      { hora: "09h00", titulo: "Servindo modelos a 100M de requests/dia", speaker: "Marina Costa" },
      { hora: "10h30", titulo: "Custo, latência e qualidade: o triângulo", speaker: "Diego Marquez" },
      { hora: "14h00", titulo: "Observabilidade para LLMs", speaker: "Thiago Andrade" },
      { hora: "16h00", titulo: "Workshop: deploy de fine-tuning", speaker: "Patricia Yu" },
    ],
  },
  {
    nome: "Produto & Estratégia",
    cor: "emerald" as const,
    sessoes: [
      { hora: "09h00", titulo: "Como dar autonomia a um agente", speaker: "Beatriz Lima" },
      { hora: "10h30", titulo: "UX para AI: o que mudou", speaker: "Patricia Yu" },
      { hora: "14h00", titulo: "Métricas para produtos com IA", speaker: "Diego Marquez" },
      { hora: "16h00", titulo: "Roadmaps que assumem que o modelo vai mudar", speaker: "Marina Costa" },
    ],
  },
];

const patrocinadores = {
  diamante: ["Anthropic", "AWS", "Google Cloud"],
  ouro: ["Microsoft", "OpenAI", "NVIDIA", "Databricks"],
  prata: ["Vercel", "Supabase", "Linear", "GitHub", "Stripe", "MongoDB"],
};

export default function CorporativoPage() {
  return (
    <main className="min-h-screen bg-[#0A0E27] text-slate-100">
      <DomainBar domain="summit.techai.com.br" theme="dark" />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E27] via-[#1a1f4a] to-[#0A0E27]" />
          <div className="absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1f4a_1px,transparent_1px),linear-gradient(to_bottom,#1a1f4a_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-300 backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                Inscrições abertas · Lotes limitados
              </div>

              <h1 className="mt-8 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                <span className="block text-slate-400">Summit</span>
                <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Tech AI 2026
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300">
                A conferência definitiva sobre IA generativa, MLOps e produtos
                inteligentes. Líderes da Anthropic, Nubank, iFood e mais 30
                empresas em um único dia na Faria Lima.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <a href="#inscricao" className="inline-flex min-h-12 items-center rounded-md bg-blue-500 px-7 text-sm font-bold text-white transition hover:bg-blue-600">
                  Garanta sua vaga →
                </a>
                <a href="#agenda" className="inline-flex min-h-12 items-center rounded-md border border-white/15 bg-white/5 px-7 text-sm font-bold text-slate-200 backdrop-blur transition hover:bg-white/10">
                  Ver agenda completa
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/5 pt-8">
                <div>
                  <p className="text-3xl font-black text-blue-400">8.10</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Outubro 2026</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-400">800+</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Profissionais</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-400">18</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Keynotes</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Local</p>
                <p className="mt-3 text-2xl font-bold text-slate-100">Centro de Convenções Faria Lima</p>
                <p className="mt-2 text-sm text-slate-400">Av. Brigadeiro Faria Lima, 3477 · São Paulo/SP</p>
                <div className="mt-6 h-px bg-white/10" />
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Credenciamento</span>
                    <span className="text-sm font-bold text-slate-200">08h00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Keynote abertura</span>
                    <span className="text-sm font-bold text-slate-200">09h00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Encerramento</span>
                    <span className="text-sm font-bold text-slate-200">19h30</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">After-party</span>
                    <span className="text-sm font-bold text-blue-400">21h00 · Bar Casa Europa</span>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 rounded-full bg-amber-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#0A0E27] shadow-xl">
                ⚡ Lote 2 · -30%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PATROCINADORES STRIP */}
      <section className="border-b border-white/5 bg-white/[0.02] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
            Apresentado pelas empresas mais inovadoras do país
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {[...patrocinadores.diamante, ...patrocinadores.ouro].map((logo) => (
              <span key={logo} className="text-2xl font-black tracking-tight text-slate-400 grayscale transition hover:text-slate-200 hover:grayscale-0">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SPEAKERS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">Speakers · 8 outubro</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Quem você vai ouvir
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-400">
            Profissionais que estão construindo a próxima geração de produtos com IA — não apenas teorizando sobre.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {speakers.map((s) => (
            <article key={s.nome} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-500/40 hover:bg-white/[0.06]">
              <div className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${s.cor} text-xl font-black text-white shadow-xl`}>
                {s.iniciais}
              </div>
              <h3 className="text-lg font-bold text-slate-100">{s.nome}</h3>
              <p className="mt-1 text-sm text-slate-400">{s.cargo}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                {s.empresa}
              </p>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </article>
          ))}
        </div>
      </section>

      {/* AGENDA POR TRILHA */}
      <section id="agenda" className="border-y border-white/5 bg-white/[0.02] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">Agenda · 3 trilhas paralelas</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Construa sua jornada</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Trilhas independentes rodando em paralelo. Você escolhe palestra a palestra.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {trilhas.map((t) => (
              <div key={t.nome} className="rounded-2xl border border-white/10 bg-[#0A0E27] p-6">
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${trilhasCores[t.cor].badge}`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${trilhasCores[t.cor].dot}`} />
                  Trilha {trilhasCores[t.cor].num}
                </div>
                <h3 className="mt-4 text-2xl font-bold">{t.nome}</h3>
                <ul className="mt-6 space-y-3">
                  {t.sessoes.map((s) => (
                    <li key={s.titulo} className="rounded-lg border border-white/5 bg-white/[0.02] p-4 transition hover:border-white/15">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-mono text-xs font-bold text-slate-500">{s.hora}</p>
                        <p className="text-xs text-slate-500">{s.speaker}</p>
                      </div>
                      <p className="mt-2 text-sm font-bold text-slate-200">{s.titulo}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PATROCINADORES TIERS */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">Patrocinadores</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Quem viabiliza</h2>
        </div>

        <div className="mt-12 space-y-10">
          <div>
            <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.3em] text-amber-400">◆ Diamante ◆</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {patrocinadores.diamante.map((p) => (
                <div key={p} className="rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-transparent p-8 text-center">
                  <p className="text-3xl font-black text-slate-100">{p}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.3em] text-slate-300">◆ Ouro ◆</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {patrocinadores.ouro.map((p) => (
                <div key={p} className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
                  <p className="text-xl font-bold text-slate-200">{p}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.3em] text-slate-500">◆ Prata ◆</p>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {patrocinadores.prata.map((p) => (
                <div key={p} className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center">
                  <p className="text-sm font-bold text-slate-400">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INSCRIÇÃO */}
      <section id="inscricao" className="border-t border-white/5 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-3">
          {[
            { nome: "Standard", preco: "R$ 890", desc: "Acesso ao dia inteiro", cor: "border-white/10 bg-white/[0.02]", btn: "border border-white/20 bg-transparent text-slate-200 hover:bg-white/10" },
            { nome: "Premium", preco: "R$ 1.490", desc: "+ Workshops + After-party", cor: "border-blue-500/40 bg-blue-500/10 ring-2 ring-blue-500/20", btn: "bg-blue-500 text-white hover:bg-blue-600", destaque: true },
            { nome: "Enterprise", preco: "R$ 4.900", desc: "5 vagas + reunião com speakers", cor: "border-amber-400/30 bg-amber-500/5", btn: "bg-amber-400 text-[#0A0E27] hover:bg-amber-300" },
          ].map((t) => (
            <article key={t.nome} className={`relative rounded-2xl border p-8 ${t.cor}`}>
              {t.destaque && (
                <span className="absolute -top-3 left-8 rounded-full bg-blue-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">Mais procurado</span>
              )}
              <h3 className="text-xl font-bold text-slate-100">{t.nome}</h3>
              <p className="mt-6 text-5xl font-black">{t.preco}</p>
              <p className="mt-2 text-sm text-slate-400">{t.desc}</p>
              <button type="button" className={`mt-8 inline-flex w-full min-h-12 items-center justify-center rounded-md px-6 text-sm font-bold transition ${t.btn}`}>
                Reservar →
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#060919] py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-2xl font-black tracking-tight text-slate-100">Summit Tech AI 2026</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">8 outubro · São Paulo · Faria Lima</p>
            </div>
            <div className="flex gap-6 text-xs uppercase tracking-wider text-slate-500">
              <a href="#" className="transition hover:text-slate-200">LinkedIn</a>
              <a href="#" className="transition hover:text-slate-200">Twitter</a>
              <a href="#" className="transition hover:text-slate-200">YouTube</a>
            </div>
          </div>
          <p className="mt-10 border-t border-white/5 pt-6 text-xs text-slate-600">
            summit.techai.com.br · Site criado com{" "}
            <Link href="/" className="font-bold text-blue-400 hover:underline">Eventify AI</Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
