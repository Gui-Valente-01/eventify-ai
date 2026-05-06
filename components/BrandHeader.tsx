"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type Action = {
  href: string;
  label: string;
  variant?: "primary" | "ghost";
};

type BrandHeaderProps = {
  actions?: Action[];
};

export default function BrandHeader({ actions = [] }: BrandHeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, isConfigured, signOut } = useAuth();

  let acoesFinais: Action[] = actions;
  if (acoesFinais.length === 0) {
    if (isConfigured && isAuthenticated) {
      acoesFinais = [
        { href: "/exemplos", label: "Exemplos", variant: "ghost" },
        { href: "/painel", label: "Painel", variant: "ghost" },
        { href: "/perfil", label: "Meu perfil", variant: "ghost" },
      ];
    } else if (isConfigured) {
      acoesFinais = [
        { href: "/exemplos", label: "Exemplos", variant: "ghost" },
        { href: "/precos", label: "Planos", variant: "ghost" },
        { href: "/login", label: "Entrar", variant: "ghost" },
        { href: "/cadastro", label: "Criar conta", variant: "primary" },
      ];
    } else {
      acoesFinais = [
        { href: "/exemplos", label: "Exemplos", variant: "ghost" },
        { href: "/precos", label: "Planos", variant: "ghost" },
        { href: "/painel", label: "Painel", variant: "ghost" },
        { href: "/novo-evento", label: "Criar agora", variant: "primary" },
      ];
    }
  }

  async function handleSair() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-12">
        <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight" aria-label="Eventify AI">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-sm text-white">
            ✦
          </span>
          <span>Eventify</span>
          <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-violet-700">
            AI
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Navegação principal">
          {acoesFinais.map((action) => (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              className={
                action.variant === "primary"
                  ? "inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-sm font-bold text-white transition-transform hover:scale-[1.02] hover:bg-black/90"
                  : "hidden h-10 items-center justify-center rounded-full px-3 text-sm font-semibold text-black/70 transition-colors hover:text-black sm:inline-flex"
              }
            >
              {action.label}
            </Link>
          ))}
          {isConfigured && isAuthenticated && (
            <button
              type="button"
              onClick={handleSair}
              className="hidden h-10 items-center justify-center rounded-full px-3 text-sm font-semibold text-black/50 transition-colors hover:text-black sm:inline-flex"
            >
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
