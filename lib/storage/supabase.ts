import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { gerarSlug } from "@/lib/utils";
import { normalizeStatus } from "@/lib/publication";
import type { EventoDados, StorageBackend } from "./types";

type EventoRow = {
  id: string;
  owner_id: string;
  slug: string;
  nome: string;
  tipo: string;
  data: string;
  status: EventoDados["status"] | null;
  endereco: EventoDados["endereco"] | null;
  imagem_url: string | null;
  selected_plan: string | null;
  briefing: EventoDados["briefing"] | null;
  site_gerado: EventoDados["siteGerado"] | null;
  site_html: string | null;
  paid_at: string | null;
  published_at: string | null;
  paid_plan: string | null;
};

function getClient() {
  const c = getSupabaseBrowserClient();
  if (!c) throw new Error("Supabase não está configurado.");
  return c;
}

function rowToEvento(
  row: EventoRow,
  convidados: string[] = [],
  convidadosDetalhes: import("./types").ConvidadoDetalhado[] = []
): EventoDados {
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    data: row.data,
    status: normalizeStatus(row.status),
    endereco: row.endereco ?? {},
    imagem: row.imagem_url ?? "",
    selectedPlan: row.selected_plan ?? undefined,
    briefing: row.briefing ?? {},
    convidados,
    convidadosDetalhes,
    siteGerado: row.site_gerado ?? undefined,
    siteHtml: row.site_html ?? undefined,
    ownerId: row.owner_id,
    paidAt: row.paid_at ?? undefined,
    publishedAt: row.published_at ?? undefined,
    paidPlan: row.paid_plan ?? undefined,
  };
}

type ConvidadoMaps = {
  nomes: Map<string, string[]>;
  detalhes: Map<string, import("./types").ConvidadoDetalhado[]>;
};

async function fetchConvidadosMap(eventoIds: string[]): Promise<ConvidadoMaps> {
  const nomes = new Map<string, string[]>();
  const detalhes = new Map<string, import("./types").ConvidadoDetalhado[]>();
  if (eventoIds.length === 0) return { nomes, detalhes };
  const supabase = getClient();
  // Tenta carregar colunas novas; se falhar (migration 0012 não aplicada),
  // cai pro select mínimo.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any[] | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let error: any = null;
  const primary = await supabase
    .from("convidados")
    .select("evento_id, nome, status, acompanhantes, restricao_alimentar, recado, confirmado_em")
    .in("evento_id", eventoIds)
    .order("confirmado_em", { ascending: true });
  data = primary.data;
  error = primary.error;

  if (error && /column.*does not exist/i.test(error.message || "")) {
    const fallback = await supabase
      .from("convidados")
      .select("evento_id, nome, confirmado_em")
      .in("evento_id", eventoIds)
      .order("confirmado_em", { ascending: true });
    data = fallback.data;
    error = fallback.error;
  }
  if (error) throw error;

  for (const row of (data ?? []) as Array<{
    evento_id: string;
    nome: string;
    status?: string;
    acompanhantes?: number;
    restricao_alimentar?: string | null;
    recado?: string | null;
    confirmado_em?: string;
  }>) {
    const arrNomes = nomes.get(row.evento_id) ?? [];
    arrNomes.push(row.nome);
    nomes.set(row.evento_id, arrNomes);

    const arrDet = detalhes.get(row.evento_id) ?? [];
    arrDet.push({
      nome: row.nome,
      status: (row.status as import("./types").RsvpStatus | undefined) ?? "confirmado",
      acompanhantes: row.acompanhantes ?? 0,
      restricaoAlimentar: row.restricao_alimentar ?? null,
      recado: row.recado ?? null,
      confirmadoEm: row.confirmado_em,
    });
    detalhes.set(row.evento_id, arrDet);
  }
  return { nomes, detalhes };
}

export const supabaseBackend: StorageBackend = {
  async list() {
    const supabase = getClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = (data ?? []) as EventoRow[];
    const map = await fetchConvidadosMap(rows.map((r) => r.id));
    return rows.map((r) =>
      rowToEvento(r, map.nomes.get(r.id) ?? [], map.detalhes.get(r.id) ?? [])
    );
  },

  async getBySlug(slug) {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .eq("slug", slug)
      .limit(1);
    if (error) throw error;
    const row = (data ?? [])[0] as EventoRow | undefined;
    if (!row) return null;
    const map = await fetchConvidadosMap([row.id]);
    return rowToEvento(row, map.nomes.get(row.id) ?? [], map.detalhes.get(row.id) ?? []);
  },

  async create(evento) {
    const supabase = getClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("É necessário estar logado.");

    const slug = gerarSlug(evento.nome);
    const { data, error } = await supabase
      .from("eventos")
      .insert({
        owner_id: user.id,
        slug,
        nome: evento.nome,
        tipo: evento.tipo,
        data: evento.data,
        status: evento.status ?? "preview",
        endereco: evento.endereco ?? {},
        imagem_url: evento.imagem || null,
        selected_plan: evento.selectedPlan ?? evento.briefing?.planoSelecionado ?? null,
        briefing: evento.briefing ?? {},
        site_gerado: evento.siteGerado ?? null,
        site_html: evento.siteHtml ?? null,
      })
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") {
        throw new Error("Você já tem um evento com esse nome. Use outro.");
      }
      throw error;
    }
    return rowToEvento(data as EventoRow, []);
  },

  async update(id, partial) {
    const supabase = getClient();
    const updates: Record<string, unknown> = {};
    if (partial.nome !== undefined) {
      updates.nome = partial.nome;
      updates.slug = gerarSlug(partial.nome);
    }
    if (partial.tipo !== undefined) updates.tipo = partial.tipo;
    if (partial.data !== undefined) updates.data = partial.data;
    if (partial.status !== undefined) updates.status = partial.status;
    if (partial.endereco !== undefined) updates.endereco = partial.endereco;
    if (partial.imagem !== undefined) updates.imagem_url = partial.imagem || null;
    if (partial.selectedPlan !== undefined) updates.selected_plan = partial.selectedPlan || null;
    if (partial.briefing !== undefined) updates.briefing = partial.briefing;
    if (partial.siteGerado !== undefined) updates.site_gerado = partial.siteGerado;
    if (partial.siteHtml !== undefined) updates.site_html = partial.siteHtml;
    if (partial.paidAt !== undefined) updates.paid_at = partial.paidAt;
    if (partial.publishedAt !== undefined) updates.published_at = partial.publishedAt;
    if (partial.paidPlan !== undefined) updates.paid_plan = partial.paidPlan;

    const { data, error } = await supabase
      .from("eventos")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;

    const map = await fetchConvidadosMap([id]);
    return rowToEvento(
      data as EventoRow,
      map.nomes.get(id) ?? partial.convidados ?? [],
      map.detalhes.get(id) ?? []
    );
  },

  async remove(id) {
    const supabase = getClient();
    const { error } = await supabase.from("eventos").delete().eq("id", id);
    if (error) throw error;
  },

  async addConvidado(eventoId, nome) {
    return this.addRsvp(eventoId, { nome });
  },

  async addRsvp(eventoId, dados) {
    const supabase = getClient();
    const payload: Record<string, unknown> = {
      evento_id: eventoId,
      nome: dados.nome.trim(),
    };
    if (dados.status) payload.status = dados.status;
    if (typeof dados.acompanhantes === "number") payload.acompanhantes = dados.acompanhantes;
    if (dados.restricaoAlimentar !== undefined)
      payload.restricao_alimentar = dados.restricaoAlimentar || null;
    if (dados.recado !== undefined) payload.recado = dados.recado || null;

    let { error } = await supabase.from("convidados").insert(payload);

    // Fallback: se colunas novas não existem (migration 0012 não rodou),
    // insere só com nome.
    if (error && /column.*does not exist/i.test(error.message || "")) {
      const retry = await supabase.from("convidados").insert({
        evento_id: eventoId,
        nome: dados.nome.trim(),
      });
      error = retry.error;
    }

    if (error) {
      if (error.code === "23505") throw new Error("Esse nome já foi confirmado.");
      throw error;
    }
  },

  async removeConvidado(eventoId, nome) {
    const supabase = getClient();
    const { error } = await supabase
      .from("convidados")
      .delete()
      .eq("evento_id", eventoId)
      .ilike("nome", nome);
    if (error) throw error;
  },

  async uploadImage(file) {
    const supabase = getClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Faça login para enviar imagens.");

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const path = `${user.id}/${id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("event-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("event-images").getPublicUrl(path);
    return data.publicUrl;
  },
};
