/* eslint-disable no-console */
/**
 * Health check completo do Eventify AI.
 *
 * Roda: type-check → lint → testes → checa env → ping endpoints externos.
 *
 * Uso: npm run health-check
 *      npm run health-check -- --skip-build  (pula type-check pesado)
 */

import { execSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

type CheckResult = {
  name: string;
  status: "ok" | "warn" | "fail" | "skip";
  detail?: string;
  durationMs?: number;
};

const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");

const checks: CheckResult[] = [];

function loadDotEnv() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (line.trim().startsWith("#")) continue;
    const [, key, val] = m;
    if (!process.env[key]) process.env[key] = val.replace(/^["']|["']$/g, "");
  }
}

function track(name: string): { done: (r: Omit<CheckResult, "name" | "durationMs">) => void } {
  const start = Date.now();
  process.stdout.write(`\x1b[2m → ${name}…\x1b[0m `);
  return {
    done(r) {
      const durationMs = Date.now() - start;
      checks.push({ name, ...r, durationMs });
      const icon = r.status === "ok" ? "\x1b[32m✓\x1b[0m"
        : r.status === "warn" ? "\x1b[33m⚠\x1b[0m"
        : r.status === "skip" ? "\x1b[2m·\x1b[0m"
        : "\x1b[31m✗\x1b[0m";
      const ms = `\x1b[2m(${durationMs}ms)\x1b[0m`;
      console.log(`\r ${icon} ${name} ${ms}${r.detail ? `\n   \x1b[2m${r.detail}\x1b[0m` : ""}`);
    },
  };
}

function checkEnv() {
  const t = track("Env vars essenciais");
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const optional = [
    "GOOGLE_API_KEY",
    "ANTHROPIC_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ];
  const missing = required.filter((k) => !process.env[k]?.trim());
  const missingOpt = optional.filter((k) => !process.env[k]?.trim());

  if (missing.length > 0) {
    t.done({ status: "fail", detail: `Faltando: ${missing.join(", ")}` });
    return;
  }
  if (missingOpt.length > 0) {
    t.done({ status: "warn", detail: `Opcionais não configuradas: ${missingOpt.join(", ")}` });
    return;
  }
  t.done({ status: "ok", detail: `${required.length + optional.length} env vars presentes` });
}

function runCmd(cmd: string, args: string[]): { code: number; stdout: string; stderr: string } {
  const r = spawnSync(cmd, args, {
    shell: true,
    encoding: "utf-8",
    cwd: process.cwd(),
  });
  return { code: r.status ?? 1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

function checkTypeCheck() {
  const t = track("TypeScript (tsc --noEmit)");
  const r = runCmd("npx", ["tsc", "--noEmit"]);
  if (r.code === 0) {
    t.done({ status: "ok" });
  } else {
    const out = (r.stdout + r.stderr).split("\n").slice(0, 3).join(" | ");
    t.done({ status: "fail", detail: out });
  }
}

function checkLint() {
  const t = track("ESLint");
  const r = runCmd("npm", ["run", "lint", "--silent"]);
  if (r.code === 0) {
    t.done({ status: "ok" });
  } else {
    const errors = (r.stdout.match(/(\d+) error/g) || []).join(" / ");
    t.done({ status: "fail", detail: errors || "lint falhou" });
  }
}

function checkTests() {
  const t = track("Vitest (testes)");
  const r = runCmd("npm", ["test", "--silent"]);
  if (r.code === 0) {
    const m = r.stdout.match(/Tests\s+(\d+) passed/);
    t.done({ status: "ok", detail: m ? `${m[1]} testes passando` : undefined });
  } else {
    t.done({ status: "fail", detail: "tests falharam" });
  }
}

function checkBuild() {
  if (skipBuild) {
    track("Next build").done({ status: "skip", detail: "--skip-build" });
    return;
  }
  const t = track("Next build");
  const r = runCmd("npm", ["run", "build", "--silent"]);
  if (r.code === 0) {
    t.done({ status: "ok" });
  } else {
    const lines = r.stdout.split("\n").filter((l) => /error|Error|failed/i.test(l));
    t.done({ status: "fail", detail: lines.slice(0, 2).join(" | ") || "build falhou" });
  }
}

async function checkSupabaseConnectivity() {
  const t = track("Supabase REST API");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    t.done({ status: "skip", detail: "envs não configuradas" });
    return;
  }
  try {
    const res = await fetch(`${url}/rest/v1/profiles?limit=0`, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` },
    });
    if (res.ok || res.status === 401 || res.status === 403) {
      t.done({ status: "ok", detail: `HTTP ${res.status}` });
    } else {
      t.done({ status: "fail", detail: `HTTP ${res.status}` });
    }
  } catch (e) {
    t.done({ status: "fail", detail: e instanceof Error ? e.message : String(e) });
  }
}

async function checkStripe() {
  const t = track("Stripe API");
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    t.done({ status: "skip", detail: "STRIPE_SECRET_KEY não configurada" });
    return;
  }
  try {
    const res = await fetch("https://api.stripe.com/v1/products?limit=1", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.ok) {
      t.done({ status: "ok", detail: "auth válida, produtos acessíveis" });
    } else {
      const body = await res.text();
      t.done({
        status: "fail",
        detail: `HTTP ${res.status} — ${body.slice(0, 80)}`,
      });
    }
  } catch (e) {
    t.done({ status: "fail", detail: e instanceof Error ? e.message : String(e) });
  }
}

async function checkGemini() {
  const t = track("Google Gemini API");
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    t.done({ status: "skip", detail: "GOOGLE_API_KEY não configurada" });
    return;
  }
  try {
    const model = process.env.GOOGLE_MODEL || "gemini-2.5-flash";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${key}`
    );
    if (res.ok) {
      t.done({ status: "ok", detail: `modelo ${model} acessível` });
    } else {
      const body = await res.text();
      t.done({
        status: "fail",
        detail: `HTTP ${res.status} — ${body.slice(0, 80)}`,
      });
    }
  } catch (e) {
    t.done({ status: "fail", detail: e instanceof Error ? e.message : String(e) });
  }
}

async function checkAnthropic() {
  const t = track("Anthropic API");
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    t.done({ status: "skip", detail: "ANTHROPIC_API_KEY não configurada" });
    return;
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/models", {
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
    });
    if (res.ok) {
      t.done({ status: "ok" });
    } else {
      const body = await res.text();
      // 400 com "credit balance" é warn (chave válida, sem saldo)
      if (body.includes("credit balance")) {
        t.done({ status: "warn", detail: "chave válida mas saldo zero" });
      } else {
        t.done({ status: "fail", detail: `HTTP ${res.status}` });
      }
    }
  } catch (e) {
    t.done({ status: "fail", detail: e instanceof Error ? e.message : String(e) });
  }
}

function summary() {
  const ok = checks.filter((c) => c.status === "ok").length;
  const warn = checks.filter((c) => c.status === "warn").length;
  const fail = checks.filter((c) => c.status === "fail").length;
  const skip = checks.filter((c) => c.status === "skip").length;
  const total = checks.length;

  console.log("\n" + "─".repeat(60));
  console.log(
    ` \x1b[32m${ok} ok\x1b[0m · \x1b[33m${warn} warn\x1b[0m · \x1b[31m${fail} fail\x1b[0m · \x1b[2m${skip} skip\x1b[0m  (${total} checks)`
  );
  console.log("─".repeat(60));

  if (fail > 0) {
    console.log("\n\x1b[31m✗ Tem coisa quebrada. Conserta antes de deployar.\x1b[0m");
    process.exit(1);
  }
  if (warn > 0) {
    console.log("\n\x1b[33m⚠ Tudo passou mas há avisos. Confere se faz sentido.\x1b[0m");
    process.exit(0);
  }
  console.log("\n\x1b[32m✓ Tudo verde. Pode deployar.\x1b[0m");
  process.exit(0);
}

async function main() {
  console.log("\n\x1b[1m🩺 Eventify AI · Health Check\x1b[0m\n");
  loadDotEnv();

  // Sequência: rápido primeiro
  checkEnv();
  await checkSupabaseConnectivity();
  await checkStripe();
  await checkGemini();
  await checkAnthropic();
  checkTypeCheck();
  checkLint();
  checkTests();
  checkBuild();

  summary();
}

main().catch((e) => {
  console.error("\n\x1b[31mErro inesperado no health-check:\x1b[0m", e);
  process.exit(1);
});

// silencia warning de unused
void execSync;
