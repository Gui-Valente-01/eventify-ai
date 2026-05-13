"use client";

import { useEffect } from "react";

/**
 * Boundary de último recurso. Precisa renderizar html/body inteiros.
 * Sem next/font aqui — pode ser invocado antes do layout carregar.
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
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
          minHeight: "100vh",
          margin: 0,
          background: "#FAFAF7",
          color: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 520, textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#B8935A",
            }}
          >
            Erro crítico
          </p>
          <h1
            style={{
              marginTop: "1.25rem",
              fontSize: "2.4rem",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.02,
              fontFamily: "ui-serif, Georgia, serif",
            }}
          >
            Algo quebrou no <em style={{ color: "#B8935A" }}>Eventify.</em>
          </h1>
          <p
            style={{
              marginTop: "1.4rem",
              fontSize: "1rem",
              lineHeight: 1.6,
              color: "#6B6B6B",
              maxWidth: "44ch",
              margin: "1.4rem auto 0",
            }}
          >
            Tivemos uma falha grave. A equipe foi notificada. Tente recarregar a página.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              height: 52,
              padding: "0 1.75rem",
              borderRadius: 9999,
              background: "#0A0A0A",
              color: "#fff",
              fontSize: "0.95rem",
              fontWeight: 500,
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
