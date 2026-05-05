import Link from "next/link";

export default function AcessoNegado() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0814] px-6 text-white">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-widest text-purple-400">
          Acesso restrito
        </p>
        <h1 className="mt-4 text-4xl font-black">Você não é admin.</h1>
        <p className="mt-4 text-white/70">
          Essa área é só para administradores. Se você precisa de acesso, fale com
          o dono da plataforma.
        </p>
        <Link
          href="/painel"
          className="mt-8 inline-block rounded-xl bg-purple-500 px-6 py-3 text-sm font-bold hover:bg-purple-400"
        >
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
