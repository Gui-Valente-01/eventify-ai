"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";
import Spinner from "@/components/Spinner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function recuperar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAviso(null);

    if (!isSupabaseConfigured) {
      setAviso({ tipo: "erro", texto: "Supabase não configurado." });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setCarregando(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/redefinir-senha`,
    });
    setCarregando(false);

    if (error) {
      setAviso({ tipo: "erro", texto: error.message });
      return;
    }
    setAviso({
      tipo: "ok",
      texto: "Se o e-mail estiver cadastrado, você vai receber um link em instantes.",
    });
  }

  return (
    <main className="eventify-page">
      <BrandHeader />
      <section className="editorial-narrow py-24 sm:py-32">
        <span className="eventify-kicker">Esqueci a senha</span>
        <h1 className="eventify-title mt-6 text-[clamp(40px,5vw,64px)]">
          Recuperar <em>acesso.</em>
        </h1>
        <p className="mt-4 text-[16px] text-[color:var(--muted)]">
          Vamos enviar um link de redefinição para seu e-mail cadastrado.
        </p>

        <form onSubmit={recuperar} className="mt-12 grid gap-7">
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-2)]">
              E-mail cadastrado
            </span>
            <input
              type="email"
              placeholder="seu@email.com"
              className="eventify-input"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
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
                <Spinner className="h-4 w-4" /> Enviando...
              </>
            ) : (
              <>Enviar link <span aria-hidden>→</span></>
            )}
          </button>
        </form>

        <p className="mt-10 border-t border-[color:var(--hairline)] pt-8 text-center text-[14px] text-[color:var(--muted)]">
          Lembrou a senha?{" "}
          <Link
            href="/login"
            className="text-[color:var(--ink)] underline decoration-[color:var(--gold)] underline-offset-4 transition-colors hover:decoration-[color:var(--ink)]"
          >
            Entrar →
          </Link>
        </p>
      </section>
    </main>
  );
}
