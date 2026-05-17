import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { enviarEmail } from "@/lib/email/resend";
import { templateConvite } from "@/lib/email/templates";
import { logger } from "@/lib/logger";
import { formatarData } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_EMAILS_POR_CHAMADA = 50;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

type Body = { emails?: string[] | string };

function parseEmails(raw: string[] | string | undefined): string[] {
  if (!raw) return [];
  const lista = Array.isArray(raw) ? raw : raw.split(/[\s,;]+/);
  const limpos = lista
    .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
    .filter((e) => e && EMAIL_RE.test(e));
  return Array.from(new Set(limpos));
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: eventoId } = await ctx.params;
  if (!eventoId) {
    return NextResponse.json({ error: "ID do evento ausente." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Banco indisponível." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const emails = parseEmails(body.emails);
  if (emails.length === 0) {
    return NextResponse.json({ error: "Nenhum e-mail válido informado." }, { status: 400 });
  }
  if (emails.length > MAX_EMAILS_POR_CHAMADA) {
    return NextResponse.json(
      {
        error: `Máximo ${MAX_EMAILS_POR_CHAMADA} e-mails por envio. Você enviou ${emails.length}.`,
        max: MAX_EMAILS_POR_CHAMADA,
      },
      { status: 400 }
    );
  }

  // Carrega o evento — RLS garante que o usuário só vê os próprios
  const { data: evento, error: eventoErr } = await supabase
    .from("eventos")
    .select("id, slug, nome, data, endereco, status, owner_id")
    .eq("id", eventoId)
    .single();

  if (eventoErr || !evento) {
    return NextResponse.json({ error: "Evento não encontrado ou sem permissão." }, { status: 404 });
  }

  if (evento.owner_id !== user.id) {
    return NextResponse.json({ error: "Sem permissão neste evento." }, { status: 403 });
  }

  // Carrega nome do anfitrião
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const nomeAnfitriao = profile?.full_name || "";

  // Monta endereço legível
  const end = (evento.endereco as Record<string, string> | null) || {};
  const local = [end.rua, end.numero, end.cidade, end.estado].filter(Boolean).join(", ") || "";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  const { subject, html, text } = templateConvite({
    nomeEvento: evento.nome,
    slug: evento.slug,
    appUrl,
    dataEvento: evento.data ? formatarData(evento.data) : undefined,
    local: local || undefined,
    nomeAnfitriao,
  });

  // Envia em paralelo (limit chega no Resend mas com 50 é OK)
  const resultados = await Promise.all(
    emails.map((to) => enviarEmail({ to, subject, html, text }))
  );

  const enviados = resultados.filter((r) => r.ok).length;
  const falhou = resultados.length - enviados;
  const erros = resultados
    .map((r, i) => (r.ok ? null : { email: emails[i], error: r.error }))
    .filter((x): x is { email: string; error: string | undefined } => x !== null);

  logger.info("eventos:convidar", "envios processados", {
    eventoId,
    userId: user.id,
    total: emails.length,
    enviados,
    falhou,
  });

  return NextResponse.json({
    ok: enviados > 0,
    enviados,
    falhou,
    total: emails.length,
    erros: erros.slice(0, 10), // limita pra não vazar muita info
  });
}
