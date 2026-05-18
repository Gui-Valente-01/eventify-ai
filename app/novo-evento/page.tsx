"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import Spinner from "@/components/Spinner";
import GeneratingOverlay from "@/components/GeneratingOverlay";
import PlanSelector from "@/components/PlanSelector";
import { useEventos, EventoDados } from "@/hooks/useEventos";
import { buscarCEP, dataMinimaHoje, gerarSlug, mascararCEP } from "@/lib/utils";
import { gerarSiteAPI } from "@/lib/api";
import { TIPOS_EVENTO, getBriefingSchema } from "@/lib/eventBriefings";
import { DEFAULT_SELECTED_PLAN, normalizePlanId } from "@/lib/planStrategy";
import type { PlanId } from "@/lib/plans";
import {
  TEMPLATES,
  type Template,
  type EventKind,
  templatesPorTipo,
  recomendarTemplate,
} from "@/lib/templateGallery";

const TAMANHO_MAXIMO_IMAGEM = 4 * 1024 * 1024;
const STEPS = ["Sobre", "Local", "Estilo", "Detalhes"] as const;

// Mapa tipo do evento → slug de exemplo real (em /exemplos/[slug])
// Usado pra mostrar pro cliente como vai ficar o site antes de escolher.
const EXEMPLO_SLUG_POR_TIPO: Record<string, string> = {
  "Casamento": "casamento-mariana-e-rafael",
  "Aniversário": "aniversario-helena-15-anos",
  "Evento Corporativo": "summit-tech-ai-2026",
  "Festa": "neon-night-festival",
  "Religioso": "encontro-de-fe-comunidade-luz",
};

function exemploSlugPorTipo(tipo?: string): string | null {
  if (!tipo) return null;
  return EXEMPLO_SLUG_POR_TIPO[tipo] || null;
}

type Aviso = { tipo: "erro" | "aviso" | "ok"; texto: string } | null;

export default function NovoEvento() {
  const router = useRouter();
  const { adicionarEvento, uploadImagem } = useEventos();

  const [step, setStep] = useState(0);

  // Etapa 1
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [data, setData] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(DEFAULT_SELECTED_PLAN);

  // Etapa 2
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [erroCep, setErroCep] = useState("");

  // Etapa 3 — agora template gallery + briefing auto
  const [templateId, setTemplateId] = useState<string>("");
  const [estilo, setEstilo] = useState("");
  const [clima, setClima] = useState("");
  const [publico, setPublico] = useState("");
  const [corPrincipal, setCorPrincipal] = useState("#B8935A");
  const [descricao, setDescricao] = useState("");

  // Etapa 4 — campos dinâmicos
  const [detalhes, setDetalhes] = useState<Record<string, string>>({});

  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);

  const schema = useMemo(() => (tipo ? getBriefingSchema(tipo) : null), [tipo]);
  const templatesFiltrados = useMemo(() => {
    if (!tipo) return TEMPLATES;
    return templatesPorTipo(tipo as EventKind);
  }, [tipo]);
  const templateAtual = useMemo<Template | undefined>(
    () => TEMPLATES.find((t) => t.id === templateId),
    [templateId]
  );

  useEffect(() => {
    if (!imagemFile) {
      setImagemPreview("");
      return;
    }
    const url = URL.createObjectURL(imagemFile);
    setImagemPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imagemFile]);

  function escolherTemplate(tpl: Template) {
    setTemplateId(tpl.id);
    setEstilo(tpl.defaults.estilo);
    setClima(tpl.defaults.clima);
    setPublico(tpl.defaults.publico);
    setCorPrincipal(tpl.defaults.corPrincipal);
    if (!descricao.trim()) setDescricao(tpl.defaults.descricao);
  }

  function recomendarComIA() {
    const rec = recomendarTemplate({ tipo, clima });
    if (rec) escolherTemplate(rec);
  }

  async function preencherCEP(valorMascarado: string) {
    setErroCep("");
    const digitos = valorMascarado.replace(/\D/g, "");
    if (digitos.length !== 8) return;
    const dados = await buscarCEP(digitos);
    if (!dados) {
      setErroCep("CEP não encontrado.");
      return;
    }
    setRua(dados.logradouro);
    setCidade(dados.localidade);
    setEstado(dados.uf);
  }

  function selecionarImagem(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
      setAviso({ tipo: "erro", texto: "Imagem muito grande. Use até 4 MB." });
      e.target.value = "";
      return;
    }
    setImagemFile(arquivo);
  }

  function validarStep(idx: number): string | null {
    if (idx === 0) {
      if (!nome.trim()) return "Informe o nome do evento.";
      if (!tipo) return "Selecione o tipo de evento.";
      if (!data) return "Informe a data do evento.";
    }
    if (idx === 1) {
      if (cep.replace(/\D/g, "").length !== 8) return "CEP precisa ter 8 dígitos.";
      if (!rua.trim() || !numero.trim() || !cidade.trim() || !estado.trim()) {
        return "Preencha o endereço completo.";
      }
    }
    if (idx === 2) {
      if (!templateId) return "Escolha um template pra continuar.";
    }
    if (idx === 3 && schema) {
      for (const campo of schema.campos) {
        if (campo.required && !detalhes[campo.id]?.trim()) {
          return `Preencha: ${campo.label}.`;
        }
      }
    }
    return null;
  }

  function avancar() {
    const erro = validarStep(step);
    if (erro) {
      setAviso({ tipo: "erro", texto: erro });
      return;
    }
    setAviso(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function voltar() {
    setAviso(null);
    setStep((s) => Math.max(0, s - 1));
  }

  async function criarEvento() {
    if (salvando) return;
    for (let i = 0; i < STEPS.length; i++) {
      const erro = validarStep(i);
      if (erro) {
        setAviso({ tipo: "erro", texto: erro });
        setStep(i);
        return;
      }
    }

    setAviso(null);
    setSalvando(true);

    try {
      let imagemUrl = "";
      if (imagemFile) {
        imagemUrl = await uploadImagem(imagemFile);
      }

      const novoEvento: EventoDados = {
        nome: nome.trim(),
        data,
        tipo,
        status: "preview",
        imagem: imagemUrl,
        selectedPlan,
        endereco: { cep, rua, numero, cidade, estado },
        briefing: {
          estilo: estilo.trim(),
          clima: clima.trim(),
          publico: publico.trim(),
          corPrincipal,
          descricao: descricao.trim(),
          detalhes,
          planoSelecionado: selectedPlan,
          templateId,
        },
        convidados: [],
      };

      const resultado = await gerarSiteAPI(novoEvento);

      if (resultado.erro && !resultado.siteGerado) {
        console.error("[novo-evento] erro da API:", resultado);
        setAviso({ tipo: "erro", texto: resultado.erro });
        setSalvando(false);
        return;
      }

      if (resultado.siteGerado) novoEvento.siteGerado = resultado.siteGerado;
      if (resultado.siteHtml) novoEvento.siteHtml = resultado.siteHtml;

      let salvo;
      try {
        salvo = await adicionarEvento(novoEvento);
      } catch (saveErr) {
        const e = saveErr as { message?: string; code?: string; details?: string; hint?: string };
        console.error("[novo-evento] erro ao salvar evento:", { e, raw: saveErr });
        const msgFinal = e?.message
          ? `Erro ao salvar: ${e.message}${e.hint ? ` (${e.hint})` : ""}`
          : "Erro ao salvar o evento no banco.";
        setAviso({ tipo: "erro", texto: msgFinal });
        setSalvando(false);
        return;
      }

      if (!resultado.aiAvailable) {
        setAviso({
          tipo: "aviso",
          texto: "Site criado em modo básico. A IA avançada está temporariamente indisponível.",
        });
        setTimeout(() => router.push(`/evento/${gerarSlug(salvo.nome)}`), 1500);
        return;
      }

      router.push(`/evento/${gerarSlug(salvo.nome)}`);
    } catch (error) {
      console.error("[novo-evento] erro inesperado:", error);
      const e = error as { message?: string; code?: string };
      const msg = e?.message || "Erro inesperado ao criar evento. Veja o console.";
      setAviso({ tipo: "erro", texto: msg });
      setSalvando(false);
    }
  }

  const progresso = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <main className="eventify-page">
      <BrandHeader actions={[{ href: "/painel", label: "Salvar & sair", variant: "ghost" }]} />
      <GeneratingOverlay visible={salvando} />

      {/* Wizard topbar com breadcrumb */}
      <div className="border-b border-[color:var(--hairline)] bg-[color:var(--paper)]">
        <div className="editorial-wrap flex items-center justify-between gap-4 py-3 text-[13px]">
          <div className="flex items-center gap-2.5">
            <span className="text-[color:var(--muted)]">Novo evento</span>
            <span className="text-[color:var(--muted-2)]">/</span>
            <span className="font-medium text-[color:var(--ink)]">{nome || "Sem nome"}</span>
            {templateAtual && (
              <>
                <span className="text-[color:var(--muted-2)]">/</span>
                <span className="text-[color:var(--muted)]">{templateAtual.nome}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 font-mono-tight text-[11.5px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
            <span>Etapa {step + 1} / {STEPS.length}</span>
            <span className="block h-px w-16 overflow-hidden bg-[color:var(--hairline)]">
              <span className="block h-full bg-[color:var(--gold)] transition-[width] duration-500" style={{ width: `${progresso}%` }} />
            </span>
            <span>{progresso}%</span>
          </div>
        </div>
      </div>

      {/* Steps row */}
      <div className="border-b border-[color:var(--hairline)] bg-[color:var(--paper-2)]">
        <div className="editorial-wrap py-4">
          <Stepper step={step} />
        </div>
      </div>

      {/* Body: form + sidebar */}
      <div className="editorial-wrap py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* Coluna principal */}
          <div className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)]">
            <div className="px-8 py-10 sm:px-12 sm:py-12">
              {step === 0 && (
                <StepSobre
                  nome={nome}
                  setNome={setNome}
                  tipo={tipo}
                  setTipo={setTipo}
                  data={data}
                  setData={setData}
                  imagemPreview={imagemPreview}
                  selecionarImagem={selecionarImagem}
                  selectedPlan={selectedPlan}
                  setSelectedPlan={setSelectedPlan}
                />
              )}

              {step === 1 && (
                <StepLocal
                  cep={cep}
                  setCep={setCep}
                  preencherCEP={preencherCEP}
                  erroCep={erroCep}
                  rua={rua}
                  setRua={setRua}
                  numero={numero}
                  setNumero={setNumero}
                  cidade={cidade}
                  setCidade={setCidade}
                  estado={estado}
                  setEstado={setEstado}
                />
              )}

              {step === 2 && (
                <StepEstilo
                  templateId={templateId}
                  templates={templatesFiltrados}
                  tipo={tipo}
                  escolherTemplate={escolherTemplate}
                  recomendarComIA={recomendarComIA}
                  descricao={descricao}
                  setDescricao={setDescricao}
                  corPrincipal={corPrincipal}
                  setCorPrincipal={setCorPrincipal}
                />
              )}

              {step === 3 && (
                <StepDetalhes schema={schema} detalhes={detalhes} setDetalhes={setDetalhes} />
              )}
            </div>

            {aviso && (
              <div
                className={`mx-8 mb-6 border-y px-4 py-3 text-[13.5px] sm:mx-12 ${
                  aviso.tipo === "erro"
                    ? "border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] text-[color:var(--rose,#A85462)]"
                    : aviso.tipo === "aviso"
                      ? "border-[color:var(--gold)] bg-[var(--gold-soft)] text-[color:var(--gold-2)]"
                      : "border-[color:var(--green,#5B7A4F)] bg-[rgba(91,122,79,0.06)] text-[color:var(--green,#5B7A4F)]"
                }`}
              >
                {aviso.texto}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <BriefingSidebar
            step={step}
            nome={nome}
            tipo={tipo}
            data={data}
            cidade={cidade}
            estado={estado}
            templateAtual={templateAtual}
            clima={clima}
            estilo={estilo}
            corPrincipal={corPrincipal}
            voltar={voltar}
            avancar={avancar}
            criarEvento={criarEvento}
            salvando={salvando}
            isLastStep={step === STEPS.length - 1}
            stepIsFirst={step === 0}
          />
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// Stepper
// ============================================================================
function Stepper({ step }: { step: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {STEPS.map((label, i) => {
        const ativo = i === step;
        const concluido = i < step;
        return (
          <div key={label} className="flex items-center gap-2.5">
            <span
              className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border text-[11px] font-mono-tight ${
                concluido
                  ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-white"
                  : ativo
                    ? "border-[color:var(--gold)] bg-[color:var(--gold)] text-white"
                    : "border-[color:var(--hairline-2)] bg-[color:var(--surface)] text-[color:var(--muted)]"
              }`}
            >
              {concluido ? "✓" : i + 1}
            </span>
            <span
              className={`text-[13px] ${
                ativo
                  ? "font-medium text-[color:var(--ink)]"
                  : "text-[color:var(--muted)]"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 hidden h-px w-8 bg-[color:var(--hairline-2)] sm:inline-block" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Briefing Sidebar (right column — always visible)
// ============================================================================
function BriefingSidebar(props: {
  step: number;
  nome: string;
  tipo: string;
  data: string;
  cidade: string;
  estado: string;
  templateAtual?: Template;
  clima: string;
  estilo: string;
  corPrincipal: string;
  voltar: () => void;
  avancar: () => void;
  criarEvento: () => void;
  salvando: boolean;
  isLastStep: boolean;
  stepIsFirst: boolean;
}) {
  const briefingItems = [
    ["Nome", props.nome],
    ["Tipo", props.tipo],
    ["Data", props.data ? new Date(`${props.data}T00:00:00`).toLocaleDateString("pt-BR") : ""],
    ["Local", [props.cidade, props.estado].filter(Boolean).join(" · ")],
    ["Template", props.templateAtual?.nome],
    ["Clima", props.clima],
  ].filter(([, v]) => Boolean(v)) as [string, string][];

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      {/* Briefing snapshot */}
      <div className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">Briefing</p>
        {briefingItems.length === 0 ? (
          <p className="mt-4 text-[13px] text-[color:var(--muted-2)]">
            Os dados que você preencher aparecem aqui em tempo real.
          </p>
        ) : (
          <dl className="mt-4 space-y-2.5 text-[13px]">
            {briefingItems.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[70px_1fr] gap-3">
                <dt className="text-[color:var(--muted)]">{k}</dt>
                <dd className="text-[color:var(--ink)]">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* Assistente Eventify */}
      <div className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[color:var(--gold)] text-[12px] font-display italic text-white">
            ✦
          </span>
          <div>
            <p className="text-[13px] font-medium text-[color:var(--ink)]">Assistente Eventify</p>
            <p className="text-[11px] text-[color:var(--muted)]">Claude · em rascunho</p>
          </div>
        </div>

        <p className="mt-4 text-[13px] leading-[1.55] text-[color:var(--ink-2)]">
          {dicaPorStep(props.step, props.templateAtual)}
        </p>
      </div>

      {/* Paleta proposta */}
      {props.templateAtual && (
        <div className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Paleta proposta
          </p>
          <div className="mt-3 flex gap-1.5">
            {props.templateAtual.paleta.map((c) => (
              <span
                key={c}
                className="h-12 flex-1 rounded-[6px] border border-black/[0.06]"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
          <p className="mt-2 font-mono-tight text-[10.5px] text-[color:var(--muted)]">
            {props.templateAtual.tom}
          </p>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--paper)] p-4 flex flex-col gap-2.5">
        {props.isLastStep ? (
          <button
            type="button"
            onClick={props.criarEvento}
            disabled={props.salvando}
            className="eventify-button eventify-button-primary justify-center min-h-12 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {props.salvando ? (
              <>
                <Spinner className="h-5 w-5" />
                <span>Gerando site...</span>
              </>
            ) : (
              <>Gerar site <span aria-hidden>→</span></>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={props.avancar}
            className="eventify-button eventify-button-primary justify-center"
          >
            Avançar <span aria-hidden>→</span>
          </button>
        )}
        <button
          type="button"
          onClick={props.voltar}
          disabled={props.stepIsFirst || props.salvando}
          className="eventify-button eventify-button-ghost justify-center disabled:opacity-50"
        >
          ← Voltar
        </button>
        <Link
          href="/painel"
          className="mt-1 text-center text-[12.5px] text-[color:var(--muted)] hover:text-[color:var(--ink)]"
        >
          Sair e salvar rascunho
        </Link>
      </div>
    </aside>
  );
}

function dicaPorStep(step: number, tpl?: Template): string {
  switch (step) {
    case 0:
      return "Comece pelo essencial: nome, tipo e data. Você pode trocar tudo depois — nada aqui é definitivo.";
    case 1:
      return "Use o CEP que a gente preenche o resto. O endereço completo aparece no mapa do site final.";
    case 2:
      if (tpl)
        return `Boa escolha. ${tpl.nome} combina com eventos ${tpl.tipos.join("/").toLowerCase()} ${tpl.tags.join(" e ").toLowerCase()}. Posso aplicar a paleta ${tpl.tom} ao site final.`;
      return "Escolha um template como ponto de partida. A IA depois ajusta paleta, tipografia e copy ao tom do seu evento.";
    case 3:
      return "Os detalhes específicos do tipo de evento são o que torna o site único. Preencha o que fizer sentido — pulamos o resto.";
    default:
      return "";
  }
}

// ============================================================================
// Step 0: Sobre
// ============================================================================
function StepHeader({ title, subtitle, eyebrow }: { title: string; subtitle: string; eyebrow?: string }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className="eventify-eyebrow mb-3">{eyebrow}</p>}
      <h2 className="font-display text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-[color:var(--ink)]">
        {title}
      </h2>
      <p className="mt-3 text-[14.5px] text-[color:var(--muted)]">{subtitle}</p>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-2)]">
      {children}
    </span>
  );
}

function StepSobre(props: {
  nome: string;
  setNome: (v: string) => void;
  tipo: string;
  setTipo: (v: string) => void;
  data: string;
  setData: (v: string) => void;
  imagemPreview: string;
  selecionarImagem: (e: ChangeEvent<HTMLInputElement>) => void;
  selectedPlan: PlanId;
  setSelectedPlan: (value: PlanId) => void;
}) {
  return (
    <>
      <StepHeader
        eyebrow="Etapa 01 · Sobre"
        title="Sobre o evento"
        subtitle="Comece pelos dados básicos. O resto a gente cuida."
      />

      <div className="grid gap-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <label>
            <FieldLabel>Nome do evento</FieldLabel>
            <input
              type="text"
              placeholder="Ex.: Marina &amp; Rafael"
              className="eventify-input"
              value={props.nome}
              onChange={(e) => props.setNome(e.target.value)}
              maxLength={120}
            />
          </label>
          <label>
            <FieldLabel>Data</FieldLabel>
            <input
              type="date"
              className="eventify-input"
              value={props.data}
              min={dataMinimaHoje()}
              onChange={(e) => props.setData(e.target.value)}
            />
          </label>
        </div>

        <label>
          <FieldLabel>Tipo de evento</FieldLabel>
          <select
            className="eventify-input"
            value={props.tipo}
            onChange={(e) => props.setTipo(e.target.value)}
          >
            <option value="">Selecione...</option>
            {TIPOS_EVENTO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <PlanSelector
          value={normalizePlanId(props.selectedPlan)}
          onChange={props.setSelectedPlan}
          title="Plano desejado"
          description="O plano define nível visual, profundidade do texto e quantidade de seções. Você só paga ao publicar."
        />

        <div className="border-t border-[color:var(--hairline)] pt-8">
          <FieldLabel>Imagem do evento · opcional</FieldLabel>
          <p className="mb-3 text-[13px] text-[color:var(--muted)]">JPG, PNG ou WebP, até 4 MB.</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="text-[13px] text-[color:var(--muted)] file:mr-4 file:rounded-full file:border file:border-[color:var(--hairline-2)] file:bg-[color:var(--paper-2)] file:px-4 file:py-2 file:text-[13px] file:text-[color:var(--ink)] hover:file:bg-[color:var(--paper-3)]"
            onChange={props.selecionarImagem}
          />
          {props.imagemPreview && (
            <div className="mt-4 overflow-hidden rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--paper-2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={props.imagemPreview} alt="Preview do evento" className="h-56 w-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Step 1: Local
// ============================================================================
function StepLocal(props: {
  cep: string;
  setCep: (v: string) => void;
  preencherCEP: (v: string) => void;
  erroCep: string;
  rua: string;
  setRua: (v: string) => void;
  numero: string;
  setNumero: (v: string) => void;
  cidade: string;
  setCidade: (v: string) => void;
  estado: string;
  setEstado: (v: string) => void;
}) {
  return (
    <>
      <StepHeader
        eyebrow="Etapa 02 · Local"
        title="Onde vai acontecer?"
        subtitle="Digite o CEP que a gente preenche o resto."
      />

      <div className="grid gap-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <label>
            <FieldLabel>CEP</FieldLabel>
            <input
              type="text"
              placeholder="00000-000"
              className="eventify-input"
              value={props.cep}
              inputMode="numeric"
              maxLength={9}
              onChange={(e) => {
                const mascarado = mascararCEP(e.target.value);
                props.setCep(mascarado);
                props.preencherCEP(mascarado);
              }}
            />
            {props.erroCep && (
              <p className="mt-2 text-[13px] text-[color:var(--rose,#A85462)]">{props.erroCep}</p>
            )}
          </label>
          <label>
            <FieldLabel>Rua</FieldLabel>
            <input
              type="text"
              placeholder="Nome da rua / avenida"
              className="eventify-input"
              value={props.rua}
              onChange={(e) => props.setRua(e.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <label>
            <FieldLabel>Número</FieldLabel>
            <input
              type="text"
              placeholder="123"
              className="eventify-input"
              value={props.numero}
              onChange={(e) => props.setNumero(e.target.value)}
            />
          </label>
          <label>
            <FieldLabel>Cidade</FieldLabel>
            <input
              type="text"
              placeholder="Cidade"
              className="eventify-input"
              value={props.cidade}
              onChange={(e) => props.setCidade(e.target.value)}
            />
          </label>
          <label>
            <FieldLabel>UF</FieldLabel>
            <input
              type="text"
              placeholder="SP"
              className="eventify-input uppercase"
              value={props.estado}
              maxLength={2}
              onChange={(e) => props.setEstado(e.target.value.toUpperCase())}
            />
          </label>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Step 2: Estilo — TEMPLATE GALLERY
// ============================================================================
function StepEstilo(props: {
  templateId: string;
  templates: Template[];
  tipo: string;
  escolherTemplate: (t: Template) => void;
  recomendarComIA: () => void;
  descricao: string;
  setDescricao: (v: string) => void;
  corPrincipal: string;
  setCorPrincipal: (v: string) => void;
}) {
  const [filtro, setFiltro] = useState<"todos" | "Editorial" | "Minimalista" | "Vibrante" | "Dark" | "Sereno">(
    "todos"
  );

  const visiveis = useMemo(() => {
    if (filtro === "todos") return props.templates;
    return props.templates.filter((t) => t.tags.includes(filtro));
  }, [filtro, props.templates]);

  const tags = ["todos", "Editorial", "Minimalista", "Vibrante", "Dark", "Sereno"] as const;

  return (
    <>
      <StepHeader
        eyebrow="Etapa 03 · Estilo"
        title="Escolha um template inicial"
        subtitle="A IA usa o template como ponto de partida — e depois ajusta paleta, tipografia e copy ao tom do seu evento."
      />

      {/* Tabs filter */}
      <div className="-mx-1 mb-6 flex gap-1 overflow-x-auto border-b border-[color:var(--hairline)] pb-px">
        {tags.map((t) => {
          const ativo = filtro === t;
          const count =
            t === "todos" ? props.templates.length : props.templates.filter((tpl) => tpl.tags.includes(t)).length;
          return (
            <button
              key={t}
              onClick={() => setFiltro(t)}
              className={`inline-flex items-center gap-1.5 border-b-[1.5px] px-3 py-2 text-[13px] transition-colors -mb-px ${
                ativo
                  ? "border-[color:var(--ink)] text-[color:var(--ink)] font-medium"
                  : "border-transparent text-[color:var(--muted)] hover:text-[color:var(--ink)]"
              }`}
            >
              {t === "todos" ? "Todos" : t}
              <span className="font-mono-tight text-[10.5px] text-[color:var(--muted-2)]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visiveis.map((tpl) => {
          const sel = props.templateId === tpl.id;
          const exemploSlug = exemploSlugPorTipo(tpl.tipos[0]);
          return (
            <div
              key={tpl.id}
              className={`group relative overflow-hidden rounded-[10px] border bg-[color:var(--surface)] transition-all hover:-translate-y-0.5 ${
                sel
                  ? "border-[color:var(--gold)] shadow-[0_0_0_4px_var(--gold-soft)]"
                  : "border-[color:var(--hairline)] hover:border-[color:var(--hairline-2)]"
              }`}
            >
              <button
                type="button"
                onClick={() => props.escolherTemplate(tpl)}
                className="w-full text-left"
              >
                {sel && (
                  <span className="absolute right-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--gold)] text-[11px] text-white">
                    ✓
                  </span>
                )}
                {/* Visual preview */}
                <div
                  className="relative aspect-[4/5]"
                  style={{
                    background: `linear-gradient(160deg, ${tpl.accent}22, ${tpl.base} 75%)`,
                  }}
                >
                  <div
                    className="absolute inset-x-3 top-3 bottom-[42%] rounded-[5px] border border-black/[0.06] bg-white/95"
                    style={{ background: tpl.base }}
                  />
                  <div
                    className="absolute inset-x-3 bottom-9 font-display italic"
                    style={{ color: tpl.accent === "#0A0A0A" || tpl.base.startsWith("#0") ? "#fff" : "#1F1B17", fontSize: "20px", lineHeight: 1.05 }}
                  >
                    {tpl.nome}
                  </div>
                  <div
                    className="absolute inset-x-3 bottom-3 font-mono-tight tracking-[0.06em] uppercase"
                    style={{ color: tpl.accent, fontSize: "10px" }}
                  >
                    {tpl.tipos[0]}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-[12px] text-[color:var(--muted)]">
                  <span>{tpl.tipos.join(" · ")}</span>
                  <span className="font-mono-tight text-[10.5px]">{tpl.tom}</span>
                </div>
              </button>

              {/* Botão preview no canto inferior — abre exemplo real em nova aba */}
              {exemploSlug && (
                <a
                  href={`/exemplos/${exemploSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-3 bottom-[58px] z-10 flex items-center gap-1 rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--surface)]/95 px-2.5 py-1 text-[10.5px] font-medium text-[color:var(--ink)] backdrop-blur transition hover:border-[color:var(--ink)] hover:bg-[color:var(--paper)]"
                  title="Ver exemplo real deste tipo de evento"
                >
                  👁 Ver site
                </a>
              )}

              {tpl.planoMinimo !== "basico" && (
                <span className="absolute left-3 top-3 rounded-full border border-[color:var(--gold)] bg-[color:var(--surface)]/90 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.14em] text-[color:var(--gold-2)] backdrop-blur">
                  {tpl.planoMinimo === "premium" ? "Premium" : "Intermediário+"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Recomendar com IA */}
      <div className="mt-6 flex items-center gap-3 rounded-[10px] border border-dashed border-[color:var(--hairline-2)] bg-[color:var(--paper)] p-4">
        <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-[color:var(--gold)] text-[13px] text-white">
          ✦
        </span>
        <div className="flex-1">
          <p className="text-[13px] font-medium text-[color:var(--ink)]">Não sabe qual escolher?</p>
          <p className="text-[12px] text-[color:var(--muted)]">
            A IA recomenda um template baseado no que você descreveu na etapa 01.
          </p>
        </div>
        <button
          type="button"
          onClick={props.recomendarComIA}
          disabled={!props.tipo}
          className="eventify-button eventify-button-ghost text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Recomendar pra mim
        </button>
      </div>

      {/* Customização opcional */}
      <div className="mt-8 border-t border-[color:var(--hairline)] pt-8">
        <p className="eventify-eyebrow mb-4">Toque pessoal · opcional</p>
        <div className="grid gap-7">
          <label>
            <FieldLabel>Descrição livre</FieldLabel>
            <textarea
              placeholder="Conte como você imagina o evento. Tem alguma referência? O que não pode faltar?"
              rows={3}
              className="eventify-input min-h-[6rem] resize-y py-3 text-[16px]"
              value={props.descricao}
              onChange={(e) => props.setDescricao(e.target.value)}
              maxLength={1500}
            />
            <p className="mt-1.5 text-right text-[11px] text-[color:var(--muted)] font-mono-tight">
              {props.descricao.length} / 1500
            </p>
          </label>

          <div>
            <FieldLabel>Cor principal · sobrescreve a paleta do template</FieldLabel>
            <div className="mt-1 flex items-center gap-3 border-b border-[color:var(--hairline-2)] py-3">
              <input
                type="color"
                value={props.corPrincipal}
                onChange={(e) => props.setCorPrincipal(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-[color:var(--hairline-2)] bg-transparent"
              />
              <input
                type="text"
                value={props.corPrincipal}
                onChange={(e) => props.setCorPrincipal(e.target.value)}
                className="flex-1 bg-transparent font-mono-tight text-[14px] uppercase outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Step 3: Detalhes (dinâmico por tipo)
// ============================================================================
function StepDetalhes(props: {
  schema: ReturnType<typeof getBriefingSchema>;
  detalhes: Record<string, string>;
  setDetalhes: (v: Record<string, string>) => void;
}) {
  if (!props.schema) {
    return (
      <>
        <StepHeader
          eyebrow="Etapa 04 · Detalhes"
          title="Detalhes específicos"
          subtitle="Volte à etapa 01 e selecione um tipo de evento."
        />
        <div className="border-y border-[color:var(--gold)] bg-[var(--gold-soft)] px-5 py-4 text-[14px] text-[color:var(--gold-2)]">
          Selecione um tipo de evento na primeira etapa pra personalizar este passo.
        </div>
      </>
    );
  }

  function setCampo(id: string, value: string) {
    props.setDetalhes({ ...props.detalhes, [id]: value });
  }

  return (
    <>
      <StepHeader eyebrow="Etapa 04 · Detalhes" title={props.schema.titulo} subtitle={props.schema.subtitulo} />

      <div className="grid gap-7">
        {props.schema.campos.map((campo) => (
          <label key={campo.id}>
            <FieldLabel>
              {campo.label}
              {campo.required && <span className="ml-1 text-[color:var(--gold)]">*</span>}
            </FieldLabel>
            {campo.type === "textarea" ? (
              <textarea
                rows={3}
                placeholder={campo.placeholder}
                className="eventify-input min-h-[6rem] resize-y py-3 text-[16px]"
                value={props.detalhes[campo.id] ?? ""}
                onChange={(e) => setCampo(campo.id, e.target.value)}
                maxLength={campo.maxLength ?? 1500}
              />
            ) : (
              <input
                type={campo.type === "url" ? "url" : "text"}
                placeholder={campo.placeholder}
                className="eventify-input"
                value={props.detalhes[campo.id] ?? ""}
                onChange={(e) => setCampo(campo.id, e.target.value)}
                maxLength={campo.maxLength ?? 240}
              />
            )}
            {campo.hint && <p className="mt-1.5 text-[12.5px] text-[color:var(--muted)]">{campo.hint}</p>}
          </label>
        ))}
      </div>
    </>
  );
}
