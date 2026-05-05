# 🏗️ Arquitetura Técnica - Sistema de Eventos

## Estrutura de Pastas

```
sites-eventos/
├── app/
│   ├── layout.tsx                    # Layout raiz com Tailwind
│   ├── page.tsx                      # Homepage
│   ├── globals.css                   # Estilos globais
│   ├── painel/
│   │   └── page.tsx                  # Dashboard (lista eventos)
│   ├── novo-evento/
│   │   └── page.js                   # Criar novo evento
│   ├── editar-evento/
│   │   └── [slug]/page.js            # Editar evento existente
│   ├── evento/
│   │   └── [slug]/page.js            # Página pública + RSVP
│   ├── api/
│   │   └── gerar-site/
│   │       └── route.ts              # API para gerar dados promo
│   └── promocional/
│       └── [slug]/page.tsx           # Site promocional dinâmico
├── lib/
│   ├── themes.ts                     # Tema centralizado (5 tipos)
│   └── promotionalTemplates.ts       # Templates de sites promo
├── hooks/
│   └── useEventos.ts                 # Hook de gerenciamento de eventos
├── public/                           # Assets estáticos
├── package.json
├── next.config.ts
├── tailwind.config.mjs
├── tsconfig.json
└── postcss.config.mjs
```

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────────┐
│                     localStorage                        │
│              (eventos: EventoDados[])                   │
└────────────────┬────────────────────────────────────────┘
                 │
          ┌──────▼──────────┐
          │   useEventos    │
          │     (Hook)      │
          └──────┬──────────┘
                 │
        ┌────────┴──────────┐
        │                   │
    ┌───▼───┐          ┌────▼────┐
    │ Painel│          │Formulário│
    │(Lista)│          │(Criar)   │
    └───┬───┘          └────┬─────┘
        │                   │
    ┌───▼───────────────────▼──┐
    │    /evento/[slug]        │
    │  (Página Pública + RSVP) │
    └───┬────────────────────┬─┘
        │                    │
    ┌───▼──────┐    ┌─────────▼──────┐
    │ API      │    │ /promocional    │
    │gerar-site│    │  [slug]        │
    └──────────┘    └────────────────┘
```

## Tipos de Dados

### EventoDados (Principal)
```typescript
{
  nome: string;
  data: string;           // ISO format
  tipo: "Casamento" | "Aniversário" | "Evento Corporativo" | "Festa" | "Religioso";
  imagem?: string;        // Base64
  endereco?: {
    cep: string;
    rua: string;
    numero: string;
    cidade: string;
    estado: string;
  };
  convidados?: string[];  // Lista de nomes
}
```

### Theme (5 tipos)
```typescript
{
  accentLight: string;    // Cor clara
  accentBorder: string;   // Cor da borda
  accentDark: string;     // Cor escura
  accentGradient: string; // Gradiente Tailwind
  buttonClass: string;    // Classes do botão
  badgeClass: string;     // Classes do badge
  label: string;          // Nome + emoji
}
```

## Sistema de Temas (lib/themes.ts)

```
Casamento        → Rose/Pink (acento em tom rosa)
Aniversário      → Amber/Yellow (acento em tom dourado)
Evento Corporativo→ Blue (acento em tom azul)
Festa            → Purple (acento em tom roxo)
Religioso        → Emerald (acento em tom verde)
```

Cada tema tem 6 propriedades:
- `accentLight`: Cor clara do tema
- `accentBorder`: Cor para bordas
- `accentDark`: Cor escura do tema
- `accentGradient`: Gradiente para heróis
- `buttonClass`: Classes Tailwind para botão
- `badgeClass`: Classes Tailwind para badge

## Hook useEventos

### Imports
```typescript
import { useEventos, gerarSlug } from "@/hooks/useEventos";
```

### Uso
```typescript
const { 
  eventos,              // EventoDados[]
  isLoading,           // boolean
  adicionarEvento,     // (evento: EventoDados) => void
  atualizarEvento,     // (index: number, evento: EventoDados) => void
  deletarEvento,       // (index: number) => void
  encontrarPorSlug,    // (slug: string) => EventoDados | undefined
} = useEventos();

// Gerar slug a partir do nome
const slug = gerarSlug("Casamento da Maria"); 
// → "casamento-da-maria"
```

## Endpoints da API

### POST /api/gerar-site
Gera dados para site promocional

**Requisição:**
```json
{
  "nome": "Casamento",
  "tipo": "Casamento",
  "data": "2024-06-15",
  // ... outros campos
}
```

**Resposta:**
```json
{
  "promoData": {
    "template": { /* tema */ },
    "copy": {
      "title": "Casamento",
      "subtitle": "...",
      "description": "..."
    },
    "cidade": "São Paulo",
    "dataFormatada": "15 de junho de 2024"
  }
}
```

## Componentes de UI

### Homepage (page.tsx)
- Hero section com gradiente
- Feature cards com checkmarks
- CTAs para criar/ver eventos
- Design moderno com Tailwind

### Painel (painel/page.tsx)
- Grid de eventos
- Cards com imagem, data, local
- Botões de ação (Ver, Editar, Apagar, Site Promo)
- Busca/filtro (extensível)

### Criar/Editar Evento
- Form com validação
- Integração ViaCEP (buscar endereco pelo CEP)
- Upload de imagem (Base64)
- Seletor de tipo de evento

### Página do Evento (evento/[slug]/page.js)
- Imagem do evento
- Informações (data, local, tipo)
- Mapa Google Maps embed
- Sistema de RSVP com lista de convidados
- Cores temáticas dinâmicas

### Site Promocional (promocional/[slug]/page.tsx)
- Design escuro e moderno
- Gradiente temático
- Informações do evento destacadas
- CTA para confirmar presença
- Template automático por tipo

## Fluxos de Usuário

### Criar Evento
```
HomePage → Clica "Novo Evento"
    ↓
novo-evento/page.js → Preenche formulário
    ↓
localStorage.setItem("eventos", [...])
    ↓
Redirect para /painel
```

### Ver Evento Público
```
painel/page.tsx → Clica "Ver evento"
    ↓
evento/[slug]/page.js → Carrega do localStorage
    ↓
Mostra RSVP + Mapa + Convidados
```

### Gerar Site Promocional
```
painel/page.tsx → Clica "Site Promocional"
    ↓
/api/gerar-site → POST com evento
    ↓
promocional/[slug]/page.tsx → Renderiza site promo
```

## Stack Técnico

- **Next.js**: 16.2.4 (App Router)
- **React**: 19.2.4 (Hooks)
- **TypeScript**: 5.x (Strict mode)
- **Tailwind CSS**: 4.x (Utility-first)
- **Armazenamento**: localStorage (frontend)
- **Mapas**: Google Maps Embed API
- **CEP**: ViaCEP API

## Performance

- Static: `/`, `/novo-evento`, `/painel`
- Dynamic: `/evento/[slug]`, `/editar-evento/[slug]`, `/promocional/[slug]`, `/api/gerar-site`
- Build time: ~5-9 segundos
- Bundle size: Otimizado com Turbopack

## Roadmap Futuro

- [ ] Integração Firebase (backend)
- [ ] Autenticação com Google/GitHub
- [ ] Pagamentos com Stripe
- [ ] Gerador com IA (OpenAI)
- [ ] Envio de convites por email
- [ ] Edição de templates pelo usuário
- [ ] Analytics de eventos
- [ ] Integração com redes sociais
- [ ] App mobile

---

**Versão**: 1.0.0  
**Última atualização**: 2024  
**Status**: Pronto para produção
