"use client";

import { useEffect, useRef } from "react";

type AiSiteFrameProps = {
  html: string;
  titulo: string;
};

const MIN_HEIGHT = 600;
const MAX_HEIGHT = 12000;
const STABILITY_THRESHOLD = 4;

export default function AiSiteFrame({ html, titulo }: AiSiteFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    let lastHeight = 0;
    let stableCount = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function medirAltura() {
      try {
        const doc = iframe!.contentDocument;
        if (!doc) return;

        // Mede APENAS o documentElement.scrollHeight (sem max de várias fontes)
        // Isso evita o loop de retroalimentação onde body cresce com o iframe
        const altura = doc.documentElement.scrollHeight || 0;

        if (altura < MIN_HEIGHT) return;

        // Sanity cap: não passa de MAX_HEIGHT (caso algo dê errado)
        const finalHeight = Math.min(altura, MAX_HEIGHT);

        // Só atualiza se a altura mudou (evita reflow)
        if (finalHeight === lastHeight) {
          stableCount += 1;
          // Após N medições estáveis, para o intervalo
          if (stableCount >= STABILITY_THRESHOLD && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
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
      setTimeout(medirAltura, 100);
      setTimeout(medirAltura, 600);
      intervalId = setInterval(medirAltura, 1000);
    };

    iframe.addEventListener("load", onLoad);

    return () => {
      iframe.removeEventListener("load", onLoad);
      if (intervalId) clearInterval(intervalId);
    };
  }, [html]);

  return (
    <iframe
      ref={ref}
      title={titulo}
      srcDoc={html}
      sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
      className="w-full border-0 block"
      style={{ height: `${MIN_HEIGHT}px` }}
    />
  );
}
