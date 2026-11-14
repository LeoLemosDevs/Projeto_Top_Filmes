import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { sendVerificationEmail } from "@/lib/email";
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
      sql: `SELECT id, name, email_verified FROM users WHERE email = ?`,
      args: [cleanEmail],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Se o e-mail estiver cadastrado, o link foi reenviado." },
        { status: 200 }
      );
    }

    const user = result.rows[0];

    if (user.email_verified === 1 || Number(user.email_verified) === 1) {
      return NextResponse.json(
        { message: "Esta conta já foi ativada. Você pode fazer login diretamente." },
        { status: 200 }
      );
    }

    const newToken = crypto.randomBytes(32).toString("hex");

    await db.execute({
      sql: `UPDATE users SET verification_token = ? WHERE id = ?`,
      args: [newToken, user.id],
    });

    const emailResult = await sendVerificationEmail({
      to: cleanEmail,
      name: user.name as string,
      token: newToken,
    });

    return NextResponse.json({
      success: true,
      message: "Novo e-mail de confirmação enviado!",
      devLink: emailResult.simulated ? emailResult.link : undefined,
    });
  } catch (error: any) {
    console.error("Erro ao reenviar confirmação:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação." },
      { status: 500 }
    );
  }
}
