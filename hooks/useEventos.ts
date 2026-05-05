"use client";

import { useCallback, useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import type { EventoDados } from "@/lib/storage/types";
import { gerarSlug } from "@/lib/utils";

export type { EventoDados };
export { gerarSlug };

export function useEventos() {
  const [eventos, setEventos] = useState<EventoDados[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const recarregar = useCallback(async () => {
    try {
      const lista = await storage.list();
      setEventos(lista);
    } catch (error) {
      const e = error as { message?: string; code?: string; details?: string; hint?: string };
      console.error("[useEventos] erro ao listar:", {
        message: e?.message,
        code: e?.code,
        details: e?.details,
        hint: e?.hint,
        raw: error,
      });
      setEventos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  const adicionarEvento = useCallback(
    async (evento: EventoDados): Promise<EventoDados> => {
      const salvo = await storage.create(evento);
      setEventos((prev) => [salvo, ...prev]);
      return salvo;
    },
    []
  );

  const atualizarEvento = useCallback(
    async (indexOrId: number | string, partial: Partial<EventoDados>) => {
      const lista = await storage.list();
      const id =
        typeof indexOrId === "string"
          ? indexOrId
          : lista[indexOrId]?.id;
      if (!id) throw new Error("Evento não encontrado.");
      const atualizado = await storage.update(id, partial);
      setEventos((prev) => prev.map((e) => (e.id === id ? { ...e, ...atualizado } : e)));
      return atualizado;
    },
    []
  );

  const deletarEvento = useCallback(
    async (indexOrId: number | string) => {
      const id =
        typeof indexOrId === "string" ? indexOrId : eventos[indexOrId]?.id;
      if (!id) return;
      await storage.remove(id);
      setEventos((prev) => prev.filter((e) => e.id !== id));
    },
    [eventos]
  );

  const confirmarPresenca = useCallback(
    async (eventoId: string, nome: string) => {
      await storage.addConvidado(eventoId, nome);
      setEventos((prev) =>
        prev.map((e) =>
          e.id === eventoId
            ? { ...e, convidados: [...(e.convidados ?? []), nome] }
            : e
        )
      );
    },
    []
  );

  const removerConvidado = useCallback(
    async (eventoId: string, nome: string) => {
      await storage.removeConvidado(eventoId, nome);
      setEventos((prev) =>
        prev.map((e) =>
          e.id === eventoId
            ? {
                ...e,
                convidados: (e.convidados ?? []).filter(
                  (c) => c.toLowerCase() !== nome.toLowerCase()
                ),
              }
            : e
        )
      );
    },
    []
  );

  const uploadImagem = useCallback(async (file: File) => {
    return storage.uploadImage(file);
  }, []);

  const encontrarPorSlug = useCallback(
    (slug: string) => eventos.find((e) => gerarSlug(e.nome) === slug),
    [eventos]
  );

  const encontrarIndexPorSlug = useCallback(
    (slug: string) => eventos.findIndex((e) => gerarSlug(e.nome) === slug),
    [eventos]
  );

  return {
    eventos,
    isLoading,
    adicionarEvento,
    atualizarEvento,
    deletarEvento,
    confirmarPresenca,
    removerConvidado,
    uploadImagem,
    encontrarPorSlug,
    encontrarIndexPorSlug,
    recarregar,
  };
}
