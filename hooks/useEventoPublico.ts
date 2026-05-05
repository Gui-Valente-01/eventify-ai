"use client";

import { useCallback, useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import type { EventoDados } from "@/lib/storage/types";

export function useEventoPublico(slug: string | undefined) {
  const [evento, setEvento] = useState<EventoDados | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    if (!slug) {
      setEvento(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const encontrado = await storage.getBySlug(slug);
      setEvento(encontrado);
      setErro(encontrado ? null : "Evento não encontrado.");
    } catch (error) {
      console.error("[useEventoPublico] erro:", error);
      setErro("Não foi possível carregar o evento.");
      setEvento(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  const confirmarPresenca = useCallback(
    async (nome: string) => {
      if (!evento?.id) throw new Error("Evento sem identificador.");
      await storage.addConvidado(evento.id, nome);
      setEvento((prev) =>
        prev
          ? { ...prev, convidados: [...(prev.convidados ?? []), nome] }
          : prev
      );
    },
    [evento]
  );

  return { evento, isLoading, erro, confirmarPresenca, recarregar };
}
