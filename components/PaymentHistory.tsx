import type { StripeInvoice } from "@/lib/stripe";
import { formatCentsBRL, formatStripeDate } from "@/lib/stripe";

const STATUS_LABEL: Record<string, { label: string; cor: string }> = {
  paid: { label: "Pago", cor: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  open: { label: "Em aberto", cor: "bg-amber-100 text-amber-700 border-amber-200" },
  uncollectible: { label: "Falhou", cor: "bg-rose-100 text-rose-700 border-rose-200" },
  void: { label: "Cancelado", cor: "bg-slate-100 text-slate-600 border-slate-200" },
  draft: { label: "Rascunho", cor: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function PaymentHistory({ invoices }: { invoices: StripeInvoice[] }) {
  if (invoices.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="text-xl font-black text-[#090814]">Histórico de pagamentos</h2>
        <div className="mt-4 rounded-2xl border border-dashed border-[#e8e3f1] bg-[#faf9ff] p-10 text-center">
          <p className="text-2xl">💳</p>
          <p className="eventify-muted mt-3">
            Você ainda não tem pagamentos. Quando assinar um plano, todas as cobranças aparecem aqui.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-xl font-black text-[#090814]">Histórico de pagamentos</h2>
        <p className="eventify-muted text-xs">
          {invoices.length} {invoices.length === 1 ? "cobrança" : "cobranças"}
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#e8e3f1] bg-white">
        <div className="hidden border-b border-[#e8e3f1] bg-[#faf9ff] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#5f5a72] sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:gap-4">
          <span>Descrição</span>
          <span>Período</span>
          <span>Status</span>
          <span className="text-right">Valor</span>
          <span className="text-right">Recibo</span>
        </div>

        <ul className="divide-y divide-[#e8e3f1]">
          {invoices.map((inv) => {
            const statusInfo = STATUS_LABEL[inv.status ?? ""] ?? STATUS_LABEL.paid;
            const periodo =
              inv.periodStart && inv.periodEnd
                ? `${formatStripeDate(inv.periodStart)} → ${formatStripeDate(inv.periodEnd)}`
                : formatStripeDate(inv.created);

            return (
              <li
                key={inv.id}
                className="grid gap-2 px-4 py-4 text-sm sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-4"
              >
                <div>
                  <p className="font-bold text-[#090814]">
                    {inv.description || "Plano Eventify AI"}
                  </p>
                  {inv.number && (
                    <p className="eventify-muted mt-0.5 font-mono text-[11px]">
                      {inv.number}
                    </p>
                  )}
                </div>

                <p className="eventify-muted text-xs whitespace-nowrap">{periodo}</p>

                <span
                  className={`inline-flex w-fit items-center justify-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${statusInfo.cor}`}
                >
                  {statusInfo.label}
                </span>

                <p className="font-black tabular-nums text-[#090814] sm:text-right">
                  {formatCentsBRL(inv.amountPaid, inv.currency)}
                </p>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {inv.invoicePdf && (
                    <a
                      href={inv.invoicePdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center justify-center rounded-full border border-[#e8e3f1] px-3 text-xs font-bold text-[#5f5a72] hover:border-purple-300 hover:text-purple-700"
                    >
                      PDF
                    </a>
                  )}
                  {inv.hostedInvoiceUrl && (
                    <a
                      href={inv.hostedInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center justify-center rounded-full bg-[#090814] px-3 text-xs font-bold text-white hover:opacity-90"
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

      <p className="eventify-muted mt-3 text-xs">
        Os recibos e a fatura completa são gerenciados pela Stripe. Para gerenciar a assinatura ou trocar o método de pagamento, use o botão "Gerenciar assinatura" no topo.
      </p>
    </section>
  );
}
