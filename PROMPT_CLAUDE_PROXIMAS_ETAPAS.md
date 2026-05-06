# Prompt Para Claude - Proximas Etapas do Eventify AI

Use este prompt quando quiser pedir para Claude implementar partes maiores do projeto com contexto completo.

---

Voce e um engenheiro senior trabalhando no projeto Eventify AI, um SaaS em Next.js que cria sites promocionais de eventos com IA.

## Contexto do produto

O Eventify AI permite que um cliente:

1. Crie conta.
2. Cadastre um evento.
3. Escolha um plano: basico, intermediario ou premium.
4. Preencha briefing, endereco, imagem e detalhes.
5. Gere automaticamente um site com IA.
6. Veja preview.
7. Assine um plano recorrente via Stripe.
8. Publique o site final.
9. Compartilhe o link com convidados.
10. Receba RSVP.

## Stack

- Next.js App Router
- React
- TypeScript
- Supabase Auth, Database e Storage
- Stripe Checkout e Stripe Billing Portal
- Gemini API
- Anthropic Claude API
- Tailwind CSS

## Arquivos importantes

- `app/novo-evento/page.tsx`: formulario de criacao do evento.
- `app/editar-evento/[slug]/page.tsx`: edicao do evento.
- `app/painel/page.tsx`: painel do usuario.
- `app/perfil/page.tsx`: perfil, plano e uso.
- `app/api/gerar-site/route.ts`: API de geracao com IA.
- `app/api/checkout/route.ts`: cria checkout Stripe recorrente.
- `app/api/stripe-webhook/route.ts`: processa eventos Stripe.
- `app/api/customer-portal/route.ts`: abre portal Stripe.
- `lib/agents/*`: agentes internos.
- `lib/planStrategy.ts`: regras por plano.
- `lib/storage/*`: persistencia local/Supabase.
- `supabase/migrations/*`: migrations do banco.

## O que ja existe

- Criacao de eventos.
- Edicao de eventos.
- Selecao de plano antes da geracao.
- Diferenciacao por plano na IA.
- Geracao com Gemini/Claude e fallback local.
- Checkout Stripe em modo `subscription`.
- Webhook Stripe.
- Portal do cliente Stripe para gerenciar/cancelar assinatura.
- Dashboard admin basico.
- Usage logs de IA.
- RSVP.
- Pagina publica do cliente.
- Pagina promocional.

## Tarefas grandes pendentes

Implemente uma das tarefas abaixo por vez, sem quebrar o build:

1. Historico de pagamentos no perfil.
2. Analytics por evento: visitas, cliques, RSVP, conversao.
3. Area de cancelamento/upgrade mais completa com Stripe Portal e status da assinatura.
4. Exportacao robusta de convidados em CSV.
5. Conversao de imagens `<img>` para `next/image`.
6. Sistema de dominio personalizado.
7. Templates premium mais distintos.
8. Painel financeiro com receita estimada, custo IA e lucro.
9. Testes automatizados para checkout, webhook e geracao.
10. Melhor tratamento visual de erros e estados vazios.

## Regras de implementacao

- Leia o codigo antes de alterar.
- Preserve os padroes existentes.
- Use TypeScript corretamente.
- Nao remova funcionalidades existentes.
- Nao exponha segredos.
- Rode `npm run build` e `npm run lint`.
- Se precisar alterar banco, crie migration em `supabase/migrations`.
- Se for algo que o usuario precisa rodar manualmente no Supabase, crie tambem um arquivo `supabase/RODAR-ISSO-X.sql`.

## Entrega esperada

Ao finalizar, informe:

- O que foi implementado.
- Quais arquivos mudaram.
- Quais migrations precisam rodar.
- Resultado de build/lint.
- O que ainda ficou pendente.

