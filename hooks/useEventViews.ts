"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type ViewCounts = Record<string, number>;

/**
 * Retorna mapa { eventoId: totalDeVisitas } para os eventos do owner.
 * RLS limita o select às views de eventos do próprio owner.
 */
export function useEventViews(eventoIds: string[]) {
  const [counts, setCounts] = useState<ViewCounts>({});
  const [isLoading, setIsLoading] = useState(false);

  // Chave estável pra dep do effect (evita refetch quando array é recriado mas com mesmo conteúdo)
  const idsKey = eventoIds.slice().sort().join(",");

  useEffect(() => {
    if (eventoIds.length === 0) {
      setCounts({});
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from("event_views")
          .select("evento_id")
          .in("evento_id", eventoIds);

        if (cancelled) return;
        if (error) return; // Tabela pode não estar migrada — não trava painel

        const map: ViewCounts = {};
        for (const row of data ?? []) {
          const id = (row as { evento_id: string }).evento_id;
          map[id] = (map[id] ?? 0) + 1;
        }
        setCounts(map);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return { counts, isLoading };
}
