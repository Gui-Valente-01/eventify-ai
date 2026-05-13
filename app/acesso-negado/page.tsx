import Link from "next/link";

export default function AcessoNegado() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--ink)] px-6 text-white">
      <div className="max-w-md text-center">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)]">Acesso restrito</p>
        <h1 className="mt-5 font-display text-[44px] font-light leading-[1.05] tracking-[-0.02em]">
          Você <em className="italic text-[color:var(--gold)]">não é admin.</em>
        </h1>
        <p className="mt-5 text-[15px] leading-[1.6] text-white/65">
          Essa área é só para administradores. Se você precisa de acesso, fale com o dono da plataforma.
        </p>
        <Link
          href="/painel"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-[color:var(--ink)] transition-transform hover:-translate-y-px"
        >
          Voltar ao painel <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
