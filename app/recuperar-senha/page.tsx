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
      <section className="eventify-section flex justify-center">
        <div className="eventify-card w-full max-w-md p-10">
          <span className="eventify-kicker">✦ Esqueci a senha</span>
          <h1 className="eventify-title mt-5 text-4xl">Recuperar acesso</h1>
          <p className="eventify-muted mt-3">Vamos enviar um link de redefinição para seu e-mail.</p>

          <form onSubmit={recuperar} className="mt-8 grid gap-4">
            <input
              type="email"
              placeholder="E-mail cadastrado"
              className="eventify-input"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
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
              {carregando ? <><Spinner className="h-4 w-4" /> Enviando...</> : <>Enviar link →</>}
            </button>
          </form>

          <p className="eventify-muted mt-6 text-center text-sm">
            Lembrou a senha?{" "}
            <Link href="/login" className="font-bold text-[#8847e7]">
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
