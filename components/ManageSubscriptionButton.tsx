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
        setError(data.error || "Nao foi possivel abrir o portal.");
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
        className="eventify-button eventify-button-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
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
        <p className="text-xs font-semibold text-[#5f5a72]">
          O portal fica disponivel depois da primeira assinatura confirmada.
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
