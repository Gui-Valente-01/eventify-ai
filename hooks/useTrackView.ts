"use client";

import { useEffect } from "react";

const SESSION_KEY = "eventify_session_id";

/** Gera UUID v4 válido sem depender de crypto.randomUUID (que falha em iOS < 15.4 e HTTP). */
function uuidV4(): string {
  // Tenta crypto.randomUUID (caminho moderno, contexto seguro)
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    try {
      return crypto.randomUUID();
    } catch {
      // segue pro fallback
    }
  }
  // Tenta crypto.getRandomValues (funciona em iOS antigo e HTTP)
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // versão 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante RFC 4122
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
  // Último recurso: Math.random (UUID válido mas previsível — só usado em browsers exóticos)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = uuidV4();
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
