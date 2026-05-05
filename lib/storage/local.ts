import { gerarSlug } from "@/lib/utils";
import { normalizeStatus } from "@/lib/publication";
import type { EventoDados, StorageBackend } from "./types";

const KEY = "eventos";

function read(): EventoDados[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EventoDados[]) : [];
  } catch {
    return [];
  }
}

function write(list: EventoDados[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

function ensureId(e: EventoDados): EventoDados {
  if (e.id) return { ...e, status: normalizeStatus(e.status) };
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { ...e, id, status: normalizeStatus(e.status) };
}

export const localBackend: StorageBackend = {
  async list() {
    return read().map(ensureId);
  },
  async getBySlug(slug) {
    const found = read().find((e) => gerarSlug(e.nome) === slug);
    return found ? ensureId(found) : null;
  },
  async create(evento) {
    const withId = ensureId({ ...evento, status: evento.status ?? "preview" });
    const list = read();
    list.push(withId);
    write(list);
    return withId;
  },
  async update(id, partial) {
    const list = read();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Evento não encontrado.");
    list[idx] = { ...list[idx], ...partial };
    write(list);
    return list[idx];
  },
  async remove(id) {
    write(read().filter((e) => e.id !== id));
  },
  async addConvidado(eventoId, nome) {
    const list = read();
    const idx = list.findIndex((e) => e.id === eventoId);
    if (idx === -1) throw new Error("Evento não encontrado.");
    const convidados = list[idx].convidados ?? [];
    if (convidados.some((c) => c.toLowerCase() === nome.toLowerCase())) {
      throw new Error("Esse nome já foi confirmado.");
    }
    list[idx] = { ...list[idx], convidados: [...convidados, nome] };
    write(list);
  },
  async removeConvidado(eventoId, nome) {
    const list = read();
    const idx = list.findIndex((e) => e.id === eventoId);
    if (idx === -1) return;
    list[idx] = {
      ...list[idx],
      convidados: (list[idx].convidados ?? []).filter(
        (c) => c.toLowerCase() !== nome.toLowerCase()
      ),
    };
    write(list);
  },
  async uploadImage(file) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Falha ao ler imagem."));
      reader.readAsDataURL(file);
    });
  },
};
