"use client";

import { useEffect } from "react";

const SESSION_KEY = "eventify_session_id";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return "";
  }
}

type Args = {
  eventoId?: string | null;
  slug?: string | null;
  enabled?: boolean;
};

/**
 * Registra uma visita ao evento. Fire-and-forget. Dedup por sessão (30min)
 * é feito no servidor.
 */
export function useTrackView({ eventoId, slug, enabled = true }: Args) {
  useEffect(() => {
    if (!enabled) return;
    if (!eventoId && !slug) return;

    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    const referrer = typeof document !== "undefined" ? document.referrer : "";

    // Não bloqueia render — fire-and-forget
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventoId, slug, sessionId, referrer }),
      keepalive: true,
    }).catch(() => {
      /* silencioso — analytics nunca deve quebrar a página */
    });
  }, [eventoId, slug, enabled]);
}
