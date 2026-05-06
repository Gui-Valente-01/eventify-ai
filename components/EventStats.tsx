type Props = {
  views: number;
  rsvps: number;
  isPublished: boolean;
};

export default function EventStats({ views, rsvps, isPublished }: Props) {
  const conversao = views > 0 ? Math.min(100, Math.round((rsvps / views) * 100)) : 0;

  return (
    <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl border border-[#e8e3f1] bg-white p-3 text-center">
      <Stat label="Visitas" value={isPublished ? views.toLocaleString("pt-BR") : "—"} hint={!isPublished ? "publique para medir" : undefined} />
      <Stat label="RSVPs" value={rsvps.toLocaleString("pt-BR")} />
      <Stat label="Conversão" value={isPublished && views > 0 ? `${conversao}%` : "—"} accent={conversao >= 30 ? "good" : conversao >= 10 ? "ok" : "low"} />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "good" | "ok" | "low";
}) {
  const accentClass =
    accent === "good"
      ? "text-emerald-600"
      : accent === "ok"
        ? "text-amber-600"
        : accent === "low"
          ? "text-[#5f5a72]"
          : "text-[#090814]";
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#5f5a72]">{label}</p>
      <p className={`mt-1 text-xl font-black tabular-nums ${accentClass}`}>{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-[#5f5a72]">{hint}</p>}
    </div>
  );
}
