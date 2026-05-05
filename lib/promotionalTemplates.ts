export type PromoTemplate = {
  accent: string;
  heroGradient: string;
  label: string;
  highlight: string;
  buttonText: string;
  cardBg: string;
  badgeBg: string;
};

export type EventoDados = {
  nome: string;
  tipo: string;
  data: string;
  endereco?: {
    cidade?: string;
  };
  imagem?: string;
  siteGerado?: {
    templateId?: string;
    heroTitle: string;
    subtitle: string;
    description: string;
    invitationMessage: string;
    highlights: string[];
    ctaLabel: string;
    templateName: string;
    generatedBy: string;
  };
};

const TEMPLATES: Record<string, PromoTemplate> = {
  Casamento: {
    accent: "text-rose-700",
    heroGradient: "from-rose-100 via-white to-pink-50",
    label: "Site de casamento",
    highlight: "Amor, estilo e celebração",
    buttonText: "Confirmar presença",
    cardBg: "bg-rose-50",
    badgeBg: "bg-rose-100",
  },
  "Aniversário": {
    accent: "text-amber-700",
    heroGradient: "from-amber-100 via-white to-yellow-50",
    label: "Festa de aniversário",
    highlight: "Diversão garantida para todos",
    buttonText: "Garanta seu lugar",
    cardBg: "bg-amber-50",
    badgeBg: "bg-amber-100",
  },
  "Evento Corporativo": {
    accent: "text-sky-700",
    heroGradient: "from-sky-100 via-white to-slate-50",
    label: "Evento corporativo",
    highlight: "Profissionalismo com alta performance",
    buttonText: "Confirmar presença",
    cardBg: "bg-sky-50",
    badgeBg: "bg-sky-100",
  },
  Festa: {
    accent: "text-violet-700",
    heroGradient: "from-violet-100 via-white to-purple-50",
    label: "Festa especial",
    highlight: "Música, cores e energia",
    buttonText: "Eu vou!",
    cardBg: "bg-violet-50",
    badgeBg: "bg-violet-100",
  },
  Religioso: {
    accent: "text-emerald-700",
    heroGradient: "from-emerald-100 via-white to-lime-50",
    label: "Celebração religiosa",
    highlight: "Tradição e fé fortalecida",
    buttonText: "Confirmar presença",
    cardBg: "bg-emerald-50",
    badgeBg: "bg-emerald-100",
  },
};

const defaultTemplate: PromoTemplate = {
  accent: "text-slate-800",
  heroGradient: "from-slate-100 via-white to-slate-50",
  label: "Evento especial",
  highlight: "Uma experiência única e memorável",
  buttonText: "Confirmar presença",
  cardBg: "bg-slate-100",
  badgeBg: "bg-slate-200",
};

export function getTemplate(tipo: string) {
  return TEMPLATES[tipo] || defaultTemplate;
}

export function formatDate(data: string) {
  try {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return data;
  }
}

export function generatePromoCopy(evento: EventoDados) {
  const cidade = evento.endereco?.cidade || "sua cidade";
  const dataFormatada = formatDate(evento.data);

  const baseTitle = `Venha celebrar ${evento.nome}`;
  const subtitle = `Um momento especial em ${cidade} no dia ${dataFormatada}`;
  const description = `Prepare-se para uma experiência única com ${evento.nome}. Este evento combina estilo, energia e emoção em um só dia. Traga seus amigos e familiares para comemorar conosco.`;

  if (evento.tipo === "Casamento") {
    return {
      title: `${evento.nome} — Um casamento inesquecível`,
      subtitle: `Celebre o amor em ${cidade} no dia ${dataFormatada}`,
      description: `Junte-se a nós para um dia repleto de romance, música e momentos especiais. O ambiente foi pensado para refletir toda a elegância e carinho do casal. Sua presença fará a diferença.`,
      cta: "Confirmar presença",
    };
  }

  if (evento.tipo === "Aniversário") {
    return {
      title: `${evento.nome} — Uma festa para lembrar`,
      subtitle: `Diversão em ${cidade} no dia ${dataFormatada}`,
      description: `Venha celebrar com muita música, bolo e alegria. Esta festa promete ser uma noite inesquecível com amigos, família e surpresas. Não perca!`,
      cta: "Quero participar",
    };
  }

  if (evento.tipo === "Evento Corporativo") {
    return {
      title: `${evento.nome} — Um encontro profissional premium`,
      subtitle: `Networking e conhecimento em ${cidade} no dia ${dataFormatada}`,
      description: `Participe de um evento corporativo com conteúdo relevante, palestras inspiradoras e conexões estratégicas. Ideal para líderes, clientes e parceiros.`,
      cta: "Confirmar participação",
    };
  }

  if (evento.tipo === "Religioso") {
    return {
      title: `${evento.nome} — Uma celebração de fé`,
      subtitle: `Um encontro especial em ${cidade} no dia ${dataFormatada}`,
      description: `Venha viver momentos de inspiração, comunhão e reflexão. Traga sua família para celebrar e renovar as energias em um ambiente acolhedor.`,
      cta: "Participar",
    };
  }

  return {
    title: baseTitle,
    subtitle,
    description,
    cta: "Confirmar presença",
  };
}

export function buildPromoData(evento: EventoDados) {
  if (evento.siteGerado) {
    return {
      ...getTemplate(evento.tipo),
      title: evento.siteGerado.heroTitle,
      subtitle: evento.siteGerado.subtitle,
      description: evento.siteGerado.description,
      cta: evento.siteGerado.ctaLabel,
      buttonText: evento.siteGerado.ctaLabel,
      label: evento.siteGerado.templateName,
      highlight: evento.siteGerado.highlights?.[0] || getTemplate(evento.tipo).highlight,
      highlights: evento.siteGerado.highlights || [],
      generatedBy: evento.siteGerado.generatedBy,
      cidade: evento.endereco?.cidade || "",
      dataFormatada: formatDate(evento.data),
      imagem: evento.imagem || "",
    };
  }

  const template = getTemplate(evento.tipo);
  const copy = generatePromoCopy(evento);

  return {
    ...template,
    ...copy,
    highlights: [],
    generatedBy: "local-template",
    cidade: evento.endereco?.cidade || "",
    dataFormatada: formatDate(evento.data),
    imagem: evento.imagem || "",
  };
}
