import { NextResponse, after } from "next/server";
import { EventoDados } from "@/lib/siteAgent";
import { runAgentCompany } from "@/lib/agents/orchestrator";
import type { AgentRunSummary } from "@/lib/agents/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { calcularCustoUSD, type TokenUsage } from "@/lib/aiPricing";
import { checkPodeCriarEvento, checkPodeRegenerar } from "@/lib/planLimits";
import { logger } from "@/lib/logger";
import { generateSite } from "@/lib/siteGenerators";
import {
  createJob,
  markRunning,
  markDone,
  markFailed,
} from "@/lib/jobs/generationJobs";
import { hashBriefing, isCacheValid } from "@/lib/jobs/briefingHash";
import { createClient } from "@supabase/supabase-js";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_CALLS = 5;
export const runtime = "nodejs";
export const maxDuration = 60;

type Usage = TokenUsage;

type Plan = "free" | "basico" | "intermediario" | "premium";

const MODEL_BY_PLAN: Record<Plan, string> = {
  premium: "claude-opus-4-7",
  intermediario: "claude-sonnet-4-6",
  basico: "claude-haiku-4-5-20251001",
  free: "claude-haiku-4-5-20251001",
};

async function resolveContext(): Promise<{
  model: string;
  plan: Plan;
  userId: string | null;
}> {
  const override = process.env.ANTHROPIC_MODEL;
  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return { model: override || MODEL_BY_PLAN.free, plan: "free", userId: null };

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { model: override || MODEL_BY_PLAN.free, plan: "free", userId: null };

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();

    const plan = (profile?.plan as Plan) || "free";
    return {
      model: MODEL_BY_PLAN[plan] || MODEL_BY_PLAN.free,
      plan,
      userId: user.id,
    };
  } catch {
    return { model: override || MODEL_BY_PLAN.free, plan: "free", userId: null };
  }
}

async function validateRequest(req: Request): Promise<
  { ok: true; evento: EventoDados } | { ok: false; error: string; status: number }
> {
  let evento: EventoDados;
  try {
    evento = (await req.json()) as EventoDados;
  } catch {
    return { ok: false, error: "JSON inválido.", status: 400 };
  }

  if (!evento?.nome || !evento?.tipo) {
    return {
      ok: false,
      error: "Campos 'nome' e 'tipo' são obrigatórios.",
      status: 400,
    };
  }

  return { ok: true, evento };
}

async function validateLimits(
  evento: EventoDados,
  userId: string | null,
  plan: Plan
): Promise<{ ok: true } | { ok: false; error: string; code: string; status: number }> {
  if (!userId) return { ok: true };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: true };

  const desdeISO = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", desdeISO);

  if ((recentCount ?? 0) >= RATE_LIMIT_MAX_CALLS) {
    logger.warn("gerar-site", "rate-limit atingido", { userId, recentCount });
    return {
      ok: false,
      error: `Muitas chamadas em pouco tempo. Tente novamente em ${RATE_LIMIT_WINDOW_SECONDS}s.`,
      code: "rate_limit",
      status: 429,
    };
  }

  if (!evento.id) {
    const { count: eventosCount } = await supabase
      .from("eventos")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId);
    const podeCriar = checkPodeCriarEvento(plan, eventosCount ?? 0);
    if (!podeCriar.ok) {
      return {
        ok: false,
        error: podeCriar.message,
        code: podeCriar.code,
        status: 403,
      };
    }
  } else {
    const { count: regenCount } = await supabase
      .from("usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("evento_id", evento.id);
    const podeRegenerar = checkPodeRegenerar(plan, regenCount ?? 0);
    if (!podeRegenerar.ok) {
      return {
        ok: false,
        error: podeRegenerar.message,
        code: podeRegenerar.code,
        status: 403,
      };
    }
  }

  return { ok: true };
}

async function logUsage(args: {
  userId: string | null;
  eventoId?: string | null;
  model: string;
  plan: Plan;
  usage: Usage;
  status: "ok" | "error";
  errorMessage?: string;
  provider: "anthropic" | "gemini" | "local";
  agentRun?: AgentRunSummary;
  qualityScore?: number;
}) {
  if (!args.userId) return;
  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return;
    const cost = calcularCustoUSD(args.model, args.usage);
    const basePayload = {
      user_id: args.userId,
      evento_id: args.eventoId ?? null,
      model: args.model,
      plan: args.plan,
      input_tokens: args.usage.inputTokens,
      output_tokens: args.usage.outputTokens,
      cache_read_tokens: args.usage.cacheReadTokens ?? 0,
      cache_write_tokens: args.usage.cacheWriteTokens ?? 0,
      cost_usd: cost,
      status: args.status,
      error_message: args.errorMessage ?? null,
    };
    const payloadWithAgents = {
      ...basePayload,
      provider: args.provider,
      generation_mode: "agent-company",
      quality_score: args.qualityScore ?? args.agentRun?.quality.score ?? null,
      agent_run: args.agentRun ?? null,
    };
    const { error } = await supabase.from("usage_logs").insert(payloadWithAgents);
    if (error && /provider|generation_mode|quality_score|agent_run/i.test(error.message || "")) {
      await supabase.from("usage_logs").insert(basePayload);
    } else if (error) {
      throw error;
    }
  } catch (e) {
    logger.error("gerar-site", "falha ao gravar usage_logs", e, { userId: args.userId });
  }
}

type GenerationResult = {
  siteGerado: unknown;
  siteHtml: string | null;
  agentRun: unknown;
  quality: unknown;
  business: unknown;
  aiAvailable: boolean;
  model: string;
  plan: Plan;
};

async function executeGeneration(
  evento: EventoDados,
  model: string,
  plan: Plan,
  userId: string | null
): Promise<GenerationResult> {
  const localRun = runAgentCompany(evento);
  const result = await generateSite(evento, model, plan, userId, localRun, logUsage);
  return {
    siteGerado: result.siteGerado,
    siteHtml: result.siteHtml,
    agentRun: result.agentRun,
    quality: result.quality,
    business: result.business,
    aiAvailable: result.aiAvailable,
    model: result.modelUsed,
    plan: result.plan,
  };
}

export async function POST(req: Request) {
  const t0 = Date.now();
  const tlog = (label: string) => {
    logger.info("gerar-site:timing", label, { elapsedMs: Date.now() - t0 });
  };

  const requestValidation = await validateRequest(req);
  if (!requestValidation.ok) {
    return NextResponse.json(
      { error: requestValidation.error },
      { status: requestValidation.status }
    );
  }
  const evento = requestValidation.evento;
  tlog("after-parse");

  const { model, plan, userId } = await resolveContext();
  tlog("after-resolveContext");

  const limitsValidation = await validateLimits(evento, userId, plan);
  if (!limitsValidation.ok) {
    return NextResponse.json(
      { error: limitsValidation.error, code: limitsValidation.code },
      { status: limitsValidation.status }
    );
  }

  // ===== Cache: se evento.id existe e briefing não mudou, retorna sem chamar IA =====
  const newHash = hashBriefing(evento);
  if (evento.id && userId) {
    try {
      const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supaUrl && serviceKey) {
        const admin = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });
        const { data: cached } = await admin
          .from("eventos")
          .select("briefing_hash, site_cached_at, site_gerado, owner_id")
          .eq("id", evento.id)
          .maybeSingle();

        if (
          cached?.owner_id === userId &&
          isCacheValid({
            storedHash: cached.briefing_hash,
            newHash,
            storedSiteHtml: (cached.site_gerado as { siteHtml?: string } | null)?.siteHtml,
            cachedAt: cached.site_cached_at,
          })
        ) {
          logger.info("gerar-site", "cache hit — pulando IA", { eventId: evento.id, hash: newHash });
          const siteGerado = cached.site_gerado as Record<string, unknown> | null;
          return NextResponse.json({
            ...siteGerado,
            promoData: siteGerado,
            cached: true,
          });
        }
      }
    } catch (e) {
      logger.warn("gerar-site", "cache check falhou, segue normal", { error: String(e) });
    }
  }

  tlog("after-cache-check");

  if (!userId) {
    tlog("anonymous-inline");
    const result = await executeGeneration(evento, model, plan, userId);
    tlog("after-anonymous-inline");
    return NextResponse.json({
      ...result,
      promoData: result.siteGerado,
    });
  }

  let job = null;
  try {
    job = await createJob({
      userId,
      eventoId: evento.id ?? null,
      input: evento as unknown,
    });
  } catch (e) {
    logger.warn("gerar-site", "createJob falhou, fallback inline", { userId, error: String(e) });
  }

  if (!job) {
    const result = await executeGeneration(evento, model, plan, userId);
    return NextResponse.json({
      ...result,
      promoData: result.siteGerado,
    });
  }

  const jobId = job.id;

  after(async () => {
    try {
      await markRunning(jobId);
      const result = await executeGeneration(evento, model, plan, userId);
      await markDone(jobId, result);

      // Marca cache no evento (pra próxima chamada com mesmo briefing virar cache hit)
      if (evento.id) {
        try {
          const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (supaUrl && serviceKey) {
            const admin = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });
            await admin
              .from("eventos")
              .update({
                briefing_hash: newHash,
                site_cached_at: new Date().toISOString(),
              })
              .eq("id", evento.id)
              .eq("owner_id", userId);
          }
        } catch (cacheErr) {
          logger.warn("gerar-site", "falha ao marcar cache do evento", {
            eventId: evento.id,
            error: String(cacheErr),
          });
        }
      }

      logger.info("gerar-site", "job concluído", { jobId, ms: Date.now() - t0 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logger.error("gerar-site", "job falhou", e, { jobId });
      await markFailed(jobId, msg);
    }
  });

  tlog("after-job-kicked-off");
  return NextResponse.json({ jobId, status: "pending" });
}
