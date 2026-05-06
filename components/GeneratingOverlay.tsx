"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "Analisando seu briefing", icon: "✎", duration: 4 },
  { label: "Definindo paleta e identidade visual", icon: "✦", duration: 6 },
  { label: "Escrevendo copy autoral", icon: "✏︎", duration: 14 },
  { label: "Montando hero e estrutura do site", icon: "▣", duration: 12 },
  { label: "Gerando seções de programação e RSVP", icon: "◈", duration: 12 },
  { label: "Aplicando animações e responsividade", icon: "◉", duration: 8 },
  { label: "Finalizando e otimizando", icon: "✓", duration: 6 },
];

const DICAS = [
  "Sites bem detalhados convertem 3x mais convidados.",
  "Você pode editar tudo depois — nada fica em pedra.",
  "A IA usa cada detalhe que você preencheu pra escrever copy único.",
  "Convidados confirmam presença com 1 toque, sem cadastro.",
  "QR Code é gerado automaticamente — pronto pra colar em convite e story.",
  "Seu site fica em preview até você publicar pelo painel.",
  "RSVP é em tempo real, você vê confirmações no painel.",
];

export default function GeneratingOverlay({
  visible,
  estimatedSeconds = 60,
}: {
  visible: boolean;
  estimatedSeconds?: number;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [dicaIndex, setDicaIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      setElapsed(0);
      setDicaIndex(0);
      return;
    }
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    const dicaTick = setInterval(() => setDicaIndex((i) => (i + 1) % DICAS.length), 7000);
    return () => {
      clearInterval(tick);
      clearInterval(dicaTick);
    };
  }, [visible]);

  if (!visible) return null;

  // Progresso baseado no tempo total estimado
  const progress = Math.min(98, Math.round((elapsed / estimatedSeconds) * 100));

  // Qual step está "ativo" agora
  let cumulative = 0;
  let activeStep = 0;
  for (let i = 0; i < STEPS.length; i++) {
    cumulative += STEPS[i].duration;
    if (elapsed < cumulative) {
      activeStep = i;
      break;
    }
    activeStep = STEPS.length - 1;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="relative mx-4 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Topo com gradiente */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 px-8 py-10 text-white">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -right-10 -top-10 h-48 w-48 animate-pulse rounded-full bg-white/40 blur-3xl" />
            <div
              className="absolute -bottom-10 -left-10 h-48 w-48 animate-pulse rounded-full bg-white/40 blur-3xl"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-widest text-white/80">
              ✦ Criando seu site
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Nossa IA está montando<br />tudo do zero pra você.
            </h2>
            <p className="mt-3 text-sm text-white/80">
              Isso costuma levar até 1 minuto. A gente avisa quando estiver pronto.
            </p>
          </div>

          {/* Barra de progresso */}
          <div className="relative mt-7">
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs font-bold text-white/80">
              <span>{progress}%</span>
              <span>{elapsed}s</span>
            </div>
          </div>
        </div>

        {/* Lista de etapas */}
        <div className="px-8 py-7">
          <ul className="space-y-3">
            {STEPS.map((step, i) => {
              const done = i < activeStep;
              const active = i === activeStep;
              return (
                <li
                  key={step.label}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-3 transition-all ${
                    active
                      ? "bg-violet-50 ring-2 ring-violet-200"
                      : done
                        ? "opacity-60"
                        : "opacity-30"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm font-black ${
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                          ? "bg-violet-600 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {done ? "✓" : active ? (
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      active ? "text-violet-900" : "text-black"
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Dica rotativa */}
          <div
            key={dicaIndex}
            className="mt-7 rounded-2xl border border-black/5 bg-black/[0.02] p-5 animate-fade-in"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
              💡 Dica enquanto espera
            </p>
            <p className="mt-2 text-sm text-black/70 leading-6">{DICAS[dicaIndex]}</p>
          </div>

          <p className="mt-5 text-center text-xs text-black/40">
            Não feche essa janela. O site está sendo gerado em segundo plano.
          </p>
        </div>
      </div>
    </div>
  );
}
