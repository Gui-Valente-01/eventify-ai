"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import Spinner from "@/components/Spinner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/painel";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    if (!isSupabaseConfigured) {
      setErro("Supabase não configurado. Adicione as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);

    if (error) {
      setErro(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <main className="eventify-page gradient-mesh">
      <BrandHeader actions={[{ href: "/cadastro", label: "Criar conta", variant: "primary" }]} />
      <section className="eventify-section flex justify-center">
        <div className="eventify-card glass w-full max-w-md p-10 ring-glow animate-fade-up">
          <span className="eventify-kicker">✦ Entrar</span>
          <h1 className="eventify-title mt-5 text-4xl">Bem-vindo de volta</h1>
          <p className="eventify-muted mt-3">Acesse seu painel de eventos.</p>

          <form onSubmit={entrar} className="mt-8 grid gap-4">
            <input
              type="email"
              placeholder="E-mail"
              className="eventify-input"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              className="eventify-input"
              value={senha}
              autoComplete="current-password"
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
            />

            {erro && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-600">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="eventify-button eventify-button-primary min-h-12 justify-center disabled:opacity-70"
            >
              {carregando ? <><Spinner className="h-4 w-4" /> Entrando...</> : <>Entrar →</>}
            </button>
          </form>

          <div className="eventify-muted mt-6 flex flex-col items-center gap-2 text-center text-sm">
            <Link href="/recuperar-senha" className="font-bold text-[#8847e7]">
              Esqueci minha senha
            </Link>
            <span>
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-bold text-[#8847e7]">
                Criar agora
              </Link>
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="eventify-page"><div className="eventify-section text-center eventify-muted">Carregando...</div></main>}>
      <LoginInner />
    </Suspense>
  );
}
