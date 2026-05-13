import Link from "next/link";
import type { ReactNode } from "react";

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
};

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: Action;
  secondaryAction?: Action;
  variant?: "light" | "dark";
  className?: string;
};

export default function EmptyState({
  icon = "✦",
  title,
  description,
  action,
  secondaryAction,
  variant = "light",
  className = "",
}: Props) {
  const isDark = variant === "dark";
  const containerCls = isDark
    ? "rounded-[14px] border border-white/10 bg-white/[0.02] p-12 text-white"
    : "rounded-[14px] border border-dashed border-[color:var(--hairline-2)] bg-[color:var(--paper-2)] p-12";

  return (
    <div className={`${containerCls} text-center ${className}`}>
      <div
        className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border font-display text-[22px] italic ${
          isDark
            ? "border-white/15 bg-white/5 text-white"
            : "border-[color:var(--hairline-2)] bg-[color:var(--surface)] text-[color:var(--gold)]"
        }`}
      >
        {icon}
      </div>
      <h3
        className={`mt-6 font-display text-[28px] font-light tracking-[-0.01em] ${
          isDark ? "text-white" : "text-[color:var(--ink)]"
        }`}
      >
        {title}
      </h3>
      {description && (
        <p
          className={`mx-auto mt-3 max-w-[52ch] text-[14.5px] leading-[1.55] ${
            isDark ? "text-white/65" : "text-[color:var(--muted)]"
          }`}
        >
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {action && <ActionBtn action={action} isDark={isDark} defaultPrimary />}
          {secondaryAction && <ActionBtn action={secondaryAction} isDark={isDark} />}
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  action,
  isDark,
  defaultPrimary = false,
}: {
  action: Action;
  isDark: boolean;
  defaultPrimary?: boolean;
}) {
  const isPrimary = action.variant ? action.variant === "primary" : defaultPrimary;
  const cls = isPrimary
    ? isDark
      ? "inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-[13.5px] font-medium text-[color:var(--ink)] transition-transform hover:-translate-y-px"
      : "eventify-button eventify-button-primary"
    : isDark
      ? "inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-[13.5px] text-white transition-colors hover:bg-white/5"
      : "eventify-button eventify-button-ghost";

  if (action.href) {
    return (
      <Link href={action.href} className={cls}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={cls}>
      {action.label}
    </button>
  );
}
