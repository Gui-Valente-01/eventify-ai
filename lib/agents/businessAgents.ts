import type { AgentEvento, BusinessOutput, CopyOutput, DesignOutput, QualityOutput } from "./types";

function eventKeyword(tipo: string) {
  const normalized = tipo.toLowerCase();
  if (normalized.includes("casamento")) return "site para casamento";
  if (normalized.includes("anivers")) return "convite digital de aniversario";
  if (normalized.includes("corporativo")) return "site para evento corporativo";
  if (normalized.includes("relig")) return "convite digital religioso";
  return "site para festa";
}

export function businessAgent(args: {
  evento: AgentEvento;
  design: DesignOutput;
  copy: CopyOutput;
  quality: QualityOutput;
}): BusinessOutput {
  const keyword = eventKeyword(args.evento.tipo);
  const cidade = args.evento.endereco?.cidade || "sua cidade";
  const baseHook = `${args.evento.nome} pronto para compartilhar com convidados em minutos.`;

  const upsells = [
    "Dominio personalizado para deixar o link mais profissional.",
    "Galeria premium com fotos do evento.",
    "RSVP avancado com lista exportavel e controle de acompanhantes.",
  ];

  if (args.quality.level === "premium") {
    upsells.unshift("Publicacao premium com QR Code em alta resolucao para materiais impressos.");
  }

  return {
    salesHooks: [
      baseHook,
      `Template ${args.design.template.name} com visual ${args.design.layoutIntent}.`,
      `${args.copy.ctaLabel} como chamada principal para converter convidados.`,
    ],
    upsells,
    seoKeywords: [
      keyword,
      `${keyword} em ${cidade}`,
      "site de evento com RSVP",
      "convite digital com QR Code",
    ],
    socialPosts: [
      `Seu evento merece um site proprio: ${args.evento.nome} ganhou convite, RSVP e QR Code.`,
      `De briefing a site publicado: criamos uma pagina ${args.design.template.name.toLowerCase()} em poucos minutos.`,
      `Mais organizacao para convidados: mapa, data, presenca confirmada e link compartilhavel.`,
    ],
    nextActions: [
      "Publicar link do cliente.",
      "Compartilhar QR Code no WhatsApp.",
      "Oferecer upgrade antes do checkout.",
    ],
  };
}
