# 🔗 Guia de Integração com Repositório Principal

Este documento descreve como integrar o módulo de eventos automaticamente gerados ao repositório `event-ai-sites`.

## 📋 Pré-requisitos

- Node.js 18+
- Git
- Acesso ao repositório principal

## 🚀 Estratégia de Merge

### Opção 1: Monorepo (Recomendado)

```bash
# Na raiz de event-ai-sites
npm install turbo # ou yarn add turbo

# Estrutura final
event-ai-sites/
├── apps/
│   ├── web/              # Site principal
│   ├── eventos/          # Este projeto (movido)
│   └── admin/
├── packages/
│   ├── shared/           # Tipos compartilhados
│   ├── ui/               # Componentes shared
│   └── hooks/
└── ...
```

### Opção 2: Pasta Integrada

```bash
# Copiar para dentro do projeto principal
cp -r sites-eventos event-ai-sites/modules/eventos
```

## 📦 Arquivos para Preservar

```
✅ /lib/*                 # Mantém configuração de temas
✅ /hooks/*               # Mantém hooks customizados
✅ /app/*                 # Mantém todas as páginas
✅ /api/*                 # Mantém endpoints
✅ package.json           # Merge de dependências
✅ next.config.ts         # Merge se necessário
```

## 🎨 Sincronização de Design

Verificar itens de UI compartilhados:

- [ ] Palette de cores (compare com `globals.css`)
- [ ] Tipografia
- [ ] Componentes de botão
- [ ] Componentes de cards
- [ ] Spacing e grid

## 🔄 Passos para Integração

### 1. Preparar o Repositório Principal

```bash
git clone https://github.com/Prof-Gui-Lindo/event-ai-sites.git
cd event-ai-sites
git checkout -b feat/integrate-eventos
```

### 2. Copiar Estrutura de Eventos

```bash
# Opção A: Como módulo
mkdir -p apps/eventos
cp -r ../sites-eventos/* apps/eventos/

# Opção B: Integrado
cp -r ../sites-eventos/app/* app/
cp -r ../sites-eventos/lib/* lib/
cp -r ../sites-eventos/hooks/* hooks/
```

### 3. Mesclar Dependências

```json
{
  "dependencies": {
    "next": "16.2.4",  // Usar a versão mais recente comum
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

### 4. Sincronizar Tailwind Config

```javascript
// tailwind.config.js - Mesclar extends
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Mesclar temas personalizados
    },
  },
}
```

### 5. Verificar Imports

Buscar e substituir paths relativos:

```bash
# Antes
import { useEventos } from "@/hooks/useEventos"

# Depois (se em monorepo)
import { useEventos } from "@eventos/hooks"
```

### 6. Testes

```bash
npm run build
npm run dev
npm run lint
```

### 7. Deploy

```bash
git add .
git commit -m "feat: integrate automatic event site generator"
git push origin feat/integrate-eventos

# Criar Pull Request no GitHub
```

## 🔐 Considerações de Segurança

- [ ] Validar dados de entrada do formulário
- [ ] Sanitizar HTML gerado
- [ ] Implementar rate limiting para API
- [ ] Usar environment variables para secrets
- [ ] Configurar CORS correto

## 🌐 Variáveis de Ambiente

```env
# .env.local (desenvolvimento)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# .env.production (produção)
NEXT_PUBLIC_APP_URL=https://seu-dominio.com

# Futuros (quando integrar OpenAI)
OPENAI_API_KEY=sk-...
```

## 📊 Checklist de Integração

- [ ] Repositório clonado
- [ ] Branch criada
- [ ] Arquivos copiados
- [ ] Dependências mescladas
- [ ] Imports atualizados
- [ ] Build sem erros
- [ ] Testes passando
- [ ] Design visual verificado
- [ ] Documentação atualizada
- [ ] PR criado
- [ ] Code review aprovado
- [ ] Merge realizado

## 🤝 Contato

Em caso de dúvidas sobre a integração:
- GitHub Issues
- Pull Request Discussion
- Email: seu-email@example.com

---

**Desenvolvido para facilitar a integração futura**
