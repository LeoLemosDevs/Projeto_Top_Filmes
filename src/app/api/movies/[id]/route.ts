import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";
import { processVideoUrl, resolveVideoUrlAsync } from "@/lib/video-helper";

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

    const movie: any = { ...movieResult.rows[0] };

    // Se o vídeo for do TokyVideo e ainda tiver um slug não-numérico, resolve dinamicamente
    if (
      movie.video_url &&
      movie.video_url.includes("tokyvideo.com") &&
      !/tokyvideo\.com\/(?:[a-zA-Z]{2}\/)?embed\/\d+/i.test(movie.video_url)
    ) {
      const resolved = await resolveVideoUrlAsync(movie.video_url);
      if (resolved.src && resolved.src !== movie.video_url) {
        movie.video_url = resolved.src;
        movie.video_type = "tokyvideo";
        // Auto-heal: atualiza de forma permanente no banco de dados para os próximos acessos
        db.execute({
          sql: `UPDATE movies SET video_url = ?, video_type = 'tokyvideo' WHERE id = ?`,
          args: [resolved.src, movieId],
        }).catch(() => {});
      }
    }

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

    const processed = video_url ? await resolveVideoUrlAsync(video_url) : null;

    // Buscar filme existente primeiro
    const existing = await db.execute({
      sql: `SELECT * FROM movies WHERE id = ?`,
      args: [movieId],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "Filme não encontrado para edição." },
        { status: 404 }
      );
    }

    const current: any = existing.rows[0];

    const newTitle = title !== undefined && title !== null ? String(title).trim() : current.title;
    const newYear = release_year !== undefined && release_year !== null ? parseInt(String(release_year), 10) : current.release_year;
    const newSynopsis = synopsis !== undefined && synopsis !== null ? String(synopsis).trim() : current.synopsis;
    const newGenre = genre !== undefined && genre !== null ? String(genre).trim() : current.genre;
    const newCover = cover_image_url !== undefined && cover_image_url !== null ? String(cover_image_url).trim() : current.cover_image_url;
    const newVideo = processed?.src || (video_url !== undefined && video_url !== null ? String(video_url).trim() : current.video_url);
    const newVideoType = processed ? processed.type : current.video_type;
    const newDuration = duration_minutes !== undefined && duration_minutes !== null ? parseInt(String(duration_minutes), 10) : current.duration_minutes;
    const newFeatured = is_featured !== undefined && is_featured !== null ? (is_featured ? 1 : 0) : current.is_featured;

    await db.execute({
      sql: `
        UPDATE movies SET
          title = ?,
          release_year = ?,
          synopsis = ?,
          genre = ?,
          cover_image_url = ?,
          video_url = ?,
          video_type = ?,
          duration_minutes = ?,
          is_featured = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        newTitle,
        newYear,
        newSynopsis,
        newGenre,
        newCover,
        newVideo,
        newVideoType,
        newDuration,
        newFeatured,
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
