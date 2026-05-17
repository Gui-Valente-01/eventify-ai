import type { Metadata } from "next";
import BrandHeader from "@/components/BrandHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Eventify coleta, usa e protege os dados pessoais dos seus clientes e convidados, em conformidade com a LGPD.",
};

const ULTIMA_REVISAO = "17 de maio de 2026";

export default function PrivacidadePage() {
  return (
    <main className="eventify-page">
      <BrandHeader />
      <div className="editorial-narrow py-16 sm:py-20">
        <span className="eventify-kicker">Política de Privacidade</span>
        <h1 className="eventify-title mt-6 text-[clamp(36px,5vw,56px)]">
          Como tratamos <em>seus dados.</em>
        </h1>
        <p className="mt-4 text-[13px] text-[color:var(--muted)]">
          Última atualização: {ULTIMA_REVISAO}
        </p>

        <article className="prose-eventify mt-10 space-y-8 text-[15.5px] leading-[1.7] text-[color:var(--ink-2)]">
          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              1. Quem somos
            </h2>
            <p className="mt-3">
              Eventify é uma plataforma SaaS brasileira que permite a criação automatizada de sites
              promocionais para eventos com auxílio de inteligência artificial. Para fins desta
              política, somos o controlador dos dados pessoais que você nos fornece, nos termos da Lei
              Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              2. Quais dados coletamos
            </h2>
            <p className="mt-3"><strong>Do titular da conta (você):</strong></p>
            <ul className="ml-5 mt-2 list-disc space-y-1">
              <li>Nome completo, e-mail e senha (criptografada)</li>
              <li>Dados de pagamento (processados diretamente pela Stripe — nunca armazenamos número de cartão)</li>
              <li>Plano contratado e histórico de assinatura</li>
              <li>Logs técnicos de uso (IA, eventos criados, erros) para garantir o funcionamento do serviço</li>
            </ul>
            <p className="mt-4"><strong>Do evento criado por você:</strong></p>
            <ul className="ml-5 mt-2 list-disc space-y-1">
              <li>Nome do evento, tipo, data, endereço, imagem de capa</li>
              <li>Briefing e instruções enviadas à IA</li>
              <li>Nomes de convidados que confirmarem presença (RSVP)</li>
            </ul>
            <p className="mt-4"><strong>Dos visitantes do site público do evento:</strong></p>
            <ul className="ml-5 mt-2 list-disc space-y-1">
              <li>Identificador anônimo de sessão (gerado pelo navegador, sem identificar pessoa)</li>
              <li>País aproximado (via cabeçalho do provedor de hosting)</li>
              <li>User agent do navegador e domínio de origem (referrer)</li>
              <li>Nome informado caso a pessoa confirme presença via RSVP</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              3. Para que usamos
            </h2>
            <ul className="ml-5 mt-3 list-disc space-y-2">
              <li><strong>Operar a plataforma:</strong> criar sua conta, gerar e publicar sites, processar pagamentos.</li>
              <li><strong>Suporte:</strong> responder dúvidas e resolver problemas.</li>
              <li><strong>Melhoria do serviço:</strong> métricas agregadas e anônimas para entender uso (nunca expomos seus dados a terceiros para fins comerciais).</li>
              <li><strong>Comunicação transacional:</strong> avisos sobre sua conta, pagamento e evento.</li>
              <li><strong>Cumprimento legal:</strong> obrigações fiscais e regulatórias.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              4. Base legal (LGPD)
            </h2>
            <p className="mt-3">
              Tratamos seus dados com as seguintes bases legais previstas no art. 7º da LGPD:
            </p>
            <ul className="ml-5 mt-2 list-disc space-y-1">
              <li><strong>Execução de contrato</strong> — operar o serviço que você contratou.</li>
              <li><strong>Consentimento</strong> — para comunicações de marketing (sempre opt-in, com opt-out fácil).</li>
              <li><strong>Legítimo interesse</strong> — analytics agregados e prevenção a fraude.</li>
              <li><strong>Obrigação legal</strong> — emissão de nota fiscal, obrigações fiscais.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              5. Com quem compartilhamos
            </h2>
            <p className="mt-3">Usamos os seguintes operadores para prestar o serviço:</p>
            <ul className="ml-5 mt-2 list-disc space-y-1">
              <li><strong>Supabase</strong> — banco de dados, autenticação e storage de imagens</li>
              <li><strong>Vercel</strong> — hospedagem da aplicação</li>
              <li><strong>Stripe</strong> — processamento de pagamentos (recebe seus dados financeiros diretamente)</li>
              <li><strong>Anthropic (Claude) e Google (Gemini)</strong> — geração do conteúdo do site via IA</li>
              <li><strong>Resend</strong> — envio de e-mails transacionais (boas-vindas, confirmação de pagamento)</li>
            </ul>
            <p className="mt-4">
              Esses operadores tratam os dados apenas para as finalidades acima e estão sujeitos a
              cláusulas contratuais de proteção. Não vendemos seus dados a terceiros sob nenhuma
              hipótese.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              6. Conteúdo enviado à IA
            </h2>
            <p className="mt-3">
              O briefing que você fornece para geração do site é processado pelos serviços de IA da
              Anthropic ou Google conforme política de uso desses fornecedores. Recomendamos não
              incluir dados sensíveis (CPF, dados bancários, informações médicas etc.) nos campos de
              briefing.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              7. Seus direitos
            </h2>
            <p className="mt-3">A LGPD garante a você, como titular, os seguintes direitos:</p>
            <ul className="ml-5 mt-2 list-disc space-y-1">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar os dados que temos sobre você</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar anonimização, bloqueio ou eliminação dos dados</li>
              <li>Solicitar portabilidade dos seus dados</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Excluir sua conta (deleta também todos os eventos e convidados associados)</li>
            </ul>
            <p className="mt-4">
              Para exercer qualquer direito, envie um e-mail para{" "}
              <a href="mailto:contato@eventify.app" className="underline">contato@eventify.app</a>.
              Respondemos em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              8. Retenção
            </h2>
            <p className="mt-3">
              Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da conta, eliminamos
              os dados em até 30 dias, com exceção de informações que precisamos manter por obrigação
              legal (ex: registros fiscais por 5 anos).
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              9. Segurança
            </h2>
            <p className="mt-3">
              Aplicamos medidas técnicas e organizacionais razoáveis para proteger seus dados:
              criptografia em trânsito (HTTPS), senhas armazenadas com hash, Row-Level Security no
              banco de dados e controle de acesso por chaves rotativas. Apesar disso, nenhum sistema
              é 100% imune — em caso de incidente de segurança que afete seus dados, notificaremos
              você e a ANPD nos prazos legais.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              10. Cookies
            </h2>
            <p className="mt-3">
              Usamos apenas cookies estritamente necessários para o funcionamento da plataforma
              (sessão de login). Não usamos cookies de publicidade. Para analytics, usamos apenas
              dados agregados e anônimos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              11. Alterações
            </h2>
            <p className="mt-3">
              Podemos atualizar esta política. Quando houver mudança material, avisaremos por e-mail
              ou via aviso destacado na plataforma. A versão vigente está sempre disponível nesta
              página, com a data da última revisão no topo.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              12. Contato
            </h2>
            <p className="mt-3">
              Dúvidas, solicitações ou denúncias relacionadas a privacidade:
            </p>
            <p className="mt-2">
              <a href="mailto:contato@eventify.app" className="underline">contato@eventify.app</a>
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </main>
  );
}
