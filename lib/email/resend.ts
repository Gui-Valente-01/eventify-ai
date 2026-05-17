import { Resend } from "resend";
import { logger } from "@/lib/logger";

/** Singleton lazy do cliente Resend (só instancia se a key existir). */
let _resend: Resend | null = null;
function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

const FROM = process.env.EMAIL_FROM || "Eventify <onboarding@resend.dev>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "contato@eventify.app";

type EnviarArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Envia e-mail via Resend. Retorna { ok, id?, error? }.
 * NUNCA lança — falha de e-mail nunca deve quebrar fluxo de negócio.
 */
export async function enviarEmail(args: EnviarArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
  const client = getClient();
  if (!client) {
    logger.warn("email", "RESEND_API_KEY não configurada — e-mail não enviado", { to: args.to });
    return { ok: false, error: "resend-not-configured" };
  }

  try {
    const res = await client.emails.send({
      from: FROM,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo: REPLY_TO,
    });

    if (res.error) {
      logger.error("email", "Resend retornou erro", res.error, { to: args.to });
      return { ok: false, error: res.error.message || "resend-error" };
    }

    logger.info("email", "e-mail enviado", { to: args.to, id: res.data?.id });
    return { ok: true, id: res.data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "erro desconhecido";
    logger.error("email", "exceção ao enviar e-mail", err, { to: args.to });
    return { ok: false, error: message };
  }
}
