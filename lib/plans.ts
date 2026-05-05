export type PlanId = "basico" | "intermediario" | "premium";

export type Plan = {
  id: PlanId;
  nome: string;
  preco: number;
  precoFormatado: string;
  destaque?: boolean;
  descricao: string;
  recursos: string[];
  cta: string;
};

export const PLANS: Plan[] = [
  {
    id: "basico",
    nome: "Básico",
    preco: 29,
    precoFormatado: "R$ 29",
    descricao: "Site simples para divulgar seu evento.",
    recursos: [
      "Site responsivo personalizado",
      "1 template à escolha",
      "Domínio eventify.app/seu-evento",
      "QR Code automático",
    ],
    cta: "Assinar Básico",
  },
  {
    id: "intermediario",
    nome: "Intermediário",
    preco: 49,
    precoFormatado: "R$ 49",
    destaque: true,
    descricao: "Site completo com confirmação de presença.",
    recursos: [
      "Tudo do Básico",
      "Sistema de RSVP completo",
      "Lista de convidados em tempo real",
      "Mapa integrado e suporte por e-mail",
    ],
    cta: "Assinar Intermediário",
  },
  {
    id: "premium",
    nome: "Premium",
    preco: 79,
    precoFormatado: "R$ 79",
    descricao: "Tudo + IA Claude gerando conteúdo sob medida.",
    recursos: [
      "Tudo do Intermediário",
      "Conteúdo gerado pela IA Claude",
      "Regeneração ilimitada de copy",
      "Suporte prioritário e analytics",
    ],
    cta: "Assinar Premium",
  },
];
