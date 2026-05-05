# 🚀 Guia Prático: Copy-Paste para Integração

Este documento oferece instruções passo-a-passo **copy-paste ready** para integrar o sistema de eventos ao repositório `event-ai-sites`.

## 📦 Passo 1: Copiar Arquivos Base

### Estrutura de Pastas a Criar

```bash
# No repositório event-ai-sites
mkdir -p app/painel
mkdir -p app/novo-evento
mkdir -p app/editar-evento
mkdir -p app/evento
mkdir -p app/promocional
mkdir -p app/api/gerar-site
mkdir -p lib
mkdir -p hooks
```

### Arquivos para Copiar Diretamente

```bash
# Copiar do sites-eventos para event-ai-sites
cp sites-eventos/lib/themes.ts ./lib/
cp sites-eventos/lib/promotionalTemplates.ts ./lib/
cp sites-eventos/hooks/useEventos.ts ./hooks/

# Páginas
cp sites-eventos/app/painel/page.tsx ./app/painel/
cp sites-eventos/app/novo-evento/page.js ./app/novo-evento/
cp sites-eventos/app/editar-evento/[slug]/page.js ./app/editar-evento/
cp sites-eventos/app/evento/[slug]/page.js ./app/evento/
cp sites-eventos/app/promocional/[slug]/page.tsx ./app/promocional/

# API
cp sites-eventos/app/api/gerar-site/route.ts ./app/api/gerar-site/
```

## 🎨 Passo 2: Mesclar Estilos

### Adicionar ao tailwind.config.mjs existente

Se o arquivo já existe, adicione esta seção no `theme.extend`:

```javascript
// tailwind.config.mjs
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Adicionar paleta de temas (opcional se já definida)
      },
      borderRadius: {
        // Manter rounded-[1.5rem], rounded-2xl, etc
      },
      spacing: {
        // Manter valores customizados se existentes
      },
    },
  },
  plugins: [],
};
```

### Mesclar globals.css

Adicione ao final do seu `app/globals.css`:

```css
/* Estilos do sistema de eventos */
@layer components {
  .evento-card {
    @apply rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 transition hover:shadow-xl hover:shadow-slate-200/60;
  }

  .evento-button {
    @apply rounded-2xl bg-slate-950 px-6 py-3 text-white font-semibold transition hover:bg-slate-800;
  }

  .evento-input {
    @apply w-full rounded-2xl border border-slate-300 bg-white p-4 outline-none focus:border-slate-400;
  }
}
```

## 📋 Passo 3: Atualizar package.json

### Adicionar Dependências

Se não estiverem já presentes, adicione ao `package.json`:

```json
{
  "dependencies": {
    "next": "16.2.4",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "@tailwindcss/postcss": "^4"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/node": "^20",
    "typescript": "^5"
  }
}
```

### Instalar Dependências

```bash
npm install
```

## ⚙️ Passo 4: Configuração de TypeScript

### Adicionar Path Aliases ao tsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## 🔧 Passo 5: Testar Compilação

```bash
# Verificar se tudo compila
npm run build

# Esperado: Todas as rotas compilam sem erro
# ✓ Compiled successfully
```

## 🧪 Passo 6: Validar Funcionamento

```bash
# Iniciar dev server
npm run dev

# Acessar no navegador
# http://localhost:3000/painel       → Dashboard
# http://localhost:3000/novo-evento  → Criar evento
```

## 📝 Passo 7: Atualizar Documentação

No `README.md` da `event-ai-sites`, adicione:

```markdown
## 📅 Sistema de Eventos

Este projeto inclui um sistema completo de gerenciamento e geração automática de sites para eventos.

### Funcionalidades

- Criar, editar e deletar eventos
- Gerador automático de sites promocionais
- Sistema de RSVP com lista de convidados
- 5 temas visual diferentes por tipo de evento
- Integração com Google Maps
- Busca de CEP automática

### Tipos de Eventos

1. **Casamento** - Tema rosa/pink
2. **Aniversário** - Tema amarelo/amber
3. **Evento Corporativo** - Tema azul
4. **Festa** - Tema roxo
5. **Religioso** - Tema verde/emerald

### Rotas Disponíveis

- `/painel` - Dashboard com todos os eventos
- `/novo-evento` - Criar novo evento
- `/evento/[slug]` - Página pública do evento
- `/editar-evento/[slug]` - Editar evento
- `/promocional/[slug]` - Site promocional gerado automaticamente

### Dados Persistentes

Os eventos são salvos em `localStorage` do navegador. Para produção, migre para um backend (Firebase, Supabase, etc).

### Código de Referência

Veja [ARCHITECTURE.md](ARCHITECTURE.md) para documentação técnica detalhada.
```

## 🚨 Checklist Final

- [ ] Todos os arquivos copiados
- [ ] Dependências instaladas com sucesso
- [ ] Build compila sem erros
- [ ] Rotas acessíveis no localhost:3000
- [ ] localStorage funciona (abrir DevTools)
- [ ] Criar um evento e verificar se aparece no painel
- [ ] Clicar em "Site Promocional" gera página dinamicamente
- [ ] Responsividade testada (mobile, tablet, desktop)
- [ ] Nenhum erro de console

## ⚡ Troubleshooting

### Build falha com erro de tipo TypeScript

```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

### Rotas não carregam

Verificar se:
- [ ] `tsconfig.json` tem path aliases configurados
- [ ] Pastas criadas corretamente
- [ ] Arquivos `.tsx` vs `.js` estão corretos

### localStorage vazio

Abrir DevTools (F12):
```javascript
// Verificar se dados existem
JSON.parse(localStorage.getItem("eventos"))
```

### Imagens não carregam

Base64 deve estar completo:
```javascript
// Formato correto
"imagem": "data:image/png;base64,iVBORw0K..."
```

## 🎯 Próximas Etapas (Futuro)

1. Integrar Firebase para persistência real
2. Autenticação de usuários
3. Envio de convites por email
4. Integração OpenAI para gerar copy automaticamente
5. Sistema de pagamentos para eventos premium

---

**Tempo estimado**: 30-45 minutos  
**Dificuldade**: Intermediária  
**Resultado**: Sistema de eventos totalmente funcional integrado ao projeto principal
