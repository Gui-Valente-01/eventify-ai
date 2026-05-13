"use client";

import { useEffect, useMemo, useRef } from "react";
import { sanitizeGeneratedHtml } from "@/lib/htmlSanitize";
import { buildPaletteCss, type LivePalette } from "@/lib/livePalette";

type AiSiteFrameProps = {
  html: string;
  titulo: string;
  /**
   * Quando fornecido, injeta um <style> dentro do iframe que sobrescreve
   * as cores em tempo real — sem reload do iframe, sem precisar regenerar
   * com IA. Usado na tela de personalizar cores.
   */
  paletteOverride?: LivePalette | null;
};

const MIN_HEIGHT = 600;
const MAX_HEIGHT = 20000;
const STABILITY_THRESHOLD = 3;
const MAX_ITERATIONS = 10;
const LIVE_STYLE_ID = "ev-live-palette";

export default function AiSiteFrame({ html, titulo, paletteOverride }: AiSiteFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const safeHtml = useMemo(() => sanitizeGeneratedHtml(html), [html]);

  // Auto-resize do iframe pra altura do conteúdo
  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    let lastHeight = 0;
    let stableCount = 0;
    let iterations = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    function medirAltura() {
      iterations += 1;
      if (iterations > MAX_ITERATIONS) {
        stop();
        return;
      }
      try {
        const doc = iframe!.contentDocument;
        if (!doc) return;
        const altura = doc.documentElement.scrollHeight || 0;
        if (altura < MIN_HEIGHT) return;
        const finalHeight = Math.min(altura, MAX_HEIGHT);
        if (finalHeight === lastHeight) {
          stableCount += 1;
          if (stableCount >= STABILITY_THRESHOLD) stop();
          return;
        }
        stableCount = 0;
        lastHeight = finalHeight;
        iframe!.style.height = `${finalHeight}px`;
      } catch {
        // cross-origin: ignora
      }
    }

    const onLoad = () => {
      iframe.style.height = `${MIN_HEIGHT}px`;
      lastHeight = 0;
      stableCount = 0;
      iterations = 0;
      setTimeout(medirAltura, 100);
      setTimeout(medirAltura, 600);
      intervalId = setInterval(medirAltura, 1000);
    };

    iframe.addEventListener("load", onLoad);

    return () => {
      iframe.removeEventListener("load", onLoad);
      if (intervalId) clearInterval(intervalId);
    };
  }, [safeHtml]);

  // Live palette override — injeta <style> dentro do iframe sem recarregar
  useEffect(() => {
    if (!paletteOverride) return;
    const iframe = ref.current;
    if (!iframe) return;

    function inject() {
      try {
        const doc = iframe!.contentDocument;
        if (!doc) return;
        let styleEl = doc.getElementById(LIVE_STYLE_ID) as HTMLStyleElement | null;
        if (!styleEl) {
          styleEl = doc.createElement("style");
          styleEl.id = LIVE_STYLE_ID;
          doc.head.appendChild(styleEl);
        }
        styleEl.textContent = buildPaletteCss(paletteOverride!);
      } catch {
        // cross-origin: ignora
      }
    }

    // Injeta agora (caso iframe já tenha carregado)
    inject();
    // E também a cada load (pra HTML novo)
    iframe.addEventListener("load", inject);
    return () => iframe.removeEventListener("load", inject);
  }, [
    paletteOverride?.fundo,
    paletteOverride?.superficie,
    paletteOverride?.texto,
    paletteOverride?.acento,
    paletteOverride?.fontDisplay?.name,
    paletteOverride?.fontBody?.name,
  ]);

  return (
    <iframe
      ref={ref}
      title={titulo}
      srcDoc={safeHtml}
      sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
      scrolling="no"
      className="w-full border-0 block"
      style={{ height: `${MIN_HEIGHT}px` }}
    />
  );
}
