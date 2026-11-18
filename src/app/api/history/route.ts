import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await initDb();
    const user = await getSessionUser();
    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get("movieId");

    if (!user) {
      if (movieId) {
        return NextResponse.json({
          progressSeconds: 0,
          durationSeconds: 0,
          completed: false,
          anonymous: true,
        });
      }
      return NextResponse.json({ history: [] });
    }

    // Buscar progresso específico de um filme (para "Continuar de onde parou")
    if (movieId) {
      const itemRes = await db.execute({
        sql: `
          SELECT progress_seconds, duration_seconds, completed, updated_at
          FROM history
          WHERE user_id = ? AND movie_id = ?
          LIMIT 1
        `,
        args: [user.id, movieId],
      });

      if (itemRes.rows.length === 0) {
        return NextResponse.json({
          progressSeconds: 0,
          durationSeconds: 0,
          completed: false,
        });
      }

      const row: any = itemRes.rows[0];
      return NextResponse.json({
        progressSeconds: Number(row.progress_seconds || 0),
        durationSeconds: Number(row.duration_seconds || 0),
        completed: Boolean(row.completed),
        updatedAt: row.updated_at,
      });
    }

    const result = await db.execute({
      sql: `
        SELECT h.id as history_id, h.progress_seconds, h.duration_seconds, h.completed, h.updated_at,
               m.*
        FROM history h
        INNER JOIN movies m ON h.movie_id = m.id
        WHERE h.user_id = ? AND h.completed = 0 AND h.progress_seconds > 5
        ORDER BY h.updated_at DESC
        LIMIT 20
      `,
      args: [user.id],
    });

    return NextResponse.json({
      history: result.rows,
    });
  } catch (error: any) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json(
      { error: "Falha ao carregar histórico." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await initDb();
    const user = await getSessionUser();
    if (!user) {
      // Se não estiver logado, não quebra o player (fallback salvo em localStorage no cliente)
      return NextResponse.json({ success: false, anonymous: true });
    }

    const { movieId, progressSeconds = 0, durationSeconds = 0, reset = false } = await req.json();
    if (!movieId) {
      return NextResponse.json(
        { error: "ID do filme é obrigatório." },
        { status: 400 }
      );
    }

    const safeProgress = reset ? 0 : Math.max(0, Math.floor(Number(progressSeconds) || 0));
    const safeDuration = Math.max(0, Math.floor(Number(durationSeconds) || 0));

    // Se assistiu mais de 92% e não é reset, marca como concluído
    const completed = !reset && safeDuration > 60 && safeProgress / safeDuration > 0.92 ? 1 : 0;

    const existing = await db.execute({
      sql: `SELECT id FROM history WHERE user_id = ? AND movie_id = ?`,
      args: [user.id, movieId],
    });

    if (existing.rows.length > 0) {
      await db.execute({
        sql: `
          UPDATE history SET 
            progress_seconds = ?,
            duration_seconds = CASE WHEN ? > 0 THEN ? ELSE duration_seconds END,
            completed = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND movie_id = ?
        `,
        args: [safeProgress, safeDuration, safeDuration, completed, user.id, movieId],
      });
    } else {
      const historyId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db.execute({
        sql: `
          INSERT INTO history (id, user_id, movie_id, progress_seconds, duration_seconds, completed)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [historyId, user.id, movieId, safeProgress, safeDuration, completed],
      });
    }

    return NextResponse.json({
      success: true,
      progressSeconds: safeProgress,
      completed: Boolean(completed),
    });
  } catch (error: any) {
    console.error("Erro ao salvar histórico:", error);
    return NextResponse.json(
      { error: "Falha ao registrar histórico." },
      { status: 500 }
    );
  }
}
