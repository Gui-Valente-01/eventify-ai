import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-black">
      <BrandHeader />
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center lg:px-12">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
          Erro 404
        </p>
        <h1 className="mt-6 text-[clamp(3rem,9vw,7rem)] font-black leading-[0.95] tracking-[-0.03em]">
          Esta página{" "}
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            sumiu
          </span>
          .
        </h1>
        <p className="mt-8 max-w-md text-lg leading-8 text-black/60">
          O link que você seguiu pode estar quebrado ou o evento foi removido. Sem
          drama — escolhe um caminho aí embaixo.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-14 items-center justify-center rounded-full bg-black px-8 text-base font-bold text-white transition-transform hover:scale-[1.02]"
          >
            Ir pra home →
          </Link>
          <Link
            href="/exemplos"
            className="inline-flex h-14 items-center justify-center rounded-full border-2 border-black/10 bg-white px-8 text-base font-bold text-black transition-colors hover:border-black"
          >
            Ver exemplos
          </Link>
          <Link
            href="/painel"
            className="inline-flex h-14 items-center justify-center rounded-full border-2 border-black/10 bg-white px-8 text-base font-bold text-black transition-colors hover:border-black"
          >
            Painel
          </Link>
        </div>
      </section>
    </main>
  );
}
