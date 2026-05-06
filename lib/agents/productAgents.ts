import { selectEventTemplate } from "@/lib/templates";
import { getPlanGenerationStrategy, getSelectedPlanFromEvento } from "@/lib/planStrategy";
import { buildPalette } from "./colorUtils";
import type { DesignSpec } from "./types";
import type {
  AgentEvento,
  BuilderOutput,
  CopyOutput,
  DesignOutput,
  GuestOutput,
  ImageOutput,
  InterpretationOutput,
  LocationOutput,
  QualityOutput,
} from "./types";

function clean(value?: string) {
  return (value || "").trim();
}

function titleCaseFallback(value: string) {
  return value || "Evento especial";
}

function formatDate(data?: string) {
  if (!data) return "data a confirmar";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(`${data}T00:00:00`));
  } catch {
    return data;
  }
}

export function interpretationAgent(evento: AgentEvento): InterpretationOutput {
  const briefing = evento.briefing || {};
  const details = Object.entries(briefing.detalhes || {})
    .filter(([, value]) => clean(value).length > 0)
    .map(([key, value]) => `${key}: ${clean(value)}`);

  const specificity =
    details.length >= 4 || clean(briefing.descricao).length > 240
      ? "high"
      : details.length >= 2 || clean(briefing.descricao).length > 80
        ? "medium"
        : "low";

  const risks: string[] = [];
  if (specificity === "low") risks.push("Briefing curto; risco de resultado generico.");
  if (!evento.data) risks.push("Data ausente.");
  if (!evento.endereco?.cidade) risks.push("Cidade ausente.");

  return {
    mood: clean(briefing.clima) || selectEventTemplate(evento.tipo).tone,
    styleDirection: clean(briefing.estilo) || selectEventTemplate(evento.tipo).layout,
    audience: clean(briefing.publico) || "convidados do evento",
    specificity,
    mustUseDetails: details,
    risks,
  };
}

export function designerAgent(
  evento: AgentEvento,
  interpretation: InterpretationOutput
): DesignOutput {
  const template = selectEventTemplate(evento.tipo);
  const strategy = getPlanGenerationStrategy(getSelectedPlanFromEvento(evento));
  const color = clean(evento.briefing?.corPrincipal);

  const fontByLayout: Record<string, string> = {
    elegant: "Playfair Display",
    vibrant: "Poppins",
    minimal: "Space Grotesk",
    celebration: "Bebas Neue",
    serene: "Cormorant Garamond",
  };

  const compositionByLayout: Record<string, string[]> = {
    elegant: ["hero editorial", "imagem com moldura", "cards leves", "ritmo romantico"],
    vibrant: ["hero central", "cards com sombra marcada", "cores quentes", "microinteracoes"],
    minimal: ["grid objetivo", "cards retos", "contraste sobrio", "hierarquia corporativa"],
    celebration: ["fundo escuro", "gradientes neon", "cta forte", "layout energetico"],
    serene: ["espaco amplo", "tons naturais", "tipografia classica", "ritmo contemplativo"],
  };

  const planDifferentiators: Record<typeof strategy.intensidade, string[]> = {
    essencial: ["menos secoes", "composicao limpa", "hierarquia rapida", "menos ornamentos"],
    completa: ["cards informativos", "ritmo equilibrado", "blocos de apoio", "cta mais visivel"],
    premium: ["hero editorial", "composicao em camadas", "detalhes de acabamento", "narrativa visual forte"],
  };

  const planFonts: Record<typeof strategy.intensidade, string> = {
    essencial: "Manrope",
    completa: fontByLayout[template.layout] || "Inter",
    premium: fontByLayout[template.layout] || "Inter",
  };

  const palette = buildPalette(color);
  const display = planFonts[strategy.intensidade];

  const motionByLayout: Record<string, string[]> = {
    elegant: [
      "Fade-up suave 0.7s cubic-bezier(0.16,1,0.3,1) on scroll (IntersectionObserver, threshold 0.15)",
      "Hover em cards: translateY(-3px) + sombra mais forte 280ms",
      "Imagem do hero: ken burns lento (transform scale 1 → 1.04) 18s loop",
    ],
    vibrant: [
      "Fade-up + slight rotate 0.5s on scroll",
      "Hover em cards: scale(1.02) + sombra colorida da paleta",
      "Botão primary: brilho diagonal animado a cada hover",
    ],
    minimal: [
      "Fade simples 0.4s on scroll, sem translate",
      "Hover: borda muda pra primary, transição 200ms",
      "Sem animações decorativas — pureza visual",
    ],
    celebration: [
      "Fade-up enérgico 0.5s ease-out on scroll",
      "Pulse no CTA principal (scale 1 ↔ 1.05) 2s infinite",
      "Hero com gradiente animado (background-position 0% → 100%) 12s",
    ],
    serene: [
      "Fade-up 0.9s ease-out, threshold 0.1",
      "Sem hover scale — só mudança de cor sutil",
      "Imagens com border-radius 24px e sombra delicada",
    ],
  };

  const spec: DesignSpec = {
    palette,
    fontDisplay: `'${display}', serif`,
    fontBody: "'Inter', system-ui, sans-serif",
    scale: {
      h1: "clamp(2.5rem, 6vw, 5rem)",
      h2: "clamp(1.8rem, 4vw, 3rem)",
      h3: "1.5rem",
      body: "1.0625rem",
    },
    radius: { card: "20px", button: "999px" },
    spacing: {
      sectionY: "clamp(64px, 9vw, 120px)",
      cardPad: "clamp(24px, 3vw, 40px)",
      gap: "clamp(16px, 2vw, 32px)",
    },
    motionRules: motionByLayout[template.layout] || motionByLayout.celebration,
  };

  return {
    template,
    layoutIntent: `${template.layout} para ${interpretation.mood}, com entrega ${strategy.intensidade}`,
    typography: {
      display,
      body: "Inter",
    },
    visualRules: [
      `Use ${template.name} como referência (vibe ${template.layout}).`,
      `Cor primária: ${palette.primary}. NÃO use outra cor primária.`,
      `Plano: ${strategy.nome} (${strategy.intensidade}).`,
      "Contraste WCAG AA mínimo. Texto sobre primary precisa ser branco.",
      "Mobile-first com media queries pra >=768px e >=1024px.",
      ...strategy.design,
    ],
    differentiators: [
      ...(compositionByLayout[template.layout] || compositionByLayout.celebration),
      ...planDifferentiators[strategy.intensidade],
    ],
    spec,
  };
}

export function copywriterAgent(
  evento: AgentEvento,
  interpretation: InterpretationOutput,
  design: DesignOutput
): CopyOutput {
  const nome = titleCaseFallback(evento.nome);
  const cidade = evento.endereco?.cidade || "sua cidade";
  const data = formatDate(evento.data);
  const detail = interpretation.mustUseDetails[0];
  const strategy = getPlanGenerationStrategy(getSelectedPlanFromEvento(evento));

  const byTemplate: Record<string, CopyOutput> = {
    casamento: {
      heroTitle: `${nome}: um convite para viver o amor com presenca`,
      subtitle: `Uma celebracao elegante em ${cidade}, no dia ${data}.`,
      description: detail
        ? `O site foi pensado a partir do detalhe central: ${detail}. A narrativa valoriza o casal, guia os convidados e cria expectativa para a cerimonia.`
        : "Uma pagina romantica, clara e acolhedora para reunir convidados, apresentar os detalhes e facilitar a confirmacao de presenca.",
      invitationMessage: "Sua presenca completa essa historia. Confirme e venha celebrar com carinho.",
      highlights: ["Cerimonia bem apresentada", "RSVP simples para convidados", "Visual romantico e premium"],
      ctaLabel: "Confirmar presenca",
      seoTitle: `${nome} | Convite de casamento`,
      seoDescription: `Convite digital de casamento em ${cidade}, com RSVP, mapa e informacoes completas.`,
    },
    aniversario: {
      heroTitle: `${nome}: a festa ja comeca no convite`,
      subtitle: `Uma celebracao vibrante em ${cidade}, no dia ${data}.`,
      description: detail
        ? `A comunicacao destaca ${detail} e transforma o convite em uma chamada animada para os convidados.`
        : "Uma pagina colorida para comunicar tema, data, local e confirmar quem vai participar da comemoracao.",
      invitationMessage: "Confirme seu nome, chame sua energia e venha fazer parte da festa.",
      highlights: ["Clima divertido", "Convite facil de compartilhar", "Confirmacao rapida"],
      ctaLabel: "Quero participar",
      seoTitle: `${nome} | Convite de aniversario`,
      seoDescription: `Site de aniversario em ${cidade}, com convite, mapa e confirmacao de presenca.`,
    },
    corporativo: {
      heroTitle: `${nome}: encontro profissional com objetivo claro`,
      subtitle: `Conteudo, networking e organizacao em ${cidade}, no dia ${data}.`,
      description: detail
        ? `A pagina posiciona o evento ao redor de ${detail}, com linguagem direta e estrutura preparada para conversao.`
        : "Uma landing page objetiva para comunicar valor, publico, agenda e detalhes operacionais do evento.",
      invitationMessage: "Garanta sua participacao e acompanhe as informacoes essenciais do encontro.",
      highlights: ["Proposta de valor clara", "Agenda organizada", "Design institucional"],
      ctaLabel: "Confirmar participacao",
      seoTitle: `${nome} | Evento corporativo`,
      seoDescription: `Site profissional para evento corporativo em ${cidade}, com detalhes, mapa e inscricao.`,
    },
    festa: {
      heroTitle: `${nome}: uma noite feita para ser lembrada`,
      subtitle: `Energia, musica e encontro em ${cidade}, no dia ${data}.`,
      description: detail
        ? `A identidade da pagina usa ${detail} como ponto de partida para criar um convite forte, visual e compartilhavel.`
        : "Uma pagina de impacto para divulgar a festa, apresentar a vibe e facilitar a confirmacao dos convidados.",
      invitationMessage: "Confirme presenca e entre no clima antes mesmo de chegar.",
      highlights: ["Visual impactante", "Compartilhamento por QR Code", "RSVP sem friccao"],
      ctaLabel: "Eu vou",
      seoTitle: `${nome} | Site de festa`,
      seoDescription: `Site promocional de festa em ${cidade}, com convite, QR Code e RSVP.`,
    },
    religioso: {
      heroTitle: `${nome}: um encontro de fe, presenca e comunhao`,
      subtitle: `Uma celebracao serena em ${cidade}, no dia ${data}.`,
      description: detail
        ? `A mensagem central parte de ${detail}, criando uma pagina respeitosa, clara e acolhedora.`
        : "Um convite sereno para reunir comunidade, familia e amigos em uma celebracao significativa.",
      invitationMessage: "Confirme sua presenca e participe desse momento com tranquilidade.",
      highlights: ["Mensagem acolhedora", "Informacoes claras", "Experiencia respeitosa"],
      ctaLabel: "Confirmar presenca",
      seoTitle: `${nome} | Celebracao religiosa`,
      seoDescription: `Convite digital para celebracao religiosa em ${cidade}, com local, mapa e confirmacao.`,
    },
  };

  const base = byTemplate[design.template.id] || byTemplate.festa;

  if (strategy.intensidade === "essencial") {
    return {
      ...base,
      subtitle: base.subtitle,
      description: base.description.slice(0, 180),
      invitationMessage: base.invitationMessage,
      highlights: base.highlights.slice(0, 3),
    };
  }

  if (strategy.intensidade === "premium") {
    return {
      ...base,
      subtitle: `${base.subtitle} Experiencia premium desenhada para causar impressao imediata.`,
      description: `${base.description} A proposta visual e textual precisa parecer exclusiva, autoral e inteiramente alinhada ao briefing do cliente.`,
      invitationMessage: `${base.invitationMessage} Cada detalhe do site deve reforcar presenca, expectativa e alto valor percebido.`,
      highlights: [
        base.highlights[0] || "Visual premium",
        base.highlights[1] || "Narrativa autoral",
        "Acabamento sofisticado",
      ],
    };
  }

  return base;
}

export function locationAgent(evento: AgentEvento): LocationOutput {
  const e = evento.endereco || {};
  const parts = [e.rua, e.numero, e.cidade, e.estado, e.cep].filter(Boolean);
  const address = parts.join(", ");
  const issues: string[] = [];

  if (!e.rua) issues.push("Rua nao informada.");
  if (!e.numero) issues.push("Numero nao informado.");
  if (!e.cidade) issues.push("Cidade nao informada.");
  if (!e.estado) issues.push("Estado nao informado.");

  return {
    address,
    mapUrl: address
      ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
      : "",
    confidence: issues.length === 0 ? "complete" : address ? "partial" : "missing",
    issues,
  };
}

export function guestAgent(evento: AgentEvento): GuestOutput {
  const guests = evento.convidados || [];
  const normalized = guests.map((guest) => clean(guest).toLowerCase()).filter(Boolean);
  const duplicates = normalized.filter((guest, index) => normalized.indexOf(guest) !== index);

  return {
    total: guests.length,
    unique: new Set(normalized).size,
    duplicates,
    normalizedGuests: normalized,
  };
}

export function imageAgent(evento: AgentEvento, design: DesignOutput): ImageOutput {
  if (evento.imagem) {
    return {
      mode: "uploaded",
      source: evento.imagem,
      prompt: "",
      usageHint: "Usar imagem enviada como hero ou destaque principal.",
    };
  }

  return {
    mode: "generated-placeholder",
    source: "",
    prompt: `Imagem ${design.template.tone} para ${evento.tipo}, paleta ${design.template.palette.primary}, sem texto, alta qualidade.`,
    usageHint: "Usar gradientes e formas do template ate existir upload ou geracao de imagem.",
  };
}

export function siteBuilderAgent(
  evento: AgentEvento,
  location: LocationOutput,
  guests: GuestOutput
): BuilderOutput {
  const missingBlocks: string[] = [];
  const strategy = getPlanGenerationStrategy(getSelectedPlanFromEvento(evento));
  if (!location.address) missingBlocks.push("local");
  if (!evento.data) missingBlocks.push("data");

  const sectionsByPlan: Record<typeof strategy.intensidade, string[]> = {
    essencial: [
      "hero",
      "sobre",
      "local",
      "rsvp",
      "footer",
    ],
    completa: [
      "hero",
      "countdown",
      "sobre",
      "agenda",
      "local",
      "informacoes-praticas",
      "rsvp",
      "faq",
      "footer",
    ],
    premium: [
      "hero",
      "countdown",
      "sobre",
      "narrativa-do-tipo",
      "agenda",
      "pessoas",
      "local",
      "informacoes-praticas",
      "rsvp",
      "oferta-ou-presentes",
      "faq",
      "footer",
    ],
  };

  return {
    sections: sectionsByPlan[strategy.intensidade],
    qrTarget: "cliente/[slug]",
    publishReady: missingBlocks.length === 0 && guests.duplicates.length === 0,
    missingBlocks,
  };
}

export function qualityAgent(args: {
  interpretation: InterpretationOutput;
  design: DesignOutput;
  location: LocationOutput;
  guests: GuestOutput;
  builder: BuilderOutput;
  copy: CopyOutput;
}): QualityOutput {
  const warnings: string[] = [];
  const blockers: string[] = [];
  const passed: string[] = [];

  if (args.interpretation.specificity === "low") warnings.push("Briefing com poucos detalhes.");
  else passed.push("Briefing tem contexto suficiente.");

  if (args.design.differentiators.length >= 3) passed.push("Template possui diferencas visuais claras.");
  else warnings.push("Template precisa de mais diferenciacao visual.");

  if (args.location.confidence === "complete") passed.push("Endereco completo para mapa.");
  else warnings.push("Endereco incompleto pode prejudicar mapa.");

  if (args.guests.duplicates.length > 0) warnings.push("Existem convidados duplicados no RSVP.");
  else passed.push("RSVP sem duplicados detectados.");

  if (args.copy.description.length < 80) warnings.push("Descricao promocional curta.");
  else passed.push("Copy possui substancia suficiente.");

  if (args.builder.missingBlocks.length > 0) blockers.push(`Blocos faltando: ${args.builder.missingBlocks.join(", ")}.`);
  else passed.push("Site possui blocos essenciais.");

  const score = Math.max(0, Math.min(100, 100 - warnings.length * 8 - blockers.length * 18));

  return {
    score,
    level: score >= 88 ? "premium" : score >= 70 ? "good" : "draft",
    passed,
    warnings,
    blockers,
    recommendations: [
      "Adicionar detalhes especificos aumenta a percepcao de site sob medida.",
      "Usar imagem real do evento melhora conversao e compartilhamento.",
      "Validar endereco antes de publicar reduz duvidas de convidados.",
    ],
  };
}
