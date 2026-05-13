"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "Analisando seu briefing", icon: "a", duration: 4 },
  { label: "Definindo paleta e identidade visual", icon: "b", duration: 6 },
  { label: "Escrevendo copy autoral", icon: "c", duration: 14 },
  { label: "Montando hero e estrutura do site", icon: "d", duration: 12 },
  { label: "Gerando seções de programação e RSVP", icon: "e", duration: 12 },
  { label: "Aplicando animações e responsividade", icon: "f", duration: 8 },
  { label: "Finalizando e otimizando", icon: "g", duration: 6 },
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

  const progress = Math.min(98, Math.round((elapsed / estimatedSeconds) * 100));

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[color:var(--ink)]/72 backdrop-blur-md">
      <div className="relative mx-4 w-full max-w-2xl overflow-hidden rounded-[18px] border border-[color:var(--hairline-2)] bg-[color:var(--paper)] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.5)]">
        {/* Topo escuro */}
        <div className="bg-[color:var(--ink)] px-10 py-12 text-white">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
            Criando seu site
          </p>
          <h2 className="mt-4 font-display text-[36px] font-light leading-[1.05] tracking-[-0.02em] sm:text-[42px]">
            A IA está montando <em className="italic text-[color:var(--gold)]">tudo do zero</em> pra você.
          </h2>
          <p className="mt-4 text-[14px] text-white/65">
            Isso costuma levar até 1 minuto. A gente avisa quando estiver pronto.
          </p>

          {/* Barra de progresso */}
          <div className="mt-9">
            <div className="h-[2px] w-full overflow-hidden bg-white/15">
              <div
                className="h-full bg-[color:var(--gold)] transition-[width] duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-[11px] uppercase tracking-[0.16em] text-white/60 font-mono-tight">
              <span>{progress}%</span>
              <span>{elapsed}s</span>
            </div>
          </div>
        </div>

        {/* Etapas */}
        <div className="px-10 py-8">
          <ul className="space-y-1.5">
            {STEPS.map((step, i) => {
              const done = i < activeStep;
              const active = i === activeStep;
              return (
                <li
                  key={step.label}
                  className={`flex items-center gap-4 rounded-[10px] px-3 py-2.5 transition-all ${
                    active
                      ? "bg-[var(--gold-soft)]"
                      : done
                        ? "opacity-55"
                        : "opacity-30"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 flex-none items-center justify-center rounded-full border font-display text-[12px] italic ${
                      done
                        ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-white"
                        : active
                          ? "border-[color:var(--gold)] bg-[color:var(--gold)] text-white"
                          : "border-[color:var(--hairline-2)] bg-[color:var(--surface)] text-[color:var(--muted)]"
                    }`}
                  >
                    {done ? "✓" : active ? (
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={`text-[14px] ${
                      active
                        ? "font-display italic text-[color:var(--ink)]"
                        : "text-[color:var(--ink-2)]"
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
            className="mt-7 border-t border-[color:var(--hairline)] pt-5 animate-fade-in"
          >
            <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
              Dica enquanto espera
            </p>
            <p className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--ink-2)]">{DICAS[dicaIndex]}</p>
          </div>

          <p className="mt-5 text-center text-[11px] text-[color:var(--muted-2)]">
            Não feche essa janela. O site está sendo gerado em segundo plano.
          </p>
        </div>
      </div>
    </div>
  );
}
