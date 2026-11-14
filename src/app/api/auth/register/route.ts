import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await initDb();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve conter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verificar se o e-mail já existe
    const existing = await db.execute({
      sql: `SELECT id, email_verified FROM users WHERE email = ?`,
      args: [cleanEmail],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado na plataforma." },
        { status: 409 }
      );
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await db.execute({
      sql: `
        INSERT INTO users (id, name, email, password_hash, role, email_verified, verification_token) 
        VALUES (?, ?, ?, ?, 'USER', 0, ?)
      `,
      args: [userId, name.trim(), cleanEmail, passwordHash, verificationToken],
    });

    // Enviar e-mail de confirmação
    const emailResult = await sendVerificationEmail({
      to: cleanEmail,
      name: name.trim(),
      token: verificationToken,
    });

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      message: `Enviamos um link de confirmação para ${cleanEmail}. Por favor, verifique sua caixa de entrada para ativar sua conta.`,
      devLink: emailResult.simulated ? emailResult.link : undefined,
    });
  } catch (error: any) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Falha ao registrar usuário." },
      { status: 500 }
    );
  }
}
