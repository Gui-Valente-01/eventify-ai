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
    <header className="eventify-header">
      <Link href="/" className="eventify-brand" aria-label="Eventify AI">
        <span className="eventify-logo">✦</span>
        <span>Eventify AI</span>
      </Link>

      <nav className="eventify-nav" aria-label="Navegação principal">
        {acoesFinais.map((action) => (
          <Link
            key={`${action.href}-${action.label}`}
            href={action.href}
            className={
              action.variant === "primary"
                ? "eventify-button eventify-button-primary"
                : "eventify-button eventify-button-ghost"
            }
          >
            {action.label}
          </Link>
        ))}
        {isConfigured && isAuthenticated && (
          <>
            <span className="hidden text-sm font-bold text-[#5f5a72] sm:inline">
              {user?.user_metadata?.full_name || user?.email}
            </span>
            <button
              type="button"
              onClick={handleSair}
              className="eventify-button eventify-button-ghost"
            >
              Sair
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
