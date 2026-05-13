"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import Spinner from "@/components/Spinner";
import PlanSelector from "@/components/PlanSelector";
import { useEventos, EventoDados } from "@/hooks/useEventos";
import { buscarCEP, dataMinimaHoje, mascararCEP } from "@/lib/utils";
import { gerarSiteAPI } from "@/lib/api";
import { DEFAULT_SELECTED_PLAN, normalizePlanId } from "@/lib/planStrategy";
import type { PlanId } from "@/lib/plans";

const TIPOS_EVENTO = ["Casamento", "Aniversário", "Evento Corporativo", "Festa", "Religioso"] as const;
const TAMANHO_MAXIMO_IMAGEM = 4 * 1024 * 1024;

type Aviso = { tipo: "erro" | "aviso" | "ok"; texto: string } | null;

export default function EditarEvento() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const { eventos, isLoading, atualizarEvento, encontrarIndexPorSlug, uploadImagem } = useEventos();

  const [eventoIndex, setEventoIndex] = useState<number | null>(null);
  const [eventoId, setEventoId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [tipo, setTipo] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [imagemAtual, setImagemAtual] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(DEFAULT_SELECTED_PLAN);
  const [estilo, setEstilo] = useState("");
  const [clima, setClima] = useState("");
  const [publico, setPublico] = useState("");
  const [corPrincipal, setCorPrincipal] = useState("#B8935A");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroCep, setErroCep] = useState("");
  const [aviso, setAviso] = useState<Aviso>(null);

  useEffect(() => {
    if (isLoading || !slug) return;
    const index = encontrarIndexPorSlug(slug);
    if (index === -1) {
      setEventoIndex(-1);
      return;
    }
    const evento = eventos[index];
    setEventoIndex(index);
    setEventoId(evento.id ?? null);
    setNome(evento.nome);
    setData(evento.data);
    setTipo(evento.tipo);
    setImagemAtual(evento.imagem || "");
    setSelectedPlan(normalizePlanId(evento.selectedPlan || evento.briefing?.planoSelecionado));

    if (evento.endereco) {
      setCep(evento.endereco.cep || "");
      setRua(evento.endereco.rua || "");
      setNumero(evento.endereco.numero || "");
      setCidade(evento.endereco.cidade || "");
      setEstado(evento.endereco.estado || "");
    }

    if (evento.briefing) {
      setEstilo(evento.briefing.estilo || "");
      setClima(evento.briefing.clima || "");
      setPublico(evento.briefing.publico || "");
      setCorPrincipal(evento.briefing.corPrincipal || "#B8935A");
      setDescricao(evento.briefing.descricao || "");
    }
  }, [isLoading, slug, eventos, encontrarIndexPorSlug]);

  useEffect(() => {
    if (!imagemFile) {
      setImagemPreview("");
      return;
    }
    const url = URL.createObjectURL(imagemFile);
    setImagemPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imagemFile]);

  async function preencherCEP(valorMascarado: string) {
    setErroCep("");
    const digitos = valorMascarado.replace(/\D/g, "");
    if (digitos.length !== 8) return;
    const dados = await buscarCEP(digitos);
    if (!dados) {
      setErroCep("CEP não encontrado.");
      return;
    }
    setRua(dados.logradouro);
    setCidade(dados.localidade);
    setEstado(dados.uf);
  }

  function selecionarImagem(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
      setAviso({ tipo: "erro", texto: "Imagem muito grande. Use até 4 MB." });
      e.target.value = "";
      return;
    }
    setImagemFile(arquivo);
  }

  async function salvarEdicao(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (salvando || eventoId === null) return;
    setSalvando(true);
    setAviso(null);

    try {
      let imagemFinal = imagemAtual;
      if (imagemFile) {
        imagemFinal = await uploadImagem(imagemFile);
      }

      const briefing = {
        estilo: estilo.trim(),
        clima: clima.trim(),
        publico: publico.trim(),
        corPrincipal,
        descricao: descricao.trim(),
        planoSelecionado: selectedPlan,
      };

      const eventoAtualizado: Partial<EventoDados> = {
        nome,
        data,
        tipo,
        imagem: imagemFinal,
        selectedPlan,
        endereco: { cep, rua, numero, cidade, estado },
        briefing,
      };

      const fullEvento: EventoDados = {
        nome,
        data,
        tipo,
        imagem: imagemFinal,
        selectedPlan,
        endereco: { cep, rua, numero, cidade, estado },
        briefing,
      };
      const resultado = await gerarSiteAPI(fullEvento);
      if (resultado.siteGerado) eventoAtualizado.siteGerado = resultado.siteGerado;
      if (resultado.siteHtml) eventoAtualizado.siteHtml = resultado.siteHtml;

      await atualizarEvento(eventoId, eventoAtualizado);

      if (resultado.erro) {
        setAviso({ tipo: "erro", texto: resultado.erro });
        setSalvando(false);
        return;
      }

      if (!resultado.aiAvailable) {
        setAviso({
          tipo: "aviso",
          texto: "Atualizado em modo básico. A IA avançada está temporariamente indisponível.",
        });
        setTimeout(() => router.push("/painel"), 1500);
        return;
      }

      router.push("/painel");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar.";
      setAviso({ tipo: "erro", texto: msg });
      setSalvando(false);
    }
  }

  if (isLoading) {
    return (
      <main className="eventify-page">
        <BrandHeader />
        <div className="editorial-wrap py-32 text-center text-[color:var(--muted)]">Carregando evento...</div>
      </main>
    );
  }

  if (eventoIndex === -1 || eventoIndex === null) {
    return (
      <main className="eventify-page">
        <BrandHeader />
        <section className="editorial-narrow py-24 text-center">
          <span className="eventify-kicker">Editar evento</span>
          <h1 className="eventify-title mt-6 text-[clamp(40px,5vw,64px)]">
            Evento <em>não encontrado.</em>
          </h1>
          <p className="mt-4 text-[16px] text-[color:var(--muted)]">
            Verifique se o link está correto ou volte ao painel.
          </p>
          <Link href="/painel" className="eventify-button eventify-button-ghost mt-10">
            ← Voltar ao painel
          </Link>
        </section>
      </main>
    );
  }

  const previewExibido = imagemPreview || imagemAtual;

  return (
    <main className="eventify-page">
      <BrandHeader />
      <div className="editorial-wrap max-w-[1080px] py-16">
        <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eventify-kicker">Editar evento</span>
            <h1 className="eventify-title mt-6 text-[clamp(40px,5.2vw,68px)]">
              Atualize os <em>detalhes.</em>
            </h1>
            <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.6] text-[color:var(--muted)]">
              Ajuste o briefing e mantenha a página do cliente atualizada. A IA regenera o site automaticamente.
            </p>
          </div>
          <Link href="/painel" className="eventify-button eventify-button-ghost shrink-0">
            ← Voltar ao painel
          </Link>
        </div>

        <form
          onSubmit={salvarEdicao}
          className="rounded-[14px] border border-[color:var(--hairline)] bg-[color:var(--surface)]"
          noValidate
        >
          <div className="space-y-10 px-8 py-10 sm:px-12 sm:py-12">
            {/* Dados básicos */}
            <section className="grid gap-8">
              <SectionTitle title="Dados básicos" subtitle="Nome, data, tipo e imagem do evento." />
              <div className="grid gap-8 sm:grid-cols-2">
                <Field label="Nome do evento">
                  <input
                    type="text"
                    placeholder="Marina &amp; Rafael"
                    className="eventify-input"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Data">
                  <input
                    type="date"
                    className="eventify-input"
                    value={data}
                    min={dataMinimaHoje()}
                    onChange={(e) => setData(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <Field label="Tipo">
                  <select
                    className="eventify-input"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    {TIPOS_EVENTO.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Imagem · opcional">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-1 text-[13px] text-[color:var(--muted)] file:mr-4 file:rounded-full file:border file:border-[color:var(--hairline-2)] file:bg-[color:var(--paper-2)] file:px-4 file:py-2 file:text-[13px] file:text-[color:var(--ink)] hover:file:bg-[color:var(--paper-3)]"
                    onChange={selecionarImagem}
                  />
                </Field>
              </div>

              {previewExibido && (
                <div className="overflow-hidden rounded-[10px] border border-[color:var(--hairline)] bg-[color:var(--paper-2)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewExibido} alt="Preview do evento" className="h-56 w-full object-cover" />
                </div>
              )}
            </section>

            <hr className="border-[color:var(--hairline)]" />

            {/* Plano */}
            <PlanSelector
              value={normalizePlanId(selectedPlan)}
              onChange={setSelectedPlan}
              disabled={salvando}
              title="Plano desejado pelo cliente"
              description="A IA regenera o site com base no plano escolhido. Densidade visual e recursos mudam."
            />

            <hr className="border-[color:var(--hairline)]" />

            {/* Endereço */}
            <section className="grid gap-8">
              <SectionTitle title="Endereço" subtitle="Use o CEP para preencher automaticamente." />
              <div className="grid gap-8 sm:grid-cols-2">
                <Field label="CEP">
                  <input
                    type="text"
                    placeholder="00000-000"
                    className="eventify-input"
                    value={cep}
                    inputMode="numeric"
                    maxLength={9}
                    onChange={(e) => {
                      const mascarado = mascararCEP(e.target.value);
                      setCep(mascarado);
                      preencherCEP(mascarado);
                    }}
                    required
                  />
                  {erroCep && (
                    <p className="mt-2 text-[12.5px] text-[color:var(--rose,#A85462)]">{erroCep}</p>
                  )}
                </Field>
                <Field label="Rua">
                  <input
                    type="text"
                    placeholder="Rua / Avenida"
                    className="eventify-input"
                    value={rua}
                    onChange={(e) => setRua(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-8 sm:grid-cols-3">
                <Field label="Número">
                  <input
                    type="text"
                    placeholder="123"
                    className="eventify-input"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Cidade">
                  <input
                    type="text"
                    placeholder="Cidade"
                    className="eventify-input"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    required
                  />
                </Field>
                <Field label="UF">
                  <input
                    type="text"
                    placeholder="SP"
                    className="eventify-input uppercase"
                    value={estado}
                    maxLength={2}
                    onChange={(e) => setEstado(e.target.value.toUpperCase())}
                    required
                  />
                </Field>
              </div>
            </section>

            <hr className="border-[color:var(--hairline)]" />

            {/* Briefing */}
            <section className="grid gap-8">
              <SectionTitle
                title="Briefing criativo"
                subtitle="Quanto mais detalhes você der, mais único o site fica. A IA usa isso pra calibrar tom e visual."
              />
              <div className="grid gap-8 sm:grid-cols-2">
                <Field label="Estilo visual">
                  <input
                    type="text"
                    placeholder="Editorial · rústico · moderno..."
                    className="eventify-input"
                    value={estilo}
                    onChange={(e) => setEstilo(e.target.value)}
                    maxLength={120}
                  />
                </Field>
                <Field label="Clima">
                  <input
                    type="text"
                    placeholder="Romântico · vibrante · intimista..."
                    className="eventify-input"
                    value={clima}
                    onChange={(e) => setClima(e.target.value)}
                    maxLength={120}
                  />
                </Field>
                <Field label="Público">
                  <input
                    type="text"
                    placeholder="Família, amigos..."
                    className="eventify-input"
                    value={publico}
                    onChange={(e) => setPublico(e.target.value)}
                    maxLength={120}
                  />
                </Field>
                <Field label="Cor principal">
                  <div className="flex items-center gap-3 border-b border-[color:var(--hairline-2)] py-3">
                    <input
                      type="color"
                      value={corPrincipal}
                      onChange={(e) => setCorPrincipal(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded-md border border-[color:var(--hairline-2)] bg-transparent"
                    />
                    <input
                      type="text"
                      value={corPrincipal}
                      onChange={(e) => setCorPrincipal(e.target.value)}
                      className="flex-1 bg-transparent font-mono-tight text-[14px] uppercase outline-none"
                    />
                  </div>
                </Field>
              </div>

              <Field label="Descreva o evento em poucas frases">
                <textarea
                  placeholder="Conte como você imagina seu evento..."
                  rows={4}
                  className="eventify-input min-h-[8rem] resize-y py-3 text-[17px]"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  maxLength={1500}
                />
                <p className="mt-2 text-right text-[11px] text-[color:var(--muted)] font-mono-tight">
                  {descricao.length} / 1500
                </p>
              </Field>
            </section>

            {aviso && (
              <div
                className={`border-y px-4 py-3 text-[13.5px] ${
                  aviso.tipo === "erro"
                    ? "border-[color:var(--rose,#A85462)] bg-[rgba(168,84,98,0.06)] text-[color:var(--rose,#A85462)]"
                    : aviso.tipo === "aviso"
                      ? "border-[color:var(--gold)] bg-[var(--gold-soft)] text-[color:var(--gold-2)]"
                      : "border-[color:var(--green,#5B7A4F)] bg-[rgba(91,122,79,0.06)] text-[color:var(--green,#5B7A4F)]"
                }`}
              >
                {aviso.texto}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-[color:var(--hairline)] px-8 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-12">
            <p className="text-[12.5px] text-[color:var(--muted)]">
              Ao salvar, a IA regenera o site automaticamente.
            </p>
            <button
              type="submit"
              disabled={salvando}
              className="eventify-button eventify-button-primary min-h-12 justify-center disabled:cursor-not-allowed disabled:opacity-70"
            >
              {salvando ? (
                <>
                  <Spinner className="h-5 w-5" />
                  <span>Atualizando site...</span>
                </>
              ) : (
                <>Salvar alterações <span aria-hidden>→</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-2)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="font-display text-[26px] italic tracking-[-0.01em] text-[color:var(--ink)]">{title}</h2>
      <p className="mt-1.5 text-[13.5px] text-[color:var(--muted)]">{subtitle}</p>
    </div>
  );
}
