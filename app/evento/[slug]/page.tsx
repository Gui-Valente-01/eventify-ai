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
        <div className="eventify-section text-center eventify-muted">Carregando evento...</div>
      </main>
    );
  }

  const indexEvento = encontrarIndexPorSlug(slug);
  const evento = indexEvento !== -1 ? eventos[indexEvento] : null;

  if (!evento) {
    return (
      <main className="eventify-page">
        <BrandHeader actions={[{ href: "/painel", label: "Entrar", variant: "ghost" }]} />
        <div className="eventify-section">
          <div className="eventify-card mx-auto max-w-4xl p-10 text-center">
            <p className="text-xl font-black text-[#090814]">Evento não encontrado.</p>
            <Link href="/painel" className="eventify-button eventify-button-ghost mt-6">
              Voltar ao painel
            </Link>
          </div>
        </div>
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
    ? [evento.endereco.rua, evento.endereco.numero, evento.endereco.cidade, evento.endereco.estado].filter(Boolean).join(", ")
    : "";
  const mapaURL = enderecoCompleto ? `https://www.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&output=embed` : "";
  const convidados = evento.convidados || [];

  return (
    <main className="eventify-page">
      <BrandHeader actions={[{ href: "/painel", label: "Entrar", variant: "ghost" }]} />
      <div className="eventify-section">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eventify-kicker">✦ Página do evento</span>
            <h1 className="eventify-title mt-6 text-5xl">{evento.nome}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/painel" className="eventify-button eventify-button-ghost">Voltar ao painel</Link>
            <Link href={`/cliente/${slug}`} className="eventify-button eventify-button-primary">Página do cliente</Link>
            <Link href={`/promocional/${slug}`} className="eventify-button eventify-button-ghost">Ver site promocional</Link>
          </div>
        </div>
        <div className="eventify-card overflow-hidden p-1">
          <div className="rounded-[1.25rem] bg-white p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
              <section className="space-y-6">
                <div className="overflow-hidden rounded-2xl bg-[#f1eef8] shadow-sm">
                  {evento.imagem ? (
                    <img src={evento.imagem} alt={evento.nome} className="h-72 w-full object-cover" />
                  ) : (
                    <div className="eventify-muted flex h-72 items-center justify-center bg-[#f1eef8]">
                      <span className="text-lg">Sem imagem disponível</span>
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-[#e8e3f1] bg-[#faf9ff] p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="inline-flex rounded-full bg-[#f0ddff] px-4 py-2 text-sm font-bold text-[#8847e7]">{evento.tipo}</span>
                    <span className="eventify-muted text-sm">{convidados.length} convidados</span>
                  </div>
                  <div className="eventify-muted mt-6 space-y-3">
                    <p className="text-lg"><strong>Data:</strong> {evento.data}</p>
                    {enderecoCompleto && <p className="text-lg"><strong>Endereço:</strong> {enderecoCompleto}</p>}
                  </div>
                  <div className="mt-6 border-t border-[#e8e3f1] pt-5">
                    <p className="eventify-muted text-sm font-bold uppercase tracking-[0.22em]">Compartilhar com convidados</p>
                    <ShareButtons
                      url={typeof window !== "undefined" ? `${window.location.origin}/cliente/${slug}` : ""}
                      titulo={`Convite: ${evento.nome}`}
                      className="mt-4"
                    />
                  </div>
                </div>
                {mapaURL && (
                  <div className="overflow-hidden rounded-2xl border border-[#e8e3f1] shadow-sm">
                    <iframe src={mapaURL} width="100%" height="320" style={{ border: 0 }} loading="lazy" />
                  </div>
                )}
              </section>
              <aside className="space-y-6 rounded-2xl border border-[#e8e3f1] bg-[#faf9ff] p-6 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-[#090814]">Confirmar presença</h2>
                  <p className="eventify-muted mt-2 text-sm">Digite seu nome para adicionar à lista de convidados.</p>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Digite seu nome"
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
                  <button onClick={adicionarPresenca} className="eventify-button eventify-button-primary w-full">
                    Confirmar presença
                  </button>
                  {mensagem && (
                    <p className={`text-sm font-semibold ${mensagem.tipo === "erro" ? "text-rose-500" : "text-emerald-600"}`}>
                      {mensagem.texto}
                    </p>
                  )}
                </div>
                <div className="rounded-2xl border border-[#e8e3f1] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="eventify-muted text-sm font-bold uppercase tracking-[0.22em]">Convidados</p>
                    {convidados.length > 0 && (
                      <button
                        type="button"
                        onClick={exportarCSV}
                        className="rounded-lg border border-[#e8e3f1] bg-[#faf9ff] px-3 py-1 text-xs font-bold text-[#8847e7] transition hover:bg-[#f0ddff]"
                      >
                        ⬇ CSV
                      </button>
                    )}
                  </div>
                  {convidados.length > 0 ? (
                    <ul className="eventify-muted mt-4 space-y-3">
                      {convidados.map((nome, index) => (
                        <li key={`${nome}-${index}`} className="flex items-center justify-between rounded-2xl border border-[#e8e3f1] bg-[#faf9ff] px-4 py-3">
                          <span>{nome}</span>
                          {confirmandoRemocao === index ? (
                            <span className="flex items-center gap-2">
                              <button onClick={() => removerPresenca(index)} className="text-sm font-bold text-rose-600">Confirmar</button>
                              <button onClick={() => setConfirmandoRemocao(null)} className="text-sm font-semibold text-[#5f5a72]">Cancelar</button>
                            </span>
                          ) : (
                            <button onClick={() => setConfirmandoRemocao(index)} className="text-sm font-semibold text-rose-500">Remover</button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="eventify-muted mt-4 text-sm">Nenhum convidado confirmado ainda.</p>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
