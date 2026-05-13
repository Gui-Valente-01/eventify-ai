export function StatCard({
  label,
  value,
  hint,
  accent = "purple",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "purple" | "green" | "amber" | "blue";
}) {
  // accent kept for API compat — não muda o visual no editorial
  void accent;
  return (
    <div className="rounded-[12px] border border-white/10 bg-white/[0.03] p-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">{label}</p>
      <p className="mt-3 font-display text-[34px] font-light leading-none tracking-[-0.02em] tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-2 text-[12px] text-white/50">{hint}</p>}
    </div>
  );
}
