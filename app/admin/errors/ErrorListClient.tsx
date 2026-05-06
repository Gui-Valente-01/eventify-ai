"use client";

import { useState } from "react";

type Status = "open" | "investigating" | "resolved" | "ignored";

type ErrorRow = {
  id: string;
  scope: string;
  level: string;
  message: string;
  error_name: string | null;
  error_message: string | null;
  stack: string | null;
  url: string | null;
  user_agent: string | null;
  context: Record<string, unknown> | null;
  status: Status;
  ai_analysis: string | null;
  ai_suggested_fix: string | null;
  ai_severity: "low" | "medium" | "high" | "critical" | null;
  created_at: string;
};

const STATUS_LABELS: Record<Status, { label: string; cls: string }> = {
  open: { label: "Aberto", cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  investigating: { label: "Investigando", cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  resolved: { label: "Resolvido", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  ignored: { label: "Ignorado", cls: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
};

const SEVERITY_LABELS: Record<string, { label: string; cls: string }> = {
  low: { label: "Baixa", cls: "bg-slate-500/20 text-slate-300" },
  medium: { label: "Média", cls: "bg-amber-500/20 text-amber-300" },
  high: { label: "Alta", cls: "bg-orange-500/20 text-orange-300" },
  critical: { label: "Crítica", cls: "bg-rose-500/30 text-rose-200" },
};

export default function ErrorListClient({ errors: initial }: { errors: ErrorRow[] }) {
  const [errors, setErrors] = useState(initial);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const visible = filter === "all" ? errors : errors.filter((e) => e.status === filter);

  async function analisarComIA(errorId: string) {
    setAnalyzingId(errorId);
    try {
      const res = await fetch("/api/admin/analyze-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Erro ao analisar: ${data.error || res.status}`);
        return;
      }
      setErrors((prev) =>
        prev.map((e) =>
          e.id === errorId
            ? {
                ...e,
                ai_analysis: data.analysis,
                ai_suggested_fix: data.fix,
                ai_severity: data.severity,
                status: "investigating",
              }
            : e
        )
      );
      setExpandedId(errorId);
    } finally {
      setAnalyzingId(null);
    }
  }

  async function mudarStatus(errorId: string, status: Status) {
    setBusy(errorId);
    try {
      const res = await fetch("/api/admin/error-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorId, status }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(`Erro: ${data.error || res.status}`);
        return;
      }
      setErrors((prev) =>
        prev.map((e) => (e.id === errorId ? { ...e, status } : e))
      );
    } finally {
      setBusy(null);
    }
  }

  if (errors.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
        <p className="text-3xl">🎉</p>
        <p className="mt-3 text-xl font-black text-emerald-300">Nenhum erro registrado</p>
        <p className="mt-2 text-sm text-white/60">
          Quando algo falhar no app, vai aparecer aqui automaticamente.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
          Todos ({errors.length})
        </FilterBtn>
        {(["open", "investigating", "resolved", "ignored"] as Status[]).map((s) => (
          <FilterBtn
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABELS[s].label} ({errors.filter((e) => e.status === s).length})
          </FilterBtn>
        ))}
      </div>

      <ul className="space-y-3">
        {visible.map((err) => {
          const expanded = expandedId === err.id;
          const status = STATUS_LABELS[err.status];
          const severity = err.ai_severity ? SEVERITY_LABELS[err.ai_severity] : null;
          return (
            <li
              key={err.id}
              className="rounded-xl border border-white/10 bg-black/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${status.cls}`}>
                      {status.label}
                    </span>
                    {severity && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${severity.cls}`}>
                        {severity.label}
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-purple-300">
                      {err.scope}
                    </span>
                    <span className="text-[11px] text-white/40">
                      {new Date(err.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="mt-2 truncate font-bold text-white">
                    {err.message}
                  </p>
                  {err.error_message && err.error_message !== err.message && (
                    <p className="mt-1 truncate text-sm text-white/50 font-mono">
                      {err.error_message}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!err.ai_analysis && (
                    <button
                      onClick={() => analisarComIA(err.id)}
                      disabled={analyzingId === err.id}
                      className="rounded-full bg-purple-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-400 disabled:opacity-50"
                    >
                      {analyzingId === err.id ? "Analisando…" : "✨ Analisar com IA"}
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedId(expanded ? null : err.id)}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/5"
                  >
                    {expanded ? "Fechar" : "Detalhes"}
                  </button>
                </div>
              </div>

              {expanded && (
                <div className="space-y-4 border-t border-white/10 px-4 py-4">
                  {err.ai_analysis && (
                    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-purple-300">
                        ✨ Análise da IA
                      </p>
                      <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-white/85">
                        {err.ai_analysis}
                      </pre>
                    </div>
                  )}

                  {err.url && (
                    <Field label="URL">
                      <code className="text-purple-300">{err.url}</code>
                    </Field>
                  )}

                  {err.stack && (
                    <Field label="Stack trace">
                      <pre className="overflow-x-auto rounded bg-black/40 p-3 text-[11px] leading-5 text-rose-300">
                        {err.stack}
                      </pre>
                    </Field>
                  )}

                  {err.context && Object.keys(err.context).length > 0 && (
                    <Field label="Context">
                      <pre className="overflow-x-auto rounded bg-black/40 p-3 text-[11px] leading-5 text-white/70">
                        {JSON.stringify(err.context, null, 2)}
                      </pre>
                    </Field>
                  )}

                  {err.user_agent && (
                    <Field label="User agent">
                      <span className="text-xs text-white/60">{err.user_agent}</span>
                    </Field>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {err.status !== "investigating" && (
                      <ActionBtn
                        onClick={() => mudarStatus(err.id, "investigating")}
                        disabled={busy === err.id}
                      >
                        Marcar como investigando
                      </ActionBtn>
                    )}
                    {err.status !== "resolved" && (
                      <ActionBtn
                        onClick={() => mudarStatus(err.id, "resolved")}
                        disabled={busy === err.id}
                        variant="success"
                      >
                        ✓ Resolver
                      </ActionBtn>
                    )}
                    {err.status !== "ignored" && (
                      <ActionBtn
                        onClick={() => mudarStatus(err.id, "ignored")}
                        disabled={busy === err.id}
                        variant="ghost"
                      >
                        Ignorar
                      </ActionBtn>
                    )}
                    {err.status !== "open" && (
                      <ActionBtn
                        onClick={() => mudarStatus(err.id, "open")}
                        disabled={busy === err.id}
                        variant="ghost"
                      >
                        Reabrir
                      </ActionBtn>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function FilterBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
        active
          ? "bg-white text-black"
          : "border border-white/15 text-white/70 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function ActionBtn({
  children,
  onClick,
  disabled,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "success" | "ghost";
}) {
  const cls =
    variant === "success"
      ? "bg-emerald-500 text-white hover:bg-emerald-400"
      : variant === "ghost"
        ? "border border-white/15 text-white/70 hover:bg-white/5"
        : "bg-white/10 text-white hover:bg-white/15";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-50 ${cls}`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-white/40">
        {label}
      </p>
      {children}
    </div>
  );
}
