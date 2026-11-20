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
    const user = await getSessionUser();

    // Buscar série por ID ou por Slug
    const seriesResult = await db.execute({
      sql: `SELECT * FROM series WHERE id = ? OR slug = ? LIMIT 1`,
      args: [id, id],
    });

    if (seriesResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Série ou Anime não encontrado." },
        { status: 404 }
      );
    }

    const seriesData = seriesResult.rows[0];

    // Buscar todas as temporadas
    const seasonsResult = await db.execute({
      sql: `SELECT * FROM seasons WHERE series_id = ? ORDER BY season_number ASC`,
      args: [seriesData.id],
    });

    // Buscar todos os episódios da série
    const episodesResult = await db.execute({
      sql: `
        SELECT ep.* 
        FROM episodes ep
        WHERE ep.series_id = ?
        ORDER BY ep.episode_number ASC
      `,
      args: [seriesData.id],
    });

    // Agrupar episódios dentro de suas temporadas
    const seasons = seasonsResult.rows.map((season: any) => {
      const seasonEpisodes = episodesResult.rows.filter(
        (ep: any) => ep.season_id === season.id
      );
      return {
        ...season,
        episodes_count: seasonEpisodes.length,
        episodes: seasonEpisodes,
      };
    });

    // Se o usuário estiver logado, buscar onde ele parou na série
    let userProgress = null;
    if (user?.id) {
      const progressResult = await db.execute({
        sql: `
          SELECT sh.*, ep.title as episode_title, ep.episode_number, ep.season_id, sea.season_number
          FROM series_history sh
          INNER JOIN episodes ep ON sh.episode_id = ep.id
          INNER JOIN seasons sea ON ep.season_id = sea.id
          WHERE sh.user_id = ? AND sh.series_id = ?
          LIMIT 1
        `,
        args: [user.id, seriesData.id],
      });

      if (progressResult.rows.length > 0) {
        userProgress = progressResult.rows[0];
      }
    }

    return NextResponse.json({
      series: {
        ...seriesData,
        seasons_count: seasons.length,
        episodes_count: episodesResult.rows.length,
        seasons,
        user_progress: userProgress,
      },
    });
  } catch (error: any) {
    console.error("Erro ao obter série:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao carregar série." },
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
      synopsis,
      genre,
      content_type = "SERIES",
      cover_image_url,
      backdrop_url = "",
      release_year,
      status = "EM_ANDAMENTO",
      is_featured = 0,
      hashtags = "",
    } = body;

    const check = await db.execute({
      sql: `SELECT id FROM series WHERE id = ? LIMIT 1`,
      args: [id],
    });

    if (check.rows.length === 0) {
      return NextResponse.json(
        { error: "Série não encontrada." },
        { status: 404 }
      );
    }

    const cleanTitle = (title || "").trim();
    const finalSlug = customSlug && customSlug.trim() ? slugify(customSlug) : slugify(cleanTitle);

    await db.execute({
      sql: `
        UPDATE series
        SET title = ?,
            slug = ?,
            synopsis = ?,
            genre = ?,
            content_type = ?,
            cover_image_url = ?,
            backdrop_url = ?,
            release_year = ?,
            status = ?,
            is_featured = ?,
            hashtags = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        cleanTitle,
        finalSlug,
        synopsis ? synopsis.trim() : "",
        genre ? genre.trim() : "",
        content_type === "ANIME" ? "ANIME" : "SERIES",
        cover_image_url ? cover_image_url.trim() : "",
        backdrop_url ? backdrop_url.trim() : "",
        parseInt(release_year, 10),
        status,
        is_featured ? 1 : 0,
        typeof hashtags === "string" ? hashtags.trim() : "",
        id,
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Série atualizada com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar série:", error);
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

    // Deletar histórico de episódios da série
    await db.execute({
      sql: `DELETE FROM series_history WHERE series_id = ?`,
      args: [id],
    });

    // Deletar episódios da série
    await db.execute({
      sql: `DELETE FROM episodes WHERE series_id = ?`,
      args: [id],
    });

    // Deletar temporadas
    await db.execute({
      sql: `DELETE FROM seasons WHERE series_id = ?`,
      args: [id],
    });

    // Deletar a série
    await db.execute({
      sql: `DELETE FROM series WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({
      success: true,
      message: "Série excluída com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao excluir série:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao excluir série." },
      { status: 500 }
    );
  }
}
