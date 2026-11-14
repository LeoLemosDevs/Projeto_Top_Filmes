import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";
import { processVideoUrl } from "@/lib/video-helper";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await initDb();
    const movieId = params.id;

    const movieResult = await db.execute({
      sql: `SELECT * FROM movies WHERE id = ?`,
      args: [movieId],
    });

    if (movieResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Filme não encontrado." },
        { status: 404 }
      );
    }

    // Incrementar contagem de visualizações
    await db.execute({
      sql: `UPDATE movies SET views_count = views_count + 1 WHERE id = ?`,
      args: [movieId],
    });

    // Buscar categorias do filme
    const categoriesResult = await db.execute({
      sql: `
        SELECT c.id, c.name, c.slug 
        FROM categories c
        INNER JOIN movie_categories mc ON c.id = mc.category_id
        WHERE mc.movie_id = ?
      `,
      args: [movieId],
    });

    const movie = movieResult.rows[0];

    return NextResponse.json({
      movie: {
        ...movie,
        categories: categoriesResult.rows,
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar filme:", error);
    return NextResponse.json(
      { error: "Falha ao carregar informações do filme." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
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

    const movieId = params.id;
    const body = await req.json();
    const {
      title,
      release_year,
      synopsis,
      genre,
      cover_image_url,
      video_url,
      categories,
      duration_minutes,
      is_featured,
    } = body;

    const processed = video_url ? processVideoUrl(video_url) : null;

    await db.execute({
      sql: `
        UPDATE movies SET
          title = COALESCE(?, title),
          release_year = COALESCE(?, release_year),
          synopsis = COALESCE(?, synopsis),
          genre = COALESCE(?, genre),
          cover_image_url = COALESCE(?, cover_image_url),
          video_url = COALESCE(?, video_url),
          video_type = COALESCE(?, video_type),
          duration_minutes = COALESCE(?, duration_minutes),
          is_featured = COALESCE(?, is_featured),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        title,
        release_year,
        synopsis,
        genre,
        cover_image_url,
        video_url,
        processed?.type,
        duration_minutes,
        is_featured !== undefined ? (is_featured ? 1 : 0) : undefined,
        movieId,
      ],
    });

    // Atualizar categorias se fornecidas
    if (Array.isArray(categories)) {
      await db.execute({
        sql: `DELETE FROM movie_categories WHERE movie_id = ?`,
        args: [movieId],
      });

      for (const catIdentifier of categories) {
        const catQuery = await db.execute({
          sql: `SELECT id FROM categories WHERE id = ? OR slug = ?`,
          args: [catIdentifier, catIdentifier],
        });

        if (catQuery.rows.length > 0) {
          const categoryId = catQuery.rows[0].id as string;
          await db.execute({
            sql: `INSERT OR IGNORE INTO movie_categories (movie_id, category_id) VALUES (?, ?)`,
            args: [movieId, categoryId],
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Filme atualizado com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar filme:", error);
    return NextResponse.json(
      { error: "Falha ao salvar alterações." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
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

    const movieId = params.id;
    await db.execute({
      sql: `DELETE FROM movies WHERE id = ?`,
      args: [movieId],
    });

    return NextResponse.json({
      success: true,
      message: "Filme removido com sucesso.",
    });
  } catch (error: any) {
    console.error("Erro ao excluir filme:", error);
    return NextResponse.json(
      { error: "Falha ao remover o filme." },
      { status: 500 }
    );
  }
}
