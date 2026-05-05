import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { gerarSlug } from "@/lib/utils";
import type { EventoDados, StorageBackend } from "./types";

type EventoRow = {
  id: string;
  owner_id: string;
  slug: string;
  nome: string;
  tipo: string;
  data: string;
  endereco: EventoDados["endereco"] | null;
  imagem_url: string | null;
  briefing: EventoDados["briefing"] | null;
  site_gerado: EventoDados["siteGerado"] | null;
  site_html: string | null;
};

function getClient() {
  const c = getSupabaseBrowserClient();
  if (!c) throw new Error("Supabase não está configurado.");
  return c;
}

function rowToEvento(row: EventoRow, convidados: string[] = []): EventoDados {
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    data: row.data,
    endereco: row.endereco ?? {},
    imagem: row.imagem_url ?? "",
    briefing: row.briefing ?? {},
    convidados,
    siteGerado: row.site_gerado ?? undefined,
    siteHtml: row.site_html ?? undefined,
    ownerId: row.owner_id,
  };
}

async function fetchConvidadosMap(eventoIds: string[]) {
  const map = new Map<string, string[]>();
  if (eventoIds.length === 0) return map;
  const supabase = getClient();
  const { data, error } = await supabase
    .from("convidados")
    .select("evento_id, nome")
    .in("evento_id", eventoIds)
    .order("confirmado_em", { ascending: true });
  if (error) throw error;
  for (const row of data ?? []) {
    const arr = map.get(row.evento_id) ?? [];
    arr.push(row.nome);
    map.set(row.evento_id, arr);
  }
  return map;
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
    return rows.map((r) => rowToEvento(r, map.get(r.id) ?? []));
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
    return rowToEvento(row, map.get(row.id) ?? []);
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
        endereco: evento.endereco ?? {},
        imagem_url: evento.imagem || null,
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
    if (partial.endereco !== undefined) updates.endereco = partial.endereco;
    if (partial.imagem !== undefined) updates.imagem_url = partial.imagem || null;
    if (partial.briefing !== undefined) updates.briefing = partial.briefing;
    if (partial.siteGerado !== undefined) updates.site_gerado = partial.siteGerado;
    if (partial.siteHtml !== undefined) updates.site_html = partial.siteHtml;

    const { data, error } = await supabase
      .from("eventos")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;

    const map = await fetchConvidadosMap([id]);
    return rowToEvento(data as EventoRow, map.get(id) ?? partial.convidados ?? []);
  },

  async remove(id) {
    const supabase = getClient();
    const { error } = await supabase.from("eventos").delete().eq("id", id);
    if (error) throw error;
  },

  async addConvidado(eventoId, nome) {
    const supabase = getClient();
    const { error } = await supabase.from("convidados").insert({ evento_id: eventoId, nome });
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
