"use client";

import { useState } from "react";

type ShareButtonsProps = {
  url: string;
  titulo: string;
  className?: string;
};

export default function ShareButtons({ url, titulo, className = "" }: ShareButtonsProps) {
  const [copiado, setCopiado] = useState(false);

  const mensagem = `${titulo} — ${url}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
  const telegram = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(titulo)}`;
  const email = `mailto:?subject=${encodeURIComponent(titulo)}&body=${encodeURIComponent(mensagem)}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // ignorar
    }
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600"
      >
        💬 WhatsApp
      </a>
      <a
        href={telegram}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-600"
      >
        ✈️ Telegram
      </a>
      <a
        href={email}
        className="rounded-xl border border-[#e8e3f1] bg-white px-4 py-2 text-sm font-bold text-[#090814] transition hover:bg-[#faf9ff]"
      >
        ✉️ E-mail
      </a>
      <button
        type="button"
        onClick={copiar}
        className="rounded-xl border border-[#e8e3f1] bg-white px-4 py-2 text-sm font-bold text-[#8847e7] transition hover:bg-[#faf9ff]"
      >
        {copiado ? "✓ Copiado!" : "🔗 Copiar link"}
      </button>
    </div>
  );
}
