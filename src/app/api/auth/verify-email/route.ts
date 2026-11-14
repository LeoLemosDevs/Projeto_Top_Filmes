import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token de confirmação não informado." },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: `SELECT id, name, email, role, email_verified FROM users WHERE verification_token = ?`,
      args: [token],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Link de confirmação inválido ou já utilizado." },
        { status: 400 }
      );
    }

    const user = result.rows[0];

    // Atualiza status para confirmado
    await db.execute({
      sql: `UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?`,
      args: [user.id],
    });

    // Já autentica o usuário automaticamente
    const jwtToken = await signToken({
      id: user.id as string,
      name: user.name as string,
      email: user.email as string,
      role: user.role as "USER" | "ADMIN",
    });

    const response = NextResponse.json({
      success: true,
      message: "E-mail confirmado com sucesso! Bem-vindo ao Top Filmes.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("top_filmes_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Erro ao verificar e-mail:", error);
    return NextResponse.json(
      { error: "Falha interna ao confirmar e-mail." },
      { status: 500 }
    );
  }
}
