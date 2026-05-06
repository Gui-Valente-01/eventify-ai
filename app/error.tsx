"use client";

import { useEffect } from "react";
import BrandHeader from "@/components/BrandHeader";
import ErrorState from "@/components/ErrorState";

/**
 * Error boundary global — captura erros em qualquer página filha.
 * Não captura erros em layouts raiz (esses vão pra global-error.tsx).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log estruturado pra debugging em produção
    console.error("[error-boundary]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack?.split("\n").slice(0, 5).join("\n"),
    });
  }, [error]);

  return (
    <main className="min-h-screen bg-white text-black">
      <BrandHeader />
      <section className="mx-auto max-w-4xl px-6 py-20 lg:px-12">
        <ErrorState
          title="Tivemos um problema"
          description="Aconteceu um erro inesperado ao carregar essa página. Tente recarregar — se persistir, mande print pra gente."
          errorMessage={
            process.env.NODE_ENV === "development"
              ? error.message
              : "Erro de servidor"
          }
          errorCode={error.digest}
          onRetry={reset}
          showHomeLink
        />
      </section>
    </main>
  );
}
