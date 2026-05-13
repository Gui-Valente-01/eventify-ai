/**
 * Live palette + typography + layout override — injeta CSS dentro do iframe
 * pra mudar cores, fontes, espaçamentos, raios, hero, botões, seções
 * em tempo real, sem regenerar com IA.
 *
 * A IA gera sites usando CSS variables (--color-primary, --font-display, etc).
 * Esta função monta um <style> que sobrescreve essas variables com as escolhas
 * do usuário, mais fallbacks em selectores comuns.
 */

export type FontFamily = {
  name: string;
  googleFontsUrl?: string;
  fallback: "serif" | "sans-serif" | "monospace" | "display";
};

export type RadiusScale = "none" | "small" | "medium" | "large" | "pill";
export type SpacingScale = "compact" | "normal" | "spacious";
export type ContainerWidth = "narrow" | "normal" | "wide";
export type HeroAlign = "left" | "center" | "right";
export type ButtonStyle = "filled" | "outlined" | "ghost";
export type ButtonRadius = "square" | "rounded" | "pill";
export type AnimationSpeed = "off" | "slow" | "normal" | "fast";

/** Seções controláveis em qualquer evento. */
export type SectionId =
  | "hero"
  | "countdown"
  | "sobre"
  | "narrativa"
  | "programacao"
  | "pessoas"
  | "local"
  | "informacoes"
  | "galeria"
  | "presentes"
  | "rsvp"
  | "faq"
  | "footer";

export const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Hero (capa)",
  countdown: "Contagem regressiva",
  sobre: "Sobre",
  narrativa: "Narrativa (História/Mensagem)",
  programacao: "Programação",
  pessoas: "Pessoas (Padrinhos/Palestrantes)",
  local: "Local + Mapa",
  informacoes: "Informações práticas",
  galeria: "Galeria de fotos",
  presentes: "Lista de presentes/Ingressos",
  rsvp: "Confirmação de presença",
  faq: "FAQ",
  footer: "Rodapé",
};

export type LivePalette = {
  // ============ CORES ============
  fundo?: string;
  superficie?: string;
  texto?: string;
  acento?: string;
  /** Cor de texto sutil (legendas, hints, links secundários) */
  mutado?: string;
  /** Cor das bordas/divisores */
  borda?: string;

  // ============ TIPOGRAFIA ============
  fontDisplay?: FontFamily;
  fontBody?: FontFamily;
  /** Peso da fonte display (300, 400, 500, 600, 700) */
  fontWeightDisplay?: number;
  /** Peso da fonte body */
  fontWeightBody?: number;
  /** Tamanho base do corpo em px (default 16) */
  fontSizeBody?: number;
  /** Tamanho do hero title em px (default 64) */
  fontSizeHero?: number;
  /** Espaçamento entre linhas (default 1.55) */
  lineHeight?: number;
  /** Espaçamento entre letras dos títulos em em (default -0.02) */
  letterSpacing?: number;

  // ============ LAYOUT ============
  /** Border radius geral (cards, badges, inputs) */
  radius?: RadiusScale;
  /** Escala de padding das sections */
  spacing?: SpacingScale;
  /** Largura máxima do container central */
  containerWidth?: ContainerWidth;

  // ============ HERO ============
  /** URL ou data URL da imagem do hero */
  heroImage?: string;
  /** Alinhamento horizontal do conteúdo do hero */
  heroAlign?: HeroAlign;
  /** Opacidade do overlay escuro sobre a imagem (0-100) */
  heroOverlay?: number;
  /** Altura do hero em px */
  heroHeight?: number;

  // ============ BOTÕES ============
  /** Estilo dos botões primários */
  buttonStyle?: ButtonStyle;
  /** Cantos dos botões */
  buttonRadius?: ButtonRadius;

  // ============ ANIMAÇÕES ============
  animationSpeed?: AnimationSpeed;

  // ============ SEÇÕES ============
  /** Quais seções aparecem (não-listadas ficam ocultas) */
  enabledSections?: Partial<Record<SectionId, boolean>>;
};

/** Catálogo de fontes prontas — Google Fonts. */
export const FONT_CATALOG: Record<string, FontFamily> = {
  "cormorant-garamond": {
    name: "Cormorant Garamond",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap",
    fallback: "serif",
  },
  fraunces: {
    name: "Fraunces",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap",
    fallback: "serif",
  },
  "playfair-display": {
    name: "Playfair Display",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
    fallback: "serif",
  },
  "instrument-serif": {
    name: "Instrument Serif",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
    fallback: "serif",
  },
  "dm-serif": {
    name: "DM Serif Display",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap",
    fallback: "serif",
  },
  inter: {
    name: "Inter",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
    fallback: "sans-serif",
  },
  "space-grotesk": {
    name: "Space Grotesk",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap",
    fallback: "sans-serif",
  },
  manrope: {
    name: "Manrope",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap",
    fallback: "sans-serif",
  },
  "dm-sans": {
    name: "DM Sans",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap",
    fallback: "sans-serif",
  },
  "jetbrains-mono": {
    name: "JetBrains Mono",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap",
    fallback: "monospace",
  },
  bebas: {
    name: "Bebas Neue",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap",
    fallback: "display",
  },
  bricolage: {
    name: "Bricolage Grotesque",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700&display=swap",
    fallback: "display",
  },
};

export function getFont(id: string): FontFamily | undefined {
  return FONT_CATALOG[id];
}

// ============ Mapas pra escalas ============
const RADIUS_PX: Record<RadiusScale, string> = {
  none: "0px",
  small: "4px",
  medium: "10px",
  large: "18px",
  pill: "999px",
};

const SPACING_PY: Record<SpacingScale, string> = {
  compact: "48px",
  normal: "96px",
  spacious: "144px",
};

const CONTAINER_MAX: Record<ContainerWidth, string> = {
  narrow: "880px",
  normal: "1120px",
  wide: "1320px",
};

const BUTTON_RADIUS_PX: Record<ButtonRadius, string> = {
  square: "4px",
  rounded: "10px",
  pill: "999px",
};

const ANIM_DUR: Record<AnimationSpeed, string> = {
  off: "0s",
  slow: "1.4s",
  normal: "0.7s",
  fast: "0.35s",
};

export function buildPaletteCss(p: LivePalette): string {
  const {
    fundo,
    superficie,
    texto,
    acento,
    mutado,
    borda,
    fontDisplay,
    fontBody,
    fontWeightDisplay,
    fontWeightBody,
    fontSizeBody,
    fontSizeHero,
    lineHeight,
    letterSpacing,
    radius,
    spacing,
    containerWidth,
    heroImage,
    heroAlign,
    heroOverlay,
    heroHeight,
    buttonStyle,
    buttonRadius,
    animationSpeed,
    enabledSections,
  } = p;

  const fontImports: string[] = [];
  if (fontDisplay?.googleFontsUrl) {
    fontImports.push(`@import url("${fontDisplay.googleFontsUrl}");`);
  }
  if (fontBody?.googleFontsUrl && fontBody.googleFontsUrl !== fontDisplay?.googleFontsUrl) {
    fontImports.push(`@import url("${fontBody.googleFontsUrl}");`);
  }

  const displayStack = fontDisplay
    ? `"${fontDisplay.name}", ${fontDisplay.fallback === "display" ? "sans-serif" : fontDisplay.fallback}`
    : "";
  const bodyStack = fontBody
    ? `"${fontBody.name}", ${fontBody.fallback === "display" ? "sans-serif" : fontBody.fallback}`
    : "";

  const radiusPx = radius ? RADIUS_PX[radius] : "";
  const buttonRadiusPx = buttonRadius ? BUTTON_RADIUS_PX[buttonRadius] : "";
  const sectionPy = spacing ? SPACING_PY[spacing] : "";
  const containerMax = containerWidth ? CONTAINER_MAX[containerWidth] : "";
  const animDur = animationSpeed ? ANIM_DUR[animationSpeed] : "";

  // Hero alignment CSS
  const heroFlexAlign =
    heroAlign === "left"
      ? "flex-start"
      : heroAlign === "right"
        ? "flex-end"
        : heroAlign === "center"
          ? "center"
          : "";
  const heroTextAlign = heroAlign ?? "";

  // Hero image background
  const heroOverlayAlpha = typeof heroOverlay === "number" ? heroOverlay / 100 : 0.45;
  const heroBackground = heroImage
    ? `linear-gradient(rgba(0,0,0,${heroOverlayAlpha}), rgba(0,0,0,${Math.min(0.7, heroOverlayAlpha + 0.1)})), url("${heroImage}") center/cover no-repeat`
    : "";

  // Hidden sections: monta CSS pra hide cada uma
  const hiddenCss = (() => {
    if (!enabledSections) return "";
    const hideRules: string[] = [];
    for (const [sec, enabled] of Object.entries(enabledSections)) {
      if (enabled !== false) continue;
      // Tenta múltiplos seletores comuns que a IA usaria
      hideRules.push(
        `#${sec}, .${sec}, section[id="${sec}"], section[class*="${sec}" i], section[data-section="${sec}"]`
      );
    }
    if (hideRules.length === 0) return "";
    return `${hideRules.join(",\n")} { display: none !important; }`;
  })();

  return `
${fontImports.join("\n")}
/* ===== Eventify · Live Override (palette + typo + layout) ===== */
:root {
  ${fundo ? `--color-bg: ${fundo} !important;` : ""}
  ${fundo ? `--color-background: ${fundo} !important;` : ""}
  ${fundo ? `--color-primary-soft: ${fundo} !important;` : ""}
  ${fundo ? `--color-surface-alt: ${fundo} !important;` : ""}
  ${fundo ? `--color-accent-soft: ${fundo} !important;` : ""}
  ${fundo ? `--bg: ${fundo} !important;` : ""}
  ${fundo ? `--ev-paper: ${fundo} !important;` : ""}

  ${superficie ? `--color-surface: ${superficie} !important;` : ""}
  ${superficie ? `--surface: ${superficie} !important;` : ""}
  ${superficie ? `--ev-surface: ${superficie} !important;` : ""}

  ${texto ? `--color-ink: ${texto} !important;` : ""}
  ${texto ? `--color-foreground: ${texto} !important;` : ""}
  ${texto ? `--color-primary-dark: ${texto} !important;` : ""}
  ${texto ? `--text: ${texto} !important;` : ""}
  ${texto ? `--ev-ink: ${texto} !important;` : ""}

  ${mutado ? `--color-ink-muted: ${mutado} !important;` : ""}
  ${mutado ? `--color-muted: ${mutado} !important;` : ""}
  ${mutado ? `--ev-muted: ${mutado} !important;` : ""}

  ${borda ? `--color-border: ${borda} !important;` : ""}
  ${borda ? `--color-line: ${borda} !important;` : ""}
  ${borda ? `--ev-line: ${borda} !important;` : ""}
  ${borda ? `--ev-hairline: ${borda} !important;` : ""}

  ${acento ? `--color-accent: ${acento} !important;` : ""}
  ${acento ? `--color-primary: ${acento} !important;` : ""}
  ${acento ? `--accent: ${acento} !important;` : ""}
  ${acento ? `--primary: ${acento} !important;` : ""}
  ${acento ? `--ev-accent: ${acento} !important;` : ""}

  ${displayStack ? `--font-display: ${displayStack} !important;` : ""}
  ${displayStack ? `--font-heading: ${displayStack} !important;` : ""}
  ${displayStack ? `--font-headline: ${displayStack} !important;` : ""}
  ${bodyStack ? `--font-body: ${bodyStack} !important;` : ""}
  ${bodyStack ? `--font-text: ${bodyStack} !important;` : ""}
  ${bodyStack ? `--font-sans: ${bodyStack} !important;` : ""}

  ${radiusPx ? `--radius: ${radiusPx} !important;` : ""}
  ${radiusPx ? `--radius-card: ${radiusPx} !important;` : ""}
  ${radiusPx ? `--border-radius: ${radiusPx} !important;` : ""}
  ${buttonRadiusPx ? `--radius-button: ${buttonRadiusPx} !important;` : ""}
  ${sectionPy ? `--section-y: ${sectionPy} !important;` : ""}
  ${sectionPy ? `--space-y: ${sectionPy} !important;` : ""}
  ${containerMax ? `--container-max: ${containerMax} !important;` : ""}
  ${animDur ? `--anim-dur: ${animDur} !important;` : ""}
}

/* ===== Body / Tipografia base ===== */
${fundo ? `body { background-color: ${fundo} !important; }` : ""}
${texto ? `body { color: ${texto} !important; }` : ""}
${texto ? `h1, h2, h3, h4, h5, h6 { color: ${texto} !important; }` : ""}
${fontSizeBody ? `body, p, li, dd, dt { font-size: ${fontSizeBody}px !important; }` : ""}
${lineHeight ? `body, p, li, dd, dt { line-height: ${lineHeight} !important; }` : ""}
${letterSpacing !== undefined ? `h1, h2, h3, .display, [class*="display" i] { letter-spacing: ${letterSpacing}em !important; }` : ""}
${fontWeightDisplay ? `h1, h2, h3, h4, h5, h6, .display { font-weight: ${fontWeightDisplay} !important; }` : ""}
${fontWeightBody ? `body, p, li, dd, dt { font-weight: ${fontWeightBody} !important; }` : ""}

/* ===== Container ===== */
${containerMax ? `.container, [class*="container" i] { max-width: ${containerMax} !important; }` : ""}

/* ===== Section spacing ===== */
${sectionPy ? `section, .section, [class*="section" i] { padding-top: ${sectionPy} !important; padding-bottom: ${sectionPy} !important; }` : ""}

/* ===== Hero ===== */
${heroFlexAlign ? `header.hero, .hero, section.hero { align-items: ${heroFlexAlign} !important; }` : ""}
${heroTextAlign ? `header.hero, .hero, section.hero, header.hero *, .hero * { text-align: ${heroTextAlign} !important; }` : ""}
${heroBackground ? `header.hero, .hero, section.hero { background: ${heroBackground} !important; background-color: transparent !important; }` : (fundo ? `header.hero, .hero, section.hero { background-color: ${fundo} !important; background-image: none !important; }` : "")}
${heroImage ? `header.hero h1, .hero h1, section.hero h1, header.hero p, .hero p, section.hero p { color: #ffffff !important; text-shadow: 0 2px 12px rgba(0,0,0,0.45) !important; }` : (texto ? `header.hero h1, .hero h1, section.hero h1 { color: ${texto} !important; }` : "")}
${heroHeight ? `header.hero, .hero, section.hero { min-height: ${heroHeight}px !important; max-height: ${Math.max(heroHeight, 760)}px !important; }` : ""}
${fontSizeHero ? `header.hero h1, .hero h1, section.hero h1 { font-size: ${fontSizeHero}px !important; line-height: 1.02 !important; }` : ""}

/* ===== Surface / Cards ===== */
${superficie ? `.card, [class*="card" i], aside, .panel { background-color: ${superficie} !important; }` : ""}
${radiusPx ? `.card, [class*="card" i], input, textarea, select, .badge, [class*="badge" i] { border-radius: ${radiusPx} !important; }` : ""}

/* ===== Mutado ===== */
${mutado ? `[class*="muted" i], .text-muted, small, time, .meta { color: ${mutado} !important; }` : ""}

/* ===== Borda ===== */
${borda ? `hr, .divider, [class*="divider" i], [class*="hairline" i] { border-color: ${borda} !important; background-color: ${borda} !important; }` : ""}
${borda ? `.card, [class*="card" i], input, textarea, select { border-color: ${borda} !important; }` : ""}

/* ===== Links ===== */
${acento ? `a:not(.btn):not([class*="btn"]):not([class*="button"]):not(.cta) { color: ${acento} !important; }` : ""}

/* ===== Botões ===== */
${(() => {
  if (!buttonStyle && !buttonRadiusPx && !acento) return "";
  const radius = buttonRadiusPx ? `border-radius: ${buttonRadiusPx} !important;` : "";
  const baseStyles = `${radius} transition: all 200ms ease !important;`;

  // Primary
  let primary = "";
  if (buttonStyle === "filled" || !buttonStyle) {
    primary = `${baseStyles} ${acento ? `background-color: ${acento} !important; border: 1px solid ${acento} !important;` : ""} ${superficie || "color: #ffffff"} !important;`;
    if (superficie && acento) primary += ` color: ${superficie} !important;`;
  } else if (buttonStyle === "outlined") {
    primary = `${baseStyles} background-color: transparent !important; ${acento ? `border: 1.5px solid ${acento} !important; color: ${acento} !important;` : ""}`;
  } else if (buttonStyle === "ghost") {
    primary = `${baseStyles} background-color: transparent !important; border: 1px solid transparent !important; ${acento ? `color: ${acento} !important;` : ""}`;
  }

  return `.btn-primary, [class*="btn-primary" i], button.primary, .cta, [class*="cta" i] { ${primary} }
.btn-ghost, [class*="btn-ghost" i], [class*="btn-outline" i], button.secondary { ${baseStyles} ${acento ? `border-color: ${acento} !important; color: ${acento} !important;` : ""} background-color: transparent !important; }
button, .btn, [class*="btn" i] { ${radius} }`;
})()}

/* ===== Fontes ===== */
${bodyStack ? `body, p, span, li, dd, dt, blockquote, input, textarea, button { font-family: ${bodyStack} !important; }` : ""}
${displayStack ? `h1, h2, h3, h4, h5, h6, .display, [class*="display" i], [class*="hero-title" i] { font-family: ${displayStack} !important; }` : ""}

/* ===== Animações ===== */
${animationSpeed === "off" ? `*, *::before, *::after { animation-duration: 0.001s !important; animation-delay: 0s !important; transition-duration: 0.001s !important; }` : ""}
${animDur && animationSpeed !== "off" ? `*, *::before, *::after { animation-duration: ${animDur} !important; transition-duration: 200ms !important; }` : ""}

/* ===== Seções escondidas ===== */
${hiddenCss}
`.trim();
}
