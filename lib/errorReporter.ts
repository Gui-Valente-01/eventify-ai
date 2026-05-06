// Persiste erros no Supabase via service_role.
// Usado pelo logger.error() (server) e pela rota /api/log-error (client).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type ErrorReport = {
  scope: string;
  level?: "warn" | "error" | "fatal";
  message: string;
  errorName?: string;
  errorMessage?: string;
  stack?: string;
  url?: string;
  userId?: string | null;
  userAgent?: string;
  context?: Record<string, unknown>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedAdmin: SupabaseClient<any, "public", any> | null = null;

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!cachedAdmin) cachedAdmin = createClient(url, key);
  return cachedAdmin;
}

/**
 * Salva um erro no banco. Fire-and-forget — não trava o caller se Supabase
 * estiver fora ou tabela ainda não migrada.
 */
export async function reportError(report: ErrorReport): Promise<void> {
  const admin = getAdmin();
  if (!admin) return;

  try {
    await admin.from("error_logs").insert({
      scope: report.scope,
      level: report.level ?? "error",
      message: report.message,
      error_name: report.errorName ?? null,
      error_message: report.errorMessage ?? null,
      stack: report.stack ?? null,
      url: report.url ?? null,
      user_id: report.userId ?? null,
      user_agent: report.userAgent ?? null,
      context: report.context ?? null,
    });
  } catch {
    // Nunca quebra o caller — falha silenciosa
  }
}
