# Eventify AI - Arquitetura de Agentes

O Eventify AI agora opera com uma camada de agentes antes da chamada ao modelo.
Essa camada cria uma decisao estruturada, auditavel e reutilizavel para cada site gerado.

## Fluxo

1. Cliente preenche evento e briefing.
2. `runAgentCompany(evento)` executa os agentes locais.
3. A API `/api/gerar-site` usa esse plano como contexto para Claude.
4. Se Claude estiver indisponivel, o plano local continua gerando `siteGerado`.
5. O admin registra uso, custo, qualidade e snapshot do `agent_run`.

## Agentes implementados

- Agente de Interpretacao: transforma briefing vago em direcao criativa.
- Agente Designer UI/UX: escolhe template, paleta, tipografia e regras visuais.
- Agente Copywriter: cria textos, CTA, SEO e destaques.
- Agente de Localizacao: monta endereco, mapa e nivel de confianca.
- Agente de Convidados: normaliza RSVP e detecta duplicados.
- Agente de Imagens: decide uso de upload ou placeholder/prompt visual.
- Agente Gerador de Site: define secoes obrigatorias e readiness de publicacao.
- Agente de Otimizacao: calcula qualidade, blockers, warnings e recomendacoes.
- Agentes de Marketing e Monetizacao: geram hooks, upsells, SEO e posts.

## Arquivos principais

- `lib/agents/types.ts`: contratos de entrada e saida.
- `lib/agents/productAgents.ts`: agentes do produto.
- `lib/agents/businessAgents.ts`: agentes de marketing, vendas e monetizacao.
- `lib/agents/orchestrator.ts`: orquestrador central.
- `lib/siteAgent.ts`: compatibilidade com o restante do app.
- `app/api/gerar-site/route.ts`: API que combina agentes + Claude.

## Dados salvos

Cada `siteGerado` pode incluir:

- `qualityScore`
- `qualityWarnings`
- `businessSuggestions`
- `agentRun`

Cada `usage_logs` pode incluir:

- `provider`
- `generation_mode`
- `quality_score`
- `agent_run`

## Regra de produto

A IA decide copy, estrategia e direcao criativa. O sistema controla templates,
persistencia, seguranca, tracking, checkout e publicacao.
