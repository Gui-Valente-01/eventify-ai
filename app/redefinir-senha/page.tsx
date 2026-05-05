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
      <section className="eventify-section flex justify-center">
        <div className="eventify-card w-full max-w-md p-10">
          <span className="eventify-kicker">✦ Nova senha</span>
          <h1 className="eventify-title mt-5 text-4xl">Defina sua nova senha</h1>
          <p className="eventify-muted mt-3">Use no mínimo 6 caracteres.</p>

          {!pronto ? (
            <p className="eventify-muted mt-8 text-center text-sm">Validando link...</p>
          ) : (
            <form onSubmit={redefinir} className="mt-8 grid gap-4">
              <input
                type="password"
                placeholder="Nova senha"
                className="eventify-input"
                value={senha}
                autoComplete="new-password"
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                className="eventify-input"
                value={confirmar}
                autoComplete="new-password"
                onChange={(e) => setConfirmar(e.target.value)}
                required
                minLength={6}
              />

              {aviso && (
                <p
                  className={`rounded-2xl border p-3 text-sm font-semibold ${
                    aviso.tipo === "erro"
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {aviso.texto}
                </p>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="eventify-button eventify-button-primary min-h-12 justify-center disabled:opacity-70"
              >
                {carregando ? <><Spinner className="h-4 w-4" /> Salvando...</> : <>Atualizar senha →</>}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
