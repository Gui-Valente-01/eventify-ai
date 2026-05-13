"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  EVENT_KINDS,
  TEMPLATES_POR_TIPO,
  type EventKind,
  type Template,
} from "@/lib/templateGallery";

type Filtro = "todos" | EventKind;

export default function TemplatesPage() {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [selecionados, setSelecionados] = useState<Record<EventKind, string>>({
    Casamento: "editorial-romantic",
    Aniversário: "confetti-pop",
    "Evento Corporativo": "brutalist-summit",
    Festa: "neon-night",
    Religioso: "vesper",
  });

  const tiposVisiveis = useMemo(
    () => (filtro === "todos" ? EVENT_KINDS : [filtro as EventKind]),
    [filtro]
  );

  const totalTemplates = EVENT_KINDS.reduce(
    (sum, k) => sum + (TEMPLATES_POR_TIPO[k]?.length ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)]">
      {/* Topbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-[color:var(--hairline)] bg-[color:var(--paper)]/85 px-6 py-4 backdrop-blur sm:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[color:var(--gold)]">
            <span className="block h-1.5 w-1.5 rounded-[1px] bg-white" />
          </span>
          <span className="font-display text-[20px] tracking-[-0.005em]">Eventify</span>
          <span className="px-2 text-[color:var(--muted-2)]">/</span>
          <span className="text-[14px] text-[color:var(--muted)]">Templates</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden text-right text-[12px] leading-[1.3] text-[color:var(--muted)] sm:block">
            <div>
              <span className="font-mono-tight text-[color:var(--ink)]">5</span> estilos ×{" "}
              <span className="font-mono-tight text-[color:var(--ink)]">5</span> tipos
            </div>
            <div className="text-[11px] text-[color:var(--muted-2)]">
              {totalTemplates} templates
            </div>
          </div>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-3.5 text-[12.5px] text-[color:var(--ink)] transition hover:border-[color:var(--ink)]">
            Filtrar
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[color:var(--hairline)] px-6 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11.5px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
              Biblioteca
            </p>
            <h1 className="mt-3 font-display text-[clamp(40px,5.6vw,68px)] font-light leading-[1.02] tracking-[-0.025em]">
              Escolha um <em className="italic text-[color:var(--gold)]">ponto de partida.</em>
            </h1>
            <p className="mt-5 max-w-[58ch] text-[15px] leading-[1.6] text-[color:var(--muted)]">
              Cinco estilos cuidadosamente desenhados pra cada tipo de evento. Selecione um —
              depois você troca as cores e regenera os textos com IA.
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5">
            <FilterPill ativo={filtro === "todos"} onClick={() => setFiltro("todos")}>
              Todos
            </FilterPill>
            {EVENT_KINDS.map((k) => {
              const label = k === "Evento Corporativo" ? "Corporativo" : k;
              return (
                <FilterPill key={k} ativo={filtro === k} onClick={() => setFiltro(k)}>
                  {label}
                </FilterPill>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sections per type */}
      <div className="mx-auto max-w-[1280px] px-6 py-10 sm:px-10 sm:py-14">
        {tiposVisiveis.map((tipo) => {
          const templates = TEMPLATES_POR_TIPO[tipo] || [];
          const labelTipo = tipo === "Evento Corporativo" ? "Corporativo" : tipo;
          return (
            <section key={tipo} className="mb-16 last:mb-0">
              {/* Section header */}
              <div className="mb-6 flex items-end justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-display text-[28px] font-medium tracking-[-0.01em]">
                    {labelTipo}
                  </h2>
                  <span className="font-mono-tight text-[12px] text-[color:var(--muted-2)]">
                    {String(templates.length).padStart(2, "0")}
                  </span>
                </div>
                <Link
                  href={`/templates?tipo=${encodeURIComponent(tipo)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setFiltro(tipo);
                  }}
                  className="flex items-center gap-1 text-[12.5px] text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                >
                  Ver tudo de {labelTipo.toLowerCase()}
                  <span aria-hidden>→</span>
                </Link>
              </div>

              {/* Grid of 5 */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {templates.map((tpl) => (
                  <TemplateCard
                    key={tpl.id}
                    template={tpl}
                    selected={selecionados[tipo] === tpl.id}
                    onSelect={() => setSelecionados((s) => ({ ...s, [tipo]: tpl.id }))}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Sticky bottom bar com os selecionados */}
      <SelectedBar selecionados={selecionados} />
    </main>
  );
}

// ============================================================================
function FilterPill({
  children,
  ativo,
  onClick,
}: {
  children: React.ReactNode;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-8 items-center rounded-full px-3.5 text-[12.5px] transition ${
        ativo
          ? "bg-[color:var(--ink)] text-white"
          : "border border-[color:var(--hairline-2)] bg-[color:var(--surface)] text-[color:var(--ink-2)] hover:border-[color:var(--ink)]"
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================================
function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: Template;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex flex-col overflow-hidden rounded-[12px] border bg-[color:var(--surface)] text-left transition-all hover:-translate-y-0.5 ${
        selected
          ? "border-[color:var(--gold)] shadow-[0_0_0_3px_var(--gold-soft)]"
          : "border-[color:var(--hairline)] hover:border-[color:var(--hairline-2)] hover:shadow-[0_20px_40px_-30px_rgba(40,30,10,0.2)]"
      }`}
    >
      {/* Visual */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${template.accent}22, ${template.base} 75%)`,
        }}
      >
        {/* Mock card */}
        <div
          className="absolute inset-3 rounded-[6px] border border-black/[0.06]"
          style={{ background: template.base }}
        />
        {/* Mock title */}
        <div
          className="absolute inset-x-3 bottom-9 font-display italic"
          style={{
            color: template.base.startsWith("#0") || template.base.startsWith("#1") ? "#fff" : "#1F1B17",
            fontSize: "15px",
            lineHeight: 1.05,
            padding: "0 6px",
          }}
        >
          {template.nome}
        </div>
        {/* Mock kind label */}
        <div
          className="absolute inset-x-3 bottom-3 font-mono-tight uppercase tracking-[0.08em]"
          style={{ color: template.accent, fontSize: "9px", padding: "0 6px" }}
        >
          {template.tipos[0]}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-medium leading-tight text-[color:var(--ink)]">
            {template.nome}
          </p>
          {/* 3 color dots */}
          <div className="flex shrink-0 gap-0.5">
            {template.paleta.slice(0, 3).map((c, i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-full border border-black/[0.08]"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <p className="text-[11.5px] leading-[1.35] text-[color:var(--muted)]">
          {template.descricao}
        </p>
        {selected && (
          <p className="mt-1 flex items-center gap-1 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--gold)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]" />
            Selecionado
          </p>
        )}
      </div>
    </button>
  );
}

// ============================================================================
function SelectedBar({
  selecionados,
}: {
  selecionados: Record<EventKind, string>;
}) {
  const count = Object.keys(selecionados).filter((k) => selecionados[k as EventKind]).length;
  if (count === 0) return null;

  return (
    <div className="sticky bottom-0 z-40 border-t border-[color:var(--hairline)] bg-[color:var(--surface)]/95 px-6 py-3 backdrop-blur sm:px-10">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
        <p className="text-[12.5px] text-[color:var(--muted)]">
          <span className="font-mono-tight text-[color:var(--ink)]">{count}</span> templates
          selecionados, um pra cada tipo de evento.
        </p>
        <Link
          href="/novo-evento"
          className="eventify-button eventify-button-primary text-[12.5px]"
        >
          Criar evento com esses templates <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
