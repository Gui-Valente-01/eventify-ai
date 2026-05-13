import type { StripeInvoice } from "@/lib/stripe";
import { formatCentsBRL, formatStripeDate } from "@/lib/stripe";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  paid: {
    label: "Pago",
    cls: "border-[color:var(--green,#5B7A4F)] bg-[rgba(91,122,79,0.08)] text-[color:var(--green,#5B7A4F)]",
  },
  open: {
    label: "Em aberto",
    cls: "border-[color:var(--gold)] bg-[var(--gold-soft)] text-[color:var(--gold-2)]",
  },
  uncollectible: {
    label: "Falhou",
    cls: "border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.08)] text-[color:var(--rose,#A85462)]",
  },
  void: { label: "Cancelado", cls: "border-[color:var(--hairline-2)] bg-[color:var(--paper-2)] text-[color:var(--muted)]" },
  draft: { label: "Rascunho", cls: "border-[color:var(--hairline-2)] bg-[color:var(--paper-2)] text-[color:var(--muted)]" },
};

export default function PaymentHistory({ invoices }: { invoices: StripeInvoice[] }) {
  if (invoices.length === 0) {
    return (
      <section className="mt-12">
        <h2 className="font-display text-[28px] italic tracking-[-0.01em] text-[color:var(--ink)]">
          Histórico de pagamentos
        </h2>
        <div className="mt-5 rounded-[14px] border border-dashed border-[color:var(--hairline-2)] bg-[color:var(--paper-2)] p-10 text-center">
          <p className="font-display text-[20px] italic text-[color:var(--gold)]">$</p>
          <p className="mt-3 text-[14px] text-[color:var(--muted)]">
            Você ainda não tem pagamentos. Quando assinar um plano, todas as cobranças aparecem aqui.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-[28px] italic tracking-[-0.01em] text-[color:var(--ink)]">
          Histórico de pagamentos
        </h2>
        <p className="text-[12px] uppercase tracking-[0.14em] text-[color:var(--muted)] font-mono-tight">
          {invoices.length} {invoices.length === 1 ? "cobrança" : "cobranças"}
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)]">
        <div className="hidden border-b border-[color:var(--hairline)] bg-[color:var(--paper-2)] px-5 py-3 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--muted)] sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:gap-4">
          <span>Descrição</span>
          <span>Período</span>
          <span>Status</span>
          <span className="text-right">Valor</span>
          <span className="text-right">Recibo</span>
        </div>

        <ul className="divide-y divide-[color:var(--hairline)]">
          {invoices.map((inv) => {
            const statusInfo = STATUS_LABEL[inv.status ?? ""] ?? STATUS_LABEL.paid;
            const periodo =
              inv.periodStart && inv.periodEnd
                ? `${formatStripeDate(inv.periodStart)} → ${formatStripeDate(inv.periodEnd)}`
                : formatStripeDate(inv.created);

            return (
              <li
                key={inv.id}
                className="grid gap-2 px-5 py-4 text-[14px] sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-4"
              >
                <div>
                  <p className="font-display text-[16px] italic tracking-[-0.005em] text-[color:var(--ink)]">
                    {inv.description || "Plano Eventify"}
                  </p>
                  {inv.number && (
                    <p className="mt-0.5 font-mono-tight text-[11px] text-[color:var(--muted)]">
                      {inv.number}
                    </p>
                  )}
                </div>

                <p className="whitespace-nowrap text-[12.5px] text-[color:var(--muted)] font-mono-tight">{periodo}</p>

                <span
                  className={`inline-flex w-fit items-center justify-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${statusInfo.cls}`}
                >
                  {statusInfo.label}
                </span>

                <p className="tabular-nums font-display text-[18px] font-light tracking-[-0.01em] text-[color:var(--ink)] sm:text-right">
                  {formatCentsBRL(inv.amountPaid, inv.currency)}
                </p>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {inv.invoicePdf && (
                    <a
                      href={inv.invoicePdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center justify-center rounded-full border border-[color:var(--hairline-2)] px-3 text-[11.5px] text-[color:var(--ink)] transition hover:border-[color:var(--ink)]"
                    >
                      PDF
                    </a>
                  )}
                  {inv.hostedInvoiceUrl && (
                    <a
                      href={inv.hostedInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center justify-center rounded-full bg-[color:var(--ink)] px-3 text-[11.5px] font-medium text-white transition hover:bg-black"
                    >
                      Ver
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-3 text-[12px] text-[color:var(--muted-2)]">
        Os recibos e a fatura completa são gerenciados pela Stripe. Para trocar o método de pagamento, use o botão &ldquo;Gerenciar assinatura&rdquo;.
      </p>
    </section>
  );
}
