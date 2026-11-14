import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await initDb();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const result = await db.execute({
      sql: `SELECT id, name, email, password_hash, role, email_verified FROM users WHERE email = ?`,
      args: [cleanEmail],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash as string
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    // Verificar se o e-mail foi confirmado
    if (user.email_verified !== 1 && Number(user.email_verified) !== 1) {
      return NextResponse.json(
        {
          error: "Sua conta ainda não foi ativada. Verifique o link de confirmação enviado para o seu e-mail.",
          unverified: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    const token = await signToken({
      id: user.id as string,
      name: user.name as string,
      email: user.email as string,
      role: user.role as "USER" | "ADMIN",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
