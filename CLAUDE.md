# CLAUDE.md — Eventify AI

## Contexto do Projeto

O Eventify AI é um SaaS em Next.js que cria sites promocionais de eventos usando inteligência artificial.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase
- Stripe
- Gemini API
- Anthropic Claude API

## Objetivo

Criar uma plataforma onde o cliente:
1. cria conta
2. cadastra evento
3. escolhe plano
4. IA gera site
5. cliente revisa preview
6. assina via Stripe
7. publica site
8. convidados acessam e confirmam presença

## Regras para Claude

- Leia o código antes de alterar.
- Não remova funcionalidades existentes.
- Preserve TypeScript.
- Preserve arquitetura atual.
- Não exponha segredos.
- Não altere Supabase sem migration.
- Não altere Stripe sem revisar webhook.
- Rode build e lint quando possível.
- Ao finalizar, informe arquivos alterados, riscos e próximos passos.

## Cérebro Obsidian

O cérebro do projeto fica em:

C:\Users\Win 11\Desktop\eventify

Pastas importantes (caminhos reais no disco):
- `Eventify/CENTRAL` — dashboard operacional, mapa geral, log de sessões Claude
- `Eventify/IA E AGENTES` — documentação dos agentes do produto
- `Eventify/ROADMAP` — prioridades e próximos passos
- `Eventify/DOCUMENTACAO TECNICA` — arquitetura e specs
- `Eventify/BUGS` — bugs manuais (notas .md)
- `14 - BUGS` — logs automáticos de build/erros
- `21 - AUTOMACOES` — agentes automáticos, autoevolução, RAG, prompts Claude, logs
- `22 - GITHUB` — status GitHub gerado automaticamente

Observação: as pastas dentro de `Eventify/` NÃO têm prefixo numérico no disco. Versões antigas deste doc citavam `00 -`, `05 -`, `17 -`, `18 -` — esses prefixos foram removidos para refletir a realidade do filesystem.

## Integração Claude ↔ Obsidian

Quando Claude Code executa tarefas neste projeto:

- Após qualquer alteração não-trivial, registra log em `Eventify/CENTRAL/LOG CLAUDE/AAAA-MM-DD.md` (data atual).
- Quando o impacto cai em uma pasta temática (ROADMAP, BUGS, DOCUMENTACAO TECNICA, IA E AGENTES, etc.), Claude decide: atualizar o doc existente OU criar nota nova — o que fizer mais sentido para preservar histórico.
- Mudança que pode quebrar código/produto: propor antes, não executar direto.
- Sem dependência de plugin do Obsidian — só leitura/escrita de `.md` no disco.

## Agentes

O projeto possui estrutura inicial de agentes em:

agents/

Agentes atuais:
- Interpreter
- Designer
- Copywriter

Objetivo futuro:
- conectar agentes com IA real
- conectar agentes com memória do Obsidian
- usar contexto do GitHub