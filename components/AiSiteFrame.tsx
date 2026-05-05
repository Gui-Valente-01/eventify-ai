"use client";

import { useEffect, useRef } from "react";

type AiSiteFrameProps = {
  html: string;
  titulo: string;
};

export default function AiSiteFrame({ html, titulo }: AiSiteFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    function ajustarAltura() {
      try {
        const doc = iframe!.contentDocument;
        if (!doc) return;
        const body = doc.body;
        const html = doc.documentElement;
        const altura = Math.max(
          body?.scrollHeight ?? 0,
          body?.offsetHeight ?? 0,
          html?.clientHeight ?? 0,
          html?.scrollHeight ?? 0,
          html?.offsetHeight ?? 0
        );
        iframe!.style.height = `${altura + 40}px`;
      } catch {
        // cross-origin: ignora
      }
    }

    iframe.addEventListener("load", ajustarAltura);
    const interval = setInterval(ajustarAltura, 1500);
    return () => {
      iframe.removeEventListener("load", ajustarAltura);
      clearInterval(interval);
    };
  }, [html]);

  return (
    <iframe
      ref={ref}
      title={titulo}
      srcDoc={html}
      sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
      className="w-full border-0"
      style={{ minHeight: "100vh" }}
    />
  );
}
