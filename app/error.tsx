"use client";

import { useEffect } from "react";
import BrandHeader from "@/components/BrandHeader";
import ErrorState from "@/components/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack?.split("\n").slice(0, 5).join("\n"),
    });

    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope: "boundary",
        message: error.message || "Erro no boundary",
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        context: { digest: error.digest },
      }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

  return (
    <main className="eventify-page">
      <BrandHeader />
      <section className="editorial-narrow py-24">
        <ErrorState
          title="Tivemos um problema"
          description="Aconteceu um erro inesperado ao carregar essa página. Tente recarregar — se persistir, mande print pra gente."
          errorMessage={process.env.NODE_ENV === "development" ? error.message : "Erro de servidor"}
          errorCode={error.digest}
          onRetry={reset}
          showHomeLink
        />
      </section>
    </main>
  );
}
