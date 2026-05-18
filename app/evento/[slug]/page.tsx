"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AiSiteFrame from "@/components/AiSiteFrame";
import BrandHeader from "@/components/BrandHeader";
import EditorVisualModal from "@/components/EditorVisualModal";
import ShareButtons from "@/components/ShareButtons";
import { useEventos, type EventoDados } from "@/hooks/useEventos";
import { buscarCEP, dataMinimaHoje, mascararCEP } from "@/lib/utils";
import { isPublishedStatus, getStatusLabel } from "@/lib/publication";
import { getSelectedPlanFromEvento, normalizePlanId } from "@/lib/planStrategy";
import { FONT_CATALOG, type LivePalette } from "@/lib/livePalette";

const TIPOS_EVENTO = ["Casamento", "Aniversário", "Evento Corporativo", "Festa", "Religioso"] as const;
const TAMANHO_MAXIMO_IMAGEM = 4 * 1024 * 1024;

function montarLivePaletteFromCustom(
  custom?: {
    paleta?: string[];
    fontDisplayId?: string;
    fontBodyId?: string;
  } | null
): LivePalette | null {
  if (!custom) return null;
  const tem = (custom.paleta && custom.paleta.length >= 4) || custom.fontDisplayId || custom.fontBodyId;
  if (!tem) return null;
  return {
    fundo: custom.paleta?.[0],
    superficie: custom.paleta?.[1],
    texto: custom.paleta?.[2],
    acento: custom.paleta?.[3],
    fontDisplay: custom.fontDisplayId ? FONT_CATALOG[custom.fontDisplayId] : undefined,
    fontBody: custom.fontBodyId ? FONT_CATALOG[custom.fontBodyId] : undefined,
  };
}

export default function Evento() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const {
    eventos,
    isLoading,
    confirmarPresenca,
    removerConvidado,
    encontrarIndexPorSlug,
    atualizarEvento,
  } = useEventos();

  const [nomeConvidado, setNomeConvidado] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState<number | null>(null);
  const [editando, setEditando] = useState(false);
  const [formEdit, setFormEdit] = useState<EventoDados | null>(null);
  const [salvandoEdit, setSalvandoEdit] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [convidando, setConvidando] = useState(false);
  const [editandoVisual, setEditandoVisual] = useState(false);
  const [emailsInput, setEmailsInput] = useState("");
  const [enviandoConvites, setEnviandoConvites] = useState(false);
  const [resultadoConvites, setResultadoConvites] = useState<{
    enviados: number;
    falhou: number;
    total: number;
  } | null>(null);

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

  const convidados = evento.convidados || [];
  const detalhes = evento.convidadosDetalhes || [];

  // Mapa por nome (lowercase) pra cruzar detalhe com lista de convidados
  const detalhesPorNome = new Map<string, typeof detalhes[number]>();
  for (const d of detalhes) detalhesPorNome.set(d.nome.toLowerCase(), d);

  const totalConfirmados = detalhes.filter((d) => d.status === "confirmado").length;
  const totalTalvez = detalhes.filter((d) => d.status === "talvez").length;
  const totalRecusou = detalhes.filter((d) => d.status === "recusou").length;
  const totalAcompanhantes = detalhes
    .filter((d) => d.status !== "recusou")
    .reduce((acc, d) => acc + (d.acompanhantes || 0), 0);
  const totalPessoasNoEvento = totalConfirmados + totalAcompanhantes;
  const temDetalhes = detalhes.length > 0;

  function exportarCSV() {
    if (!evento) return;
    const linhas = ["nome,status,acompanhantes,restricao_alimentar,recado,confirmado_em"];
    (evento.convidados || []).forEach((nome) => {
      const det = detalhesPorNome.get(nome.toLowerCase());
      const status = det?.status || "confirmado";
      const aco = det?.acompanhantes ?? 0;
      const rest = (det?.restricaoAlimentar || "").replace(/"/g, '""');
      const rec = (det?.recado || "").replace(/"/g, '""');
      const quando = det?.confirmadoEm || new Date().toISOString().split("T")[0];
      const escapado = `"${nome.replace(/"/g, '""')}"`;
      linhas.push(`${escapado},${status},${aco},"${rest}","${rec}",${quando}`);
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

  function abrirEdicao() {
    if (!evento) return;
    setFormEdit({ ...evento });
    setEditando(true);
  }

  async function salvarPersonalizacaoVisual(custom: {
    paleta: string[];
    fontDisplayId: string;
    fontBodyId: string;
  }) {
    if (!evento || indexEvento < 0) return;
    const briefingAtual = evento.briefing || {};
    const novoBriefing = {
      ...briefingAtual,
      customTemplate: {
        ...(briefingAtual.customTemplate || {}),
        paleta: custom.paleta,
        fontDisplayId: custom.fontDisplayId,
        fontBodyId: custom.fontBodyId,
        salvoEm: new Date().toISOString(),
      },
    };
    await atualizarEvento(indexEvento, { ...evento, briefing: novoBriefing });
    setMensagem({ tipo: "ok", texto: "Visual personalizado salvo!" });
  }

  async function enviarConvites() {
    if (!evento?.id || enviandoConvites) return;
    setEnviandoConvites(true);
    setResultadoConvites(null);
    try {
      const res = await fetch(`/api/eventos/${evento.id}/convidar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: emailsInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensagem({ tipo: "erro", texto: data.error || "Erro ao enviar convites." });
      } else {
        setResultadoConvites({ enviados: data.enviados, falhou: data.falhou, total: data.total });
        if (data.enviados > 0) {
          setEmailsInput("");
        }
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro de rede ao enviar convites." });
    } finally {
      setEnviandoConvites(false);
    }
  }

  async function publicarAgora() {
    if (!evento?.id || publicando) return;
    setPublicando(true);
    setMensagem(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: normalizePlanId(getSelectedPlanFromEvento(evento)),
          eventId: evento.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensagem({ tipo: "erro", texto: data.error || "Não foi possível iniciar o checkout." });
      } else if (data.url) {
        window.location.assign(data.url);
        return;
      } else {
        setMensagem({
          tipo: "erro",
          texto: data.message || "Configure o Stripe para ativar assinatura e publicação.",
        });
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro de rede ao iniciar checkout." });
    } finally {
      setPublicando(false);
    }
  }

  async function salvarEdicao() {
    if (!formEdit || indexEvento < 0) return;
    setSalvandoEdit(true);
    try {
      await atualizarEvento(indexEvento, formEdit);
      setEditando(false);
      setMensagem({ tipo: "ok", texto: "Dados atualizados!" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar.";
      setMensagem({ tipo: "erro", texto: msg });
    } finally {
      setSalvandoEdit(false);
    }
  }

  function onCEPChange(e: ChangeEvent<HTMLInputElement>) {
    if (!formEdit) return;
    const cep = mascararCEP(e.target.value);
    setFormEdit({ ...formEdit, endereco: { ...(formEdit.endereco || {}), cep } });
    if (cep.replace(/\D/g, "").length === 8) {
      buscarCEP(cep).then((dados) => {
        if (dados && formEdit) {
          setFormEdit((prev) =>
            prev
              ? {
                  ...prev,
                  endereco: {
                    ...(prev.endereco || {}),
                    cep,
                    rua: dados.logradouro || prev.endereco?.rua || "",
                    cidade: dados.localidade || prev.endereco?.cidade || "",
                    estado: dados.uf || prev.endereco?.estado || "",
                  },
                }
              : prev
          );
        }
      });
    }
  }

  function onImagemChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !formEdit) return;
    if (file.size > TAMANHO_MAXIMO_IMAGEM) {
      setMensagem({ tipo: "erro", texto: "Imagem muito grande (max 4MB)." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormEdit({ ...formEdit, imagem: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="eventify-page">
      <BrandHeader actions={[{ href: "/painel", label: "Painel", variant: "ghost" }]} />
      <div className="editorial-wrap py-12 sm:py-16">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eventify-kicker">Página do evento</span>
            <h1 className="eventify-title mt-6 text-[clamp(40px,5.4vw,72px)]">{evento.nome}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={abrirEdicao} className="eventify-button eventify-button-ghost">
              ✎ Editar dados
            </button>
            {evento.siteHtml && (
              <button
                onClick={() => setEditandoVisual(true)}
                className="eventify-button eventify-button-ghost"
              >
                🎨 Personalizar visual
              </button>
            )}
            {isPublishedStatus(evento.status) && (
              <>
                <button
                  onClick={() => {
                    setConvidando(true);
                    setResultadoConvites(null);
                  }}
                  className="eventify-button eventify-button-ghost"
                >
                  📧 Convidar por e-mail
                </button>
                <Link href={`/cliente/${slug}`} className="eventify-button eventify-button-primary">
                  Ver página pública
                </Link>
              </>
            )}
          </div>
        </div>

        {/* STATUS + CTA DE PUBLICAÇÃO */}
        <div
          className={`mb-8 flex flex-col gap-4 rounded-[12px] border p-5 sm:flex-row sm:items-center sm:justify-between ${
            isPublishedStatus(evento.status)
              ? "border-[color:var(--green,#5B7A4F)]/30 bg-[rgba(91,122,79,0.05)]"
              : "border-[color:var(--gold)] bg-[var(--gold-soft)]"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                isPublishedStatus(evento.status)
                  ? "bg-[color:var(--green,#5B7A4F)]"
                  : "bg-[color:var(--gold)]"
              }`}
            />
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Status
              </p>
              <p className="font-display text-[20px] italic text-[color:var(--ink)]">
                {getStatusLabel(evento.status)}
                {isPublishedStatus(evento.status) && " — link ativo para convidados"}
                {evento.status === "preview" && " — falta publicar"}
                {evento.status === "draft" && " — rascunho, ainda não pronto"}
              </p>
            </div>
          </div>
          {!isPublishedStatus(evento.status) && (
            <button
              onClick={publicarAgora}
              disabled={publicando}
              className="eventify-button eventify-button-primary text-[15px]"
            >
              {publicando ? "Abrindo checkout..." : "✦ Assinar & Publicar"}
            </button>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
          {/* COLUNA ESQUERDA — Preview do site */}
          <section className="space-y-4">
            <h2 className="font-display text-[20px] italic text-[color:var(--ink)]">
              Prévia do site dos convidados
            </h2>
            {evento.siteHtml ? (
              <div className="overflow-hidden rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--paper)]">
                <AiSiteFrame
                  html={evento.siteHtml}
                  titulo={evento.nome}
                  paletteOverride={montarLivePaletteFromCustom(evento.briefing?.customTemplate)}
                />
              </div>
            ) : (
              <div className="rounded-[10px] border border-dashed border-[color:var(--hairline)] bg-[color:var(--paper-2)] p-12 text-center text-[color:var(--muted)]">
                <p>Site ainda não foi gerado.</p>
                <Link href="/painel" className="eventify-button eventify-button-ghost mt-4">
                  Voltar ao painel
                </Link>
              </div>
            )}
          </section>

          {/* COLUNA DIREITA — Convidados e compartilhar */}
          <aside className="space-y-6">
            <div className="rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--paper)] p-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--gold)]">
                Compartilhar com convidados
              </p>
              <ShareButtons
                url={typeof window !== "undefined" ? `${window.location.origin}/cliente/${slug}` : ""}
                titulo={`Convite: ${evento.nome}`}
                className="mt-4"
              />
            </div>

            <div className="rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--paper)] p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-[24px] italic tracking-[-0.01em] text-[color:var(--ink)]">
                  Lista de RSVPs
                </h2>
                <span className="font-mono-tight text-[13px] text-[color:var(--muted)]">
                  {convidados.length}
                </span>
              </div>

              {/* Resumo agregado */}
              {temDetalhes && (
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-[8px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-3 text-[12px]">
                  <div>
                    <span className="text-[color:var(--green,#5B7A4F)]">✓ Vão:</span>{" "}
                    <strong className="text-[color:var(--ink)]">{totalConfirmados}</strong>
                    {totalAcompanhantes > 0 && (
                      <span className="text-[color:var(--muted)]"> (+{totalAcompanhantes} aco.)</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[color:var(--gold-2)]">? Talvez:</span>{" "}
                    <strong className="text-[color:var(--ink)]">{totalTalvez}</strong>
                  </div>
                  <div>
                    <span className="text-[color:var(--rose,#A85462)]">✗ Não vão:</span>{" "}
                    <strong className="text-[color:var(--ink)]">{totalRecusou}</strong>
                  </div>
                  <div>
                    <span className="text-[color:var(--muted)]">Total no evento:</span>{" "}
                    <strong className="text-[color:var(--ink)]">{totalPessoasNoEvento}</strong>
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-3">
                <input
                  type="text"
                  placeholder="Adicionar convidado manualmente"
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
                  className="eventify-button eventify-button-ghost w-full justify-center"
                >
                  + Adicionar
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

              <div className="mt-5">
                {convidados.length > 0 && (
                  <div className="mb-3 flex justify-end">
                    <button
                      type="button"
                      onClick={exportarCSV}
                      className="rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--paper)] px-3 py-1 text-[11px] text-[color:var(--ink)] transition hover:border-[color:var(--ink)]"
                    >
                      ↓ Baixar CSV
                    </button>
                  </div>
                )}
                {convidados.length > 0 ? (
                  <ul className="space-y-2">
                    {convidados.map((nome, index) => {
                      const det = detalhesPorNome.get(nome.toLowerCase());
                      const statusBadge =
                        det?.status === "talvez"
                          ? { txt: "talvez", cls: "bg-[var(--gold-soft)] text-[color:var(--gold-2)]" }
                          : det?.status === "recusou"
                            ? { txt: "não vai", cls: "bg-[rgba(168,84,98,0.1)] text-[color:var(--rose,#A85462)]" }
                            : { txt: "vai", cls: "bg-[rgba(91,122,79,0.1)] text-[color:var(--green,#5B7A4F)]" };
                      return (
                      <li
                        key={`${nome}-${index}`}
                        className="rounded-[8px] border border-[color:var(--hairline)] bg-[color:var(--paper-2)] px-3.5 py-2.5 text-[14px] text-[color:var(--ink-2)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <span className="truncate">{nome}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${statusBadge.cls}`}>
                              {statusBadge.txt}
                            </span>
                            {det && det.acompanhantes > 0 && (
                              <span className="text-[11.5px] text-[color:var(--muted)]">
                                +{det.acompanhantes}
                              </span>
                            )}
                          </div>
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
                            className="text-[12.5px] text-[color:var(--rose,#A85462)] underline decoration-transparent underline-offset-2 hover:decoration-current shrink-0"
                          >
                            Remover
                          </button>
                        )}
                        </div>
                        {det?.restricaoAlimentar && (
                          <p className="mt-1.5 text-[11.5px] text-[color:var(--muted)]">
                            🍽 {det.restricaoAlimentar}
                          </p>
                        )}
                        {det?.recado && (
                          <p className="mt-1 italic text-[11.5px] text-[color:var(--muted)]">
                            💬 &ldquo;{det.recado}&rdquo;
                          </p>
                        )}
                      </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-[13px] text-[color:var(--muted)]">
                    Nenhum convidado confirmado ainda. Compartilhe o link acima para começar a receber presenças.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {editando && formEdit && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => !salvandoEdit && setEditando(false)}
        >
          <div
            className="mt-12 w-full max-w-2xl rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="eventify-kicker">Editar evento</span>
                <h2 className="mt-2 font-display text-[32px] italic text-[color:var(--ink)]">
                  Dados básicos
                </h2>
              </div>
              <button
                onClick={() => !salvandoEdit && setEditando(false)}
                className="text-[20px] text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] uppercase tracking-[0.14em] text-[color:var(--muted)] mb-1.5">
                  Nome do evento
                </label>
                <input
                  type="text"
                  value={formEdit.nome}
                  onChange={(e) => setFormEdit({ ...formEdit, nome: e.target.value })}
                  className="eventify-input"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.14em] text-[color:var(--muted)] mb-1.5">
                    Tipo
                  </label>
                  <select
                    value={formEdit.tipo}
                    onChange={(e) => setFormEdit({ ...formEdit, tipo: e.target.value })}
                    className="eventify-input"
                  >
                    {TIPOS_EVENTO.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.14em] text-[color:var(--muted)] mb-1.5">
                    Data
                  </label>
                  <input
                    type="date"
                    value={formEdit.data || ""}
                    min={dataMinimaHoje()}
                    onChange={(e) => setFormEdit({ ...formEdit, data: e.target.value })}
                    className="eventify-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-[0.14em] text-[color:var(--muted)] mb-1.5">
                  CEP
                </label>
                <input
                  type="text"
                  value={formEdit.endereco?.cep || ""}
                  onChange={onCEPChange}
                  placeholder="00000-000"
                  className="eventify-input"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.14em] text-[color:var(--muted)] mb-1.5">
                    Rua
                  </label>
                  <input
                    type="text"
                    value={formEdit.endereco?.rua || ""}
                    onChange={(e) =>
                      setFormEdit({
                        ...formEdit,
                        endereco: { ...(formEdit.endereco || {}), rua: e.target.value },
                      })
                    }
                    className="eventify-input"
                  />
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.14em] text-[color:var(--muted)] mb-1.5">
                    Número
                  </label>
                  <input
                    type="text"
                    value={formEdit.endereco?.numero || ""}
                    onChange={(e) =>
                      setFormEdit({
                        ...formEdit,
                        endereco: { ...(formEdit.endereco || {}), numero: e.target.value },
                      })
                    }
                    className="eventify-input"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.14em] text-[color:var(--muted)] mb-1.5">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formEdit.endereco?.cidade || ""}
                    onChange={(e) =>
                      setFormEdit({
                        ...formEdit,
                        endereco: { ...(formEdit.endereco || {}), cidade: e.target.value },
                      })
                    }
                    className="eventify-input"
                  />
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.14em] text-[color:var(--muted)] mb-1.5">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formEdit.endereco?.estado || ""}
                    maxLength={2}
                    onChange={(e) =>
                      setFormEdit({
                        ...formEdit,
                        endereco: { ...(formEdit.endereco || {}), estado: e.target.value.toUpperCase() },
                      })
                    }
                    className="eventify-input uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-[0.14em] text-[color:var(--muted)] mb-1.5">
                  Imagem (máx 4MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImagemChange}
                  className="block w-full text-[13px] text-[color:var(--ink-2)] file:mr-3 file:rounded-md file:border file:border-[color:var(--hairline)] file:bg-[color:var(--paper)] file:px-3 file:py-1.5 file:text-[12px] file:text-[color:var(--ink)]"
                />
                {formEdit.imagem && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formEdit.imagem} alt="" className="mt-3 h-32 rounded-md object-cover" />
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setEditando(false)}
                disabled={salvandoEdit}
                className="eventify-button eventify-button-ghost"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicao}
                disabled={salvandoEdit}
                className="eventify-button eventify-button-primary"
              >
                {salvandoEdit ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDITOR VISUAL */}
      {editandoVisual && (
        <EditorVisualModal
          siteHtml={evento.siteHtml || null}
          nomeEvento={evento.nome}
          initialCustom={evento.briefing?.customTemplate}
          onSalvar={salvarPersonalizacaoVisual}
          onClose={() => setEditandoVisual(false)}
        />
      )}

      {/* MODAL DE CONVITES POR E-MAIL */}
      {convidando && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => !enviandoConvites && setConvidando(false)}
        >
          <div
            className="mt-12 w-full max-w-2xl rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="eventify-kicker">Convidar por e-mail</span>
                <h2 className="mt-2 font-display text-[32px] italic text-[color:var(--ink)]">
                  Cola a lista de e-mails
                </h2>
                <p className="mt-2 text-[13.5px] text-[color:var(--muted)]">
                  Cada convidado recebe um e-mail com o link da página pra confirmar presença. Máximo 50 por envio.
                </p>
              </div>
              <button
                onClick={() => !enviandoConvites && setConvidando(false)}
                className="text-[20px] text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <textarea
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              placeholder="maria@email.com&#10;joao@email.com, ana@email.com&#10;pedro@email.com"
              rows={8}
              className="w-full rounded-[8px] border border-[color:var(--hairline)] bg-[color:var(--paper)] p-3 text-[14px] text-[color:var(--ink)] outline-none transition focus:border-[color:var(--ink)] font-mono-tight"
            />
            <p className="mt-2 text-[12px] text-[color:var(--muted)]">
              Separa por vírgula, espaço ou linha nova. Duplicados são ignorados automaticamente.
            </p>

            {resultadoConvites && (
              <div
                className={`mt-4 rounded-md border px-3 py-2.5 text-[13px] ${
                  resultadoConvites.falhou === 0
                    ? "border-[color:var(--green,#5B7A4F)] bg-[rgba(91,122,79,0.06)] text-[color:var(--green,#5B7A4F)]"
                    : "border-[color:var(--gold)] bg-[var(--gold-soft)] text-[color:var(--ink-2)]"
                }`}
              >
                ✓ {resultadoConvites.enviados} de {resultadoConvites.total} enviados
                {resultadoConvites.falhou > 0 && ` · ${resultadoConvites.falhou} falharam`}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConvidando(false)}
                disabled={enviandoConvites}
                className="eventify-button eventify-button-ghost"
              >
                Fechar
              </button>
              <button
                onClick={enviarConvites}
                disabled={enviandoConvites || !emailsInput.trim()}
                className="eventify-button eventify-button-primary"
              >
                {enviandoConvites ? "Enviando..." : "Enviar convites →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
