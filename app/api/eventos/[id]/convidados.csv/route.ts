import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { buildCsv } from "@/lib/csv";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function buildConvidadosCsv(rows: Array<{ nome: string; confirmado_em: string }>): string {
  const header = ["Nome", "Confirmado em (data)", "Confirmado em (hora)"];
  const linhas = rows.map((r) => {
    const d = new Date(r.confirmado_em);
    const data = d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const hora = d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return [r.nome, data, hora];
  });
  return buildCsv(header, linhas);
}

function slugify(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "evento";
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login pra exportar." }, { status: 401 });
  }

  // Valida owner (RLS já protegeria, mas confirmamos pra erro amigável)
  const { data: evento, error: eventoErr } = await supabase
    .from("eventos")
    .select("id, nome, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (eventoErr || !evento) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }
  if (evento.owner_id !== user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { data: convidados, error: convErr } = await supabase
    .from("convidados")
    .select("nome, confirmado_em")
    .eq("evento_id", id)
    .order("confirmado_em", { ascending: true });

  if (convErr) {
    logger.error("convidados-csv", "falha ao buscar convidados", convErr, { id });
    return NextResponse.json({ error: "Erro ao buscar convidados." }, { status: 500 });
  }

  const csv = buildConvidadosCsv(convidados ?? []);
  const filename = `convidados-${slugify(evento.nome)}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
