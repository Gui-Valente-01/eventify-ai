type Props = {
  views: number;
  rsvps: number;
  isPublished: boolean;
};

export default function EventStats({ views, rsvps, isPublished }: Props) {
  const conversao = views > 0 ? Math.min(100, Math.round((rsvps / views) * 100)) : 0;

  return (
    <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--surface)]">
      <Stat
        label="Visitas"
        value={isPublished ? views.toLocaleString("pt-BR") : "—"}
        hint={!isPublished ? "publique para medir" : undefined}
        withDivider
      />
      <Stat label="RSVPs" value={rsvps.toLocaleString("pt-BR")} withDivider />
      <Stat
        label="Conversão"
        value={isPublished && views > 0 ? `${conversao}%` : "—"}
        accent={conversao >= 30 ? "good" : conversao >= 10 ? "ok" : "low"}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
  withDivider,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "good" | "ok" | "low";
  withDivider?: boolean;
}) {
  const accentClass =
    accent === "good"
      ? "text-[color:var(--green,#5B7A4F)]"
      : accent === "ok"
        ? "text-[color:var(--gold-2)]"
        : accent === "low"
          ? "text-[color:var(--muted)]"
          : "text-[color:var(--ink)]";
  return (
    <div className={`px-3 py-3 text-center ${withDivider ? "border-r border-[color:var(--hairline)]" : ""}`}>
      <p className="text-[9.5px] uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p>
      <p className={`mt-1.5 font-display text-[22px] font-light leading-none tracking-[-0.02em] tabular-nums ${accentClass}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-[10px] text-[color:var(--muted-2)]">{hint}</p>}
    </div>
  );
}
