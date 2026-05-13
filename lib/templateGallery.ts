/**
 * Template Gallery — biblioteca de 25 templates (5 tipos × 5 estilos).
 *
 * Cada template é um "ponto de partida" visual + tonal pra um tipo de evento.
 * A IA usa o template selecionado pra gerar copy, paleta e estrutura compatíveis.
 *
 * Quando o usuário escolhe um template no wizard, os campos de briefing
 * (estilo, clima, corPrincipal, descricao) são pré-preenchidos com os defaults
 * do template — mas continuam editáveis.
 *
 * O chrome do app é editorial premium (gold/ink). Cada template gera um site
 * com paleta PRÓPRIA que não precisa combinar com o chrome.
 */

export type EventKind = "Casamento" | "Aniversário" | "Evento Corporativo" | "Festa" | "Religioso";

export type TemplateTag =
  | "Editorial"
  | "Minimalista"
  | "Vibrante"
  | "Brutalist"
  | "Dark"
  | "Sereno"
  | "Boêmio"
  | "Lúdico"
  | "Vintage";

export type TemplatePlan = "basico" | "intermediario" | "premium";

export type Template = {
  id: string;
  nome: string;
  tipos: EventKind[];
  /** Cor principal do template. */
  accent: string;
  /** Cor de fundo. */
  base: string;
  /** Tom curto descritivo. */
  tom: string;
  /** Tags pra filtragem. */
  tags: TemplateTag[];
  /** Plano mínimo necessário. */
  planoMinimo: TemplatePlan;
  /** Defaults aplicados aos campos de briefing. */
  defaults: {
    estilo: string;
    clima: string;
    publico: string;
    corPrincipal: string;
    descricao: string;
  };
  /** Paleta visual completa (5 cores). */
  paleta: string[];
  /** Descrição curta exibida no card. */
  descricao: string;
};

// ============================================================================
// CASAMENTO (5)
// ============================================================================
const CASAMENTO: Template[] = [
  {
    id: "editorial-romantic",
    nome: "Editorial Romantic",
    tipos: ["Casamento"],
    accent: "#B7895C",
    base: "#F5EDE2",
    tom: "Serif clássico, fotografia, ouro velho",
    tags: ["Editorial", "Sereno"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Editorial · serif clássica",
      clima: "elegante, acolhedor, com toque editorial",
      publico: "família e amigos próximos",
      corPrincipal: "#B7895C",
      descricao: "Casamento elegante com tom editorial, paleta marfim e detalhes em ouro velho.",
    },
    paleta: ["#F5EDE2", "#E8D4C3", "#B7895C", "#2B1D17", "#C8A96A"],
    descricao: "Serif clássico, fotografia, ouro velho",
  },
  {
    id: "swiss-minimal",
    nome: "Swiss Minimal",
    tipos: ["Casamento"],
    accent: "#0A0A0A",
    base: "#FFFFFF",
    tom: "Preto e branco, geométrico, silencioso",
    tags: ["Minimalista", "Editorial"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Suíço · geométrico minimalista",
      clima: "limpo, contido, silencioso",
      publico: "convidados próximos com gosto refinado",
      corPrincipal: "#0A0A0A",
      descricao: "Casamento minimalista em preto e branco, tipografia geométrica, fotos generosas.",
    },
    paleta: ["#FFFFFF", "#F5F5F5", "#A8A8A8", "#0A0A0A", "#1F1F1F"],
    descricao: "Preto e branco, geométrico, silencioso",
  },
  {
    id: "garden-botanico",
    nome: "Garden Botânico",
    tipos: ["Casamento"],
    accent: "#5B7A4F",
    base: "#F4F2E8",
    tom: "Sálvia e rosa pálido, folhagem",
    tags: ["Boêmio", "Sereno"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Boêmio botânico, ilustrações de folhagem",
      clima: "leve, ao ar livre, natural",
      publico: "amigos próximos e família",
      corPrincipal: "#5B7A4F",
      descricao: "Casamento de jardim com paleta sálvia e rosa pálido, ilustrações botânicas.",
    },
    paleta: ["#F4F2E8", "#D8CFAE", "#5B7A4F", "#3D5036", "#E8C7CE"],
    descricao: "Sálvia e rosa pálido, folhagem",
  },
  {
    id: "beach-sand",
    nome: "Beach & Sand",
    tipos: ["Casamento"],
    accent: "#7AB5E0",
    base: "#F2F8FF",
    tom: "Areia, oceano, leveza",
    tags: ["Boêmio", "Sereno"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Praiano leve, tons frios e areia",
      clima: "ensolarado, descontraído, oceânico",
      publico: "convidados próximos",
      corPrincipal: "#7AB5E0",
      descricao: "Casamento na praia com paleta azul oceano e areia, tipografia leve.",
    },
    paleta: ["#F2F8FF", "#C8D9E8", "#7AB5E0", "#0E6FD7", "#F4E2B9"],
    descricao: "Areia, oceano, leveza",
  },
  {
    id: "vintage-letterpress",
    nome: "Vintage Letterpress",
    tipos: ["Casamento"],
    accent: "#7C5E2C",
    base: "#F8F1E3",
    tom: "Sépia, ornamentos, romântico antigo",
    tags: ["Vintage", "Editorial"],
    planoMinimo: "intermediario",
    defaults: {
      estilo: "Vintage letterpress · sépia",
      clima: "nostálgico, romântico, atemporal",
      publico: "família tradicional, amigos íntimos",
      corPrincipal: "#7C5E2C",
      descricao: "Casamento vintage com ornamentos clássicos, tipografia letterpress e paleta sépia.",
    },
    paleta: ["#F8F1E3", "#E5CFA1", "#A89876", "#7C5E2C", "#3D2E15"],
    descricao: "Sépia, ornamentos, romântico antigo",
  },
];

// ============================================================================
// ANIVERSÁRIO (5)
// ============================================================================
const ANIVERSARIO: Template[] = [
  {
    id: "confetti-pop",
    nome: "Confetti Pop",
    tipos: ["Aniversário"],
    accent: "#E63946",
    base: "#FFFDF5",
    tom: "Cores primárias, lúdico, festivo",
    tags: ["Vibrante", "Lúdico"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Pop · cores primárias lúdicas",
      clima: "festivo, caloroso, energético",
      publico: "amigos, família e crianças",
      corPrincipal: "#E63946",
      descricao: "Aniversário pop com cores primárias, confetti, tipografia divertida.",
    },
    paleta: ["#FFFDF5", "#FFD93D", "#E63946", "#2563EB", "#1F1F1F"],
    descricao: "Cores primárias, lúdico, festivo",
  },
  {
    id: "neon-disco",
    nome: "Neon Disco",
    tipos: ["Aniversário"],
    accent: "#FF4FCB",
    base: "#0A0814",
    tom: "Muito escuro, brilho, balada",
    tags: ["Dark", "Vibrante"],
    planoMinimo: "intermediario",
    defaults: {
      estilo: "Disco neon · dark com brilho",
      clima: "noturno, energético, vibrante",
      publico: "amigos festeiros",
      corPrincipal: "#FF4FCB",
      descricao: "Aniversário disco com paleta dark e neon rosa/roxo, tipografia condensada.",
    },
    paleta: ["#0A0814", "#1F1438", "#7C3AED", "#FF4FCB", "#E5E5FF"],
    descricao: "Muito escuro, brilho, balada",
  },
  {
    id: "crayon-kids",
    nome: "Crayon Kids",
    tipos: ["Aniversário"],
    accent: "#F4A261",
    base: "#FFF8EE",
    tom: "Pastel, ilustração, infantil",
    tags: ["Lúdico", "Vibrante"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Crayon infantil · pastel com ilustrações",
      clima: "alegre, fofo, infantil",
      publico: "crianças, pais e padrinhos",
      corPrincipal: "#F4A261",
      descricao: "Aniversário infantil com paleta pastel, ilustrações em crayon e tipografia manuscrita.",
    },
    paleta: ["#FFF8EE", "#FFD479", "#F4A261", "#A8DADC", "#2A2A2A"],
    descricao: "Pastel, ilustração, infantil",
  },
  {
    id: "black-tie-soiree",
    nome: "Black Tie Soirée",
    tipos: ["Aniversário"],
    accent: "#C8A96A",
    base: "#0A0A0A",
    tom: "Preto, dourado, elegante",
    tags: ["Editorial", "Dark"],
    planoMinimo: "premium",
    defaults: {
      estilo: "Black tie · dark com dourado",
      clima: "sofisticado, formal, glamouroso",
      publico: "convidados em traje de gala",
      corPrincipal: "#C8A96A",
      descricao: "Aniversário formal black tie com paleta preto e dourado, tipografia serif elegante.",
    },
    paleta: ["#0A0A0A", "#1A1A1A", "#5B4A28", "#C8A96A", "#F4E9C8"],
    descricao: "Preto, dourado, elegante",
  },
  {
    id: "polaroid-frame",
    nome: "Polaroid Frame",
    tipos: ["Aniversário"],
    accent: "#D6B894",
    base: "#FAF6EE",
    tom: "Off-white, fotos rotacionadas, nostálgico",
    tags: ["Vintage", "Lúdico"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Polaroid · fotos rotacionadas, nostálgico",
      clima: "nostálgico, divertido, memorável",
      publico: "amigos próximos e família",
      corPrincipal: "#D6B894",
      descricao: "Aniversário com tema polaroid, fotos rotacionadas, paleta off-white nostálgica.",
    },
    paleta: ["#FAF6EE", "#EAD6BD", "#D6B894", "#8C6F40", "#2B2218"],
    descricao: "Off-white, fotos rotacionadas, nostálgico",
  },
];

// ============================================================================
// CORPORATIVO (5)
// ============================================================================
const CORPORATIVO: Template[] = [
  {
    id: "brutalist-summit",
    nome: "Brutalist Summit",
    tipos: ["Evento Corporativo"],
    accent: "#C8E64B",
    base: "#F0F0EC",
    tom: "Mono pesado, lima fluorescente",
    tags: ["Brutalist", "Minimalista"],
    planoMinimo: "intermediario",
    defaults: {
      estilo: "Brutalist · mono pesado",
      clima: "técnico, contemporâneo, sério",
      publico: "profissionais de tecnologia e negócios",
      corPrincipal: "#0A0A0A",
      descricao: "Evento corporativo brutalist com tipografia mono pesada e detalhes em lima fluorescente.",
    },
    paleta: ["#F0F0EC", "#D8D8D0", "#0A0A0A", "#1F1F1F", "#C8E64B"],
    descricao: "Mono pesado, lima fluorescente",
  },
  {
    id: "conference-clean",
    nome: "Conference Clean",
    tipos: ["Evento Corporativo"],
    accent: "#1E63D5",
    base: "#FFFFFF",
    tom: "Branco, azul corporativo",
    tags: ["Minimalista"],
    planoMinimo: "intermediario",
    defaults: {
      estilo: "Conferência clean · azul corporativo",
      clima: "profissional, organizado, confiável",
      publico: "executivos e palestrantes",
      corPrincipal: "#1E63D5",
      descricao: "Conferência profissional com paleta branca e azul corporativo, tipografia sans clean.",
    },
    paleta: ["#FFFFFF", "#F0F4FA", "#7A9AD0", "#1E63D5", "#0A2456"],
    descricao: "Branco, azul corporativo",
  },
  {
    id: "tech-dark",
    nome: "Tech Dark",
    tipos: ["Evento Corporativo"],
    accent: "#7C76EE",
    base: "#0B0E1A",
    tom: "Mudo escuro, gradiente sutil, AI",
    tags: ["Dark", "Minimalista"],
    planoMinimo: "intermediario",
    defaults: {
      estilo: "Tech dark · gradiente sutil",
      clima: "futurista, técnico, AI",
      publico: "comunidade tech, devs, designers",
      corPrincipal: "#7C76EE",
      descricao: "Evento tech com paleta dark, gradiente sutil indigo, tipografia mono.",
    },
    paleta: ["#0B0E1A", "#161B2C", "#5046E5", "#7C76EE", "#EEEDFD"],
    descricao: "Mudo escuro, gradiente sutil, AI",
  },
  {
    id: "editorial-report",
    nome: "Editorial Report",
    tipos: ["Evento Corporativo"],
    accent: "#1A1F3A",
    base: "#F7F8FC",
    tom: "Serif + grid, navy, jornalístico",
    tags: ["Editorial", "Minimalista"],
    planoMinimo: "intermediario",
    defaults: {
      estilo: "Editorial report · serif jornalístico",
      clima: "intelectual, refinado, sério",
      publico: "executivos, imprensa, parceiros",
      corPrincipal: "#1A1F3A",
      descricao: "Evento corporativo com layout editorial jornalístico, serif e paleta navy.",
    },
    paleta: ["#F7F8FC", "#D5DAE6", "#5B6F8C", "#1A1F3A", "#C9A961"],
    descricao: "Serif + grid, navy, jornalístico",
  },
  {
    id: "minimal-mint",
    nome: "Minimal Mint",
    tipos: ["Evento Corporativo"],
    accent: "#4CB99A",
    base: "#FAFFFB",
    tom: "Sans clean, verde fresco",
    tags: ["Minimalista"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Minimal mint · sans clean",
      clima: "fresco, otimista, sustentável",
      publico: "comunidade ESG, startups",
      corPrincipal: "#4CB99A",
      descricao: "Evento corporativo com paleta verde menta, tipografia sans clean, vibe sustentável.",
    },
    paleta: ["#FAFFFB", "#D7F2E5", "#4CB99A", "#1F7A5C", "#0A2A20"],
    descricao: "Sans clean, verde fresco",
  },
];

// ============================================================================
// FESTA (5)
// ============================================================================
const FESTA: Template[] = [
  {
    id: "neon-night",
    nome: "Neon Night",
    tipos: ["Festa"],
    accent: "#7C3AED",
    base: "#0A0814",
    tom: "Dark, neon roxo, condensada",
    tags: ["Dark", "Vibrante"],
    planoMinimo: "intermediario",
    defaults: {
      estilo: "Neon night · condensada",
      clima: "noturno, energético, intenso",
      publico: "público jovem, festeiros",
      corPrincipal: "#7C3AED",
      descricao: "Festa noturna com paleta dark e neon roxo, tipografia condensada impactante.",
    },
    paleta: ["#0A0814", "#1F1438", "#7C3AED", "#FF4FCB", "#E5E5FF"],
    descricao: "Dark, neon roxo, condensada",
  },
  {
    id: "tropical-carnaval",
    nome: "Tropical Carnaval",
    tipos: ["Festa"],
    accent: "#FF6B35",
    base: "#FFF8F0",
    tom: "Cores vivas, palm leaves, energia",
    tags: ["Vibrante", "Boêmio"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Tropical · cores vivas e palm leaves",
      clima: "alegre, quente, festivo",
      publico: "amigos festeiros",
      corPrincipal: "#FF6B35",
      descricao: "Festa tropical com cores vivas, palm leaves, vibe carnaval.",
    },
    paleta: ["#FFF8F0", "#FFD479", "#FF6B35", "#2A9D8F", "#1F1F1F"],
    descricao: "Cores vivas, palm leaves, energia",
  },
  {
    id: "lounge-sunset",
    nome: "Lounge Sunset",
    tipos: ["Festa"],
    accent: "#D4A017",
    base: "#1A0F1F",
    tom: "Tons quentes, dourado, sofisticado",
    tags: ["Dark", "Editorial"],
    planoMinimo: "intermediario",
    defaults: {
      estilo: "Lounge sunset · dark com dourado",
      clima: "sofisticado, sensual, lounge",
      publico: "adultos, vibe rooftop",
      corPrincipal: "#D4A017",
      descricao: "Festa lounge com paleta dark sunset e dourado, vibe rooftop sofisticada.",
    },
    paleta: ["#1A0F1F", "#3D1F2F", "#A8401B", "#D4A017", "#F4E2B9"],
    descricao: "Tons quentes, dourado, sofisticado",
  },
  {
    id: "underground",
    nome: "Underground",
    tipos: ["Festa"],
    accent: "#00E5C8",
    base: "#0E0E10",
    tom: "Industrial, rosa neon, raver",
    tags: ["Dark", "Brutalist"],
    planoMinimo: "premium",
    defaults: {
      estilo: "Underground · industrial rave",
      clima: "transgressor, intenso, alternativo",
      publico: "público alternativo, rave",
      corPrincipal: "#FF4FCB",
      descricao: "Festa underground com paleta industrial dark, rosa neon e ciano elétrico.",
    },
    paleta: ["#0E0E10", "#1A1A20", "#FF4FCB", "#00E5C8", "#F5F5F5"],
    descricao: "Industrial, rosa neon, raver",
  },
  {
    id: "beach-day",
    nome: "Beach Day",
    tipos: ["Festa"],
    accent: "#0E6FD7",
    base: "#F2F8FF",
    tom: "Azul oceano, areia, ensolarado",
    tags: ["Vibrante", "Boêmio"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Beach day · ensolarado",
      clima: "leve, ensolarado, descontraído",
      publico: "amigos, day club",
      corPrincipal: "#0E6FD7",
      descricao: "Festa de praia com paleta azul oceano e areia, tipografia leve.",
    },
    paleta: ["#F2F8FF", "#C8D9E8", "#7AB5E0", "#0E6FD7", "#F4E2B9"],
    descricao: "Azul oceano, areia, ensolarado",
  },
];

// ============================================================================
// RELIGIOSO (5)
// ============================================================================
const RELIGIOSO: Template[] = [
  {
    id: "vesper",
    nome: "Vésper",
    tipos: ["Religioso"],
    accent: "#7C5E2C",
    base: "#F8F4ED",
    tom: "Cormorant, stone, sereno",
    tags: ["Sereno", "Editorial"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Sereno · cormorant",
      clima: "contemplativo, acolhedor, suave",
      publico: "comunidade religiosa, família",
      corPrincipal: "#7C5E2C",
      descricao: "Celebração religiosa sereno com tipografia cormorant e paleta stone.",
    },
    paleta: ["#F8F4ED", "#E5DCC9", "#A89876", "#7C5E2C", "#2B2218"],
    descricao: "Cormorant, stone, sereno",
  },
  {
    id: "catolico-classico",
    nome: "Católico Clássico",
    tipos: ["Religioso"],
    accent: "#3A4A6B",
    base: "#FAF8F2",
    tom: "Azul navy, dourado, tradicional",
    tags: ["Sereno", "Vintage"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Católico tradicional · navy e dourado",
      clima: "reverente, sereno, familiar",
      publico: "comunidade católica, padrinhos",
      corPrincipal: "#3A4A6B",
      descricao: "Celebração católica tradicional com paleta navy e dourado, ornamentos clássicos.",
    },
    paleta: ["#FAF8F2", "#E8DFC4", "#A89876", "#3A4A6B", "#1F2A45"],
    descricao: "Azul navy, dourado, tradicional",
  },
  {
    id: "evangelico-moderno",
    nome: "Evangélico Moderno",
    tipos: ["Religioso"],
    accent: "#5BA3D0",
    base: "#FFFFFF",
    tom: "Branco, azul claro, contemporâneo",
    tags: ["Minimalista", "Sereno"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Evangélico moderno · clean",
      clima: "alegre, acolhedor, contemporâneo",
      publico: "jovens da comunidade, famílias",
      corPrincipal: "#5BA3D0",
      descricao: "Celebração evangélica com paleta branca e azul claro, tipografia clean moderna.",
    },
    paleta: ["#FFFFFF", "#E8F2F9", "#5BA3D0", "#1F5A85", "#0A2A45"],
    descricao: "Branco, azul claro, contemporâneo",
  },
  {
    id: "capela-rustica",
    nome: "Capela Rústica",
    tipos: ["Religioso"],
    accent: "#A8642A",
    base: "#F5EFE0",
    tom: "Madeira, marfim, acolhedor",
    tags: ["Boêmio", "Vintage"],
    planoMinimo: "basico",
    defaults: {
      estilo: "Capela rústica · madeira e marfim",
      clima: "acolhedor, íntimo, tradicional",
      publico: "família e amigos próximos",
      corPrincipal: "#A8642A",
      descricao: "Celebração religiosa em capela rústica com paleta madeira e marfim.",
    },
    paleta: ["#F5EFE0", "#E0CFA5", "#A8642A", "#5C3A1A", "#2B1D0E"],
    descricao: "Madeira, marfim, acolhedor",
  },
  {
    id: "celestial",
    nome: "Celestial",
    tipos: ["Religioso"],
    accent: "#C9A961",
    base: "#FFFCF5",
    tom: "Branco e ouro, etéreo",
    tags: ["Editorial", "Sereno"],
    planoMinimo: "intermediario",
    defaults: {
      estilo: "Celestial · branco e ouro etéreo",
      clima: "luminoso, sagrado, etéreo",
      publico: "comunidade religiosa, padrinhos",
      corPrincipal: "#C9A961",
      descricao: "Celebração com paleta branca e dourada, luz etérea, tipografia delicada.",
    },
    paleta: ["#FFFCF5", "#F4E9C8", "#C9A961", "#8C7437", "#2B2218"],
    descricao: "Branco e ouro, etéreo",
  },
];

// ============================================================================
// EXPORTS
// ============================================================================
export const TEMPLATES: Template[] = [
  ...CASAMENTO,
  ...ANIVERSARIO,
  ...CORPORATIVO,
  ...FESTA,
  ...RELIGIOSO,
];

export const TEMPLATES_POR_TIPO: Record<EventKind, Template[]> = {
  Casamento: CASAMENTO,
  Aniversário: ANIVERSARIO,
  "Evento Corporativo": CORPORATIVO,
  Festa: FESTA,
  Religioso: RELIGIOSO,
};

export const EVENT_KINDS: EventKind[] = [
  "Casamento",
  "Aniversário",
  "Evento Corporativo",
  "Festa",
  "Religioso",
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function filtrarTemplates(filtro: { tipo?: EventKind; tag?: TemplateTag }) {
  return TEMPLATES.filter((t) => {
    if (filtro.tipo && !t.tipos.includes(filtro.tipo)) return false;
    if (filtro.tag && !t.tags.includes(filtro.tag)) return false;
    return true;
  });
}

export function templatesPorTipo(tipo: EventKind): Template[] {
  return TEMPLATES_POR_TIPO[tipo] || [];
}

/**
 * Recomenda um template baseado no briefing inicial.
 */
export function recomendarTemplate(briefing: {
  tipo?: string;
  clima?: string;
}): Template | undefined {
  if (!briefing.tipo) return TEMPLATES[0];
  const candidatos = TEMPLATES.filter((t) => t.tipos.some((tp) => tp === briefing.tipo));
  if (candidatos.length === 0) return TEMPLATES[0];
  const clima = briefing.clima?.toLowerCase() || "";
  if (clima.includes("elegante") || clima.includes("editorial")) {
    return candidatos.find((t) => t.tags.includes("Editorial")) ?? candidatos[0];
  }
  if (clima.includes("minimal")) {
    return candidatos.find((t) => t.tags.includes("Minimalista")) ?? candidatos[0];
  }
  if (clima.includes("vibrante") || clima.includes("festivo")) {
    return candidatos.find((t) => t.tags.includes("Vibrante")) ?? candidatos[0];
  }
  if (clima.includes("noturno") || clima.includes("dark")) {
    return candidatos.find((t) => t.tags.includes("Dark")) ?? candidatos[0];
  }
  return candidatos[0];
}
