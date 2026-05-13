"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AiSiteFrame from "@/components/AiSiteFrame";
import EmptyState from "@/components/EmptyState";
import Spinner from "@/components/Spinner";
import { useEventos } from "@/hooks/useEventos";
import { gerarSiteAPI } from "@/lib/api";
import { gerarSlug } from "@/lib/utils";
import { getTemplate, templatesPorTipo, type Template } from "@/lib/templateGallery";
import {
  FONT_CATALOG,
  SECTION_LABELS,
  type AnimationSpeed,
  type ButtonRadius,
  type ButtonStyle,
  type ContainerWidth,
  type FontFamily,
  type HeroAlign,
  type LivePalette,
  type RadiusScale,
  type SectionId,
  type SpacingScale,
} from "@/lib/livePalette";
import type { ReferenceProfile } from "@/lib/agents/analyzeReference";

type Viewport = "desktop" | "tablet" | "mobile";
type Tab = "cores" | "tipografia" | "layout" | "hero" | "botoes" | "secoes" | "ia";

// Paletas pré-definidas
const PALETTE_FUNDO = [
  "#F5EDE2", "#FFFFFF", "#FAF6EE", "#0A0A0A", "#1F1F1F", "#0A0814", "#0B0E1A",
  "#F4E2B9", "#F8F4ED", "#1A0F1F", "#FFD93D", "#FFD479",
];
const PALETTE_SUPERFICIE = [
  "#FFFFFF", "#FAFAFA", "#F0F0EC", "#E5DCC9", "#1A1A1A", "#161B2C", "#1F1F1F", "#EEEDFD",
];
const PALETTE_TEXTO = [
  "#2B1D17", "#0A0A0A", "#1F1B17", "#1A1F3A", "#F5EDE2", "#E5E5FF", "#2B2218", "#FFFFFF",
];
const PALETTE_MUTADO = [
  "#6B6B6B", "#8A8A8A", "#A5A29A", "#5F4E36", "#9A9AA8", "#7C5E2C",
];
const PALETTE_BORDA = [
  "#E8E5DD", "#E8E3F1", "#ECECF0", "#D8D4C9", "#2A2A2A", "#3D3D3D",
];
const PALETTE_ACENTO = [
  "#B7895C", "#C8A96A", "#5B7A4F", "#E63946", "#FF4FCB", "#C8E64B", "#7C76EE",
  "#1E63D5", "#2A9D8F", "#7C3AED", "#D4A017", "#FF6B35", "#FF3D7F", "#0E6FD7",
];

const TABS: { id: Tab; label: string; ic: string }[] = [
  { id: "cores", label: "Cores", ic: "◐" },
  { id: "tipografia", label: "Fontes", ic: "Aa" },
  { id: "layout", label: "Layout", ic: "▦" },
  { id: "hero", label: "Hero", ic: "✦" },
  { id: "botoes", label: "Botões", ic: "▭" },
  { id: "secoes", label: "Seções", ic: "≡" },
  { id: "ia", label: "IA", ic: "★" },
];

export default function PersonalizarPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const { eventos, isLoading, encontrarIndexPorSlug, atualizarEvento, uploadImagem } = useEventos();
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [tab, setTab] = useState<Tab>("cores");
  const [regenerando, setRegenerando] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [salvouTemplate, setSalvouTemplate] = useState(false);

  const evento = useMemo(() => {
    const idx = encontrarIndexPorSlug(slug);
    return idx !== -1 ? eventos[idx] : null;
  }, [eventos, encontrarIndexPorSlug, slug]);

  const templateAtual = useMemo<Template | undefined>(
    () => (evento?.briefing?.templateId ? getTemplate(evento.briefing.templateId) : undefined),
    [evento]
  );

  // ============ STATES de customização ============
  // Cores
  const [fundo, setFundo] = useState<string>("#F5EDE2");
  const [superficie, setSuperficie] = useState<string>("#FFFFFF");
  const [texto, setTexto] = useState<string>("#2B1D17");
  const [mutado, setMutado] = useState<string>("#6B6B6B");
  const [borda, setBorda] = useState<string>("#E8E5DD");
  const [acento, setAcento] = useState<string>("#B7895C");

  // Tipografia
  const [fontDisplayId, setFontDisplayId] = useState<string>("cormorant-garamond");
  const [fontBodyId, setFontBodyId] = useState<string>("inter");
  const [fontWeightDisplay, setFontWeightDisplay] = useState<number>(500);
  const [fontWeightBody, setFontWeightBody] = useState<number>(400);
  const [fontSizeBody, setFontSizeBody] = useState<number>(16);
  const [fontSizeHero, setFontSizeHero] = useState<number>(72);
  const [lineHeight, setLineHeight] = useState<number>(1.6);
  const [letterSpacing, setLetterSpacing] = useState<number>(-0.02);

  // Layout
  const [radius, setRadius] = useState<RadiusScale>("medium");
  const [spacing, setSpacing] = useState<SpacingScale>("normal");
  const [containerWidth, setContainerWidth] = useState<ContainerWidth>("normal");

  // Hero
  const [heroImage, setHeroImage] = useState<string>("");
  const [heroAlign, setHeroAlign] = useState<HeroAlign>("center");
  const [heroOverlay, setHeroOverlay] = useState<number>(45);
  const [heroHeight, setHeroHeight] = useState<number>(640);

  // Botões
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>("filled");
  const [buttonRadius, setButtonRadius] = useState<ButtonRadius>("rounded");

  // Animações
  const [animationSpeed, setAnimationSpeed] = useState<AnimationSpeed>("normal");

  // Seções
  const [enabledSections, setEnabledSections] = useState<Record<SectionId, boolean>>({
    hero: true,
    countdown: true,
    sobre: true,
    narrativa: true,
    programacao: true,
    pessoas: true,
    local: true,
    informacoes: true,
    galeria: true,
    presentes: true,
    rsvp: true,
    faq: true,
    footer: true,
  });

  // Inspirar com referência
  const [referenceProfile, setReferenceProfile] = useState<ReferenceProfile | null>(null);
  const [refLoading, setRefLoading] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);
  const [refDescricao, setRefDescricao] = useState("");
  const [refImageBase64, setRefImageBase64] = useState<string | null>(null);
  const [refImagePreview, setRefImagePreview] = useState<string | null>(null);
  const [refUrl, setRefUrl] = useState("");

  // ============ EFFECTS ============
  useEffect(() => {
    if (!templateAtual) return;
    setFundo(templateAtual.paleta[0]);
    setSuperficie(templateAtual.paleta[1] || "#FFFFFF");
    setTexto(templateAtual.paleta[3] || templateAtual.paleta[2] || "#2B1D17");
    setAcento(templateAtual.accent);
  }, [templateAtual?.id]);

  useEffect(() => {
    if (!evento) return;
    if (!savedAt) setSavedAt(new Date());
    const t = setInterval(() => setSavedAt(new Date()), 30000);
    return () => clearInterval(t);
  }, [evento, savedAt]);

  // Restaura customização salva quando o evento carrega
  useEffect(() => {
    const ct = evento?.briefing?.customTemplate;
    if (!ct) return;
    if (ct.paleta?.[0]) setFundo(ct.paleta[0]);
    if (ct.paleta?.[1]) setSuperficie(ct.paleta[1]);
    if (ct.paleta?.[3]) setTexto(ct.paleta[3]);
    if (ct.paleta?.[4]) setAcento(ct.paleta[4]);
    if (ct.fontDisplayId) setFontDisplayId(ct.fontDisplayId);
    if (ct.fontBodyId) setFontBodyId(ct.fontBodyId);
  }, [evento?.id]);

  const fontDisplay: FontFamily | undefined = FONT_CATALOG[fontDisplayId];
  const fontBody: FontFamily | undefined = FONT_CATALOG[fontBodyId];

  // Live palette montada — vai pro AiSiteFrame
  const livePalette: LivePalette = useMemo(
    () => ({
      fundo,
      superficie,
      texto,
      mutado,
      borda,
      acento,
      fontDisplay,
      fontBody,
      fontWeightDisplay,
      fontWeightBody,
      fontSizeBody,
      fontSizeHero,
      lineHeight,
      letterSpacing,
      radius,
      spacing,
      containerWidth,
      heroImage,
      heroAlign,
      heroOverlay,
      heroHeight,
      buttonStyle,
      buttonRadius,
      animationSpeed,
      enabledSections,
    }),
    [
      fundo, superficie, texto, mutado, borda, acento,
      fontDisplay, fontBody, fontWeightDisplay, fontWeightBody,
      fontSizeBody, fontSizeHero, lineHeight, letterSpacing,
      radius, spacing, containerWidth,
      heroImage, heroAlign, heroOverlay, heroHeight,
      buttonStyle, buttonRadius, animationSpeed, enabledSections,
    ]
  );

  // ============ HANDLERS ============
  function restaurar() {
    if (!templateAtual) return;
    setFundo(templateAtual.paleta[0]);
    setSuperficie(templateAtual.paleta[1] || "#FFFFFF");
    setTexto(templateAtual.paleta[3] || templateAtual.paleta[2] || "#2B1D17");
    setAcento(templateAtual.accent);
    setMutado("#6B6B6B");
    setBorda("#E8E5DD");
    setFontDisplayId("cormorant-garamond");
    setFontBodyId("inter");
    setFontWeightDisplay(500);
    setFontWeightBody(400);
    setFontSizeBody(16);
    setFontSizeHero(72);
    setLineHeight(1.6);
    setLetterSpacing(-0.02);
    setRadius("medium");
    setSpacing("normal");
    setContainerWidth("normal");
    setHeroImage("");
    setHeroAlign("center");
    setHeroOverlay(45);
    setHeroHeight(640);
    setButtonStyle("filled");
    setButtonRadius("rounded");
    setAnimationSpeed("normal");
  }

  async function aplicarEGerar() {
    if (!evento?.id || regenerando) return;
    setRegenerando(true);
    try {
      const novoBriefing = {
        ...(evento.briefing || {}),
        corPrincipal: acento,
        customTemplate: gerarCustomTemplate(),
      };
      const eventoComCores = { ...evento, briefing: novoBriefing };
      const resultado = await gerarSiteAPI(eventoComCores);
      if (resultado.siteGerado && evento.id) {
        await atualizarEvento(evento.id, {
          briefing: novoBriefing,
          siteGerado: resultado.siteGerado,
          ...(resultado.siteHtml ? { siteHtml: resultado.siteHtml } : {}),
        });
        setSavedAt(new Date());
      }
    } finally {
      setRegenerando(false);
    }
  }

  function gerarCustomTemplate() {
    return {
      nome: templateAtual ? `${templateAtual.nome} (personalizado)` : "Meu template",
      paleta: [fundo, superficie, "", texto, acento],
      fontDisplayId,
      fontBodyId,
      referenceProfile: referenceProfile
        ? {
            vibe: referenceProfile.vibe,
            estilo: referenceProfile.estilo,
            inspiracaoParaIA: referenceProfile.inspiracaoParaIA,
          }
        : undefined,
      salvoEm: new Date().toISOString(),
    };
  }

  async function salvarComoMeuTemplate() {
    if (!evento?.id) return;
    try {
      await atualizarEvento(evento.id, {
        briefing: {
          ...(evento.briefing || {}),
          corPrincipal: acento,
          customTemplate: gerarCustomTemplate(),
        },
      });
      setSalvouTemplate(true);
      setSavedAt(new Date());
      setTimeout(() => setSalvouTemplate(false), 3000);
    } catch (e) {
      console.error(e);
    }
  }

  async function trocarTemplate(novo: Template) {
    if (!evento?.id || regenerando) return;
    setRegenerando(true);
    try {
      const novoBriefing = {
        ...(evento.briefing || {}),
        templateId: novo.id,
        estilo: novo.defaults.estilo,
        clima: novo.defaults.clima,
        corPrincipal: novo.accent,
      };
      const eventoNovo = { ...evento, briefing: novoBriefing };
      const resultado = await gerarSiteAPI(eventoNovo);
      if (resultado.siteGerado && evento.id) {
        await atualizarEvento(evento.id, {
          briefing: novoBriefing,
          siteGerado: resultado.siteGerado,
          ...(resultado.siteHtml ? { siteHtml: resultado.siteHtml } : {}),
        });
        setSavedAt(new Date());
      }
    } finally {
      setRegenerando(false);
    }
  }

  async function analisarReferencia() {
    if (refLoading) return;
    setRefLoading(true);
    setRefError(null);
    try {
      const res = await fetch("/api/ai/analisar-referencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: refImageBase64 || undefined,
          imageUrl: refUrl || undefined,
          descricao: refDescricao || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.profile) {
        setRefError(data.error || "Não foi possível analisar a referência.");
        return;
      }
      const profile = data.profile as ReferenceProfile;
      setReferenceProfile(profile);
      aplicarReferenceProfile(profile);
    } catch (e) {
      setRefError(e instanceof Error ? e.message : "Erro de rede.");
    } finally {
      setRefLoading(false);
    }
  }

  function aplicarReferenceProfile(profile: ReferenceProfile) {
    const [c1, c2, , c4, c5] = profile.paleta;
    if (c1) setFundo(c1);
    if (c2) setSuperficie(c2);
    if (c4) setTexto(c4);
    if (c5 || profile.paleta[2]) setAcento(c5 || profile.paleta[2]);
    if (profile.fontDisplayId && FONT_CATALOG[profile.fontDisplayId]) {
      setFontDisplayId(profile.fontDisplayId);
    }
    if (profile.fontBodyId && FONT_CATALOG[profile.fontBodyId]) {
      setFontBodyId(profile.fontBodyId);
    }
    // Ajusta cantos baseado em caracteristicas
    if (profile.caracteristicas.botaoRetangular) {
      setButtonRadius("square");
      setRadius("small");
    } else {
      setButtonRadius("rounded");
    }
    if (profile.caracteristicas.espacamentoGeneroso) {
      setSpacing("spacious");
    }
  }

  function handleRefImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setRefError("Imagem muito grande. Use até 4 MB.");
      return;
    }
    setRefError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setRefImagePreview(dataUrl);
      const base64 = dataUrl.replace(/^data:[^;]+;base64,/, "");
      setRefImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleHeroImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return;
    try {
      const url = await uploadImagem(file);
      setHeroImage(url);
    } catch {
      // fallback: usa data URL local (não vai pro DB mas funciona no preview)
      const reader = new FileReader();
      reader.onload = () => setHeroImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  // ============ Loading / error ============
  if (isLoading) {
    return (
      <main className="flex h-screen items-center justify-center text-[14px] text-[color:var(--muted)]">
        Carregando evento...
      </main>
    );
  }

  if (!evento) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--paper)] p-6">
        <EmptyState
          icon="?"
          title="Evento não encontrado"
          description="Volte ao painel pra escolher outro evento."
          action={{ label: "Voltar ao painel", href: "/painel", variant: "primary" }}
          className="max-w-xl"
        />
      </main>
    );
  }

  const tipoEvento = evento.tipo as
    | "Casamento"
    | "Aniversário"
    | "Evento Corporativo"
    | "Festa"
    | "Religioso";
  const outrosTemplates = templatesPorTipo(tipoEvento).filter((t) => t.id !== templateAtual?.id);
  const viewportWidth =
    viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px";
  const slugEvento = gerarSlug(evento.nome);

  return (
    <main className="min-h-screen bg-[color:var(--paper-2)]">
      {/* Topbar */}
      <header className="sticky top-0 z-50 flex h-[56px] items-center justify-between gap-3 border-b border-[color:var(--hairline)] bg-[color:var(--surface)] px-5">
        <Link href="/painel" className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[color:var(--gold)]">
            <span className="block h-1.5 w-1.5 rounded-[1px] bg-white" />
          </span>
          <span className="font-display text-[20px] tracking-[-0.005em]">Eventify</span>
          <span className="px-1.5 text-[color:var(--muted-2)]">/</span>
          <span className="text-[14px] text-[color:var(--muted)]">Personalizar</span>
        </Link>

        <div className="flex rounded-[8px] bg-[color:var(--paper-2)] p-1 text-[13px]">
          {(
            [
              { id: "desktop" as const, label: "Desktop" },
              { id: "tablet" as const, label: "Tablet" },
              { id: "mobile" as const, label: "Mobile" },
            ]
          ).map((v) => (
            <button
              key={v.id}
              onClick={() => setViewport(v.id)}
              className={`rounded-[6px] px-3.5 py-1 transition ${
                viewport === v.id
                  ? "bg-[color:var(--surface)] font-medium text-[color:var(--ink)] shadow-[0_1px_2px_rgba(11,11,18,0.06)]"
                  : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 text-[12px] text-[color:var(--muted)] md:flex">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--green,#5B7A4F)]" />
            {savedAt ? formatHora(savedAt) : "—"}
          </span>
          <span className="text-[color:var(--muted-2)]">·</span>
          <span className="font-mono-tight">eventify.app/{slugEvento}</span>
        </div>
      </header>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
        {/* Sidebar */}
        <aside className="border-r border-[color:var(--hairline)] bg-[color:var(--surface)] lg:sticky lg:top-[56px] lg:h-[calc(100vh-56px)] lg:overflow-y-auto lg:scrollbar-hide">
          <div className="flex min-h-full flex-col">
            {/* Template info */}
            <div className="border-b border-[color:var(--hairline)] p-5">
              <p className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--gold)]">
                Template
              </p>
              <h2 className="mt-2 font-display text-[22px] font-medium leading-tight tracking-[-0.01em]">
                {templateAtual?.nome ?? "Sem template"}
              </h2>
              <p className="mt-1.5 text-[12px] leading-[1.4] text-[color:var(--muted)]">
                {evento.tipo} · {templateAtual?.tom ?? "—"}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-0.5 overflow-x-auto border-b border-[color:var(--hairline)] bg-[color:var(--paper)] px-2 py-2">
              {TABS.map((t) => {
                const ativo = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[12px] transition ${
                      ativo
                        ? "bg-[color:var(--surface)] font-medium text-[color:var(--ink)] shadow-[0_1px_2px_rgba(11,11,18,0.06)]"
                        : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                    }`}
                  >
                    <span className="font-mono-tight text-[10.5px] text-[color:var(--muted-2)]">{t.ic}</span>
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-5">
              {tab === "cores" && (
                <div>
                  <ColorPicker label="Fundo" value={fundo} onChange={setFundo} options={PALETTE_FUNDO} />
                  <ColorPicker label="Superfície" value={superficie} onChange={setSuperficie} options={PALETTE_SUPERFICIE} />
                  <ColorPicker label="Texto" value={texto} onChange={setTexto} options={PALETTE_TEXTO} />
                  <ColorPicker label="Texto sutil" value={mutado} onChange={setMutado} options={PALETTE_MUTADO} />
                  <ColorPicker label="Bordas" value={borda} onChange={setBorda} options={PALETTE_BORDA} />
                  <ColorPicker label="Acento" value={acento} onChange={setAcento} options={PALETTE_ACENTO} />
                </div>
              )}

              {tab === "tipografia" && (
                <div>
                  <FontPicker
                    label="Títulos (display)"
                    value={fontDisplayId}
                    onChange={setFontDisplayId}
                    options={Object.keys(FONT_CATALOG).filter((id) => FONT_CATALOG[id].fallback !== "monospace")}
                  />
                  <SliderField
                    label="Peso dos títulos"
                    value={fontWeightDisplay}
                    onChange={setFontWeightDisplay}
                    min={300}
                    max={700}
                    step={100}
                    suffix=""
                  />
                  <SliderField
                    label="Tamanho do hero"
                    value={fontSizeHero}
                    onChange={setFontSizeHero}
                    min={32}
                    max={120}
                    step={4}
                    suffix="px"
                  />
                  <hr className="my-5 border-[color:var(--hairline)]" />
                  <FontPicker
                    label="Corpo de texto"
                    value={fontBodyId}
                    onChange={setFontBodyId}
                    options={["inter", "manrope", "space-grotesk", "dm-sans", "cormorant-garamond", "fraunces"]}
                  />
                  <SliderField
                    label="Peso do corpo"
                    value={fontWeightBody}
                    onChange={setFontWeightBody}
                    min={300}
                    max={700}
                    step={100}
                    suffix=""
                  />
                  <SliderField
                    label="Tamanho do corpo"
                    value={fontSizeBody}
                    onChange={setFontSizeBody}
                    min={13}
                    max={22}
                    step={1}
                    suffix="px"
                  />
                  <SliderField
                    label="Altura de linha"
                    value={lineHeight}
                    onChange={setLineHeight}
                    min={1.2}
                    max={2}
                    step={0.05}
                    suffix=""
                  />
                  <SliderField
                    label="Tracking (títulos)"
                    value={letterSpacing}
                    onChange={setLetterSpacing}
                    min={-0.05}
                    max={0.1}
                    step={0.005}
                    suffix="em"
                  />
                </div>
              )}

              {tab === "layout" && (
                <div>
                  <ChipGroup
                    label="Cantos arredondados"
                    value={radius}
                    onChange={(v) => setRadius(v as RadiusScale)}
                    options={[
                      { value: "none", label: "Reto" },
                      { value: "small", label: "Pouco" },
                      { value: "medium", label: "Médio" },
                      { value: "large", label: "Generoso" },
                      { value: "pill", label: "Pill" },
                    ]}
                  />
                  <ChipGroup
                    label="Espaçamento entre seções"
                    value={spacing}
                    onChange={(v) => setSpacing(v as SpacingScale)}
                    options={[
                      { value: "compact", label: "Compacto" },
                      { value: "normal", label: "Normal" },
                      { value: "spacious", label: "Generoso" },
                    ]}
                  />
                  <ChipGroup
                    label="Largura do site"
                    value={containerWidth}
                    onChange={(v) => setContainerWidth(v as ContainerWidth)}
                    options={[
                      { value: "narrow", label: "Estreito" },
                      { value: "normal", label: "Normal" },
                      { value: "wide", label: "Largo" },
                    ]}
                  />
                  <ChipGroup
                    label="Animações"
                    value={animationSpeed}
                    onChange={(v) => setAnimationSpeed(v as AnimationSpeed)}
                    options={[
                      { value: "off", label: "Off" },
                      { value: "slow", label: "Lenta" },
                      { value: "normal", label: "Normal" },
                      { value: "fast", label: "Rápida" },
                    ]}
                  />
                </div>
              )}

              {tab === "hero" && (
                <div>
                  <div className="mb-5">
                    <p className="mb-2 text-[12px] font-medium text-[color:var(--ink)]">
                      Imagem do hero
                    </p>
                    {heroImage ? (
                      <div className="relative overflow-hidden rounded-[8px] border border-[color:var(--hairline)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={heroImage} alt="Hero" className="h-32 w-full object-cover" />
                        <button
                          onClick={() => setHeroImage("")}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--ink)] text-[12px] text-white"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleHeroImageUpload}
                        className="block w-full text-[11.5px] text-[color:var(--muted)] file:mr-2 file:rounded-full file:border file:border-[color:var(--hairline-2)] file:bg-[color:var(--paper-2)] file:px-3 file:py-1.5 file:text-[11.5px] file:text-[color:var(--ink)]"
                      />
                    )}
                  </div>
                  <ChipGroup
                    label="Alinhamento"
                    value={heroAlign}
                    onChange={(v) => setHeroAlign(v as HeroAlign)}
                    options={[
                      { value: "left", label: "Esquerda" },
                      { value: "center", label: "Centro" },
                      { value: "right", label: "Direita" },
                    ]}
                  />
                  <SliderField
                    label="Altura do hero"
                    value={heroHeight}
                    onChange={setHeroHeight}
                    min={400}
                    max={900}
                    step={20}
                    suffix="px"
                  />
                  {heroImage && (
                    <SliderField
                      label="Overlay escuro"
                      value={heroOverlay}
                      onChange={setHeroOverlay}
                      min={0}
                      max={80}
                      step={5}
                      suffix="%"
                    />
                  )}
                </div>
              )}

              {tab === "botoes" && (
                <div>
                  <ChipGroup
                    label="Estilo"
                    value={buttonStyle}
                    onChange={(v) => setButtonStyle(v as ButtonStyle)}
                    options={[
                      { value: "filled", label: "Sólido" },
                      { value: "outlined", label: "Contorno" },
                      { value: "ghost", label: "Ghost" },
                    ]}
                  />
                  <ChipGroup
                    label="Cantos"
                    value={buttonRadius}
                    onChange={(v) => setButtonRadius(v as ButtonRadius)}
                    options={[
                      { value: "square", label: "Reto" },
                      { value: "rounded", label: "Arredondado" },
                      { value: "pill", label: "Pill" },
                    ]}
                  />
                  <div className="mt-6 rounded-[8px] border border-[color:var(--hairline)] bg-[color:var(--paper)] p-4">
                    <p className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                      Preview
                    </p>
                    <button
                      className="inline-block px-5 py-2.5 text-[13px] font-medium transition"
                      style={{
                        background: buttonStyle === "filled" ? acento : "transparent",
                        color: buttonStyle === "filled" ? superficie : acento,
                        border: buttonStyle === "ghost" ? "1px solid transparent" : `1.5px solid ${acento}`,
                        borderRadius:
                          buttonRadius === "square" ? "4px" : buttonRadius === "pill" ? "999px" : "10px",
                      }}
                    >
                      Confirmar Presença
                    </button>
                  </div>
                </div>
              )}

              {tab === "secoes" && (
                <div>
                  <p className="mb-3 text-[12px] text-[color:var(--muted)]">
                    Desative as seções que você não quer que apareçam no site.
                  </p>
                  {(Object.keys(SECTION_LABELS) as SectionId[]).map((sec) => {
                    const enabled = enabledSections[sec] !== false;
                    return (
                      <label
                        key={sec}
                        className="flex cursor-pointer items-center justify-between gap-3 border-b border-[color:var(--hairline)] py-2.5 last:border-b-0"
                      >
                        <span className="text-[13px] text-[color:var(--ink)]">
                          {SECTION_LABELS[sec]}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setEnabledSections({ ...enabledSections, [sec]: !enabled })
                          }
                          className={`relative h-5 w-9 rounded-full transition ${
                            enabled ? "bg-[color:var(--gold)]" : "bg-[color:var(--hairline-2)]"
                          }`}
                          aria-pressed={enabled}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                              enabled ? "translate-x-[18px]" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </label>
                    );
                  })}
                </div>
              )}

              {tab === "ia" && (
                <div>
                  <p className="mb-3 text-[12.5px] leading-[1.5] text-[color:var(--muted)]">
                    Envie um print, foto ou URL de inspiração. A IA extrai cores, fontes e vibe — sem copiar o site original.
                  </p>

                  <label className="mb-3 block">
                    <span className="mb-1.5 block text-[11px] text-[color:var(--ink-2)]">Imagem / print</span>
                    {refImagePreview ? (
                      <div className="relative overflow-hidden rounded-[8px] border border-[color:var(--hairline)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={refImagePreview} alt="Referência" className="h-32 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setRefImagePreview(null);
                            setRefImageBase64(null);
                          }}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--ink)] text-[12px] text-white"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleRefImageUpload}
                        className="block w-full text-[11.5px] text-[color:var(--muted)] file:mr-2 file:rounded-full file:border file:border-[color:var(--hairline-2)] file:bg-[color:var(--paper-2)] file:px-3 file:py-1.5 file:text-[11.5px] file:text-[color:var(--ink)]"
                      />
                    )}
                  </label>

                  <label className="mb-3 block">
                    <span className="mb-1.5 block text-[11px] text-[color:var(--ink-2)]">URL</span>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={refUrl}
                      onChange={(e) => setRefUrl(e.target.value)}
                      className="h-8 w-full rounded-[6px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-2.5 text-[12px] outline-none focus:border-[color:var(--ink)]"
                    />
                  </label>

                  <label className="mb-3 block">
                    <span className="mb-1.5 block text-[11px] text-[color:var(--ink-2)]">Descrição</span>
                    <textarea
                      rows={3}
                      placeholder="Ex: minimalista preto e branco, editorial"
                      value={refDescricao}
                      onChange={(e) => setRefDescricao(e.target.value)}
                      className="block w-full resize-none rounded-[6px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] p-2 text-[12px] outline-none focus:border-[color:var(--ink)]"
                    />
                  </label>

                  {refError && (
                    <p className="mb-3 border-y border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] px-2 py-1.5 text-[11.5px] text-[color:var(--rose,#A85462)]">
                      {refError}
                    </p>
                  )}

                  <button
                    onClick={analisarReferencia}
                    disabled={refLoading || (!refImageBase64 && !refUrl && !refDescricao.trim())}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-[8px] bg-[color:var(--gold)] px-3.5 py-2.5 text-[12.5px] font-medium text-white transition hover:bg-[color:var(--gold-2)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {refLoading ? (
                      <>
                        <Spinner className="h-3.5 w-3.5" /> Analisando...
                      </>
                    ) : (
                      <>✦ Analisar e aplicar</>
                    )}
                  </button>

                  {referenceProfile && (
                    <div className="mt-3 rounded-[8px] border border-[color:var(--hairline)] bg-[color:var(--paper)] p-3 text-[11.5px]">
                      <p className="font-medium text-[color:var(--ink)]">
                        Vibe: <em className="italic text-[color:var(--gold)]">{referenceProfile.vibe}</em>
                      </p>
                      <p className="mt-1 text-[color:var(--muted)]">{referenceProfile.estilo}</p>
                      <div className="mt-2 flex gap-1">
                        {referenceProfile.paleta.map((c) => (
                          <span
                            key={c}
                            className="h-5 w-5 rounded-[4px] border border-black/[0.08]"
                            style={{ background: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Outros templates */}
            {outrosTemplates.length > 0 && (
              <div className="border-t border-[color:var(--hairline)] p-5">
                <p className="mb-3 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--gold)]">
                  Outros estilos de {evento.tipo}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {outrosTemplates.slice(0, 4).map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => trocarTemplate(tpl)}
                      disabled={regenerando}
                      className="group flex flex-col overflow-hidden rounded-[8px] border border-[color:var(--hairline)] bg-[color:var(--surface)] text-left transition hover:-translate-y-0.5 hover:border-[color:var(--hairline-2)] disabled:opacity-60"
                    >
                      <div
                        className="aspect-[3/4] w-full"
                        style={{
                          background: `linear-gradient(160deg, ${tpl.accent}33, ${tpl.base} 75%)`,
                        }}
                      />
                      <div className="px-2 py-1.5">
                        <p className="truncate text-[11px] font-medium">{tpl.nome}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="flex flex-col gap-2 border-t border-[color:var(--hairline)] p-5">
              <div className="flex gap-2">
                <button
                  onClick={restaurar}
                  className="flex-1 rounded-[8px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-3.5 py-2 text-[12px] text-[color:var(--muted)] transition hover:border-[color:var(--ink)] hover:text-[color:var(--ink)]"
                >
                  Restaurar
                </button>
                <button
                  onClick={salvarComoMeuTemplate}
                  className="flex-1 rounded-[8px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-3.5 py-2 text-[12px] text-[color:var(--ink)] transition hover:border-[color:var(--ink)]"
                >
                  {salvouTemplate ? "✓ Salvo" : "★ Salvar"}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/evento/${slugEvento}/pronto`)}
                  className="flex-1 rounded-[8px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-4 py-2.5 text-[13px] text-[color:var(--ink)] transition hover:border-[color:var(--ink)]"
                >
                  Voltar
                </button>
                <button
                  onClick={aplicarEGerar}
                  disabled={regenerando}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-[8px] px-4 py-2.5 text-[13px] font-medium text-white transition disabled:opacity-60"
                  style={{ background: regenerando ? "#9a7a48" : "#7C76EE" }}
                >
                  {regenerando ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Gerando...
                    </>
                  ) : (
                    <>Aplicar e gerar <span aria-hidden>→</span></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Preview */}
        <div className="bg-[color:var(--paper-2)] p-6 sm:p-10">
          <div
            className="mx-auto overflow-hidden rounded-[12px] border border-[color:var(--hairline)] bg-[color:var(--surface)] shadow-[0_30px_60px_-40px_rgba(11,11,18,0.18)] transition-[max-width]"
            style={{ maxWidth: viewportWidth }}
          >
            <div className="flex h-[36px] items-center gap-2 border-b border-[color:var(--hairline)] bg-[color:var(--paper)] px-3">
              <span className="flex h-4 w-4 items-center justify-center text-[10px] text-[color:var(--muted-2)]">
                🔒
              </span>
              <span className="font-mono-tight text-[11.5px] text-[color:var(--muted)]">
                eventify.app/{slugEvento}
              </span>
            </div>

            {evento.siteHtml ? (
              <AiSiteFrame
                html={evento.siteHtml}
                titulo={evento.nome}
                paletteOverride={livePalette}
              />
            ) : (
              <div className="flex h-[600px] flex-col items-center justify-center p-8 text-center">
                <p className="font-display text-[26px] italic text-[color:var(--gold)]">✦</p>
                <p className="mt-4 font-display text-[22px] font-light tracking-[-0.01em]">
                  Aguardando o site ser gerado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// Componentes auxiliares
// ============================================================================
function ColorPicker({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (c: string) => void;
  options: string[];
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-[color:var(--ink)]">{label}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-f]{0,6}$/i.test(v)) onChange(v);
          }}
          className="w-[76px] rounded-[4px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-1.5 py-0.5 text-right font-mono-tight text-[10.5px] uppercase tracking-[0.04em] outline-none focus:border-[color:var(--ink)]"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded-full border-2 border-[color:var(--ink)] bg-transparent"
          aria-label={`${label} custom`}
        />
        {options.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`h-7 w-7 rounded-full border transition hover:scale-110 ${
              c.toLowerCase() === value.toLowerCase()
                ? "border-[color:var(--ink)]"
                : "border-black/[0.08]"
            }`}
            style={{ background: c }}
            aria-label={`Selecionar ${c}`}
          />
        ))}
      </div>
    </div>
  );
}

function FontPicker({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  options: string[];
}) {
  const current = FONT_CATALOG[value];
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-medium text-[color:var(--ink)]">{label}</span>
        <span className="text-[10.5px] uppercase tracking-[0.06em] text-[color:var(--muted)]">
          {current?.fallback ?? ""}
        </span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-[6px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-2.5 py-1.5 text-[12.5px] text-[color:var(--ink)] outline-none focus:border-[color:var(--ink)]"
      >
        {options.map((id) => {
          const f = FONT_CATALOG[id];
          if (!f) return null;
          return (
            <option key={id} value={id}>
              {f.name} · {f.fallback}
            </option>
          );
        })}
      </select>
      {current && (
        <p
          className="mt-1.5 truncate text-[15px] leading-tight"
          style={{
            fontFamily: `"${current.name}", ${current.fallback === "display" ? "sans-serif" : current.fallback}`,
          }}
        >
          The quick brown fox · ÁàÉéçãõ — 0123
        </p>
      )}
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-medium text-[color:var(--ink)]">{label}</span>
        <span className="font-mono-tight text-[11px] text-[color:var(--muted)]">
          {value.toFixed(step < 0.1 ? 3 : step < 1 ? 2 : 0)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[color:var(--gold)]"
      />
    </div>
  );
}

function ChipGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="mb-2 text-[12px] font-medium text-[color:var(--ink)]">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const ativo = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`rounded-[6px] border px-2.5 py-1.5 text-[12px] transition ${
                ativo
                  ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-white"
                  : "border-[color:var(--hairline-2)] bg-[color:var(--surface)] text-[color:var(--ink-2)] hover:border-[color:var(--ink)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatHora(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
