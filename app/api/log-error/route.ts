import { NextResponse } from "next/server";
import { reportError } from "@/lib/errorReporter";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Body = {
  scope?: string;
  message?: string;
  errorName?: string;
  errorMessage?: string;
  stack?: string;
  url?: string;
  context?: Record<string, unknown>;
};

const MAX_FIELD = 5000;
const MAX_STACK = 8000;

function trim(s: string | undefined, max: number): string | undefined {
  if (!s) return undefined;
  return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const scope = (body.scope || "client").slice(0, 60);
  const message = trim(body.message, 500) || "(sem mensagem)";

  // user_id se logado
  let userId: string | null = null;
  try {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }
  } catch {
    // ok, anon
  }

  await reportError({
    scope: `client:${scope}`,
    level: "error",
    message,
    errorName: trim(body.errorName, 200),
    errorMessage: trim(body.errorMessage, 1000),
    stack: trim(body.stack, MAX_STACK),
    url: trim(body.url, MAX_FIELD),
    userId,
    userAgent: (req.headers.get("user-agent") || "").slice(0, 500),
    context: body.context,
  });

  return NextResponse.json({ ok: true });
}
