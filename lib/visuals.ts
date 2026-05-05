export type TemplateId = "casamento" | "aniversario" | "corporativo" | "festa" | "religioso";

export type PromoVisual = {
  page: string;
  hero: string;
  kicker: string;
  title: string;
  muted: string;
  card: string;
  button: string;
  cta: string;
  label: string;
};

export type ClientVisual = {
  page: string;
  section: string;
  kicker: string;
  title: string;
  muted: string;
  card: string;
  image: string;
  button: string;
  accent: string;
  label: string;
};

export const PROMO_VISUALS: Record<TemplateId, PromoVisual> = {
  casamento: {
    page: "min-h-screen bg-[#fff8f6] text-[#24151a]",
    hero: "eventify-section grid min-h-[680px] gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center",
    kicker: "inline-flex rounded-full border border-[#ead0c1] bg-white/80 px-5 py-2 text-sm font-bold text-[#9a5b61]",
    title: "font-serif text-5xl font-black leading-tight text-[#24151a] sm:text-6xl lg:text-7xl",
    muted: "text-[#72575b]",
    card: "rounded-[1.8rem] border border-[#ead0c1] bg-white/85 shadow-2xl shadow-rose-100/60",
    button: "rounded-full bg-[#b76e79] px-7 py-4 font-black text-white shadow-xl shadow-rose-200 transition hover:bg-[#99545e]",
    cta: "rounded-[2rem] bg-[#24151a] px-8 py-16 text-white shadow-2xl shadow-rose-100",
    label: "Editorial romântico",
  },
  aniversario: {
    page: "min-h-screen bg-[#fff8db] text-[#24180a]",
    hero: "eventify-section flex min-h-[680px] flex-col items-center justify-center text-center",
    kicker: "inline-flex rounded-2xl bg-[#ffdb57] px-5 py-2 text-sm font-black text-[#5d3200] shadow-lg shadow-amber-200",
    title: "text-5xl font-black leading-tight text-[#24180a] sm:text-6xl lg:text-8xl",
    muted: "text-[#6f4b14]",
    card: "rounded-[1.2rem] border-2 border-[#ffd166] bg-white shadow-[10px_10px_0_#f97316]",
    button: "rounded-2xl bg-[#f97316] px-7 py-4 font-black text-white shadow-xl shadow-orange-200 transition hover:bg-[#ea580c]",
    cta: "rounded-[1.2rem] bg-gradient-to-br from-[#f97316] to-[#ffcf33] px-8 py-16 text-[#24180a] shadow-[14px_14px_0_#ef4444]",
    label: "Campanha vibrante",
  },
  corporativo: {
    page: "min-h-screen bg-[#f6f8fb] text-[#0f172a]",
    hero: "eventify-section grid min-h-[680px] gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start",
    kicker: "inline-flex rounded-md border border-[#dbe4f0] bg-white px-4 py-2 text-sm font-black text-[#2563eb]",
    title: "text-5xl font-black leading-tight text-[#0f172a] sm:text-6xl lg:text-7xl",
    muted: "text-[#475569]",
    card: "rounded-lg border border-[#dbe4f0] bg-white shadow-sm",
    button: "rounded-lg bg-[#2563eb] px-7 py-4 font-black text-white shadow-lg shadow-blue-100 transition hover:bg-[#1d4ed8]",
    cta: "rounded-lg bg-[#0f172a] px-8 py-16 text-white shadow-xl shadow-slate-200",
    label: "Landing corporativa",
  },
  festa: {
    page: "min-h-screen bg-[#11071f] text-white",
    hero: "eventify-section grid min-h-[680px] gap-10 lg:grid-cols-[1fr_1fr] lg:items-center",
    kicker: "inline-flex rounded-full bg-[#ec4899] px-5 py-2 text-sm font-black text-white shadow-xl shadow-pink-900/40",
    title: "text-5xl font-black leading-tight text-white sm:text-6xl lg:text-8xl",
    muted: "text-[#e9d5ff]",
    card: "rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl shadow-fuchsia-950/50 backdrop-blur",
    button: "rounded-full bg-gradient-to-r from-[#8847e7] to-[#ec4899] px-7 py-4 font-black text-white shadow-xl shadow-fuchsia-900/50 transition hover:opacity-90",
    cta: "rounded-[2rem] bg-gradient-to-r from-[#8847e7] to-[#ec4899] px-8 py-16 text-white shadow-2xl shadow-fuchsia-950/60",
    label: "Experiência noturna",
  },
  religioso: {
    page: "min-h-screen bg-[#f3fbf4] text-[#052e1d]",
    hero: "eventify-section grid min-h-[680px] gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center",
    kicker: "inline-flex rounded-full border border-[#bfe8cc] bg-white px-5 py-2 text-sm font-black text-[#047857]",
    title: "font-serif text-5xl font-black leading-tight text-[#052e1d] sm:text-6xl lg:text-7xl",
    muted: "text-[#3d6b52]",
    card: "rounded-[1.6rem] border border-[#ccebd5] bg-white/90 shadow-xl shadow-emerald-100/70",
    button: "rounded-full bg-[#059669] px-7 py-4 font-black text-white shadow-xl shadow-emerald-100 transition hover:bg-[#047857]",
    cta: "rounded-[1.6rem] bg-[#052e1d] px-8 py-16 text-white shadow-2xl shadow-emerald-100",
    label: "Página serena",
  },
};

export const CLIENT_VISUALS: Record<TemplateId, ClientVisual> = {
  casamento: {
    page: "min-h-screen bg-[#fff8f6] text-[#24151a]",
    section: "eventify-section grid min-h-[760px] gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center",
    kicker: "inline-flex rounded-full border border-[#ead0c1] bg-white/80 px-5 py-2 text-sm font-bold text-[#9a5b61]",
    title: "font-serif text-5xl font-black leading-tight text-[#24151a] sm:text-6xl lg:text-7xl",
    muted: "text-[#72575b]",
    card: "rounded-[1.8rem] border border-[#ead0c1] bg-white/85 shadow-2xl shadow-rose-100/60",
    image: "rounded-t-[10rem] border-[10px] border-white shadow-2xl shadow-rose-100",
    button: "rounded-full bg-[#b76e79] px-7 py-4 font-black text-white shadow-xl shadow-rose-200 transition hover:bg-[#99545e]",
    accent: "bg-[#fff0f2]",
    label: "Convite elegante",
  },
  aniversario: {
    page: "min-h-screen bg-[#fff8db] text-[#24180a]",
    section: "eventify-section grid min-h-[760px] gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center",
    kicker: "inline-flex rounded-2xl bg-[#ffdb57] px-5 py-2 text-sm font-black text-[#5d3200] shadow-lg shadow-amber-200",
    title: "text-5xl font-black leading-tight text-[#24180a] sm:text-6xl lg:text-7xl",
    muted: "text-[#6f4b14]",
    card: "rounded-[1.2rem] border-2 border-[#ffd166] bg-white shadow-[10px_10px_0_#f97316]",
    image: "rotate-1 rounded-[2rem] border-[8px] border-white shadow-2xl shadow-orange-200",
    button: "rounded-2xl bg-[#f97316] px-7 py-4 font-black text-white shadow-xl shadow-orange-200 transition hover:bg-[#ea580c]",
    accent: "bg-[#ffef9a]",
    label: "Festa vibrante",
  },
  corporativo: {
    page: "min-h-screen bg-[#f6f8fb] text-[#0f172a]",
    section: "eventify-section grid min-h-[760px] gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:items-start",
    kicker: "inline-flex rounded-md border border-[#dbe4f0] bg-white px-4 py-2 text-sm font-black text-[#2563eb]",
    title: "text-5xl font-black leading-tight text-[#0f172a] sm:text-6xl lg:text-7xl",
    muted: "text-[#475569]",
    card: "rounded-lg border border-[#dbe4f0] bg-white shadow-sm",
    image: "rounded-lg border border-[#dbe4f0] shadow-xl shadow-slate-200",
    button: "rounded-lg bg-[#2563eb] px-7 py-4 font-black text-white shadow-lg shadow-blue-100 transition hover:bg-[#1d4ed8]",
    accent: "bg-[#eff6ff]",
    label: "Grid profissional",
  },
  festa: {
    page: "min-h-screen bg-[#11071f] text-white",
    section: "eventify-section grid min-h-[760px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center",
    kicker: "inline-flex rounded-full bg-[#ec4899] px-5 py-2 text-sm font-black text-white shadow-xl shadow-pink-900/40",
    title: "text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl",
    muted: "text-[#e9d5ff]",
    card: "rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl shadow-fuchsia-950/50 backdrop-blur",
    image: "-rotate-1 rounded-[2rem] border-[8px] border-[#ec4899] shadow-2xl shadow-fuchsia-900/60",
    button: "rounded-full bg-gradient-to-r from-[#8847e7] to-[#ec4899] px-7 py-4 font-black text-white shadow-xl shadow-fuchsia-900/50 transition hover:opacity-90",
    accent: "bg-white/10",
    label: "Noite impactante",
  },
  religioso: {
    page: "min-h-screen bg-[#f3fbf4] text-[#052e1d]",
    section: "eventify-section grid min-h-[760px] gap-12 lg:grid-cols-[1fr_1fr] lg:items-center",
    kicker: "inline-flex rounded-full border border-[#bfe8cc] bg-white px-5 py-2 text-sm font-black text-[#047857]",
    title: "font-serif text-5xl font-black leading-tight text-[#052e1d] sm:text-6xl lg:text-7xl",
    muted: "text-[#3d6b52]",
    card: "rounded-[1.6rem] border border-[#ccebd5] bg-white/90 shadow-xl shadow-emerald-100/70",
    image: "rounded-[1.6rem] border-[8px] border-white shadow-2xl shadow-emerald-100",
    button: "rounded-full bg-[#059669] px-7 py-4 font-black text-white shadow-xl shadow-emerald-100 transition hover:bg-[#047857]",
    accent: "bg-[#e6f8eb]",
    label: "Celebração serena",
  },
};
