import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await initDb();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const result = await db.execute({
      sql: `SELECT id, name FROM users WHERE email = ?`,
      args: [cleanEmail],
    });

    if (result.rows.length === 0) {
      // Para segurança, retornar mensagem genérica
      return NextResponse.json({
        success: true,
        message: "Se o e-mail estiver cadastrado, enviamos as instruções de recuperação.",
      });
    }

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora

    await db.execute({
      sql: `UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?`,
      args: [resetToken, expiresAt, user.id],
    });

    const emailResult = await sendPasswordResetEmail({
      to: cleanEmail,
      name: user.name as string,
      token: resetToken,
    });

    return NextResponse.json({
      success: true,
      message: `Enviamos as instruções de recuperação para ${cleanEmail}. Verifique sua caixa de entrada.`,
      devLink: emailResult.simulated ? emailResult.link : undefined,
    });
  } catch (error: any) {
    console.error("Erro na recuperação de senha:", error);
    return NextResponse.json(
      { error: "Falha ao processar recuperação de senha." },
      { status: 500 }
    );
  }
}
