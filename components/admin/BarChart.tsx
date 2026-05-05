export function BarChart({
  data,
  formatValue,
}: {
  data: Array<{ label: string; value: number }>;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 0.0001);
  return (
    <div className="flex h-48 items-end gap-1">
      {data.map((d, i) => {
        const h = Math.max(2, (d.value / max) * 100);
        return (
          <div
            key={i}
            className="group relative flex flex-1 flex-col justify-end"
            title={`${d.label}: ${formatValue ? formatValue(d.value) : d.value}`}
          >
            <div
              className="w-full rounded-t bg-gradient-to-t from-purple-600 to-purple-400 transition-all group-hover:from-purple-500 group-hover:to-purple-300"
              style={{ height: `${h}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
