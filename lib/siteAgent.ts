import { selectEventTemplate, EventTemplate } from "./templates";

export type EventoDados = {
  nome: string;
  tipo: string;
  data: string;
  endereco?: {
    cep?: string;
    rua?: string;
    numero?: string;
    cidade?: string;
    estado?: string;
  };
  imagem?: string;
  briefing?: {
    estilo?: string;
    clima?: string;
    publico?: string;
    corPrincipal?: string;
    descricao?: string;
    detalhes?: Record<string, string>;
  };
  convidados?: string[];
  siteGerado?: GeneratedSite;
  siteHtml?: string;
};

export type GeneratedSite = {
  templateId: string;
  templateName: string;
  layout: string;
  palette: EventTemplate["palette"];
  heroTitle: string;
  subtitle: string;
  description: string;
  invitationMessage: string;
  highlights: string[];
  ctaLabel: string;
  seoTitle: string;
  seoDescription: string;
  generatedBy: "local-agent" | "claude" | "openai";
};

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

function getCidade(evento: EventoDados) {
  return evento.endereco?.cidade || "sua cidade";
}

function buildLocalCopy(evento: EventoDados, template: EventTemplate): GeneratedSite {
  const cidade = getCidade(evento);
  const data = formatDate(evento.data);
  const nome = evento.nome || "Evento especial";

  const copyByTemplate: Record<string, Pick<GeneratedSite, "heroTitle" | "subtitle" | "description" | "invitationMessage" | "highlights" | "ctaLabel">> = {
    casamento: {
      heroTitle: `${nome}: um dia para celebrar o amor`,
      subtitle: `Uma celebração elegante em ${cidade}, no dia ${data}.`,
      description: "Um convite preparado para reunir pessoas queridas em uma experiência romântica, leve e inesquecível.",
      invitationMessage: "Sua presença deixa esse momento ainda mais especial. Confirme e venha celebrar conosco.",
      highlights: ["Cerimônia especial", "Recepção acolhedora", "Memórias para guardar"],
      ctaLabel: "Confirmar presença",
    },
    aniversario: {
      heroTitle: `${nome}: uma festa para lembrar`,
      subtitle: `Diversão, energia e boas histórias em ${cidade}, no dia ${data}.`,
      description: "Um site vibrante para reunir convidados, destacar a festa e facilitar a confirmação de presença.",
      invitationMessage: "Venha comemorar, sorrir e fazer parte dessa celebração.",
      highlights: ["Clima animado", "Convidados especiais", "Celebração personalizada"],
      ctaLabel: "Quero participar",
    },
    corporativo: {
      heroTitle: `${nome}: experiência corporativa premium`,
      subtitle: `Networking, conteúdo e presença profissional em ${cidade}, no dia ${data}.`,
      description: "Uma página objetiva para comunicar valor, programação e detalhes essenciais do evento.",
      invitationMessage: "Confirme sua participação e garanta seu lugar nesse encontro estratégico.",
      highlights: ["Networking qualificado", "Conteúdo relevante", "Organização profissional"],
      ctaLabel: "Confirmar participação",
    },
    festa: {
      heroTitle: `${nome}: energia para reunir todo mundo`,
      subtitle: `Uma experiência social em ${cidade}, no dia ${data}.`,
      description: "Uma página chamativa para divulgar a festa, receber confirmações e compartilhar o link com facilidade.",
      invitationMessage: "Chame sua turma, confirme presença e venha viver esse momento.",
      highlights: ["Visual impactante", "Compartilhamento fácil", "RSVP rápido"],
      ctaLabel: "Eu vou",
    },
    religioso: {
      heroTitle: `${nome}: uma celebração de fé e encontro`,
      subtitle: `Um momento especial em ${cidade}, no dia ${data}.`,
      description: "Um convite sereno para reunir comunidade, família e amigos em uma celebração significativa.",
      invitationMessage: "Confirme sua presença e participe desse momento de comunhão.",
      highlights: ["Mensagem acolhedora", "Encontro especial", "Organização simples"],
      ctaLabel: "Confirmar presença",
    },
  };

  const copy = copyByTemplate[template.id] || copyByTemplate.festa;

  return {
    ...copy,
    templateId: template.id,
    templateName: template.name,
    layout: template.layout,
    palette: template.palette,
    seoTitle: `${nome} | Eventify AI`,
    seoDescription: copy.subtitle,
    generatedBy: "local-agent",
  };
}

export function generateSiteLocally(evento: EventoDados): GeneratedSite {
  const template = selectEventTemplate(evento.tipo);
  return buildLocalCopy(evento, template);
}

export function buildEventAddress(evento: EventoDados) {
  const endereco = evento.endereco || {};
  return [endereco.rua, endereco.numero, endereco.cidade, endereco.estado].filter(Boolean).join(", ");
}
