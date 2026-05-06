"use client";

import Link from "next/link";

type Props = {
  title?: string;
  description?: string;
  errorMessage?: string;
  errorCode?: string;
  onRetry?: () => void;
  showHomeLink?: boolean;
  variant?: "light" | "dark";
};

/**
 * Tela de erro consistente. Usar em error boundaries e estados de
 * falha previsível (rede, API, validação).
 */
export default function ErrorState({
  title = "Algo deu errado",
  description = "Tivemos um problema ao carregar essa parte. Tente recarregar — se persistir, fale com a gente.",
  errorMessage,
  errorCode,
  onRetry,
  showHomeLink = true,
  variant = "light",
}: Props) {
  const isDark = variant === "dark";
  return (
    <div
      className={`mx-auto max-w-xl rounded-2xl border p-10 text-center ${
        isDark
          ? "border-white/10 bg-white/[0.02]"
          : "border-rose-200 bg-rose-50/40"
      }`}
    >
      <div
        className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${
          isDark ? "bg-rose-500/10" : "bg-rose-100"
        }`}
      >
        ⚠️
      </div>
      <h2
        className={`mt-5 text-2xl font-black ${
          isDark ? "text-white" : "text-[#090814]"
        }`}
      >
        {title}
      </h2>
      <p className={`mt-3 text-sm ${isDark ? "text-white/60" : "text-[#5f5a72]"}`}>
        {description}
      </p>

      {errorMessage && (
        <div
          className={`mt-5 overflow-x-auto rounded-xl border p-3 text-left text-xs font-mono ${
            isDark
              ? "border-white/10 bg-black/40 text-rose-300"
              : "border-rose-200 bg-white text-rose-700"
          }`}
        >
          {errorCode && <span className="opacity-60">[{errorCode}] </span>}
          {errorMessage}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={
              isDark
                ? "inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-black hover:bg-white/90"
                : "eventify-button eventify-button-primary"
            }
          >
            Tentar de novo
          </button>
        )}
        {showHomeLink && (
          <Link
            href="/"
            className={
              isDark
                ? "inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-bold text-white hover:bg-white/5"
                : "eventify-button eventify-button-ghost"
            }
          >
            Voltar para o início
          </Link>
        )}
      </div>
    </div>
  );
}
