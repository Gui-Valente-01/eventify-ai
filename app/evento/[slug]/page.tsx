"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import ShareButtons from "@/components/ShareButtons";
import { useEventos } from "@/hooks/useEventos";

export default function Evento() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const { eventos, isLoading, confirmarPresenca, removerConvidado, encontrarIndexPorSlug } = useEventos();

  const [nomeConvidado, setNomeConvidado] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState<number | null>(null);

  useEffect(() => {
    if (!mensagem) return;
    const timer = setTimeout(() => setMensagem(null), 4000);
    return () => clearTimeout(timer);
  }, [mensagem]);

  if (isLoading) {
    return (
      <main className="eventify-page">
        <BrandHeader actions={[{ href: "/painel", label: "Entrar", variant: "ghost" }]} />
        <div className="editorial-wrap py-32 text-center text-[color:var(--muted)]">Carregando evento...</div>
      </main>
    );
  }

  const indexEvento = encontrarIndexPorSlug(slug);
  const evento = indexEvento !== -1 ? eventos[indexEvento] : null;

  if (!evento) {
    return (
      <main className="eventify-page">
        <BrandHeader actions={[{ href: "/painel", label: "Entrar", variant: "ghost" }]} />
        <section className="editorial-narrow py-24 text-center">
          <span className="eventify-kicker">Página do evento</span>
          <h1 className="eventify-title mt-6 text-[clamp(40px,5vw,64px)]">
            Evento <em>não encontrado.</em>
          </h1>
          <Link href="/painel" className="eventify-button eventify-button-ghost mt-8">
            ← Voltar ao painel
          </Link>
        </section>
      </main>
    );
  }

  function exportarCSV() {
    if (!evento) return;
    const linhas = ["nome,confirmado_em"];
    (evento.convidados || []).forEach((nome) => {
      const escapado = `"${nome.replace(/"/g, '""')}"`;
      linhas.push(`${escapado},${new Date().toISOString().split("T")[0]}`);
    });
    const csv = linhas.join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `convidados-${slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function adicionarPresenca() {
    if (!evento?.id) return;
    const nome = nomeConvidado.trim();
    if (!nome) {
      setMensagem({ tipo: "erro", texto: "Digite um nome para confirmar." });
      return;
    }
    try {
      await confirmarPresenca(evento.id, nome);
      setNomeConvidado("");
      setMensagem({ tipo: "ok", texto: "Presença confirmada!" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao confirmar.";
      setMensagem({ tipo: "erro", texto: msg });
    }
  }

  async function removerPresenca(indexConvidado: number) {
    if (!evento?.id) return;
    const nome = (evento.convidados || [])[indexConvidado];
    if (!nome) return;
    try {
      await removerConvidado(evento.id, nome);
      setConfirmandoRemocao(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao remover.";
      setMensagem({ tipo: "erro", texto: msg });
    }
  }

  const enderecoCompleto = evento.endereco
    ? [evento.endereco.rua, evento.endereco.numero, evento.endereco.cidade, evento.endereco.estado]
        .filter(Boolean)
        .join(", ")
    : "";
  const mapaURL = enderecoCompleto
    ? `https://www.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&output=embed`
    : "";
  const convidados = evento.convidados || [];

  return (
    <main className="eventify-page">
      <BrandHeader actions={[{ href: "/painel", label: "Entrar", variant: "ghost" }]} />
      <div className="editorial-wrap py-12 sm:py-16">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eventify-kicker">Página do evento</span>
            <h1 className="eventify-title mt-6 text-[clamp(40px,5.4vw,72px)]">{evento.nome}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/painel" className="eventify-button eventify-button-ghost">
              ← Painel
            </Link>
            <Link href={`/cliente/${slug}`} className="eventify-button eventify-button-primary">
              Página do cliente
            </Link>
            <Link href={`/promocional/${slug}`} className="eventify-button eventify-button-ghost">
              Site promocional
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)]">
          <div className="grid gap-10 p-8 lg:grid-cols-[1.4fr_0.9fr] lg:p-12">
            {/* COLUNA ESQUERDA */}
            <section className="space-y-6">
              <div className="overflow-hidden rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--paper-2)]">
                {evento.imagem ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={evento.imagem} alt={evento.nome} className="h-72 w-full object-cover" />
                ) : (
                  <div className="flex h-72 items-center justify-center font-display text-[16px] italic text-[color:var(--muted-2)]">
                    Sem imagem disponível
                  </div>
                )}
              </div>

              <div className="rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--paper)] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-3.5 py-1.5 text-[11.5px] uppercase tracking-[0.16em] text-[color:var(--ink-2)]">
                    {evento.tipo}
                  </span>
                  <span className="text-[13px] text-[color:var(--muted)] font-mono-tight">
                    {convidados.length} {convidados.length === 1 ? "convidado" : "convidados"}
                  </span>
                </div>
                <dl className="mt-6 space-y-2.5 text-[15px] text-[color:var(--ink-2)]">
                  <p>
                    <span className="mr-2 text-[color:var(--gold)]">●</span>
                    <strong className="font-medium">Data:</strong> {evento.data}
                  </p>
                  {enderecoCompleto && (
                    <p>
                      <span className="mr-2 text-[color:var(--gold)]">●</span>
                      <strong className="font-medium">Endereço:</strong> {enderecoCompleto}
                    </p>
                  )}
                </dl>
                <div className="mt-6 border-t border-[color:var(--hairline)] pt-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--gold)]">
                    Compartilhar com convidados
                  </p>
                  <ShareButtons
                    url={typeof window !== "undefined" ? `${window.location.origin}/cliente/${slug}` : ""}
                    titulo={`Convite: ${evento.nome}`}
                    className="mt-4"
                  />
                </div>
              </div>

              {mapaURL && (
                <div className="overflow-hidden rounded-[10px] border border-[color:var(--hairline)]">
                  <iframe src={mapaURL} width="100%" height="320" style={{ border: 0 }} loading="lazy" />
                </div>
              )}
            </section>

            {/* COLUNA DIREITA */}
            <aside className="space-y-6 rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--paper)] p-6">
              <div>
                <h2 className="font-display text-[28px] italic tracking-[-0.01em] text-[color:var(--ink)]">
                  Confirmar presença
                </h2>
                <p className="mt-2 text-[13.5px] text-[color:var(--muted)]">
                  Digite seu nome para adicionar à lista de convidados.
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={nomeConvidado}
                  onChange={(e) => setNomeConvidado(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      adicionarPresenca();
                    }
                  }}
                  className="eventify-input"
                />
                <button
                  onClick={adicionarPresenca}
                  className="eventify-button eventify-button-primary w-full justify-center"
                >
                  Confirmar presença
                </button>
                {mensagem && (
                  <p
                    className={`border-y px-3 py-2 text-[13px] ${
                      mensagem.tipo === "erro"
                        ? "border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] text-[color:var(--rose,#A85462)]"
                        : "border-[color:var(--green,#5B7A4F)] bg-[rgba(91,122,79,0.06)] text-[color:var(--green,#5B7A4F)]"
                    }`}
                  >
                    {mensagem.texto}
                  </p>
                )}
              </div>

              <div className="rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--gold)]">
                    Convidados
                  </p>
                  {convidados.length > 0 && (
                    <button
                      type="button"
                      onClick={exportarCSV}
                      className="rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--paper)] px-3 py-1 text-[11px] text-[color:var(--ink)] transition hover:border-[color:var(--ink)]"
                    >
                      ↓ CSV
                    </button>
                  )}
                </div>
                {convidados.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {convidados.map((nome, index) => (
                      <li
                        key={`${nome}-${index}`}
                        className="flex items-center justify-between rounded-[8px] border border-[color:var(--hairline)] bg-[color:var(--paper-2)] px-3.5 py-2.5 text-[14px] text-[color:var(--ink-2)]"
                      >
                        <span>{nome}</span>
                        {confirmandoRemocao === index ? (
                          <span className="flex items-center gap-3 text-[12.5px]">
                            <button
                              onClick={() => removerPresenca(index)}
                              className="text-[color:var(--rose,#A85462)] underline decoration-current underline-offset-2"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setConfirmandoRemocao(null)}
                              className="text-[color:var(--muted)]"
                            >
                              Cancelar
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmandoRemocao(index)}
                            className="text-[12.5px] text-[color:var(--rose,#A85462)] underline decoration-transparent underline-offset-2 hover:decoration-current"
                          >
                            Remover
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-[13px] text-[color:var(--muted)]">
                    Nenhum convidado confirmado ainda.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
