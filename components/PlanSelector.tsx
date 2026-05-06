import { PLANS, type PlanId } from "@/lib/plans";

type PlanSelectorProps = {
  value: PlanId;
  onChange: (planId: PlanId) => void;
  disabled?: boolean;
  title?: string;
  description?: string;
};

export default function PlanSelector({
  value,
  onChange,
  disabled = false,
  title = "Plano do site",
  description = "A IA usa o plano escolhido para definir profundidade, secoes, copy e nivel visual.",
}: PlanSelectorProps) {
  return (
    <section className="rounded-2xl border border-[#e8e3f1] bg-[#faf9ff] p-5">
      <div className="mb-4">
        <h2 className="text-xl font-black text-[#090814]">{title}</h2>
        <p className="eventify-muted mt-1 text-sm">{description}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const selected = value === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(plan.id)}
              className={`min-h-[190px] rounded-2xl border-2 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-70 ${
                selected
                  ? "border-[#8847e7] bg-white shadow-lg shadow-purple-100"
                  : "border-[#e8e3f1] bg-white/70 hover:border-purple-300 hover:bg-white"
              }`}
              aria-pressed={selected}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-[#090814]">{plan.nome}</p>
                  <p className="mt-1 text-sm font-black text-[#8847e7]">{plan.precoFormatado}</p>
                </div>
                {selected && (
                  <span className="rounded-full bg-[#8847e7] px-3 py-1 text-xs font-black text-white">
                    Escolhido
                  </span>
                )}
              </div>

              <p className="eventify-muted mt-3 text-sm leading-6">{plan.descricao}</p>

              <ul className="mt-4 space-y-2">
                {plan.recursos.slice(0, 3).map((recurso) => (
                  <li key={recurso} className="text-xs font-semibold leading-5 text-[#3a3548]">
                    {recurso}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </section>
  );
}
