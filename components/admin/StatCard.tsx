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
  const accentMap = {
    purple: "from-purple-500/20 to-purple-500/0 border-purple-500/30",
    green: "from-emerald-500/20 to-emerald-500/0 border-emerald-500/30",
    amber: "from-amber-500/20 to-amber-500/0 border-amber-500/30",
    blue: "from-blue-500/20 to-blue-500/0 border-blue-500/30",
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 ${accentMap[accent]}`}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-white/60">{label}</p>
      <p className="mt-3 text-3xl font-black tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-xs text-white/50">{hint}</p>}
    </div>
  );
}
