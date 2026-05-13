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
      className={`mx-auto max-w-xl rounded-[14px] border p-10 text-center ${
        isDark
          ? "border-white/10 bg-white/[0.02] text-white"
          : "border-[color:var(--hairline)] bg-[color:var(--surface)]"
      }`}
    >
      <div
        className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border font-display italic ${
          isDark
            ? "border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.12)] text-[color:var(--rose,#A85462)]"
            : "border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] text-[color:var(--rose,#A85462)]"
        }`}
      >
        !
      </div>
      <h2
        className={`mt-6 font-display text-[32px] font-light tracking-[-0.01em] ${
          isDark ? "text-white" : "text-[color:var(--ink)]"
        }`}
      >
        {title}
      </h2>
      <p className={`mt-3 text-[14.5px] leading-[1.55] ${isDark ? "text-white/65" : "text-[color:var(--muted)]"}`}>
        {description}
      </p>

      {errorMessage && (
        <div
          className={`mt-5 overflow-x-auto rounded-[8px] border p-3 text-left font-mono-tight text-[12px] ${
            isDark
              ? "border-white/10 bg-black/40 text-[color:var(--rose,#A85462)]"
              : "border-[color:var(--hairline)] bg-[color:var(--paper-2)] text-[color:var(--rose,#A85462)]"
          }`}
        >
          {errorCode && <span className="opacity-60">[{errorCode}] </span>}
          {errorMessage}
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={
              isDark
                ? "inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-[13.5px] font-medium text-[color:var(--ink)] transition-transform hover:-translate-y-px"
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
                ? "inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-[13.5px] text-white transition-colors hover:bg-white/5"
                : "eventify-button eventify-button-ghost"
            }
          >
            Voltar pro início
          </Link>
        )}
      </div>
    </div>
  );
}
