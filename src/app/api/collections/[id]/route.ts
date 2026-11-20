import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;

    // Buscar por ID ou por Slug
    const colResult = await db.execute({
      sql: `SELECT * FROM collections WHERE id = ? OR slug = ? LIMIT 1`,
      args: [id, id],
    });

    if (colResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Saga ou coleção não encontrada." },
        { status: 404 }
      );
    }

    const collection = colResult.rows[0];

    // Buscar todos os filmes pertencentes à coleção, na ordem especificada
    const moviesResult = await db.execute({
      sql: `
        SELECT m.*, cm.order_index
        FROM movies m
        INNER JOIN collection_movies cm ON m.id = cm.movie_id
        WHERE cm.collection_id = ?
        ORDER BY cm.order_index ASC, m.release_year ASC
      `,
      args: [collection.id],
    });

    return NextResponse.json({
      collection: {
        ...collection,
        movies_count: moviesResult.rows.length,
        movies: moviesResult.rows,
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar saga/coleção:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso restrito ao Administrador." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const {
      title,
      slug: customSlug,
      synopsis = "",
      cover_image_url = "",
      backdrop_url = "",
      is_featured = 0,
      movie_ids = [],
    } = body;

    const check = await db.execute({
      sql: `SELECT id FROM collections WHERE id = ? LIMIT 1`,
      args: [id],
    });

    if (check.rows.length === 0) {
      return NextResponse.json(
        { error: "Saga/Coleção não encontrada." },
        { status: 404 }
      );
    }

    const cleanTitle = (title || "").trim();
    const finalSlug = customSlug && customSlug.trim() ? slugify(customSlug) : slugify(cleanTitle);

    await db.execute({
      sql: `
        UPDATE collections
        SET title = ?,
            slug = ?,
            synopsis = ?,
            cover_image_url = ?,
            backdrop_url = ?,
            is_featured = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        cleanTitle,
        finalSlug,
        synopsis.trim(),
        cover_image_url.trim(),
        backdrop_url.trim(),
        is_featured ? 1 : 0,
        id,
      ],
    });

    // Se movie_ids for enviado, sincronizar filmes da coleção
    if (Array.isArray(movie_ids)) {
      await db.execute({
        sql: `DELETE FROM collection_movies WHERE collection_id = ?`,
        args: [id],
      });

      for (let i = 0; i < movie_ids.length; i++) {
        const mId = movie_ids[i];
        if (mId) {
          await db.execute({
            sql: `INSERT OR IGNORE INTO collection_movies (collection_id, movie_id, order_index) VALUES (?, ?, ?)`,
            args: [id, mId, i + 1],
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Saga/Coleção atualizada com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar saga/coleção:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao atualizar." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso restrito ao Administrador." },
        { status: 403 }
      );
    }

    const { id } = await params;
    await db.execute({
      sql: `DELETE FROM collection_movies WHERE collection_id = ?`,
      args: [id],
    });

    await db.execute({
      sql: `DELETE FROM collections WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({
      success: true,
      message: "Saga/Coleção excluída com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao deletar saga/coleção:", error);
    return NextResponse.json(
      { error: "Erro ao excluir saga/coleção." },
      { status: 500 }
    );
  }
}
