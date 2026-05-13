"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import Spinner from "@/components/Spinner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setAviso({ tipo: "erro", texto: "Supabase não configurado." });
      setPronto(true);
      return;
    }
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setPronto(true);
    });
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setPronto(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function redefinir(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAviso(null);

    if (senha.length < 6) {
      setAviso({ tipo: "erro", texto: "A senha precisa ter ao menos 6 caracteres." });
      return;
    }
    if (senha !== confirmar) {
      setAviso({ tipo: "erro", texto: "As senhas não coincidem." });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);

    if (error) {
      setAviso({ tipo: "erro", texto: error.message });
      return;
    }

    setAviso({ tipo: "ok", texto: "Senha atualizada! Redirecionando..." });
    setTimeout(() => router.push("/painel"), 1500);
  }

  return (
    <main className="eventify-page">
      <BrandHeader />
      <section className="editorial-narrow py-24 sm:py-32">
        <span className="eventify-kicker">Nova senha</span>
        <h1 className="eventify-title mt-6 text-[clamp(40px,5vw,64px)]">
          Defina sua <em>nova senha.</em>
        </h1>
        <p className="mt-4 text-[16px] text-[color:var(--muted)]">
          Use no mínimo 6 caracteres. Algo que você lembre.
        </p>

        {!pronto ? (
          <p className="mt-12 text-center text-[14px] text-[color:var(--muted)]">Validando link...</p>
        ) : (
          <form onSubmit={redefinir} className="mt-12 grid gap-7">
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-2)]">
                Nova senha
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="eventify-input"
                value={senha}
                autoComplete="new-password"
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-2)]">
                Confirmar
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="eventify-input"
                value={confirmar}
                autoComplete="new-password"
                onChange={(e) => setConfirmar(e.target.value)}
                required
                minLength={6}
              />
            </label>

            {aviso && (
              <p
                className={
                  aviso.tipo === "erro"
                    ? "border-y border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] px-4 py-3 text-[13.5px] text-[color:var(--rose,#A85462)]"
                    : "border-y border-[color:var(--green,#5B7A4F)] bg-[rgba(91,122,79,0.06)] px-4 py-3 text-[13.5px] text-[color:var(--green,#5B7A4F)]"
                }
              >
                {aviso.texto}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="eventify-button eventify-button-primary mt-2 min-h-[3rem] justify-center disabled:opacity-70"
            >
              {carregando ? (
                <>
                  <Spinner className="h-4 w-4" /> Salvando...
                </>
              ) : (
                <>Atualizar senha <span aria-hidden>→</span></>
              )}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
