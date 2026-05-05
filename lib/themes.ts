export const THEMES = {
  Casamento: {
    accent: "rose",
    accentLight: "rose-50",
    accentBorder: "rose-200",
    accentDark: "rose-700",
    accentGradient: "from-rose-100 to-pink-50",
    buttonClass: "bg-rose-700 hover:bg-rose-800",
    badgeClass: "bg-rose-100 text-rose-700",
    label: "💍 Casamento",
  },
  "Aniversário": {
    accent: "amber",
    accentLight: "amber-50",
    accentBorder: "amber-200",
    accentDark: "amber-700",
    accentGradient: "from-amber-100 to-yellow-50",
    buttonClass: "bg-amber-700 hover:bg-amber-800",
    badgeClass: "bg-amber-100 text-amber-700",
    label: "🎂 Aniversário",
  },
  "Evento Corporativo": {
    accent: "blue",
    accentLight: "blue-50",
    accentBorder: "blue-200",
    accentDark: "blue-700",
    accentGradient: "from-blue-100 to-slate-50",
    buttonClass: "bg-blue-700 hover:bg-blue-800",
    badgeClass: "bg-blue-100 text-blue-700",
    label: "💼 Corporativo",
  },
  Festa: {
    accent: "purple",
    accentLight: "purple-50",
    accentBorder: "purple-200",
    accentDark: "purple-700",
    accentGradient: "from-purple-100 to-violet-50",
    buttonClass: "bg-purple-700 hover:bg-purple-800",
    badgeClass: "bg-purple-100 text-purple-700",
    label: "🎉 Festa",
  },
  Religioso: {
    accent: "emerald",
    accentLight: "emerald-50",
    accentBorder: "emerald-200",
    accentDark: "emerald-700",
    accentGradient: "from-emerald-100 to-lime-50",
    buttonClass: "bg-emerald-700 hover:bg-emerald-800",
    badgeClass: "bg-emerald-100 text-emerald-700",
    label: "✨ Religioso",
  },
};

export const DEFAULT_THEME = THEMES.Casamento;

export function getTheme(tipo: string) {
  return THEMES[tipo as keyof typeof THEMES] || DEFAULT_THEME;
}
