"use client";

import { useState, useEffect } from "react";
import AiSiteFrame from "@/components/AiSiteFrame";
import { FONT_CATALOG, type LivePalette } from "@/lib/livePalette";

type Props = {
  siteHtml: string | null;
  nomeEvento: string;
  initialCustom?: {
    paleta?: string[];
    fontDisplayId?: string;
    fontBodyId?: string;
  };
  onSalvar: (custom: {
    paleta: string[];
    fontDisplayId: string;
    fontBodyId: string;
  }) => Promise<void>;
  onClose: () => void;
};

// 6 paletas pré-feitas (curadas) — [fundo, superficie, texto, acento]
const PALETAS_PRESET = [
  {
    nome: "Editorial Clássico",
    cores: ["#F5EDE2", "#E8D4C3", "#2B1D17", "#B7895C"],
  },
  {
    nome: "Romântico Suave",
    cores: ["#FAF5F1", "#F0DCD0", "#3A2A2A", "#C49A8E"],
  },
  {
    nome: "Minimalista Branco",
    cores: ["#FFFFFF", "#F5F5F5", "#0A0A0A", "#1F1F1F"],
  },
  {
    nome: "Luxo Sofisticado",
    cores: ["#0A0A0A", "#1A1A1A", "#F4E9C8", "#C8A96A"],
  },
  {
    nome: "Festivo Vibrante",
    cores: ["#FFF8E7", "#FFE5B4", "#1A1A1A", "#E85A4F"],
  },
  {
    nome: "Sereno Natural",
    cores: ["#F0EDE5", "#D4E4D9", "#2D3A2D", "#7BA68E"],
  },
];

// Curadoria das fontes pra mostrar no editor (sem o mono e display extremos)
const FONTES_DISPLAY = ["cormorant-garamond", "fraunces", "playfair-display", "instrument-serif", "dm-serif"];
const FONTES_BODY = ["inter", "space-grotesk", "manrope", "dm-sans"];

export default function EditorVisualModal({
  siteHtml,
  nomeEvento,
  initialCustom,
  onSalvar,
  onClose,
}: Props) {
  const paletaInicial = initialCustom?.paleta && initialCustom.paleta.length >= 4
    ? initialCustom.paleta.slice(0, 4)
    : PALETAS_PRESET[0].cores;

  const [paleta, setPaleta] = useState<string[]>(paletaInicial);
  const [fontDisplayId, setFontDisplayId] = useState<string>(
    initialCustom?.fontDisplayId || "cormorant-garamond"
  );
  const [fontBodyId, setFontBodyId] = useState<string>(initialCustom?.fontBodyId || "inter");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Live palette pro AiSiteFrame — atualiza em tempo real
  const [livePalette, setLivePalette] = useState<LivePalette | null>(null);
  useEffect(() => {
    setLivePalette({
      fundo: paleta[0],
      superficie: paleta[1],
      texto: paleta[2],
      acento: paleta[3],
      fontDisplay: FONT_CATALOG[fontDisplayId],
      fontBody: FONT_CATALOG[fontBodyId],
    });
  }, [paleta, fontDisplayId, fontBodyId]);

  function aplicarPreset(cores: string[]) {
    setPaleta(cores);
  }

  function atualizarCor(idx: number, valor: string) {
    const nova = [...paleta];
    nova[idx] = valor;
    setPaleta(nova);
  }

  function resetar() {
    setPaleta(PALETAS_PRESET[0].cores);
    setFontDisplayId("cormorant-garamond");
    setFontBodyId("inter");
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);
    try {
      await onSalvar({
        paleta,
        fontDisplayId,
        fontBodyId,
      });
      onClose();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  const labelsCores = ["Fundo", "Superfície", "Texto", "Acento"];

  return (
    <div className="fixed inset-0 z-50 flex items-stretch overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="m-auto w-full max-w-6xl rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[color:var(--hairline)] p-6">
          <div>
            <span className="eventify-kicker">Personalizar visual</span>
            <h2 className="mt-2 font-display text-[28px] italic text-[color:var(--ink)]">
              Cores e tipografia
            </h2>
            <p className="mt-1 text-[13px] text-[color:var(--muted)]">
              Mudanças aparecem no preview ao lado em tempo real.
            </p>
          </div>
          <button
            onClick={() => !salvando && onClose()}
            className="text-[20px] text-[color:var(--muted)] hover:text-[color:var(--ink)]"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
          {/* Controles à esquerda */}
          <div className="space-y-6 overflow-y-auto" style={{ maxHeight: "70vh" }}>
            {/* Paletas pré-feitas */}
            <section>
              <h3 className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Paletas prontas
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {PALETAS_PRESET.map((preset) => {
                  const ativo =
                    preset.cores[0] === paleta[0] &&
                    preset.cores[1] === paleta[1] &&
                    preset.cores[2] === paleta[2] &&
                    preset.cores[3] === paleta[3];
                  return (
                    <button
                      key={preset.nome}
                      onClick={() => aplicarPreset(preset.cores)}
                      className={`group flex flex-col gap-1.5 rounded-[10px] border p-2.5 text-left transition ${
                        ativo
                          ? "border-[color:var(--ink)] bg-[color:var(--paper)]"
                          : "border-[color:var(--hairline)] hover:border-[color:var(--ink-2)]"
                      }`}
                    >
                      <div className="flex gap-1">
                        {preset.cores.map((c, i) => (
                          <span
                            key={i}
                            className="h-6 flex-1 rounded-sm border border-black/10"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span className="text-[11.5px] text-[color:var(--ink-2)]">{preset.nome}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Color pickers */}
            <section>
              <h3 className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Ajustar cores
              </h3>
              <div className="space-y-2">
                {labelsCores.map((label, i) => (
                  <label
                    key={label}
                    className="flex items-center gap-3 rounded-[8px] border border-[color:var(--hairline)] bg-[color:var(--paper)] px-3 py-2"
                  >
                    <input
                      type="color"
                      value={paleta[i] || "#000000"}
                      onChange={(e) => atualizarCor(i, e.target.value)}
                      className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <span className="flex-1 text-[12.5px] text-[color:var(--ink-2)]">{label}</span>
                    <input
                      type="text"
                      value={paleta[i] || ""}
                      onChange={(e) => atualizarCor(i, e.target.value)}
                      className="w-[88px] rounded border border-[color:var(--hairline)] bg-[color:var(--surface)] px-2 py-1 font-mono-tight text-[11.5px] uppercase text-[color:var(--ink)]"
                      maxLength={7}
                      placeholder="#000000"
                    />
                  </label>
                ))}
              </div>
            </section>

            {/* Fontes */}
            <section>
              <h3 className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Tipografia
              </h3>
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-[11.5px] text-[color:var(--ink-2)]">
                    Títulos (display)
                  </span>
                  <select
                    value={fontDisplayId}
                    onChange={(e) => setFontDisplayId(e.target.value)}
                    className="w-full rounded-[6px] border border-[color:var(--hairline)] bg-[color:var(--paper)] px-3 py-2 text-[13px] text-[color:var(--ink)]"
                  >
                    {FONTES_DISPLAY.map((id) => (
                      <option key={id} value={id}>
                        {FONT_CATALOG[id]?.name || id}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11.5px] text-[color:var(--ink-2)]">
                    Texto corrido (body)
                  </span>
                  <select
                    value={fontBodyId}
                    onChange={(e) => setFontBodyId(e.target.value)}
                    className="w-full rounded-[6px] border border-[color:var(--hairline)] bg-[color:var(--paper)] px-3 py-2 text-[13px] text-[color:var(--ink)]"
                  >
                    {FONTES_BODY.map((id) => (
                      <option key={id} value={id}>
                        {FONT_CATALOG[id]?.name || id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            {erro && (
              <p className="border-y border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] px-3 py-2 text-[12.5px] text-[color:var(--rose,#A85462)]">
                {erro}
              </p>
            )}
          </div>

          {/* Preview à direita */}
          <div className="overflow-hidden rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--paper-2)]">
            <div className="border-b border-[color:var(--hairline)] bg-[color:var(--paper)] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Preview ao vivo
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 40px)" }}>
              {siteHtml ? (
                <AiSiteFrame html={siteHtml} titulo={nomeEvento} paletteOverride={livePalette} />
              ) : (
                <div className="flex h-64 items-center justify-center text-[14px] text-[color:var(--muted)]">
                  Site ainda não foi gerado.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 border-t border-[color:var(--hairline)] p-6">
          <button
            onClick={resetar}
            disabled={salvando}
            className="text-[13px] text-[color:var(--muted)] underline-offset-2 hover:underline disabled:opacity-50"
          >
            ↺ Resetar pro padrão
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={salvando}
              className="eventify-button eventify-button-ghost"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={salvando}
              className="eventify-button eventify-button-primary"
            >
              {salvando ? "Salvando..." : "Salvar personalização"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
