export type EventTemplateId = "casamento" | "aniversario" | "corporativo" | "festa" | "religioso";

export type TemplateVariant = {
  palette: {
    primary: string;
    secondary: string;
    soft: string;
    text: string;
    gradient: string;
  };
  fontDisplay: string;
  fontBody: string;
  layoutTraits: string[];
  motionTraits: string[];
};

export type EventTemplate = {
  id: EventTemplateId;
  name: string;
  match: string[];
  icon: string;
  tone: string;
  palette: TemplateVariant["palette"];
  layout: "elegant" | "vibrant" | "minimal" | "celebration" | "serene";
  sections: string[];
  /** Variante visual ativada quando o plano é Premium. */
  premiumVariant: TemplateVariant;
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
    premiumVariant: {
      palette: {
        primary: "#1f2937",
        secondary: "#c8a96a",
        soft: "#f7f3ec",
        text: "#0a0a0a",
        gradient: "from-stone-50 via-amber-50 to-rose-50",
      },
      fontDisplay: "Cormorant Garamond",
      fontBody: "Inter",
      layoutTraits: [
        "Editorial magazine: hero com tipografia serif gigante (h1 até 8rem) e linhas de filete dourado",
        "Layout assimétrico: colunas em proporção áurea (60/40) alternando texto e imagem",
        "Drop caps na seção Sobre — primeira letra grande, serif, em cor accent",
        "Galeria com molduras douradas finas (border 1px var(--color-accent)), proporção 4/5",
        "Citações em itálico centralizadas com aspas ornamentais grandes",
        "Footer com monograma do casal (iniciais entrelaçadas em SVG)",
      ],
      motionTraits: [
        "Fade lento 1.2s cubic-bezier(0.16,1,0.3,1) com leve translate(0, 24px)",
        "Hover em galeria: scale(1.03) com transition 600ms ease-out",
        "Scroll parallax sutil no hero (background-position-y move 30%)",
      ],
    },
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
    premiumVariant: {
      palette: {
        primary: "#ec4899",
        secondary: "#facc15",
        soft: "#fef3c7",
        text: "#1a0b14",
        gradient: "from-pink-100 via-amber-100 to-cyan-100",
      },
      fontDisplay: "Bricolage Grotesque",
      fontBody: "Inter",
      layoutTraits: [
        "Hero com gradient mesh animado (3 blobs SVG em movimento contínuo)",
        "Idade do aniversariante em tipografia gigantesca (clamp 6rem, 18vw, 14rem) ocupando hero",
        "Cards de programação inclinados (-2deg / +2deg alternando), bordas grossas (3px var(--color-primary))",
        "Confetti SVG espalhado em background absoluto com opacity 0.15",
        "Botões pill com sombra dura colorida (4px 4px 0 var(--color-secondary))",
        "Galeria estilo polaroid: cards rotacionados levemente, fundo branco com sombra",
      ],
      motionTraits: [
        "Mesh background animado: 18s cubic-bezier infinite",
        "Hover em cards: rotate(0deg) + scale(1.03), 350ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "Confetti com float gentil 8-12s loop",
        "Pulse no CTA principal: scale(1) ↔ scale(1.04), 2.4s ease-in-out infinite",
      ],
    },
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
    premiumVariant: {
      palette: {
        primary: "#0a0a0a",
        secondary: "#a3e635",
        soft: "#f5f5f5",
        text: "#0a0a0a",
        gradient: "from-zinc-50 via-white to-lime-50",
      },
      fontDisplay: "Space Grotesk",
      fontBody: "Inter",
      layoutTraits: [
        "Hero brutalist: headline preto sobre branco, linha horizontal lima fina (4px) cortando o título",
        "Grid bold de benefícios: 3 colunas com bordas grossas pretas (2px), números em monospace gigante",
        "Agenda em formato terminal: monospace, dois pontos e setas, fundo preto + texto lima fluo",
        "Logos de patrocinadores em grayscale, hover vira lima",
        "Tabela de palestrantes com foto em formato quadrado (sem border-radius), nome em ALLCAPS bold",
        "Stats grandes (clamp 4rem, 12vw, 9rem) em monospace pra números — '2026', '500+', '12h'",
      ],
      motionTraits: [
        "Reveal por seção: clip-path inset 100% 0 0 0 → 0% 0 0 0, 0.8s ease",
        "Hover em cards: borda passa de preto pra lima em 200ms",
        "Cursor custom em CTAs (cursor-pointer + transição borda)",
        "Sem scale/rotate — só mudanças de cor e clip-path",
      ],
    },
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
    premiumVariant: {
      palette: {
        primary: "#22d3ee",
        secondary: "#f0abfc",
        soft: "#0a0414",
        text: "#f8fafc",
        gradient: "from-fuchsia-900 via-violet-900 to-cyan-900",
      },
      fontDisplay: "Bebas Neue",
      fontBody: "Inter",
      layoutTraits: [
        "Modo dark: background var(--color-soft) que é #0a0414, texto branco",
        "Hero fullscreen com line-up gigante em 4 colunas (DJs/atrações) — typography esmaga (clamp 4rem, 14vw, 12rem)",
        "Texto com efeito glitch sutil (text-shadow duplicado em cyan + magenta)",
        "Cards de line-up com glow neon (box-shadow 0 0 40px var(--color-primary))",
        "Contador de tempo em LED-style (segmentos 7-segment via CSS clip-path)",
        "Backdrop com partículas cyan flutuando (CSS animation)",
        "Botões com brilho diagonal animado infinito",
      ],
      motionTraits: [
        "Glow pulse nas attractions: box-shadow 0 0 20px → 0 0 60px, 2s ease-in-out infinite",
        "Hover em DJ card: scale(1.05) + brightness(1.2) 250ms",
        "Background partículas: float aleatório 20-40s com opacity oscilando",
        "Headline com text-glow shifting (cyan → magenta → cyan) 8s loop",
      ],
    },
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
    premiumVariant: {
      palette: {
        primary: "#7c5e2c",
        secondary: "#a3a3a3",
        soft: "#fbf6ec",
        text: "#1c1917",
        gradient: "from-stone-50 via-amber-50 to-stone-100",
      },
      fontDisplay: "Cormorant Garamond",
      fontBody: "Inter",
      layoutTraits: [
        "Estética catedral: layout vertical contemplativo, max-width 720px centralizado",
        "Versículo em itálico serif gigante (clamp 2rem, 5vw, 4rem) com letterspacing aberto",
        "Liturgia em formato de oração: alinhamento esquerda, indentação alternada",
        "Filetes dourados finos separando seções (height 1px, color secondary)",
        "Iconografia simbólica: cruz/pomba/coroa em SVG inline minimalista",
        "Foto do celebrante em circle frame com border dourada 2px",
        "Espaçamento amplo (var(--section-y) +30% — clamp 96px, 12vw, 160px)",
      ],
      motionTraits: [
        "Fade muito lento 1.5s ease-out, sem translate (sereno)",
        "Hover quase imperceptível em links: cor passa pra primary 400ms",
        "Sem scale, sem rotate, sem pulse — repouso visual completo",
      ],
    },
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

/** Retorna paleta + fontes da variante apropriada (premium ou padrão). */
export function getActiveTemplateVariant(
  template: EventTemplate,
  isPremium: boolean
): TemplateVariant {
  if (!isPremium) {
    return {
      palette: template.palette,
      fontDisplay: "Inter",
      fontBody: "Inter",
      layoutTraits: [],
      motionTraits: [],
    };
  }
  return template.premiumVariant;
}
