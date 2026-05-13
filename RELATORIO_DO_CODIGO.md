# Relatorio do Codigo - Eventify AI

## 1. Resumo do projeto

O projeto e uma aplicacao web chamada **Eventify AI**. A ideia principal e permitir que uma pessoa crie um site completo para um evento em poucos passos, usando inteligencia artificial para gerar textos, estrutura visual e conteudo promocional.

O sistema atende eventos como casamentos, aniversarios, festas, eventos corporativos e eventos religiosos. Alem do site promocional, ele tambem oferece painel de gerenciamento, confirmacao de presenca, lista de convidados, mapa, QR Code, planos pagos e publicacao apos assinatura.

Em resumo: o codigo se trata de uma plataforma SaaS para criar, gerenciar, publicar e vender sites personalizados para eventos.

## 2. Objetivo do sistema

O objetivo do sistema e simplificar a criacao de paginas de evento. Em vez de o usuario contratar um designer ou montar uma pagina manualmente, ele preenche um briefing com informacoes do evento e a aplicacao gera um site automaticamente.

O projeto busca resolver estes problemas:

- Criar um site de evento sem precisar programar.
- Gerar textos personalizados com IA.
- Organizar informacoes importantes do evento em um so lugar.
- Controlar convidados e confirmacoes de presenca.
- Publicar o evento somente apos escolha de plano e pagamento.
- Oferecer uma experiencia simples tanto para o dono do evento quanto para os convidados.

## 3. Principais funcionalidades

### Criacao de eventos

O usuario pode criar um novo evento em um formulario dividido em quatro etapas:

- Dados basicos: nome, tipo, data, imagem e plano escolhido.
- Local: CEP, rua, numero, cidade e estado.
- Estilo: clima do evento, estilo visual, publico, cor principal e descricao.
- Detalhes especificos: campos diferentes dependendo do tipo de evento.

O codigo tambem busca endereco automaticamente pelo CEP, usando a API ViaCEP.

### Geracao de site com IA

Depois que o evento e preenchido, o sistema chama a rota `/api/gerar-site`. Essa rota valida os dados, verifica limites do plano e tenta gerar o site usando IA.

O projeto tem suporte para:

- Gemini, como provedor principal quando configurado.
- Claude/Anthropic, previsto no codigo, mas com fallback desativado no trecho atual.
- Um modo local, que gera conteudo basico caso a IA nao esteja disponivel.

O resultado pode incluir:

- Dados estruturados do site.
- HTML completo do site promocional.
- Informacoes de qualidade geradas pelos agentes internos.
- Sugestoes de negocio e melhorias.

### Painel de eventos

O painel mostra todos os eventos criados pelo usuario. Nele e possivel:

- Ver estatisticas gerais.
- Acessar o site promocional.
- Ver a pagina publica do evento.
- Editar ou apagar eventos.
- Regenerar conteudo com IA.
- Publicar o evento via checkout.
- Exportar convidados em CSV.

### RSVP e convidados

O sistema permite que convidados confirmem presenca. Essas confirmacoes ficam salvas no evento e aparecem no painel.

Quando ha convidados confirmados, o sistema tambem permite exportar a lista em CSV.

### Pagamentos e publicacao

O projeto possui planos pagos:

- Basico: R$ 29/mes.
- Intermediario: R$ 49/mes.
- Premium: R$ 79/mes.

O checkout e feito com Stripe. Apos pagamento, o webhook do Stripe atualiza o plano do usuario e marca o evento como publicado.

### Autenticacao e banco de dados

O sistema pode funcionar de dois modos:

- Modo local: salva dados no navegador com `localStorage`.
- Modo completo: usa Supabase para login, banco de dados, perfis, eventos, convidados e upload de imagens.

Isso permite que o projeto rode mesmo sem configuracao externa, mas tambem fique pronto para producao quando as variaveis de ambiente forem configuradas.

## 4. Tecnologias utilizadas

O projeto usa tecnologias modernas de desenvolvimento web:

- **Next.js 16** para a aplicacao web.
- **React 19** para interface.
- **TypeScript** para tipagem e organizacao do codigo.
- **Tailwind CSS 4** para estilos.
- **Supabase** para autenticacao, banco e armazenamento.
- **Stripe** para assinaturas e pagamentos.
- **Gemini** e **Anthropic Claude** para geracao de conteudo com IA.
- **Vitest** para testes automatizados.

## 5. Estrutura geral do codigo

### Pasta `app`

Contem as paginas e rotas da aplicacao. Exemplos:

- `app/page.tsx`: pagina inicial.
- `app/novo-evento/page.tsx`: criacao de evento.
- `app/painel/page.tsx`: painel do usuario.
- `app/evento/[slug]/page.tsx`: pagina do evento.
- `app/promocional/[slug]/page.tsx`: site promocional gerado.
- `app/api/gerar-site/route.ts`: API que gera o site.
- `app/api/checkout/route.ts`: API que inicia o pagamento.
- `app/api/stripe-webhook/route.ts`: API que recebe confirmacoes do Stripe.

### Pasta `components`

Guarda partes reutilizaveis da interface, como:

- Cabecalho.
- Botoes de compartilhamento.
- Seletor de planos.
- Indicadores de carregamento.
- Cards e componentes administrativos.

### Pasta `hooks`

Contem logicas reutilizaveis para o frontend, como:

- `useEventos`: cria, lista, atualiza e remove eventos.
- `useAuth`: controla estado de autenticacao.
- `useEventViews`: acompanha visualizacoes.
- `useEventoPublico`: busca dados publicos do evento.

### Pasta `lib`

Concentra a maior parte da regra de negocio:

- Geracao de site.
- Integracao com IA.
- Estrategia de planos.
- Limites por plano.
- Comunicacao com Supabase.
- Armazenamento local ou remoto.
- Formatacao, temas, templates e utilitarios.

### Pasta `supabase`

Contem scripts SQL e migracoes para montar o banco de dados, tabelas, politicas de seguranca e estrutura necessaria no Supabase.

### Pasta `tests`

Contem testes automatizados para partes importantes do sistema, como:

- Precificacao de IA.
- Webhook do Stripe.
- Limites dos planos.
- Exportacao CSV.
- Publicacao.
- Logs.

## 6. Fluxo principal de uso

1. O usuario acessa a pagina inicial.
2. Cria uma conta ou entra no sistema.
3. Vai para "Novo evento".
4. Preenche os dados do evento em quatro etapas.
5. O sistema gera o site usando IA ou fallback local.
6. O evento aparece no painel.
7. O usuario revisa o site, edita ou regenera o conteudo.
8. O usuario escolhe um plano e paga pelo Stripe.
9. O webhook confirma o pagamento.
10. O evento fica publicado e pronto para ser compartilhado.
11. Convidados acessam o link e confirmam presenca.
12. O dono do evento acompanha convidados, visualizacoes e exportacoes no painel.

## 7. Pontos fortes do projeto

- A aplicacao ja possui uma proposta clara de produto.
- O codigo esta dividido em paginas, componentes, hooks e bibliotecas.
- O projeto funciona tanto localmente quanto com Supabase.
- Ha integracao com IA para criar sites personalizados.
- Ha estrutura de planos e pagamentos.
- Ha testes automatizados para regras importantes.
- O sistema tem fluxo completo: criar, gerar, publicar, compartilhar e acompanhar evento.

## 8. Pontos de atencao

Alguns arquivos apresentam caracteres quebrados em textos com acento, como `Gerador automÃ¡tico` em vez de `Gerador automático`. Isso indica problema de codificacao em alguns conteudos.

Tambem existem documentos antigos citando tecnologias ou planos futuros que parecem ja ter mudado. Por exemplo, parte da documentacao menciona Firebase ou OpenAI como roadmap, enquanto o codigo atual usa Supabase, Gemini e Claude.

Outro ponto e que o fallback do Anthropic/Claude aparece desativado no codigo atual. O comentario informa que isso foi feito por questao de credito em producao.

## 9. Conclusao

O codigo se trata de uma plataforma completa para criacao automatica de sites de eventos com IA. Ele combina frontend, painel administrativo, banco de dados, autenticacao, armazenamento de imagens, controle de convidados, planos pagos e checkout.

De forma simples, o Eventify AI e um sistema para transformar informacoes de um evento em um site bonito, funcional e compartilhavel, com publicacao controlada por assinatura.
