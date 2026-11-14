import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await initDb();
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token e nova senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: `SELECT id, reset_token_expires FROM users WHERE reset_token = ?`,
      args: [token],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Token de recuperação inválido ou expirado." },
        { status: 400 }
      );
    }

    const user = result.rows[0];
    const expiresAt = new Date(user.reset_token_expires as string).getTime();

    if (Date.now() > expiresAt) {
      return NextResponse.json(
        { error: "Este link de recuperação expirou. Por favor solicite um novo." },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await db.execute({
      sql: `UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?`,
      args: [newHash, user.id],
    });

    return NextResponse.json({
      success: true,
      message: "Senha alterada com sucesso! Você já pode fazer login com sua nova senha.",
    });
  } catch (error: any) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json(
      { error: "Falha ao redefinir senha." },
      { status: 500 }
    );
  }
}
