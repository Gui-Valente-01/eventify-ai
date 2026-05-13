import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";

export default function NotFound() {
  return (
    <main className="eventify-page">
      <BrandHeader />
      <section className="editorial-narrow flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <span className="eventify-kicker">Erro 404</span>
        <h1 className="eventify-title mt-7 text-[clamp(56px,9vw,140px)]">
          Esta página <em>sumiu.</em>
        </h1>
        <p className="mt-8 max-w-[52ch] text-[17px] leading-[1.7] text-[color:var(--muted)]">
          O link que você seguiu pode estar quebrado ou o evento foi removido. Sem drama — escolhe um caminho aí embaixo.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="eventify-button eventify-button-primary">
            Ir pra home <span aria-hidden>→</span>
          </Link>
          <Link href="/exemplos" className="eventify-button eventify-button-ghost">
            Ver exemplos
          </Link>
          <Link href="/painel" className="eventify-button eventify-button-ghost">
            Painel
          </Link>
        </div>
      </section>
    </main>
  );
}
