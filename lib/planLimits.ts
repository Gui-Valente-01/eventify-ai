// Limites por plano — fonte única de verdade.
// Validações críticas devem usar getPlanLimits() no servidor.

export type Plan = "free" | "basico" | "intermediario" | "premium";

export type PlanLimits = {
  maxEventos: number;             // total que pode criar
  regeneracoesPorEvento: number;  // chamadas de IA por evento
  watermark: boolean;             // marca d'água no preview/site final
  permitePublicar: boolean;       // pode assinar+publicar
  qrCode: boolean;                // QR Code liberado
  templatesPremium: boolean;      // acesso a templates premium
  suportePrioritario: boolean;
};

const LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxEventos: 1,
    regeneracoesPorEvento: 2,
    watermark: true,
    permitePublicar: false,
    qrCode: false,
    templatesPremium: false,
    suportePrioritario: false,
  },
  basico: {
    maxEventos: 5,
    regeneracoesPorEvento: 5,
    watermark: false,
    permitePublicar: true,
    qrCode: true,
    templatesPremium: false,
    suportePrioritario: false,
  },
  intermediario: {
    maxEventos: 20,
    regeneracoesPorEvento: 15,
    watermark: false,
    permitePublicar: true,
    qrCode: true,
    templatesPremium: false,
    suportePrioritario: false,
  },
  premium: {
    maxEventos: 999,
    regeneracoesPorEvento: 999,
    watermark: false,
    permitePublicar: true,
    qrCode: true,
    templatesPremium: true,
    suportePrioritario: true,
  },
};

export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  if (plan === "free" || plan === "basico" || plan === "intermediario" || plan === "premium") {
    return LIMITS[plan];
  }
  return LIMITS.free;
}

export type LimitCheck =
  | { ok: true }
  | { ok: false; code: "max_eventos" | "max_regen" | "no_publish" | "no_qr"; message: string };

export function checkPodeCriarEvento(plan: string | null | undefined, eventosAtuais: number): LimitCheck {
  const limits = getPlanLimits(plan);
  if (eventosAtuais >= limits.maxEventos) {
    return {
      ok: false,
      code: "max_eventos",
      message: `Seu plano permite até ${limits.maxEventos} ${limits.maxEventos === 1 ? "evento" : "eventos"}. Faça upgrade para criar mais.`,
    };
  }
  return { ok: true };
}

export function checkPodeRegenerar(plan: string | null | undefined, regeneracoesNoEvento: number): LimitCheck {
  const limits = getPlanLimits(plan);
  if (regeneracoesNoEvento >= limits.regeneracoesPorEvento) {
    return {
      ok: false,
      code: "max_regen",
      message: `Você atingiu o limite de ${limits.regeneracoesPorEvento} regenerações deste evento no seu plano. Faça upgrade para liberar mais.`,
    };
  }
  return { ok: true };
}

export function checkPodePublicar(plan: string | null | undefined): LimitCheck {
  const limits = getPlanLimits(plan);
  if (!limits.permitePublicar) {
    return {
      ok: false,
      code: "no_publish",
      message: "O plano gratuito não permite publicar. Escolha um plano pago para liberar o link final.",
    };
  }
  return { ok: true };
}
