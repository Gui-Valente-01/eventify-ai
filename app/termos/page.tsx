import type { Metadata } from "next";
import BrandHeader from "@/components/BrandHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos e condições para uso da plataforma Eventify para criação de sites de eventos com IA.",
};

const ULTIMA_REVISAO = "17 de maio de 2026";

export default function TermosPage() {
  return (
    <main className="eventify-page">
      <BrandHeader />
      <div className="editorial-narrow py-16 sm:py-20">
        <span className="eventify-kicker">Termos de Uso</span>
        <h1 className="eventify-title mt-6 text-[clamp(36px,5vw,56px)]">
          As regras do <em>jogo.</em>
        </h1>
        <p className="mt-4 text-[13px] text-[color:var(--muted)]">
          Última atualização: {ULTIMA_REVISAO}
        </p>

        <article className="prose-eventify mt-10 space-y-8 text-[15.5px] leading-[1.7] text-[color:var(--ink-2)]">
          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              1. Aceitação
            </h2>
            <p className="mt-3">
              Ao criar uma conta ou usar a plataforma Eventify, você concorda integralmente com estes
              Termos de Uso e com nossa{" "}
              <a href="/privacidade" className="underline">Política de Privacidade</a>. Se não
              concordar, não use o serviço.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              2. O que oferecemos
            </h2>
            <p className="mt-3">
              Eventify é uma plataforma SaaS que permite criar sites promocionais para eventos com
              auxílio de inteligência artificial. Você fornece o briefing; nossos sistemas geram um
              site personalizado, que você pode editar, publicar e compartilhar com convidados que
              confirmam presença via RSVP.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              3. Cadastro e conta
            </h2>
            <ul className="ml-5 mt-3 list-disc space-y-1">
              <li>Você deve ter no mínimo 18 anos ou autorização do responsável legal.</li>
              <li>As informações fornecidas no cadastro devem ser verdadeiras e atualizadas.</li>
              <li>Você é responsável por manter a confidencialidade da sua senha.</li>
              <li>Atividades realizadas com sua conta são de sua responsabilidade.</li>
              <li>Notifique-nos imediatamente em caso de uso não autorizado da conta.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              4. Planos e pagamento
            </h2>
            <p className="mt-3">
              Oferecemos planos pagos mensais (Básico, Intermediário e Premium) com diferentes
              limites — detalhes em <a href="/precos" className="underline">/precos</a>. O pagamento é
              processado pela Stripe via cartão de crédito. Você autoriza a cobrança automática
              recorrente enquanto a assinatura estiver ativa.
            </p>
            <p className="mt-4">
              <strong>Cancelamento:</strong> você pode cancelar a qualquer momento através do painel.
              O cancelamento entra em vigor ao fim do ciclo de cobrança atual. Sites já publicados
              permanecem ativos até o final do período pago.
            </p>
            <p className="mt-4">
              <strong>Reembolso:</strong> oferecemos reembolso integral em até 7 dias corridos após a
              primeira cobrança, conforme art. 49 do Código de Defesa do Consumidor. Após esse prazo,
              o valor pago não é reembolsável, mas você não é cobrado novamente.
            </p>
            <p className="mt-4">
              <strong>Falhas no pagamento:</strong> caso uma cobrança falhe, a Stripe tentará
              novamente automaticamente. Após múltiplas tentativas sem sucesso, a conta pode ser
              suspensa.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              5. Conteúdo gerado por IA
            </h2>
            <ul className="ml-5 mt-3 list-disc space-y-1.5">
              <li>O conteúdo do site é gerado por IA com base no seu briefing. <strong>Você é responsável por revisar antes de publicar.</strong></li>
              <li>Não nos responsabilizamos por imprecisões, erros gramaticais, conteúdo ofensivo gerado pela IA ou direitos autorais de imagens que você enviar.</li>
              <li>A IA pode falhar, ficar indisponível ou gerar resultado abaixo do esperado. Nesses casos, você pode regenerar (sujeito ao limite do seu plano).</li>
              <li>Você não pode usar a plataforma para criar sites com conteúdo ilegal, ofensivo, discriminatório, fraudulento, com violação de marcas/direitos autorais ou que promova violência, ódio, drogas ilícitas ou exploração.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              6. Propriedade intelectual
            </h2>
            <p className="mt-3">
              <strong>Da plataforma:</strong> o código, design, templates, marca e identidade visual
              do Eventify pertencem a nós. Você não pode copiar, modificar, redistribuir ou criar
              obras derivadas.
            </p>
            <p className="mt-4">
              <strong>Do seu site:</strong> o conteúdo final gerado para o seu evento (textos
              específicos, imagens enviadas por você) é seu. Nós mantemos uma licença não-exclusiva
              para hospedar, exibir e processar enquanto o serviço estiver ativo.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              7. Convidados e RSVPs
            </h2>
            <p className="mt-3">
              Os nomes de convidados que confirmarem presença são tratados como dados pessoais. Você,
              ao publicar o site e divulgar o link, atua como controlador desses dados perante os
              convidados — incluindo a obrigação de informá-los sobre o tratamento. Nós atuamos como
              operador, processando os dados apenas para a finalidade de RSVP.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              8. Disponibilidade
            </h2>
            <p className="mt-3">
              Nos esforçamos para manter o serviço disponível 24/7, mas não garantimos disponibilidade
              ininterrupta. Manutenções programadas, falhas de provedores terceiros (Vercel,
              Supabase, Stripe, Anthropic, Google) ou eventos imprevistos podem causar indisponibilidade
              temporária.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              9. Limitação de responsabilidade
            </h2>
            <p className="mt-3">
              Na máxima extensão permitida pela legislação aplicável:
            </p>
            <ul className="ml-5 mt-2 list-disc space-y-1">
              <li>O serviço é fornecido &quot;como está&quot;, sem garantias além das previstas em lei.</li>
              <li>Não nos responsabilizamos por prejuízos indiretos, lucros cessantes, perda de oportunidades comerciais ou danos morais decorrentes do uso do serviço.</li>
              <li>Nossa responsabilidade total perante você se limita ao valor pago por você nos últimos 12 meses.</li>
              <li>Você isenta a Eventify de qualquer prejuízo decorrente de uso indevido do serviço ou violação destes termos por você.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              10. Suspensão e encerramento
            </h2>
            <p className="mt-3">
              Podemos suspender ou encerrar sua conta, com ou sem aviso, em caso de:
            </p>
            <ul className="ml-5 mt-2 list-disc space-y-1">
              <li>Violação destes termos</li>
              <li>Conteúdo ilegal ou abusivo</li>
              <li>Falha persistente de pagamento</li>
              <li>Suspeita de fraude</li>
              <li>Determinação judicial ou regulatória</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              11. Alterações
            </h2>
            <p className="mt-3">
              Podemos atualizar estes termos. Mudanças materiais serão notificadas por e-mail e/ou
              aviso na plataforma com pelo menos 30 dias de antecedência. Se você continuar usando o
              serviço após esse prazo, considera-se aceitação das novas condições.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              12. Foro
            </h2>
            <p className="mt-3">
              Estes Termos são regidos pelas leis brasileiras. Para resolução de eventuais disputas,
              fica eleito o foro do domicílio do consumidor, conforme art. 101 do Código de Defesa do
              Consumidor.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] italic text-[color:var(--ink)]">
              13. Contato
            </h2>
            <p className="mt-3">
              <a href="mailto:contato@eventify.app" className="underline">contato@eventify.app</a>
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </main>
  );
}
