"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import Spinner from "@/components/Spinner";
import { useEventos, EventoDados } from "@/hooks/useEventos";
import { buscarCEP, dataMinimaHoje, gerarSlug, mascararCEP } from "@/lib/utils";
import { gerarSiteAPI } from "@/lib/api";
import { TIPOS_EVENTO, getBriefingSchema } from "@/lib/eventBriefings";

const TAMANHO_MAXIMO_IMAGEM = 4 * 1024 * 1024;
const STEPS = ["Sobre", "Local", "Estilo", "Detalhes"] as const;

type Aviso = { tipo: "erro" | "aviso" | "ok"; texto: string } | null;

export default function NovoEvento() {
  const router = useRouter();
  const { adicionarEvento, uploadImagem } = useEventos();

  const [step, setStep] = useState(0);

  // Etapa 1
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [data, setData] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState("");

  // Etapa 2
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [erroCep, setErroCep] = useState("");

  // Etapa 3
  const [estilo, setEstilo] = useState("");
  const [clima, setClima] = useState("");
  const [publico, setPublico] = useState("");
  const [corPrincipal, setCorPrincipal] = useState("#8847e7");
  const [descricao, setDescricao] = useState("");

  // Etapa 4 — campos dinâmicos
  const [detalhes, setDetalhes] = useState<Record<string, string>>({});

  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);

  const schema = useMemo(() => (tipo ? getBriefingSchema(tipo) : null), [tipo]);

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

  function validarStep(idx: number): string | null {
    if (idx === 0) {
      if (!nome.trim()) return "Informe o nome do evento.";
      if (!tipo) return "Selecione o tipo de evento.";
      if (!data) return "Informe a data do evento.";
    }
    if (idx === 1) {
      if (cep.replace(/\D/g, "").length !== 8) return "CEP precisa ter 8 dígitos.";
      if (!rua.trim() || !numero.trim() || !cidade.trim() || !estado.trim()) {
        return "Preencha o endereço completo.";
      }
    }
    if (idx === 3 && schema) {
      for (const campo of schema.campos) {
        if (campo.required && !detalhes[campo.id]?.trim()) {
          return `Preencha: ${campo.label}.`;
        }
      }
    }
    return null;
  }

  function avancar() {
    const erro = validarStep(step);
    if (erro) {
      setAviso({ tipo: "erro", texto: erro });
      return;
    }
    setAviso(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function voltar() {
    setAviso(null);
    setStep((s) => Math.max(0, s - 1));
  }

  async function criarEvento() {
    if (salvando) return;
    for (let i = 0; i < STEPS.length; i++) {
      const erro = validarStep(i);
      if (erro) {
        setAviso({ tipo: "erro", texto: erro });
        setStep(i);
        return;
      }
    }

    setAviso(null);
    setSalvando(true);

    try {
      let imagemUrl = "";
      if (imagemFile) {
        imagemUrl = await uploadImagem(imagemFile);
      }

      const novoEvento: EventoDados = {
        nome: nome.trim(),
        data,
        tipo,
        status: "preview",
        imagem: imagemUrl,
        endereco: { cep, rua, numero, cidade, estado },
        briefing: {
          estilo: estilo.trim(),
          clima: clima.trim(),
          publico: publico.trim(),
          corPrincipal,
          descricao: descricao.trim(),
          detalhes,
        },
        convidados: [],
      };

      const resultado = await gerarSiteAPI(novoEvento);
      if (resultado.siteGerado) novoEvento.siteGerado = resultado.siteGerado;
      if (resultado.siteHtml) novoEvento.siteHtml = resultado.siteHtml;

      const salvo = await adicionarEvento(novoEvento);

      if (!resultado.aiAvailable && !resultado.erro) {
        setAviso({
          tipo: "aviso",
          texto:
            "Site criado com agente local. Configure ANTHROPIC_API_KEY para conteúdo gerado por Claude.",
        });
        setTimeout(() => router.push(`/evento/${gerarSlug(salvo.nome)}/pronto`), 1500);
        return;
      }

      router.push(`/evento/${gerarSlug(salvo.nome)}/pronto`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao criar evento.";
      setAviso({ tipo: "erro", texto: msg });
      setSalvando(false);
    }
  }

  return (
    <main className="eventify-page">
      <BrandHeader />
      <div className="eventify-section max-w-5xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eventify-kicker">✦ Novo evento</span>
            <h1 className="eventify-title mt-6 text-5xl">Vamos montar seu site</h1>
            <p className="eventify-muted mt-4 text-lg">
              Em 4 passos a IA Claude monta um site completo, com conteúdo escrito sob medida.
            </p>
          </div>
          <Link href="/painel" className="eventify-button eventify-button-ghost">
            Voltar ao painel
          </Link>
        </div>

        <Stepper step={step} />

        <div className="eventify-card grid gap-8 p-8">
          {step === 0 && (
            <StepSobre
              nome={nome}
              setNome={setNome}
              tipo={tipo}
              setTipo={setTipo}
              data={data}
              setData={setData}
              imagemPreview={imagemPreview}
              selecionarImagem={selecionarImagem}
            />
          )}

          {step === 1 && (
            <StepLocal
              cep={cep}
              setCep={setCep}
              preencherCEP={preencherCEP}
              erroCep={erroCep}
              rua={rua}
              setRua={setRua}
              numero={numero}
              setNumero={setNumero}
              cidade={cidade}
              setCidade={setCidade}
              estado={estado}
              setEstado={setEstado}
            />
          )}

          {step === 2 && (
            <StepEstilo
              estilo={estilo}
              setEstilo={setEstilo}
              clima={clima}
              setClima={setClima}
              publico={publico}
              setPublico={setPublico}
              corPrincipal={corPrincipal}
              setCorPrincipal={setCorPrincipal}
              descricao={descricao}
              setDescricao={setDescricao}
            />
          )}

          {step === 3 && (
            <StepDetalhes
              schema={schema}
              detalhes={detalhes}
              setDetalhes={setDetalhes}
            />
          )}

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

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={voltar}
              disabled={step === 0 || salvando}
              className="eventify-button eventify-button-ghost disabled:opacity-50"
            >
              ← Voltar
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={avancar}
                className="eventify-button eventify-button-primary min-h-12 justify-center"
              >
                Próximo →
              </button>
            ) : (
              <button
                type="button"
                onClick={criarEvento}
                disabled={salvando}
                className="eventify-button eventify-button-primary min-h-14 justify-center text-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                {salvando ? (
                  <>
                    <Spinner className="h-5 w-5" />
                    <span>Gerando site com Claude...</span>
                  </>
                ) : (
                  <>Gerar site →</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="mb-8 flex items-center gap-3 overflow-x-auto">
      {STEPS.map((label, i) => {
        const ativo = i === step;
        const concluido = i < step;
        return (
          <div key={label} className="flex flex-1 items-center gap-3 min-w-[120px]">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                concluido
                  ? "bg-emerald-500 text-white"
                  : ativo
                    ? "bg-[#8847e7] text-white"
                    : "bg-[#e8e3f1] text-[#5f5a72]"
              }`}
            >
              {concluido ? "✓" : i + 1}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-bold ${
                  ativo ? "text-[#090814]" : "text-[#5f5a72]"
                }`}
              >
                {label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden h-px flex-1 bg-[#e8e3f1] sm:block" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepSobre(props: {
  nome: string;
  setNome: (v: string) => void;
  tipo: string;
  setTipo: (v: string) => void;
  data: string;
  setData: (v: string) => void;
  imagemPreview: string;
  selecionarImagem: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-black text-[#090814]">Sobre o evento</h2>
        <p className="eventify-muted mt-2 text-sm">Comece pelos dados básicos.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Nome do evento"
          className="eventify-input"
          value={props.nome}
          onChange={(e) => props.setNome(e.target.value)}
          maxLength={120}
        />
        <input
          type="date"
          className="eventify-input"
          value={props.data}
          min={dataMinimaHoje()}
          onChange={(e) => props.setData(e.target.value)}
        />
      </div>

      <select
        className="eventify-input"
        value={props.tipo}
        onChange={(e) => props.setTipo(e.target.value)}
      >
        <option value="">Selecione o tipo de evento</option>
        {TIPOS_EVENTO.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <div className="rounded-2xl border border-[#e8e3f1] bg-[#faf9ff] p-4">
        <p className="text-sm font-black text-[#090814]">Imagem do evento (opcional)</p>
        <p className="eventify-muted mt-2 text-sm">JPG, PNG ou WebP, até 4 MB.</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-4 w-full text-sm text-[#5f5a72]"
          onChange={props.selecionarImagem}
        />
      </div>

      {props.imagemPreview && (
        <div className="overflow-hidden rounded-2xl border border-[#e8e3f1] bg-[#f1eef8] shadow-lg">
          <img
            src={props.imagemPreview}
            alt="Preview do evento"
            className="h-56 w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}

function StepLocal(props: {
  cep: string;
  setCep: (v: string) => void;
  preencherCEP: (v: string) => void;
  erroCep: string;
  rua: string;
  setRua: (v: string) => void;
  numero: string;
  setNumero: (v: string) => void;
  cidade: string;
  setCidade: (v: string) => void;
  estado: string;
  setEstado: (v: string) => void;
}) {
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-black text-[#090814]">Onde vai acontecer?</h2>
        <p className="eventify-muted mt-2 text-sm">
          Digite o CEP que a gente preenche o resto.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <input
            type="text"
            placeholder="00000-000"
            className="eventify-input w-full"
            value={props.cep}
            inputMode="numeric"
            maxLength={9}
            onChange={(e) => {
              const mascarado = mascararCEP(e.target.value);
              props.setCep(mascarado);
              props.preencherCEP(mascarado);
            }}
          />
          {props.erroCep && (
            <p className="mt-2 text-sm font-semibold text-rose-500">{props.erroCep}</p>
          )}
        </div>
        <input
          type="text"
          placeholder="Rua"
          className="eventify-input"
          value={props.rua}
          onChange={(e) => props.setRua(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <input
          type="text"
          placeholder="Número"
          className="eventify-input"
          value={props.numero}
          onChange={(e) => props.setNumero(e.target.value)}
        />
        <input
          type="text"
          placeholder="Cidade"
          className="eventify-input"
          value={props.cidade}
          onChange={(e) => props.setCidade(e.target.value)}
        />
        <input
          type="text"
          placeholder="Estado"
          className="eventify-input uppercase"
          value={props.estado}
          maxLength={2}
          onChange={(e) => props.setEstado(e.target.value.toUpperCase())}
        />
      </div>
    </div>
  );
}

function StepEstilo(props: {
  estilo: string;
  setEstilo: (v: string) => void;
  clima: string;
  setClima: (v: string) => void;
  publico: string;
  setPublico: (v: string) => void;
  corPrincipal: string;
  setCorPrincipal: (v: string) => void;
  descricao: string;
  setDescricao: (v: string) => void;
}) {
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-black text-[#090814]">
          ✨ Briefing criativo
          <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
            para a IA
          </span>
        </h2>
        <p className="eventify-muted mt-2 text-sm">
          A IA usa isso pra escolher cores, tipografia e tom do texto.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Estilo visual (ex: rústico vintage, moderno minimalista)"
          className="eventify-input"
          value={props.estilo}
          onChange={(e) => props.setEstilo(e.target.value)}
          maxLength={120}
        />
        <input
          type="text"
          placeholder="Clima do evento (ex: romântico, vibrante, intimista)"
          className="eventify-input"
          value={props.clima}
          onChange={(e) => props.setClima(e.target.value)}
          maxLength={120}
        />
        <input
          type="text"
          placeholder="Público (ex: família e amigos próximos)"
          className="eventify-input"
          value={props.publico}
          onChange={(e) => props.setPublico(e.target.value)}
          maxLength={120}
        />
        <div className="flex items-center gap-3 rounded-2xl border border-[#e8e3f1] bg-white px-4">
          <span className="eventify-muted text-sm">Cor principal</span>
          <input
            type="color"
            value={props.corPrincipal}
            onChange={(e) => props.setCorPrincipal(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent"
          />
          <input
            type="text"
            value={props.corPrincipal}
            onChange={(e) => props.setCorPrincipal(e.target.value)}
            className="flex-1 bg-transparent font-mono text-sm uppercase outline-none"
          />
        </div>
      </div>

      <textarea
        placeholder="Conte como você imagina seu evento. Como deve ser a sensação dos convidados? Tem alguma referência? O que NÃO pode faltar?"
        rows={4}
        className="eventify-input min-h-32 resize-y py-3"
        value={props.descricao}
        onChange={(e) => props.setDescricao(e.target.value)}
        maxLength={1500}
      />
      <p className="eventify-muted text-right text-xs">{props.descricao.length}/1500</p>
    </div>
  );
}

function StepDetalhes(props: {
  schema: ReturnType<typeof getBriefingSchema>;
  detalhes: Record<string, string>;
  setDetalhes: (v: Record<string, string>) => void;
}) {
  if (!props.schema) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-700">
        Selecione um tipo de evento na primeira etapa para personalizar este passo.
      </div>
    );
  }

  function setCampo(id: string, value: string) {
    props.setDetalhes({ ...props.detalhes, [id]: value });
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-black text-[#090814]">{props.schema.titulo}</h2>
        <p className="eventify-muted mt-2 text-sm">{props.schema.subtitulo}</p>
      </div>

      <div className="grid gap-4">
        {props.schema.campos.map((campo) => (
          <div key={campo.id} className="grid gap-1.5">
            <label className="text-sm font-bold text-[#090814]">
              {campo.label}
              {campo.required && <span className="ml-1 text-rose-500">*</span>}
            </label>
            {campo.type === "textarea" ? (
              <textarea
                rows={3}
                placeholder={campo.placeholder}
                className="eventify-input min-h-24 resize-y py-3"
                value={props.detalhes[campo.id] ?? ""}
                onChange={(e) => setCampo(campo.id, e.target.value)}
                maxLength={campo.maxLength ?? 1500}
              />
            ) : (
              <input
                type={campo.type === "url" ? "url" : "text"}
                placeholder={campo.placeholder}
                className="eventify-input"
                value={props.detalhes[campo.id] ?? ""}
                onChange={(e) => setCampo(campo.id, e.target.value)}
                maxLength={campo.maxLength ?? 240}
              />
            )}
            {campo.hint && (
              <p className="eventify-muted text-xs">{campo.hint}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
