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
  const { user: _user, isAuthenticated, isConfigured, signOut } = useAuth();

  let acoesFinais: Action[] = actions;
  if (acoesFinais.length === 0) {
    if (isConfigured && isAuthenticated) {
      acoesFinais = [
        { href: "/templates", label: "Templates", variant: "ghost" },
        { href: "/painel", label: "Painel", variant: "ghost" },
        { href: "/perfil", label: "Meu perfil", variant: "ghost" },
      ];
    } else if (isConfigured) {
      acoesFinais = [
        { href: "/templates", label: "Templates", variant: "ghost" },
        { href: "/precos", label: "Preços", variant: "ghost" },
        { href: "/login", label: "Entrar", variant: "ghost" },
        { href: "/cadastro", label: "Criar conta", variant: "primary" },
      ];
    } else {
      acoesFinais = [
        { href: "/templates", label: "Templates", variant: "ghost" },
        { href: "/precos", label: "Preços", variant: "ghost" },
        { href: "/painel", label: "Painel", variant: "ghost" },
        { href: "/novo-evento", label: "Criar evento", variant: "primary" },
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
      <Link href="/" className="eventify-brand" aria-label="Eventify">
        <span className="eventify-mark" aria-hidden />
        <span>Eventify</span>
      </Link>

      <nav className="eventify-nav" aria-label="Navegação principal">
        {acoesFinais.map((action) => (
          <Link
            key={`${action.href}-${action.label}`}
            href={action.href}
            className={
              action.variant === "primary"
                ? "eventify-button eventify-button-primary"
                : "hidden sm:inline-flex h-10 items-center rounded-full px-3 text-sm font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--ink)]"
            }
          >
            {action.label}
            {action.variant === "primary" && <span aria-hidden>→</span>}
          </Link>
        ))}
        {isConfigured && isAuthenticated && (
          <button
            type="button"
            onClick={handleSair}
            className="hidden sm:inline-flex h-10 items-center rounded-full px-3 text-sm font-medium text-[color:var(--muted-2)] transition-colors hover:text-[color:var(--ink)]"
          >
            Sair
          </button>
        )}
      </nav>
    </header>
  );
}
