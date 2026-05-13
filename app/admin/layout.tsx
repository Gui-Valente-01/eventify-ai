import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireAdmin();

  return (
    <div className="min-h-screen bg-[color:var(--ink)] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[color:var(--ink)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-white/30">
                <span className="block h-1.5 w-1.5 rounded-[1px] bg-white" />
              </span>
              <span className="font-display text-[20px] tracking-[-0.005em]">
                Eventify <em className="italic text-[color:var(--gold)]">Admin</em>
              </span>
            </Link>
            <nav className="hidden gap-1 text-[12.5px] sm:flex">
              <NavLink href="/admin">Dashboard</NavLink>
              <NavLink href="/admin/financeiro">Financeiro</NavLink>
              <NavLink href="/admin/usuarios">Usuários</NavLink>
              <NavLink href="/admin/eventos">Eventos</NavLink>
              <NavLink href="/admin/uso">Uso da IA</NavLink>
              <NavLink href="/admin/errors">Erros</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono-tight text-[11px] text-white/55 sm:inline">{ctx.email}</span>
            <Link
              href="/painel"
              className="rounded-full border border-white/15 px-3.5 py-1.5 text-[11.5px] text-white/85 transition hover:bg-white/5"
            >
              ← Sair do admin
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1280px] px-8 py-12">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3.5 py-1.5 text-white/65 transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
  );
}
