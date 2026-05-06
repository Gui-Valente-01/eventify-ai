import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const VALID_STATUS = ["open", "investigating", "resolved", "ignored"] as const;
type Status = typeof VALID_STATUS[number];

export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  let body: { errorId?: string; status?: Status };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.errorId || !body.status) {
    return NextResponse.json({ error: "errorId e status obrigatórios" }, { status: 400 });
  }
  if (!VALID_STATUS.includes(body.status)) {
    return NextResponse.json({ error: "status inválido" }, { status: 400 });
  }

  const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!adminUrl || !adminKey) {
    return NextResponse.json({ error: "Service role não configurada" }, { status: 503 });
  }
  const admin = createClient(adminUrl, adminKey);

  const update: Record<string, unknown> = { status: body.status };
  if (body.status === "resolved") update.resolved_at = new Date().toISOString();

  const { error } = await admin.from("error_logs").update(update).eq("id", body.errorId);
  if (error) {
    return NextResponse.json({ error: "Falha ao atualizar" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
