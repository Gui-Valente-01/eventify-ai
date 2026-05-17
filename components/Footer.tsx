import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[color:var(--hairline)] bg-[color:var(--paper)]">
      <div className="editorial-wrap py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-[20px] italic text-[color:var(--ink)]">Eventify</p>
            <p className="mt-2 max-w-md text-[13px] text-[color:var(--muted)]">
              Sites editoriais para eventos, gerados com IA. Do briefing ao link publicado em uma tarde.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[13px]">
            <div className="flex flex-col gap-1.5">
              <p className="mb-1 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Produto
              </p>
              <Link href="/precos" className="text-[color:var(--ink-2)] hover:text-[color:var(--ink)]">
                Planos
              </Link>
              <Link href="/exemplos" className="text-[color:var(--ink-2)] hover:text-[color:var(--ink)]">
                Exemplos
              </Link>
              <Link href="/templates" className="text-[color:var(--ink-2)] hover:text-[color:var(--ink)]">
                Templates
              </Link>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="mb-1 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Legal
              </p>
              <Link href="/termos" className="text-[color:var(--ink-2)] hover:text-[color:var(--ink)]">
                Termos de uso
              </Link>
              <Link href="/privacidade" className="text-[color:var(--ink-2)] hover:text-[color:var(--ink)]">
                Privacidade
              </Link>
              <a
                href="mailto:contato@eventify.app"
                className="text-[color:var(--ink-2)] hover:text-[color:var(--ink)]"
              >
                Suporte
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[color:var(--hairline)] pt-5 text-[11.5px] text-[color:var(--muted)]">
          © {new Date().getFullYear()} Eventify · Todos os direitos reservados
        </div>
      </div>
    </footer>
  );
}
