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
      setErro(
        "Supabase não configurado. Adicione as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local."
      );
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
    <main className="eventify-page">
      <BrandHeader actions={[{ href: "/cadastro", label: "Criar conta", variant: "primary" }]} />
      <section className="editorial-narrow py-24 sm:py-32">
        <span className="eventify-kicker">Entrar</span>
        <h1 className="eventify-title mt-6 text-[clamp(40px,5vw,64px)]">
          Bem-vindo de <em>volta.</em>
        </h1>
        <p className="mt-4 text-[16px] text-[color:var(--muted)]">
          Acesse seu painel de eventos.
        </p>

        <form onSubmit={entrar} className="mt-12 grid gap-7">
          <Field label="E-mail">
            <input
              type="email"
              placeholder="seu@email.com"
              className="eventify-input"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field label="Senha">
            <input
              type="password"
              placeholder="••••••••"
              className="eventify-input"
              value={senha}
              autoComplete="current-password"
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
            />
          </Field>

          {erro && (
            <p className="border-y border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] px-4 py-3 text-[13.5px] text-[color:var(--rose,#A85462)]">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="eventify-button eventify-button-primary mt-2 min-h-[3rem] justify-center disabled:opacity-70"
          >
            {carregando ? (
              <>
                <Spinner className="h-4 w-4" /> Entrando...
              </>
            ) : (
              <>Entrar <span aria-hidden>→</span></>
            )}
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-[color:var(--hairline)] pt-8 text-center text-[14px]">
          <Link
            href="/recuperar-senha"
            className="text-[color:var(--ink)] underline decoration-[color:var(--hairline-2)] underline-offset-4 transition-colors hover:decoration-[color:var(--ink)]"
          >
            Esqueci minha senha
          </Link>
          <span className="text-[color:var(--muted)]">
            Ainda não tem conta?{" "}
            <Link
              href="/cadastro"
              className="text-[color:var(--ink)] underline decoration-[color:var(--gold)] underline-offset-4 transition-colors hover:decoration-[color:var(--ink)]"
            >
              Criar agora →
            </Link>
          </span>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-2)]">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="eventify-page">
          <div className="eventify-section text-center text-[color:var(--muted)]">Carregando...</div>
        </main>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
