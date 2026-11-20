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
      return NextResponse.json({ history: [] });
    }

    const result = await db.execute({
      sql: `
        SELECT sh.*,
               s.title as series_title, s.slug as series_slug, s.cover_image_url as series_cover, s.content_type,
               ep.title as episode_title, ep.episode_number, ep.thumbnail_url as episode_thumbnail,
               sea.season_number, sea.title as season_title
        FROM series_history sh
        INNER JOIN series s ON sh.series_id = s.id
        INNER JOIN episodes ep ON sh.episode_id = ep.id
        INNER JOIN seasons sea ON ep.season_id = sea.id
        WHERE sh.user_id = ?
        ORDER BY sh.updated_at DESC
        LIMIT 20
      `,
      args: [user.id],
    });

    return NextResponse.json({ history: result.rows });
  } catch (error: any) {
    console.error("Erro ao listar histórico de séries:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico de séries." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await initDb();
    const user = await getSessionUser();
    if (!user) {
      // Permitir que o client salve em localStorage se não autenticado
      return NextResponse.json({ guest: true });
    }

    const body = await req.json();
    const { series_id, episode_id, progress_seconds = 0, duration_seconds = 0, completed = 0 } = body;

    if (!series_id || !episode_id) {
      return NextResponse.json(
        { error: "ID da série e ID do episódio são obrigatórios." },
        { status: 400 }
      );
    }

    const historyId = `sh_${user.id}_${series_id}`;

    await db.execute({
      sql: `
        INSERT INTO series_history (
          id, user_id, series_id, episode_id,
          progress_seconds, duration_seconds, completed, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, series_id) DO UPDATE SET
          episode_id = excluded.episode_id,
          progress_seconds = excluded.progress_seconds,
          duration_seconds = excluded.duration_seconds,
          completed = excluded.completed,
          updated_at = CURRENT_TIMESTAMP
      `,
      args: [
        historyId,
        user.id,
        series_id,
        episode_id,
        Math.floor(progress_seconds),
        Math.floor(duration_seconds),
        completed ? 1 : 0,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao registrar progresso da série:", error);
    return NextResponse.json(
      { error: "Erro ao salvar progresso." },
      { status: 500 }
    );
  }
}
