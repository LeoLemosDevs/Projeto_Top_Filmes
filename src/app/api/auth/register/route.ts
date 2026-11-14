import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

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

    // Verificar se o e-mail já existe
    const existing = await db.execute({
      sql: `SELECT id FROM users WHERE email = ?`,
      args: [email.toLowerCase().trim()],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso." },
        { status: 409 }
      );
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = await bcrypt.hash(password, 10);

    await db.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'USER')`,
      args: [userId, name.trim(), email.toLowerCase().trim(), passwordHash],
    });

    const token = await signToken({
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: "USER",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: "USER",
      },
    });

    response.cookies.set("top_filmes_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 dias
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Falha ao registrar usuário." },
      { status: 500 }
    );
  }
}
