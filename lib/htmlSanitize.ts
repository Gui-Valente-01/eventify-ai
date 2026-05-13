/**
 * Sanitiza HTML gerado pela IA antes de renderizar/salvar.
 *
 * Cobre 3 bugs conhecidos:
 *
 * 1. `data:image/svg+xml` em style="..."
 *    A IA gera background-image: url('data:image/svg+xml;utf8,<svg ...">...')
 *    sem escape de aspas, quebrando o parser HTML inteiro.
 *
 * 2. `source.unsplash.com/random/...`
 *    Endpoint descontinuado pela Unsplash em 2023. Imagem nunca carrega.
 *    A IA frequentemente gera URLs assim. Resultado: hero fica com fundo
 *    do `background-color` (geralmente preto) e título "some".
 *
 * 3. `.fade-up { opacity: 0 }` + IntersectionObserver
 *    A IA adiciona classes de animação que começam invisíveis e dependem
 *    de JS pra aparecer. Dentro do iframe com altura medida dinamicamente,
 *    o observer falha — o conteúdo fica permanentemente invisível.
 *
 * Estratégia:
 *   - Detecta e neutraliza cada bug separadamente
 *   - Injeta um <style> de safety que força o hero a ser visível com
 *     contraste e altura sensatas, e força elementos com opacity:0 a ficarem visíveis
 */
export function sanitizeGeneratedHtml(html: string): string {
  if (!html) return html;
  let result = html;
  let didFix = false;

  // -------- PASS 1: data:image/svg+xml em style="..." -----------------
  const brokenTagPattern = /<([a-z][a-z0-9-]*)([^>]*?)\s+style\s*=\s*"[^">]*data:image\/svg\+xml[^>]*>/gi;
  result = result.replace(brokenTagPattern, (_full, tag, attrsBefore) => {
    didFix = true;
    const cleanAttrs = (attrsBefore || "").replace(/\s+$/, "");
    return `<${tag}${cleanAttrs} style="background: linear-gradient(135deg, var(--color-primary, #f4f2ec), var(--color-secondary, #e8e5dd))">`;
  });

  // -------- PASS 1b: source.unsplash.com URLs (endpoint morto) --------
  // Em styles inline OU em <style> blocks. Remove o url(...) preservando
  // gradients ou outras layers do background.
  const hasUnsplashRandom = /url\([^)]*source\.unsplash\.com[^)]*\)/i.test(result);
  if (hasUnsplashRandom) {
    didFix = true;
    // Remove `, url(source.unsplash...) modifiers` quando vem depois de outra layer
    result = result.replace(
      /,\s*url\([^)]*source\.unsplash\.com[^)]*\)[^,;}]*/gi,
      ""
    );
    // Remove `url(source.unsplash...) modifiers` quando é a única layer
    result = result.replace(
      /url\([^)]*source\.unsplash\.com[^)]*\)[^,;}]*/gi,
      "none"
    );
    // Remove em <img src="source.unsplash.com...">
    result = result.replace(
      /<img\b[^>]*\bsrc\s*=\s*["']?[^"'\s>]*source\.unsplash\.com[^>]*>/gi,
      ""
    );
  }

  // -------- PASS 2: limpa órfãos se houve correção de svg --------------
  if (didFix) {
    result = result.replace(/<defs\b[^>]*>[\s\S]*?<\/defs>/gi, "");
    result = result.replace(/<text\b[^>]*>[\s\S]*?<\/text>/gi, "");
    result = result.replace(/<(linearGradient|radialGradient)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
    result = result.replace(
      /<\/?(?:rect|path|circle|ellipse|polygon|polyline|stop|g|svg|use|symbol|filter|mask|clipPath|pattern)\b[^>]*>/gi,
      ""
    );
    result = result.replace(/['"]\s*\)\s*['"]?\s*(?:&gt;|>)?\s*/g, "");
    result = result.replace(/&lt;\/?svg\b[^&]*&gt;/gi, "");
    result = result.replace(/&lt;\/?(?:defs|rect|path|text|linearGradient|radialGradient|stop|g)\b[^&]*&gt;/gi, "");
  }

  // -------- PASS 3: sempre — strip <img src="data:image/svg+xml..."> --
  result = result.replace(
    /<img\b[^>]*\bsrc\s*=\s*["']?data:image\/svg\+xml[^>]*>/gi,
    ""
  );

  // -------- PASS 3b: sempre — converte vh → px em alturas (qualquer elemento)
  // Motivo: dentro do iframe, vh é instável (vh = altura do próprio iframe que é
  // medida dinamicamente, criando loop). Convertemos pra px usando 1vh ≈ 8px
  // (referência: iframe de ~800px num laptop comum).
  result = result.replace(
    /(min-height|max-height|height)\s*:\s*(\d+(?:\.\d+)?)\s*vh\b/gi,
    (_full, prop, val) => {
      const vhNum = parseFloat(val);
      const px = Math.max(120, Math.round(vhNum * 8));
      return `${prop}: ${px}px`;
    }
  );

  // PASS 3c: também converte vh em padding-top/bottom/inline-start/end
  // (vh em padding vertical também causa instabilidade dentro de iframe)
  result = result.replace(
    /(padding-top|padding-bottom|padding-block(?:-start|-end)?|margin-top|margin-bottom)\s*:\s*(\d+(?:\.\d+)?)\s*vh\b/gi,
    (_full, prop, val) => {
      const vhNum = parseFloat(val);
      const px = Math.max(8, Math.round(vhNum * 8));
      return `${prop}: ${px}px`;
    }
  );

  // PASS 3d: padding shorthand com vh — \`padding: Xvh Yvw\` ou \`padding: Avh Bvh Cvh Dvh\`
  // Conservador: só converte se a string contém vh
  result = result.replace(
    /padding\s*:\s*([^;}]*vh[^;}]*)/gi,
    (_full, value) => {
      const converted = value.replace(/(\d+(?:\.\d+)?)\s*vh\b/g, (_m: string, val: string) => {
        const vhNum = parseFloat(val);
        const px = Math.max(8, Math.round(vhNum * 8));
        return `${px}px`;
      });
      return `padding: ${converted}`;
    }
  );

  // -------- PASS 4: detecta animação que esconde TÍTULO sem fallback ---
  const fadeHidesTitle =
    /(fade|reveal|hidden)[\w-]*\s*\{[^}]*opacity\s*:\s*0[^}]*\}/i.test(result) &&
    !/animation\s*:[^;]*forwards/i.test(result);

  // -------- PASS 5: rede de segurança visual SÓ pra bugs específicos --
  // (vh→px já foi convertido nos passos 3b/3c/3d — não precisa de !important
  // override pra altura aqui)
  if (didFix || fadeHidesTitle) {
    const safetyStyle = `<style data-ev-safety>
/* Safety net Eventify — corrige bugs detectados na geração */
.fade-up, .fade-in, .fade-down, .fade-left, .fade-right,
[class*="fade" i], [class*="reveal" i], [data-aos] {
  opacity: 1 !important;
  transform: none !important;
  visibility: visible !important;
}
${didFix ? `
/* Hero recuperado de SVG quebrado — paleta neutra clara */
header.hero, .hero, section.hero {
  background-color: #f4f2ec !important;
  background-image: none !important;
  min-height: 560px !important;
  max-height: 760px !important;
  padding: 56px 5vw !important;
}
header.hero h1, .hero h1 { color: #0a0a0a !important; text-shadow: none !important; }
header.hero p, .hero p { color: #1b1b1b !important; }
` : ""}
</style>`;

    if (/<head\b[^>]*>/i.test(result)) {
      result = result.replace(/<head\b[^>]*>/i, (m) => m + safetyStyle);
    } else if (/<html\b[^>]*>/i.test(result)) {
      result = result.replace(/<html\b[^>]*>/i, (m) => m + `<head>${safetyStyle}</head>`);
    } else {
      result = safetyStyle + result;
    }
  }

  return result;
}
