export type EventTemplateId = "casamento" | "aniversario" | "corporativo" | "festa" | "religioso";

export type EventTemplate = {
  id: EventTemplateId;
  name: string;
  match: string[];
  icon: string;
  tone: string;
  palette: {
    primary: string;
    secondary: string;
    soft: string;
    text: string;
    gradient: string;
  };
  layout: "elegant" | "vibrant" | "minimal" | "celebration" | "serene";
  sections: string[];
};

export const EVENT_TEMPLATES: Record<EventTemplateId, EventTemplate> = {
  casamento: {
    id: "casamento",
    name: "Casamento",
    match: ["casamento", "wedding", "noivado"],
    icon: "♡",
    tone: "elegante, romântico e acolhedor",
    palette: {
      primary: "#b76e79",
      secondary: "#d6a85d",
      soft: "#fff3f6",
      text: "#24151a",
      gradient: "from-rose-50 via-white to-amber-50",
    },
    layout: "elegant",
    sections: ["Convite", "Data e local", "História", "Confirmação", "Mapa"],
  },
  aniversario: {
    id: "aniversario",
    name: "Aniversário",
    match: ["aniversário", "aniversario", "birthday"],
    icon: "♕",
    tone: "vibrante, divertido e memorável",
    palette: {
      primary: "#f59e0b",
      secondary: "#ef4444",
      soft: "#fff7dc",
      text: "#24180a",
      gradient: "from-amber-50 via-white to-orange-50",
    },
    layout: "vibrant",
    sections: ["Chamada", "Programação", "Confirmação", "Localização"],
  },
  corporativo: {
    id: "corporativo",
    name: "Corporativo",
    match: ["corporativo", "empresa", "workshop", "palestra", "congresso"],
    icon: "▣",
    tone: "profissional, objetivo e premium",
    palette: {
      primary: "#2563eb",
      secondary: "#475569",
      soft: "#eff6ff",
      text: "#0f172a",
      gradient: "from-blue-50 via-white to-slate-50",
    },
    layout: "minimal",
    sections: ["Hero", "Benefícios", "Agenda", "Inscrição", "Mapa"],
  },
  festa: {
    id: "festa",
    name: "Festa",
    match: ["festa", "balada", "show", "festival"],
    icon: "✦",
    tone: "energético, social e impactante",
    palette: {
      primary: "#8847e7",
      secondary: "#ec4899",
      soft: "#f4e8ff",
      text: "#13071f",
      gradient: "from-violet-50 via-white to-fuchsia-50",
    },
    layout: "celebration",
    sections: ["Chamada", "Atrações", "Confirmação", "Mapa"],
  },
  religioso: {
    id: "religioso",
    name: "Religioso",
    match: ["religioso", "culto", "missa", "celebração", "celebracao"],
    icon: "✓",
    tone: "sereno, respeitoso e inspirador",
    palette: {
      primary: "#059669",
      secondary: "#84cc16",
      soft: "#ecfdf5",
      text: "#052e1d",
      gradient: "from-emerald-50 via-white to-lime-50",
    },
    layout: "serene",
    sections: ["Convite", "Mensagem", "Data e local", "Confirmação"],
  },
};

export function selectEventTemplate(tipo?: string): EventTemplate {
  const normalized = (tipo || "").toLowerCase();
  return (
    Object.values(EVENT_TEMPLATES).find((template) =>
      template.match.some((term) => normalized.includes(term))
    ) || EVENT_TEMPLATES.festa
  );
}
