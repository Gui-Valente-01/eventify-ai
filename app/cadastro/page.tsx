"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import Spinner from "@/components/Spinner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function CadastroPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function cadastrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!isSupabaseConfigured) {
      setErro("Supabase não configurado. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha precisa ter ao menos 6 caracteres.");
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
    <main className="eventify-page gradient-mesh">
      <BrandHeader actions={[{ href: "/login", label: "Entrar", variant: "ghost" }]} />
      <section className="eventify-section flex justify-center">
        <div className="eventify-card glass w-full max-w-md p-10 ring-glow animate-fade-up">
          <span className="eventify-kicker">✦ Criar conta</span>
          <h1 className="eventify-title mt-5 text-4xl">Comece grátis</h1>
          <p className="eventify-muted mt-3">Sem cartão. Pague só ao publicar.</p>

          <form onSubmit={cadastrar} className="mt-8 grid gap-4">
            <input
              type="text"
              placeholder="Seu nome"
              className="eventify-input"
              value={nome}
              autoComplete="name"
              onChange={(e) => setNome(e.target.value)}
              required
            />
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
              placeholder="Senha (mín. 6 caracteres)"
              className="eventify-input"
              value={senha}
              autoComplete="new-password"
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
            />

            {erro && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-600">
                {erro}
              </p>
            )}
            {sucesso && (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                {sucesso}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="eventify-button eventify-button-primary min-h-12 justify-center disabled:opacity-70"
            >
              {carregando ? <><Spinner className="h-4 w-4" /> Criando conta...</> : <>Criar conta →</>}
            </button>
          </form>

          <p className="eventify-muted mt-6 text-center text-sm">
            Já tem conta?{" "}
            <Link href="/login" className="font-bold text-[#8847e7]">
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
