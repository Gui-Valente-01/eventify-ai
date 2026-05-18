"use client";

import { useCallback, useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import type { EventoDados, RsvpPayload, ConvidadoDetalhado } from "@/lib/storage/types";

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

  const enviarRsvp = useCallback(
    async (dados: RsvpPayload) => {
      if (!evento?.id) throw new Error("Evento sem identificador.");
      await storage.addRsvp(evento.id, dados);
      const novoDetalhe: ConvidadoDetalhado = {
        nome: dados.nome.trim(),
        status: dados.status ?? "confirmado",
        acompanhantes: dados.acompanhantes ?? 0,
        restricaoAlimentar: dados.restricaoAlimentar ?? null,
        recado: dados.recado ?? null,
        confirmadoEm: new Date().toISOString(),
      };
      setEvento((prev) =>
        prev
          ? {
              ...prev,
              convidados: [...(prev.convidados ?? []), dados.nome.trim()],
              convidadosDetalhes: [...(prev.convidadosDetalhes ?? []), novoDetalhe],
            }
          : prev
      );
    },
    [evento]
  );

  /** @deprecated Use enviarRsvp({nome}) */
  const confirmarPresenca = useCallback(
    async (nome: string) => enviarRsvp({ nome }),
    [enviarRsvp]
  );

  return { evento, isLoading, erro, enviarRsvp, confirmarPresenca, recarregar };
}
