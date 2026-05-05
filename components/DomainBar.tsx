import Link from "next/link";

type DomainBarProps = {
  domain: string;
  theme?: "light" | "dark";
};

export default function DomainBar({ domain, theme = "light" }: DomainBarProps) {
  const isDark = theme === "dark";
  return (
    <div
      className={`relative z-40 ${
        isDark
          ? "bg-gradient-to-r from-[#0a0414] via-[#1a0930] to-[#0a0414] text-white"
          : "bg-gradient-to-r from-slate-50 via-white to-slate-50 text-slate-900 border-b border-slate-200"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-rose-400" />
          <span className="inline-block h-3 w-3 rounded-full bg-amber-400" />
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-400" />
        </div>

        <div
          className={`flex flex-1 items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${
            isDark ? "bg-white/10 text-white/90" : "bg-slate-100 text-slate-700"
          }`}
        >
          <span className="text-emerald-500">🔒</span>
          <span className="font-mono">{domain}</span>
        </div>

        <Link
          href="/cadastro"
          className={`hidden items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black transition sm:inline-flex ${
            isDark
              ? "bg-white text-[#0a0414] hover:scale-105"
              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105"
          }`}
        >
          ✨ Criar igual a esse
        </Link>
      </div>
    </div>
  );
}
