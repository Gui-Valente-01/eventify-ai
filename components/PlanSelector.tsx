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
  description = "A IA usa o plano escolhido pra definir profundidade, seções, copy e nível visual.",
}: PlanSelectorProps) {
  return (
    <section>
      <div className="mb-4">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-2)]">
          {title}
        </span>
        <p className="text-[13px] text-[color:var(--muted)]">{description}</p>
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
              aria-pressed={selected}
              className={`flex min-h-[180px] flex-col rounded-[12px] border p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                selected
                  ? "border-[color:var(--gold)] bg-[color:var(--paper-2)] shadow-[inset_0_0_0_1px_var(--gold)]"
                  : "border-[color:var(--hairline)] bg-[color:var(--surface)] hover:border-[color:var(--hairline-2)] hover:-translate-y-px"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[20px] italic tracking-[-0.01em] text-[color:var(--ink)]">
                    {plan.nome}
                  </p>
                  <p className="mt-1 font-display text-[22px] font-light leading-none tracking-[-0.02em] text-[color:var(--ink)]">
                    {plan.precoFormatado}
                    <span className="ml-1 text-[12px] font-normal text-[color:var(--muted)] font-sans">/mês</span>
                  </p>
                </div>
                {selected && (
                  <span className="inline-flex shrink-0 items-center rounded-full bg-[color:var(--gold)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white">
                    Escolhido
                  </span>
                )}
              </div>

              <p className="mt-3 text-[13px] leading-[1.5] text-[color:var(--muted)]">{plan.descricao}</p>

              <ul className="mt-auto pt-4">
                {plan.recursos.slice(0, 3).map((recurso) => (
                  <li
                    key={recurso}
                    className="flex gap-2 border-t border-[color:var(--hairline)] py-1.5 text-[12px] text-[color:var(--ink-2)]"
                  >
                    <span className="font-mono-tight text-[color:var(--gold)]">+</span>
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
