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
  const [corPrincipal, setCorPrincipal] = useState("#8847e7");
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
      setCorPrincipal(evento.briefing.corPrincipal || "#8847e7");
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
        <div className="eventify-section text-center eventify-muted">Carregando evento...</div>
      </main>
    );
  }

  if (eventoIndex === -1 || eventoIndex === null) {
    return (
      <main className="eventify-page">
        <BrandHeader />
        <section className="eventify-section flex justify-center">
          <div className="eventify-card max-w-xl p-10 text-center">
            <span className="eventify-kicker">Editar evento</span>
            <h1 className="eventify-title mt-5 text-4xl">Evento não encontrado</h1>
            <p className="eventify-muted mt-3">Verifique se o link está correto ou volte ao painel.</p>
            <Link href="/painel" className="eventify-button eventify-button-ghost mt-7">
              Voltar ao painel
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const previewExibido = imagemPreview || imagemAtual;

  return (
    <main className="eventify-page">
      <BrandHeader />
      <div className="eventify-section max-w-5xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eventify-kicker">✦ Editar evento</span>
            <h1 className="eventify-title mt-6 text-5xl">Atualize os detalhes</h1>
            <p className="eventify-muted mt-4 text-lg">Ajuste o briefing e mantenha a página do cliente atualizada.</p>
          </div>
          <Link href="/painel" className="eventify-button eventify-button-ghost">
            Voltar ao painel
          </Link>
        </div>

        <form onSubmit={salvarEdicao} className="eventify-card grid gap-8 p-8" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <input type="text" placeholder="Nome do evento" className="eventify-input" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <input type="date" className="eventify-input" value={data} min={dataMinimaHoje()} onChange={(e) => setData(e.target.value)} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <select className="eventify-input" value={tipo} onChange={(e) => setTipo(e.target.value)} required>
              <option value="">Selecione o tipo</option>
              {TIPOS_EVENTO.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="rounded-2xl border border-[#e8e3f1] bg-[#faf9ff] p-4">
              <p className="text-sm font-black text-[#090814]">Imagem do evento</p>
              <p className="eventify-muted mt-2 text-sm">Atualize a imagem ou mantenha a atual.</p>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-4 w-full text-sm text-[#5f5a72]" onChange={selecionarImagem} />
            </div>
          </div>

          <PlanSelector
            value={normalizePlanId(selectedPlan)}
            onChange={setSelectedPlan}
            disabled={salvando}
            title="Plano desejado pelo cliente"
            description="A IA regenera o site com base no plano escolhido. O resultado muda em densidade, visual e recursos."
          />

          {previewExibido && (
            <div className="overflow-hidden rounded-2xl border border-[#e8e3f1] bg-[#f1eef8] shadow-lg">
              <img src={previewExibido} alt="Preview do evento" className="h-56 w-full object-cover" />
            </div>
          )}

          <div className="space-y-4 rounded-2xl border border-[#e8e3f1] bg-[#faf9ff] p-6">
            <div>
              <h2 className="text-xl font-black text-[#090814]">Endereço</h2>
              <p className="eventify-muted mt-2 text-sm">Use o CEP para preencher automaticamente os dados do endereço.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  placeholder="00000-000"
                  className="eventify-input w-full"
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
                {erroCep && <p className="mt-2 text-sm font-semibold text-rose-500">{erroCep}</p>}
              </div>
              <input type="text" placeholder="Rua" className="eventify-input" value={rua} onChange={(e) => setRua(e.target.value)} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <input type="text" placeholder="Número" className="eventify-input" value={numero} onChange={(e) => setNumero(e.target.value)} required />
              <input type="text" placeholder="Cidade" className="eventify-input" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
              <input type="text" placeholder="Estado" className="eventify-input uppercase" value={estado} maxLength={2} onChange={(e) => setEstado(e.target.value.toUpperCase())} required />
            </div>
          </div>

          <div className="space-y-5 rounded-2xl border border-[#e8e3f1] bg-gradient-to-br from-[#faf5ff] via-white to-[#fef3ff] p-6">
            <div>
              <h2 className="text-xl font-black text-[#090814]">
                ✨ Briefing criativo <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">para a IA</span>
              </h2>
              <p className="eventify-muted mt-2 text-sm">
                Quanto mais detalhes você der, mais único o site fica.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input type="text" placeholder="Estilo visual" className="eventify-input" value={estilo} onChange={(e) => setEstilo(e.target.value)} maxLength={120} />
              <input type="text" placeholder="Clima do evento" className="eventify-input" value={clima} onChange={(e) => setClima(e.target.value)} maxLength={120} />
              <input type="text" placeholder="Público" className="eventify-input" value={publico} onChange={(e) => setPublico(e.target.value)} maxLength={120} />
              <div className="flex items-center gap-3 rounded-2xl border border-[#e8e3f1] bg-white px-4">
                <span className="eventify-muted text-sm">Cor principal</span>
                <input type="color" value={corPrincipal} onChange={(e) => setCorPrincipal(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent" />
                <input type="text" value={corPrincipal} onChange={(e) => setCorPrincipal(e.target.value)} className="flex-1 bg-transparent font-mono text-sm uppercase outline-none" />
              </div>
            </div>

            <textarea placeholder="Conte como você imagina seu evento..." rows={4} className="eventify-input min-h-32 resize-y py-3" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={1500} />
            <p className="eventify-muted text-right text-xs">{descricao.length}/1500</p>
          </div>

          {aviso && (
            <div
              className={`rounded-2xl border p-4 text-sm font-semibold ${
                aviso.tipo === "erro"
                  ? "border-rose-200 bg-rose-50 text-rose-600"
                  : aviso.tipo === "aviso"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {aviso.texto}
            </div>
          )}

          <button
            type="submit"
            disabled={salvando}
            className="eventify-button eventify-button-primary min-h-14 justify-center text-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {salvando ? (
              <>
                <Spinner className="h-5 w-5" />
                <span>Atualizando site...</span>
              </>
            ) : (
              <>Salvar alterações →</>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
