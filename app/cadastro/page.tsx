"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function CadastroPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function cadastrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!isSupabaseConfigured) {
      setErro(
        "Supabase não configurado. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local."
      );
      return;
    }

    if (senha.length < 6) {
      setErro("A senha precisa ter ao menos 6 caracteres.");
      return;
    }

    if (!aceitouTermos) {
      setErro("Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setCarregando(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { full_name: nome } },
    });
    setCarregando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    if (data.session) {
      router.push("/painel");
      router.refresh();
    } else {
      setSucesso("Conta criada! Confirme seu e-mail para acessar.");
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* LEFT: form */}
      <div className="flex flex-col px-10 py-10 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[color:var(--ink)]">
            <span className="block h-1.5 w-1.5 rounded-[1px] bg-[color:var(--ink)]" />
          </span>
          <span className="font-display text-[22px] tracking-[-0.005em] text-[color:var(--ink)]">Eventify</span>
        </Link>

        <div className="flex flex-1 items-center">
          <div className="w-full max-w-[400px]">
            <span className="eventify-eyebrow">Criar conta</span>
            <h1 className="mt-3 font-display text-[clamp(32px,3.6vw,44px)] font-light leading-[1.05] tracking-[-0.025em] text-[color:var(--ink)]">
              Comece grátis.<br />
              <span className="text-[color:var(--muted-2)]">Pague só quando publicar.</span>
            </h1>
            <p className="mt-3 text-[14.5px] leading-[1.55] text-[color:var(--muted)]">
              Sem cartão pra começar. Em 5 minutos seu site fica pronto.
            </p>

            <form onSubmit={cadastrar} className="mt-8 grid gap-3.5">
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2.5 rounded-[8px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] text-[13.5px] font-medium text-[color:var(--ink)] transition hover:bg-[color:var(--paper-2)]"
              >
                <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.1 4 9.3 8.5 6.3 14.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5C29.6 34.7 27 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.2 39.4 16 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.4-4.3 5.8l6.5 5.5C41.4 36.1 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z"
                  />
                </svg>
                Continuar com Google
              </button>
              <div className="flex items-center gap-2.5 py-1 text-[11px] text-[color:var(--muted-2)]">
                <span className="h-px flex-1 bg-[color:var(--hairline)]" />
                OU
                <span className="h-px flex-1 bg-[color:var(--hairline)]" />
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-[color:var(--ink-2)]">Seu nome</span>
                <input
                  type="text"
                  placeholder="Como você se chama"
                  className="h-[38px] w-full rounded-[8px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-3 text-[13.5px] text-[color:var(--ink)] outline-none transition focus:border-[color:var(--ink)]"
                  value={nome}
                  autoComplete="name"
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-[color:var(--ink-2)]">E-mail</span>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="h-[38px] w-full rounded-[8px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-3 text-[13.5px] text-[color:var(--ink)] outline-none transition focus:border-[color:var(--ink)]"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-[color:var(--ink-2)]">
                  Senha · mínimo 6 caracteres
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="h-[38px] w-full rounded-[8px] border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-3 text-[13.5px] text-[color:var(--ink)] outline-none transition focus:border-[color:var(--ink)]"
                  value={senha}
                  autoComplete="new-password"
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={6}
                />
              </label>

              <label className="flex items-start gap-2.5 mt-1">
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-[color:var(--ink)]"
                  required
                />
                <span className="text-[12px] leading-[1.55] text-[color:var(--muted)]">
                  Li e aceito os{" "}
                  <Link href="/termos" target="_blank" className="text-[color:var(--ink-2)] underline hover:text-[color:var(--ink)]">
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link href="/privacidade" target="_blank" className="text-[color:var(--ink-2)] underline hover:text-[color:var(--ink)]">
                    Política de Privacidade
                  </Link>
                  .
                </span>
              </label>

              {erro && (
                <p className="border-y border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] px-3 py-2.5 text-[12.5px] text-[color:var(--rose,#A85462)]">
                  {erro}
                </p>
              )}
              {sucesso && (
                <p className="border-y border-[color:var(--green,#5B7A4F)] bg-[rgba(91,122,79,0.06)] px-3 py-2.5 text-[12.5px] text-[color:var(--green,#5B7A4F)]">
                  {sucesso}
                </p>
              )}

              <button
                type="submit"
                disabled={carregando || !aceitouTermos}
                className="eventify-button eventify-button-primary mt-1 w-full justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {carregando ? (
                  <>
                    <Spinner className="h-4 w-4" /> Criando conta...
                  </>
                ) : (
                  <>Criar conta <span aria-hidden>→</span></>
                )}
              </button>

              <p className="mt-1 text-center text-[12.5px] text-[color:var(--muted)]">
                Já tem conta?{" "}
                <Link href="/login" className="font-medium text-[color:var(--ink)] hover:underline">
                  Entrar
                </Link>
              </p>
            </form>
          </div>
        </div>

        <p className="text-[11.5px] text-[color:var(--muted-2)]">
          <Link href="/termos" className="text-[color:var(--muted)] underline-offset-2 hover:underline">
            Termos
          </Link>{" "}
          ·{" "}
          <Link href="/privacidade" className="text-[color:var(--muted)] underline-offset-2 hover:underline">
            Privacidade
          </Link>{" "}
          ·{" "}
          <a href="mailto:contato@eventify.app" className="text-[color:var(--muted)] underline-offset-2 hover:underline">
            Suporte
          </a>
        </p>
      </div>

      {/* RIGHT: testimonial + mini composer */}
      <div
        className="relative hidden flex-col justify-between border-l border-[color:var(--hairline)] px-12 py-10 lg:flex"
        style={{
          background: "linear-gradient(160deg, var(--paper-2) 0%, var(--gold-soft) 100%)",
        }}
      >
        <div className="flex justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-3 py-1 text-[11.5px] text-[color:var(--ink-2)]">
            ★ 4,9 · 2.300+ eventos publicados
          </span>
        </div>

        <blockquote className="mt-auto">
          <p className="font-display text-[40px] font-light leading-[1.1] tracking-[-0.02em] text-[color:var(--ink)]">
            <span className="font-display text-[color:var(--gold)] italic">&ldquo;</span>
            A gente abriu o link no almoço de família e todo mundo achou que tinha sido feito por um estúdio. Levou 12 minutos.
            <span className="font-display text-[color:var(--gold)] italic">&rdquo;</span>
          </p>
          <footer className="mt-6 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--gold)] font-display text-[14px] italic text-white">
              M
            </span>
            <div>
              <p className="text-[13.5px] font-medium text-[color:var(--ink)]">Marina Coutinho</p>
              <p className="text-[12px] text-[color:var(--muted)]">Noiva · Marina &amp; Rafael, out/26</p>
            </div>
          </footer>
        </blockquote>

        {/* Mini composer mockup */}
        <div className="mt-9 rounded-[12px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-3.5 shadow-[0_10px_30px_-20px_rgba(11,11,18,0.15)]">
          <div className="flex items-center gap-2 text-[11px] text-[color:var(--muted)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--gold)]" />
            Gerando seção &ldquo;Convite&rdquo;…
          </div>
          <div className="mt-2.5 h-[6px] overflow-hidden rounded-full bg-[color:var(--paper-2)]">
            <div className="h-full w-[72%] bg-[color:var(--gold)] animate-pulse" />
          </div>
          <p className="mt-3.5 font-display text-[14px] italic leading-[1.55] text-[color:var(--ink-2)]">
            &ldquo;É com alegria que convidamos você a celebrar o início da nossa nova história…&rdquo;
          </p>
        </div>
      </div>
    </main>
  );
}
