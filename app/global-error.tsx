"use client";

import { useEffect } from "react";

/**
 * Boundary de último recurso — captura erros que aconteceram no
 * RootLayout antes do `error.tsx` montar. Precisa renderizar o html/body.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          minHeight: "100vh",
          margin: 0,
          background: "#fff",
          color: "#0a0814",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#7c3aed",
            }}
          >
            Erro crítico
          </p>
          <h1
            style={{
              marginTop: "1rem",
              fontSize: "2.25rem",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Algo quebrou no Eventify AI
          </h1>
          <p
            style={{
              marginTop: "1.5rem",
              fontSize: "1rem",
              lineHeight: 1.6,
              color: "rgba(10,8,20,0.6)",
            }}
          >
            Tivemos uma falha grave. A equipe foi notificada. Tente recarregar a
            página.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              height: 56,
              padding: "0 2rem",
              borderRadius: 9999,
              background: "#0a0814",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            Recarregar →
          </button>
        </div>
      </body>
    </html>
  );
}
