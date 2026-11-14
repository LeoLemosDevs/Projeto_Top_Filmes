import nodemailer from "nodemailer";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Configuração do Transportador SMTP (ex: Gmail, Brevo, SendGrid, etc.)
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);

  if (!host || !user || !pass) {
    return null; // Modo desenvolvimento sem SMTP configurado
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Envia e-mail com link de confirmação de cadastro
 */
export async function sendVerificationEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string;
  token: string;
}) {
  const confirmUrl = `${APP_URL}/confirmar-email?token=${token}`;
  const transporter = getTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0D14; color: #F8FAFC; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background-color: #121826; border: 1px solid #243048; border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #121826, #1A2234); padding: 30px 20px; text-align: center; border-bottom: 2px solid #FFC700; }
        .header h1 { color: #FFC700; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; }
        .content { padding: 30px 25px; line-height: 1.6; }
        .btn { display: inline-block; background-color: #FFC700; color: #0A0D14 !important; font-weight: 800; font-size: 14px; text-transform: uppercase; padding: 14px 28px; border-radius: 12px; text-decoration: none; margin: 25px 0; text-align: center; letter-spacing: 1px; }
        .footer { padding: 20px; text-align: center; font-size: 11px; color: #94A3B8; border-top: 1px solid #1A2234; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎬 TOP FILMES</h1>
        </div>
        <div class="content">
          <h2>Bem-vindo ao Top Filmes, ${name}!</h2>
          <p>Sua conta foi criada com sucesso na nossa plataforma de streaming de clássicos do cinema e da TV.</p>
          <p>Para ativar sua conta e começar a assistir aos seus filmes favoritos, clique no botão abaixo para confirmar seu e-mail:</p>
          <div style="text-align: center;">
            <a href="${confirmUrl}" class="btn">Confirmar Minha Conta</a>
          </div>
          <p style="font-size: 12px; color: #94A3B8;">Ou copie e cole este link no seu navegador:<br>
            <a href="${confirmUrl}" style="color: #3B82F6;">${confirmUrl}</a>
          </p>
        </div>
        <div class="footer">
          <p>Se você não solicitou este cadastro, pode desconsiderar este e-mail com segurança.</p>
          <p>© 2026 Top Filmes. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log("\n=======================================================");
    console.log("📧 [E-MAIL DE CONFIRMAÇÃO (MODO DEV)]");
    console.log(`Para: ${to} (${name})`);
    console.log(`Link de Confirmação: ${confirmUrl}`);
    console.log("=======================================================\n");
    return { success: true, simulated: true, link: confirmUrl };
  }

  try {
    const from = process.env.SMTP_FROM || `"Top Filmes" <${process.env.SMTP_USER}>`;
    await transporter.sendMail({
      from,
      to,
      subject: "🎬 Confirme sua conta no Top Filmes",
      html: htmlContent,
    });
    return { success: true, simulated: false };
  } catch (error) {
    console.error("Erro ao enviar e-mail de confirmação:", error);
    return { success: false, error };
  }
}

/**
 * Envia e-mail com link de recuperação / redefinição de senha
 */
export async function sendPasswordResetEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string;
  token: string;
}) {
  const resetUrl = `${APP_URL}/redefinir-senha?token=${token}`;
  const transporter = getTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0D14; color: #F8FAFC; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background-color: #121826; border: 1px solid #243048; border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #121826, #1A2234); padding: 30px 20px; text-align: center; border-bottom: 2px solid #FFC700; }
        .header h1 { color: #FFC700; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; }
        .content { padding: 30px 25px; line-height: 1.6; }
        .btn { display: inline-block; background-color: #FFC700; color: #0A0D14 !important; font-weight: 800; font-size: 14px; text-transform: uppercase; padding: 14px 28px; border-radius: 12px; text-decoration: none; margin: 25px 0; text-align: center; letter-spacing: 1px; }
        .footer { padding: 20px; text-align: center; font-size: 11px; color: #94A3B8; border-top: 1px solid #1A2234; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎬 TOP FILMES</h1>
        </div>
        <div class="content">
          <h2>Recuperação de Senha</h2>
          <p>Olá, ${name}.</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no Top Filmes.</p>
          <p>Para escolher uma nova senha, clique no botão abaixo (este link é válido por 1 hora):</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="btn">Redefinir Minha Senha</a>
          </div>
          <p style="font-size: 12px; color: #94A3B8;">Ou copie e cole este link no seu navegador:<br>
            <a href="${resetUrl}" style="color: #3B82F6;">${resetUrl}</a>
          </p>
        </div>
        <div class="footer">
          <p>Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha atual permanecerá segura.</p>
          <p>© 2026 Top Filmes. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log("\n=======================================================");
    console.log("🔐 [E-MAIL DE RECUPERAÇÃO DE SENHA (MODO DEV)]");
    console.log(`Para: ${to} (${name})`);
    console.log(`Link para Redefinir: ${resetUrl}`);
    console.log("=======================================================\n");
    return { success: true, simulated: true, link: resetUrl };
  }

  try {
    const from = process.env.SMTP_FROM || `"Top Filmes" <${process.env.SMTP_USER}>`;
    await transporter.sendMail({
      from,
      to,
      subject: "🔐 Recuperação de Senha - Top Filmes",
      html: htmlContent,
    });
    return { success: true, simulated: false };
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação de senha:", error);
    return { success: false, error };
  }
}
