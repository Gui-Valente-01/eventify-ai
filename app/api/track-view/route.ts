import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

type Body = {
  eventoId?: string;
  slug?: string;
  sessionId?: string;
  referrer?: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const sessionId = (body.sessionId || "").trim();
  if (!sessionId || !UUID_RE.test(sessionId)) {
    return NextResponse.json({ error: "sessionId inválido" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ ok: false, reason: "supabase-not-configured" });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  // Resolve eventoId — aceita id direto ou slug
  let eventoId = (body.eventoId || "").trim();
  if (!eventoId && body.slug) {
    const { data } = await admin
      .from("eventos")
      .select("id, status")
      .eq("slug", body.slug)
      .maybeSingle();
    if (data?.id) eventoId = data.id;
  }

  if (!eventoId || !UUID_RE.test(eventoId)) {
    return NextResponse.json({ error: "evento não encontrado" }, { status: 404 });
  }

  // Anti-spam: se já houve view dessa session no mesmo evento nos últimos 30min, ignora
  const desdeISO = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("event_views")
    .select("id", { count: "exact", head: true })
    .eq("evento_id", eventoId)
    .eq("session_id", sessionId)
    .gte("created_at", desdeISO);

  if ((count ?? 0) > 0) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const userAgent = (req.headers.get("user-agent") || "").slice(0, 500);
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    null;
  const referrer = (body.referrer || req.headers.get("referer") || "").slice(0, 500);

  const { error } = await admin.from("event_views").insert({
    evento_id: eventoId,
    session_id: sessionId,
    user_agent: userAgent || null,
    country,
    referrer: referrer || null,
  });

  if (error) {
    logger.error("track-view", "falha ao gravar event_views", error, { eventoId });
    return NextResponse.json({ error: "falha ao registrar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
