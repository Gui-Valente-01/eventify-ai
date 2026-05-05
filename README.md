# Eventify AI

Gerador automático de sites promocionais para eventos, com IA Claude (Anthropic), banco Supabase e pagamentos Stripe.

> **Funciona sem nenhuma configuração** — basta `npm run dev`. Conforme você adiciona variáveis no `.env.local`, recursos vão sendo ativados:
>
> - **Sem nada** → localStorage + agente local (textos pré-definidos por template)
> - **+ ANTHROPIC_API_KEY** → conteúdo gerado pelo Claude
> - **+ SUPABASE_*** → banco real, autenticação, multiusuário, upload de imagens
> - **+ STRIPE_*** → checkout pago para os planos R$ 29 / R$ 49 / R$ 79

---

## 🚀 Setup rápido

```bash
npm install
cp .env.example .env.local   # opcional: edite conforme abaixo
npm run dev
```

Acesse http://localhost:3000

---

## 🔑 Variáveis de ambiente

Edite `.env.local` (não comite). Cada bloco é opcional e independente.

### 1. Anthropic Claude — geração de conteúdo

```
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-opus-4-7   # ou claude-sonnet-4-6 (mais barato)
```

Obtenha em https://console.anthropic.com/. Sem essa chave, o sistema usa textos pré-definidos por template.

### 2. Supabase — banco, auth e storage

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # apenas para o webhook do Stripe
```

1. Crie um projeto em https://supabase.com
2. Em **SQL Editor**, cole e rode o conteúdo de [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql)
3. Copie a URL e a anon key em **Project Settings → API**
4. (Opcional) Para Stripe webhook, copie também a **service_role** key (mantenha em segredo)

Sem essas variáveis o sistema usa localStorage (single-user, sem auth).

### 3. Stripe — pagamentos

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASICO=price_...
STRIPE_PRICE_INTERMEDIARIO=price_...
STRIPE_PRICE_PREMIUM=price_...
```

1. Crie produtos no [Stripe Dashboard](https://dashboard.stripe.com/products) com os preços R$ 29, R$ 49, R$ 79
2. Copie os `price_id` correspondentes
3. Configure um webhook apontando para `https://seu-dominio.com/api/stripe-webhook` com o evento `checkout.session.completed`

Sem essas variáveis a página `/precos` mostra mensagem amigável e nenhum pagamento é processado.

---

## 📁 Estrutura

```
app/
  ├── api/
  │     ├── gerar-site/       → endpoint do Claude
  │     ├── checkout/         → Stripe Checkout
  │     └── stripe-webhook/   → atualiza plano após pagamento
  ├── auth/callback/          → OAuth Supabase
  ├── login/, cadastro/       → autenticação
  ├── recuperar-senha/, redefinir-senha/
  ├── precos/                 → planos
  ├── painel/                 → dashboard com métricas
  ├── novo-evento/, editar-evento/[slug]/
  ├── evento/[slug]/          → painel administrativo do evento
  ├── cliente/[slug]/         → página pública para o convidado
  └── promocional/[slug]/     → site promocional gerado pela IA
components/
  ├── BrandHeader.tsx         → header com auth state
  ├── ShareButtons.tsx        → WhatsApp / Telegram / e-mail / copiar
  └── Spinner.tsx
hooks/
  ├── useEventos.ts           → CRUD adaptado (Supabase OU localStorage)
  ├── useEventoPublico.ts     → leitura pública por slug
  └── useAuth.ts              → estado de autenticação
lib/
  ├── api.ts                  → cliente do /api/gerar-site
  ├── plans.ts                → definição dos planos
  ├── siteAgent.ts            → fallback local de geração
  ├── templates.ts            → 5 templates de evento
  ├── visuals.ts              → tema visual de cada template
  ├── promotionalTemplates.ts → estilos da página promocional
  ├── utils.ts                → slug, CEP, data
  ├── storage/                → adapter (localStorage OU Supabase)
  └── supabase/               → clientes browser/server + middleware
supabase/migrations/
  └── 0001_init.sql           → schema, RLS e bucket de imagens
middleware.ts                 → refresh de sessão e proteção de rotas
```

---

## 🧪 Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4**
- **@anthropic-ai/sdk** — Claude para geração de conteúdo (Opus 4.7 default)
- **@supabase/supabase-js** + **@supabase/ssr** — banco, auth, storage
- **Stripe** — pagamentos via raw HTTP (sem SDK pesado)

---

## 🛠️ Comandos

```bash
npm run dev      # dev server (localhost:3000)
npm run build    # build de produção
npm run start    # servir build
npm run lint     # eslint
```

---

## 🚢 Deploy

A forma mais simples é a Vercel:

1. Push do repo para o GitHub
2. Conecte na Vercel
3. Cole as variáveis de ambiente em **Project Settings → Environment Variables**
4. Atualize `NEXT_PUBLIC_APP_URL` para o domínio final
5. (Stripe) Atualize a URL do webhook para o domínio Vercel

---

## 📋 Roadmap

**✅ Pronto**
- Geração de conteúdo via Claude (com fallback local)
- 5 templates visuais distintos
- CRUD completo de eventos
- Auth: cadastro, login, recuperação de senha
- Banco Supabase com Row Level Security
- Upload real de imagens (Supabase Storage)
- Página pública de RSVP + administrativa
- QR Code automático
- Compartilhamento (WhatsApp, Telegram, e-mail, copiar link)
- Export CSV de convidados
- Dashboard com métricas (eventos do mês, taxa de RSVP, etc.)
- Página de preços com 3 planos
- Stripe Checkout + webhook
- SEO com Open Graph
- Middleware de proteção de rotas

**🔜 Possíveis evoluções**
- Domínio personalizado por evento
- Marketplace de templates
- Mercado Pago / Pix
- Galeria de imagens por evento
- Lembretes por e-mail/WhatsApp
- App mobile (React Native)
