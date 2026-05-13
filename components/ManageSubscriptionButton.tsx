"use client";

import { useState } from "react";
import Spinner from "@/components/Spinner";

type ManageSubscriptionButtonProps = {
  enabled: boolean;
};

export default function ManageSubscriptionButton({ enabled }: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    if (!enabled || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/customer-portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Não foi possível abrir o portal.");
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Erro de rede ao abrir o portal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={openPortal}
        disabled={!enabled || loading}
        className="eventify-button eventify-button-ghost justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Spinner className="h-4 w-4" />
            Abrindo portal...
          </>
        ) : (
          "Gerenciar assinatura"
        )}
      </button>
      {!enabled && (
        <p className="text-[12px] text-[color:var(--muted)]">
          O portal fica disponível depois da primeira assinatura confirmada.
        </p>
      )}
      {error && (
        <p className="border-y border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] px-3 py-2 text-[12px] text-[color:var(--rose,#A85462)]">
          {error}
        </p>
      )}
    </div>
  );
}
