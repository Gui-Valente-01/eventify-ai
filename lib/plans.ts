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

// Recursos consolidados — SINCRONIZADOS com lib/planLimits.ts (fonte da verdade
// do que o código de fato libera). Atualizar AMBOS quando mudar algo.
export const PLANS: Plan[] = [
  {
    id: "basico",
    nome: "Básico",
    preco: 29,
    precoFormatado: "R$ 29/mês",
    descricao: "Pra quem quer publicar 1 evento de cada vez com tudo essencial.",
    recursos: [
      "Até 5 eventos publicados",
      "5 regenerações de IA por evento",
      "Sem marca d'água no site",
      "QR Code automático",
      "RSVP ilimitado de convidados",
      "Convite por e-mail em massa",
      "Editor visual (cores + fontes)",
    ],
    cta: "Assinar Básico",
  },
  {
    id: "intermediario",
    nome: "Intermediário",
    preco: 49,
    precoFormatado: "R$ 49/mês",
    destaque: true,
    descricao: "Pra quem organiza vários eventos por ano (cerimonialista, planner).",
    recursos: [
      "Tudo do Básico",
      "Até 20 eventos publicados",
      "15 regenerações de IA por evento",
      "Mais flexibilidade pra ajustar antes de fechar",
    ],
    cta: "Assinar Intermediário",
  },
  {
    id: "premium",
    nome: "Premium",
    preco: 79,
    precoFormatado: "R$ 79/mês",
    descricao: "Pra agências, buffets e produtoras com volume alto.",
    recursos: [
      "Tudo do Intermediário",
      "Eventos praticamente ilimitados",
      "Regenerações de IA praticamente ilimitadas",
      "Acesso a templates premium exclusivos",
      "Atendimento prioritário por e-mail",
    ],
    cta: "Assinar Premium",
  },
];
