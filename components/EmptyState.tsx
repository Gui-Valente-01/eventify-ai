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

/**
 * Empty state padronizado. Use em listas vazias, dashboards sem dados,
 * páginas que precisam de configuração inicial.
 */
export default function EmptyState({
  icon = "✨",
  title,
  description,
  action,
  secondaryAction,
  variant = "light",
  className = "",
}: Props) {
  const isDark = variant === "dark";
  const containerCls = isDark
    ? "rounded-2xl border border-white/10 bg-white/[0.02] p-10"
    : "rounded-2xl border border-dashed border-[#e8e3f1] bg-[#faf9ff] p-10";
  const titleCls = isDark
    ? "text-2xl font-black text-white"
    : "text-2xl font-black text-[#090814]";
  const descCls = isDark ? "mt-3 text-white/60" : "mt-3 text-[#5f5a72]";

  return (
    <div className={`${containerCls} text-center ${className}`}>
      <div className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
        isDark ? "bg-white/5 text-3xl" : "bg-white text-3xl shadow-sm"
      }`}>
        {icon}
      </div>
      <p className={`mt-5 ${titleCls}`}>{title}</p>
      {description && <p className={descCls}>{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && <ActionBtn action={action} isDark={isDark} />}
          {secondaryAction && <ActionBtn action={secondaryAction} isDark={isDark} />}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ action, isDark }: { action: Action; isDark: boolean }) {
  const isPrimary = action.variant !== "ghost";
  const cls = isPrimary
    ? isDark
      ? "inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-black hover:bg-white/90"
      : "eventify-button eventify-button-primary"
    : isDark
      ? "inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-bold text-white hover:bg-white/5"
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
