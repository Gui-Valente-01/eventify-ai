// Helpers para derivar paleta a partir de uma cor primária do briefing.

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hexToRgb(hex: string): [number, number, number] | null {
  const s = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 1);
  l = clamp(l, 0, 1);
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h / 360 + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h / 360) * 255),
    Math.round(hue2rgb(p, q, h / 360 - 1 / 3) * 255),
  ];
}

function adjust(hex: string, dh: number, ds: number, dl: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [h, s, l] = rgbToHsl(...rgb);
  const [r, g, b] = hslToRgb(h + dh, s + ds, l + dl);
  return rgbToHex(r, g, b);
}

export type Palette = {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  accent: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkMuted: string;
};

const FALLBACK_PALETTE: Palette = {
  primary: "#8847e7",
  primaryDark: "#5b25a9",
  primarySoft: "#f0e5ff",
  accent: "#ec4899",
  surface: "#ffffff",
  surfaceAlt: "#faf9ff",
  ink: "#0a0814",
  inkMuted: "#5f5a72",
};

export function buildPalette(corPrincipal?: string): Palette {
  const primary = corPrincipal && hexToRgb(corPrincipal) ? corPrincipal : FALLBACK_PALETTE.primary;
  return {
    primary,
    primaryDark: adjust(primary, 0, 0, -0.18),
    primarySoft: adjust(primary, 0, -0.4, 0.42),
    accent: adjust(primary, 30, 0.05, 0.05),
    surface: "#ffffff",
    surfaceAlt: adjust(primary, 0, -0.6, 0.48),
    ink: "#0a0814",
    inkMuted: "#5f5a72",
  };
}
