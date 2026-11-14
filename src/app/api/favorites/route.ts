import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initDb();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ favorites: [] });
    }

    const result = await db.execute({
      sql: `
        SELECT f.id as favorite_id, f.created_at as favorited_at, m.*
        FROM favorites f
        INNER JOIN movies m ON f.movie_id = m.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
      `,
      args: [user.id],
    });

    return NextResponse.json({
      favorites: result.rows,
    });
  } catch (error: any) {
    console.error("Erro ao buscar favoritos:", error);
    return NextResponse.json(
      { error: "Falha ao carregar lista de favoritos." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await initDb();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Faça login para favoritar filmes." },
        { status: 401 }
      );
    }

    const { movieId } = await req.json();
    if (!movieId) {
      return NextResponse.json(
        { error: "ID do filme não fornecido." },
        { status: 400 }
      );
    }

    // Checar se já é favorito
    const check = await db.execute({
      sql: `SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?`,
      args: [user.id, movieId],
    });

    if (check.rows.length > 0) {
      // Se já está favoritado, remove (toggle)
      await db.execute({
        sql: `DELETE FROM favorites WHERE user_id = ? AND movie_id = ?`,
        args: [user.id, movieId],
      });
      return NextResponse.json({
        isFavorite: false,
        message: "Removido da Minha Lista.",
      });
    }

    const favId = `fav_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.execute({
      sql: `INSERT INTO favorites (id, user_id, movie_id) VALUES (?, ?, ?)`,
      args: [favId, user.id, movieId],
    });

    return NextResponse.json({
      isFavorite: true,
      message: "Adicionado à Minha Lista!",
    });
  } catch (error: any) {
    console.error("Erro ao alternar favorito:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar lista de favoritos." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await initDb();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get("movieId");

    if (!movieId) {
      return NextResponse.json(
        { error: "ID do filme não fornecido." },
        { status: 400 }
      );
    }

    await db.execute({
      sql: `DELETE FROM favorites WHERE user_id = ? AND movie_id = ?`,
      args: [user.id, movieId],
    });

    return NextResponse.json({
      success: true,
      message: "Filme removido dos favoritos.",
    });
  } catch (error: any) {
    console.error("Erro ao deletar favorito:", error);
    return NextResponse.json(
      { error: "Falha ao remover dos favoritos." },
      { status: 500 }
    );
  }
}
