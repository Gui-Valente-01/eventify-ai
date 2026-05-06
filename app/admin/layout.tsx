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
    <div className="min-h-screen bg-[#0a0814] text-white">
      <header className="border-b border-white/10 bg-[#0a0814]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-black tracking-tight">
              <span className="text-purple-400">Eventify</span> Admin
            </Link>
            <nav className="hidden gap-1 text-sm font-semibold sm:flex">
              <NavLink href="/admin">Dashboard</NavLink>
              <NavLink href="/admin/financeiro">Financeiro</NavLink>
              <NavLink href="/admin/usuarios">Usuários</NavLink>
              <NavLink href="/admin/eventos">Eventos</NavLink>
              <NavLink href="/admin/uso">Uso da IA</NavLink>
              <NavLink href="/admin/errors">Erros</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-white/60 sm:inline">{ctx.email}</span>
            <Link
              href="/painel"
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/5"
            >
              Sair do admin
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-white/70 hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
  );
}
