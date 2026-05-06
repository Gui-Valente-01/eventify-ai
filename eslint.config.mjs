import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // O app usa carregamento client-side com Supabase/localStorage.
      // Essa regra nova do React Compiler acusa muitos usos legítimos de useEffect.
      "react-hooks/set-state-in-effect": "off",
      // Redirecionamentos de checkout externo precisam chamar APIs do browser.
      "react-hooks/immutability": "off",
      // As páginas de exemplo são conteúdo editorial estático, com aspas e textos criativos.
      "react/no-unescaped-entities": "off",
      "react/jsx-no-comment-textnodes": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
