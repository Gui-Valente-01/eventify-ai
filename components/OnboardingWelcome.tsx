import Link from "next/link";

type Props = {
  nomeUsuario?: string;
};

const PASSOS = [
  {
    num: "01",
    titulo: "Conta sobre o evento",
    desc: "Tipo, data, estilo, público. Briefing de 2 minutos — nada técnico.",
    icon: "✎",
  },
  {
    num: "02",
    titulo: "IA monta o site",
    desc: "Cores, fontes, copy emocional e seções prontas em ~30 segundos.",
    icon: "✦",
  },
  {
    num: "03",
    titulo: "Compartilha o link",
    desc: "WhatsApp, QR Code, e-mail. Convidados confirmam direto na página.",
    icon: "→",
  },
];

const TIPOS = [
  { label: "Casamento", icon: "❀" },
  { label: "Aniversário", icon: "✦" },
  { label: "Corporativo", icon: "▭" },
  { label: "Festa", icon: "♬" },
  { label: "Religioso", icon: "✚" },
];

function extrairPrimeiroNome(email?: string): string {
  if (!email) return "";
  const local = email.split("@")[0] || "";
  const primeiro = local.split(/[._-]/)[0] || "";
  return primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase();
}

export default function OnboardingWelcome({ nomeUsuario }: Props) {
  const primeiroNome = extrairPrimeiroNome(nomeUsuario);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Saudação */}
      <div className="text-center">
        <span className="eventify-kicker">Bem-vindo ao Eventify</span>
        <h1 className="eventify-title mt-5 text-[clamp(36px,4.5vw,56px)]">
          {primeiroNome ? (
            <>Oi, <em>{primeiroNome}</em>. Vamos criar seu primeiro site?</>
          ) : (
            <>Vamos criar seu <em>primeiro site?</em></>
          )}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.6] text-[color:var(--muted)]">
          Em 5 minutos seu evento tem um site bonito, com RSVP e QR Code, pronto pra compartilhar.
          Sem cartão de crédito pra começar.
        </p>
      </div>

      {/* 3 passos */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {PASSOS.map((passo) => (
          <div
            key={passo.num}
            className="rounded-[12px] border border-[color:var(--hairline)] bg-[color:var(--surface)] p-6"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono-tight text-[11px] text-[color:var(--muted)]">{passo.num}</span>
              <span className="font-display text-[22px] italic text-[color:var(--gold)]">
                {passo.icon}
              </span>
            </div>
            <h3 className="mt-4 font-display text-[20px] font-light text-[color:var(--ink)]">
              {passo.titulo}
            </h3>
            <p className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--muted)]">
              {passo.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Tipos de evento */}
      <div className="mt-10 rounded-[12px] border border-[color:var(--hairline)] bg-[color:var(--paper)] p-6">
        <p className="text-center text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Templates curados pra
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {TIPOS.map((tipo) => (
            <span
              key={tipo.label}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--hairline-2)] bg-[color:var(--surface)] px-4 py-2 text-[13px] text-[color:var(--ink-2)]"
            >
              <span className="text-[color:var(--gold)]">{tipo.icon}</span>
              {tipo.label}
            </span>
          ))}
        </div>
      </div>

      {/* CTA principal */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <Link
          href="/novo-evento"
          className="eventify-button eventify-button-primary px-8 py-4 text-[15px]"
        >
          Criar meu primeiro evento <span aria-hidden>→</span>
        </Link>
        <Link
          href="/exemplos"
          className="text-[13px] text-[color:var(--muted)] underline-offset-2 hover:underline"
        >
          ou ver exemplos prontos primeiro
        </Link>
      </div>

      {/* Reassurance footer */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[color:var(--hairline)] pt-6 text-[12px] text-[color:var(--muted)]">
        <span>✓ Grátis até publicar</span>
        <span>✓ Sem cartão pra começar</span>
        <span>✓ Cancela a qualquer momento</span>
      </div>
    </div>
  );
}
