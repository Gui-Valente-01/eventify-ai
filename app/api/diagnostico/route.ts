import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "erro" | "nao_testado";

type CheckResult = {
  status: CheckStatus;
  message: string;
  detail?: string;
  httpStatus?: number;
};

const REQUIRED_ENV = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_MODEL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_BASICO",
  "STRIPE_PRICE_INTERMEDIARIO",
  "STRIPE_PRICE_PREMIUM",
] as const;

function envValue(name: string) {
  return process.env[name]?.trim() || "";
}

function envSummary(name: string) {
  const value = envValue(name);
  return {
    configured: Boolean(value),
    length: value.length,
    prefixOk: expectedPrefixOk(name, value),
  };
}

function expectedPrefixOk(name: string, value: string) {
  if (!value) return false;
  if (name === "NEXT_PUBLIC_APP_URL" || name === "NEXT_PUBLIC_SUPABASE_URL") {
    return value.startsWith("https://") || value.startsWith("http://");
  }
  if (name === "ANTHROPIC_API_KEY") return value.startsWith("sk-ant-");
  if (name === "STRIPE_SECRET_KEY") return value.startsWith("sk_live_") || value.startsWith("sk_test_");
  if (name === "STRIPE_WEBHOOK_SECRET") return value.startsWith("whsec_");
  if (name.startsWith("STRIPE_PRICE_")) return value.startsWith("price_");
  if (name === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
    return value.startsWith("eyJ") || value.startsWith("sb_publishable_");
  }
  if (name === "SUPABASE_SERVICE_ROLE_KEY") {
    return value.startsWith("eyJ") || value.startsWith("sb_secret_");
  }
  return true;
}

function withTimeout(ms = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timeout) };
}

function jsonError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Erro desconhecido.";
}

async function checkSupabaseAnon(): Promise<CheckResult> {
  const url = envValue("NEXT_PUBLIC_SUPABASE_URL");
  const key = envValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !key) return { status: "erro", message: "Supabase anon sem URL/chave." };

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.from("eventos").select("id", { count: "exact", head: true });
    if (error) {
      return {
        status: "erro",
        message: "Supabase anon respondeu, mas a consulta falhou.",
        detail: `${error.code || "sem_codigo"}: ${error.message}`,
      };
    }
    return { status: "ok", message: "Supabase anon conectado e tabela eventos acessível." };
  } catch (error) {
    return { status: "erro", message: "Falha de rede/conexão no Supabase anon.", detail: jsonError(error) };
  }
}

async function checkSupabaseService(): Promise<CheckResult> {
  const url = envValue("NEXT_PUBLIC_SUPABASE_URL");
  const key = envValue("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return { status: "erro", message: "Supabase service role sem URL/chave." };

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    if (error) {
      return {
        status: "erro",
        message: "Supabase service role respondeu, mas a consulta falhou.",
        detail: `${error.code || "sem_codigo"}: ${error.message}`,
      };
    }
    return { status: "ok", message: "Supabase service role conectado e tabela profiles acessível." };
  } catch (error) {
    return { status: "erro", message: "Falha de rede/conexão no Supabase service role.", detail: jsonError(error) };
  }
}

async function checkStripe(): Promise<CheckResult> {
  const key = envValue("STRIPE_SECRET_KEY");
  const priceId = envValue("STRIPE_PRICE_INTERMEDIARIO") || envValue("STRIPE_PRICE_BASICO");
  if (!key || !priceId) return { status: "erro", message: "Stripe sem secret key ou price id." };

  const timeout = withTimeout();
  try {
    const res = await fetch(`https://api.stripe.com/v1/prices/${encodeURIComponent(priceId)}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: timeout.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: "erro",
        message: "Stripe respondeu com erro.",
        httpStatus: res.status,
        detail: data?.error?.message || JSON.stringify(data).slice(0, 300),
      };
    }
    if (!data?.recurring) {
      return {
        status: "erro",
        message: "Stripe conectado, mas o price testado nao e recorrente.",
        httpStatus: res.status,
        detail: "Use price mensal/recorrente nas variaveis STRIPE_PRICE_* ou troque o checkout para pagamento unico.",
      };
    }
    return { status: "ok", message: "Stripe conectado e price recorrente encontrado.", httpStatus: res.status };
  } catch (error) {
    return { status: "erro", message: "Falha de rede/conexão no Stripe.", detail: jsonError(error) };
  } finally {
    timeout.done();
  }
}

async function checkAnthropic(): Promise<CheckResult> {
  const key = envValue("ANTHROPIC_API_KEY");
  const model = envValue("ANTHROPIC_MODEL") || "claude-opus-4-7";
  if (!key) return { status: "erro", message: "Anthropic sem API key." };

  const timeout = withTimeout();
  try {
    const res = await fetch(`https://api.anthropic.com/v1/models/${encodeURIComponent(model)}`, {
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      signal: timeout.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: "erro",
        message: "Anthropic respondeu com erro.",
        httpStatus: res.status,
        detail: data?.error?.message || JSON.stringify(data).slice(0, 300),
      };
    }
    return { status: "ok", message: `Anthropic conectado e modelo ${model} encontrado.`, httpStatus: res.status };
  } catch (error) {
    return { status: "erro", message: "Falha de rede/conexão na Anthropic.", detail: jsonError(error) };
  } finally {
    timeout.done();
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || req.headers.get("x-diagnostics-token") || "";
  const expectedToken = envValue("DIAGNOSTICS_TOKEN");

  const env = Object.fromEntries(REQUIRED_ENV.map((name) => [name, envSummary(name)]));
  const tokenConfigured = Boolean(expectedToken);

  if (!tokenConfigured || token !== expectedToken) {
    return NextResponse.json(
      {
        ok: false,
        message: tokenConfigured
          ? "Token de diagnóstico ausente ou inválido."
          : "Configure DIAGNOSTICS_TOKEN na Vercel para rodar testes profundos.",
        tokenConfigured,
        env,
        checks: {
          supabaseAnon: { status: "nao_testado", message: "Informe o token para testar." },
          supabaseService: { status: "nao_testado", message: "Informe o token para testar." },
          stripe: { status: "nao_testado", message: "Informe o token para testar." },
          anthropic: { status: "nao_testado", message: "Informe o token para testar." },
        },
      },
      { status: 401 }
    );
  }

  const [supabaseAnon, supabaseService, stripe, anthropic] = await Promise.all([
    checkSupabaseAnon(),
    checkSupabaseService(),
    checkStripe(),
    checkAnthropic(),
  ]);

  const checks = { supabaseAnon, supabaseService, stripe, anthropic };
  const ok = Object.values(checks).every((check) => check.status === "ok");

  return NextResponse.json({
    ok,
    generatedAt: new Date().toISOString(),
    env,
    checks,
    nextActions: ok
      ? ["Conexões principais OK. Teste cadastro, geração de site e checkout no fluxo real."]
      : [
          "Confira as variáveis Production no Vercel.",
          "Depois de alterar env vars na Vercel, faça Redeploy.",
          "No Supabase, rode RODAR-ISSO.sql + RODAR-ISSO-2.sql + migrations pendentes.",
          "No Stripe, confira se os price_ pertencem à mesma conta da STRIPE_SECRET_KEY.",
        ],
  });
}
