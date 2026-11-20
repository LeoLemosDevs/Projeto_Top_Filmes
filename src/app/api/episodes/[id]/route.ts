import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";
import { resolveVideoUrlAsync } from "@/lib/video-helper";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;

    const epResult = await db.execute({
      sql: `
        SELECT ep.*, 
               sea.season_number, sea.title as season_title,
               s.title as series_title, s.slug as series_slug, s.content_type, s.cover_image_url as series_cover
        FROM episodes ep
        INNER JOIN seasons sea ON ep.season_id = sea.id
        INNER JOIN series s ON ep.series_id = s.id
        WHERE ep.id = ?
        LIMIT 1
      `,
      args: [id],
    });

    if (epResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Episódio não encontrado." },
        { status: 404 }
      );
    }

    const episode = epResult.rows[0];

    // Incrementar visualizações do episódio
    try {
      await db.execute({
        sql: `UPDATE episodes SET views_count = views_count + 1 WHERE id = ?`,
        args: [id],
      });
      await db.execute({
        sql: `UPDATE series SET views_count = views_count + 1 WHERE id = ?`,
        args: [episode.series_id],
      });
    } catch {}

    // Buscar episódio anterior e próximo na mesma série
    const allEpisodes = await db.execute({
      sql: `
        SELECT ep.id, ep.season_id, ep.episode_number, ep.title, ep.thumbnail_url, ep.duration_minutes,
               sea.season_number
        FROM episodes ep
        INNER JOIN seasons sea ON ep.season_id = sea.id
        WHERE ep.series_id = ?
        ORDER BY sea.season_number ASC, ep.episode_number ASC
      `,
      args: [episode.series_id],
    });

    const currentIndex = allEpisodes.rows.findIndex((e: any) => e.id === id);
    const prevEpisode = currentIndex > 0 ? allEpisodes.rows[currentIndex - 1] : null;
    const nextEpisode = currentIndex >= 0 && currentIndex < allEpisodes.rows.length - 1 ? allEpisodes.rows[currentIndex + 1] : null;

    return NextResponse.json({
      episode,
      prevEpisode,
      nextEpisode,
      allEpisodes: allEpisodes.rows,
    });
  } catch (error: any) {
    console.error("Erro ao obter episódio:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao carregar episódio." },
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
      synopsis = "",
      episode_number,
      duration_minutes = 45,
      thumbnail_url = "",
      video_url,
    } = body;

    const check = await db.execute({
      sql: `SELECT id, video_url FROM episodes WHERE id = ? LIMIT 1`,
      args: [id],
    });

    if (check.rows.length === 0) {
      return NextResponse.json(
        { error: "Episódio não encontrado." },
        { status: 404 }
      );
    }

    const epNum = parseInt(episode_number, 10);
    const duration = parseInt(duration_minutes, 10) || 45;

    let finalVideoUrl = video_url ? video_url.trim() : (check.rows[0].video_url as string);
    let videoType = "embed";

    if (video_url && video_url.trim() !== check.rows[0].video_url) {
      const processed = await resolveVideoUrlAsync(video_url);
      finalVideoUrl = processed.src || video_url.trim();
      videoType = processed.type;
    }

    await db.execute({
      sql: `
        UPDATE episodes
        SET title = ?,
            synopsis = ?,
            episode_number = ?,
            duration_minutes = ?,
            thumbnail_url = ?,
            video_url = ?,
            video_type = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        title ? title.trim() : "",
        synopsis ? synopsis.trim() : "",
        epNum,
        duration,
        thumbnail_url ? thumbnail_url.trim() : "",
        finalVideoUrl,
        videoType,
        id,
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Episódio atualizado com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar episódio:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao atualizar episódio." },
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
      sql: `DELETE FROM series_history WHERE episode_id = ?`,
      args: [id],
    });

    await db.execute({
      sql: `DELETE FROM episodes WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({
      success: true,
      message: "Episódio excluído com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao excluir episódio:", error);
    return NextResponse.json(
      { error: "Erro ao excluir episódio." },
      { status: 500 }
    );
  }
}
