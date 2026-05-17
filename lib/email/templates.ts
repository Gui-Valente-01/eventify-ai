/** Templates de e-mail HTML. Mantemos inline-styles e estrutura simples
 *  pra maximizar compatibilidade com clientes de e-mail (Gmail, Outlook, iOS Mail, etc). */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type BoasVindasArgs = {
  nomeUsuario: string;
  nomeEvento: string;
  slug: string;
  appUrl: string;
};

export function templateBoasVindas(args: BoasVindasArgs): { subject: string; html: string; text: string } {
  const nome = escapeHtml(args.nomeUsuario || "");
  const evento = escapeHtml(args.nomeEvento);
  const slug = encodeURIComponent(args.slug);
  const appUrl = args.appUrl.replace(/\/$/, "");
  const linkEvento = `${appUrl}/evento/${slug}`;
  const linkPublico = `${appUrl}/cliente/${slug}`;

  const subject = `🎉 Seu site do ${args.nomeEvento} está no ar!`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f2ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f5f2ed;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="540" style="max-width:540px;background-color:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e8e2d5;">
          <tr>
            <td style="padding:32px 36px 0 36px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:24px;font-style:italic;color:#1a1812;">Eventify</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 8px 36px;">
              <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#9c8c6e;">Tudo pronto</p>
              <h1 style="margin:0;font-family:Georgia,serif;font-size:32px;font-weight:300;line-height:1.15;color:#1a1812;">
                ${nome ? `${nome}, ` : ""}seu site do <em style="font-style:italic;color:#b8935a;">${evento}</em> está no ar.
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px;">
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#3d3a31;">
                Recebemos seu pagamento e publicamos seu site. Agora você pode compartilhar com os convidados.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;">
                <tr>
                  <td align="center">
                    <a href="${linkPublico}" style="display:inline-block;background-color:#1a1812;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:500;">
                      Abrir página dos convidados →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0 0;font-size:13px;line-height:1.6;color:#6b6453;">
                <strong>Link para compartilhar:</strong><br />
                <a href="${linkPublico}" style="color:#b8935a;word-break:break-all;">${linkPublico}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px 36px;">
              <div style="border-top:1px solid #e8e2d5;margin:16px 0;"></div>
              <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#9c8c6e;">Próximos passos</p>
              <ul style="margin:8px 0;padding-left:20px;font-size:13.5px;line-height:1.7;color:#3d3a31;">
                <li>Mande o link para sua lista de convidados (WhatsApp, e-mail, Instagram).</li>
                <li>Acompanhe quem confirmou presença no painel.</li>
                <li>Edite dados básicos a qualquer momento — o site atualiza na hora.</li>
              </ul>
              <p style="margin:16px 0 0 0;font-size:13px;line-height:1.6;color:#3d3a31;">
                Acesso ao painel: <a href="${linkEvento}" style="color:#b8935a;">${linkEvento}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 36px 32px 36px;background-color:#faf7f0;border-top:1px solid #e8e2d5;">
              <p style="margin:0;font-size:12px;line-height:1.55;color:#6b6453;">
                Precisa de ajuda? Responda este e-mail ou escreva pra
                <a href="mailto:contato@eventify.app" style="color:#b8935a;">contato@eventify.app</a>. Estamos por aqui.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0 0;font-size:11px;color:#9c8c6e;">
          © Eventify · Você recebeu este e-mail porque criou uma conta em ${appUrl.replace(/^https?:\/\//, "")}.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${nome ? `Oi ${nome}, ` : "Oi, "}seu site do ${args.nomeEvento} está no ar.

Recebemos seu pagamento e publicamos seu site. Agora você pode compartilhar com os convidados.

Link para compartilhar:
${linkPublico}

Acessar o painel:
${linkEvento}

Próximos passos:
- Manda o link para sua lista de convidados
- Acompanha quem confirmou presença no painel
- Pode editar dados básicos a qualquer momento

Precisa de ajuda? Responde este e-mail ou escreve pra contato@eventify.app

— Eventify`;

  return { subject, html, text };
}
