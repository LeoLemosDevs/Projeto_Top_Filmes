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
        SELECT h.id as history_id, h.progress_seconds, h.duration_seconds, h.completed, h.updated_at,
               m.*
        FROM history h
        INNER JOIN movies m ON h.movie_id = m.id
        WHERE h.user_id = ? AND h.completed = 0
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
      // Se não estiver logado, não quebra o player
      return NextResponse.json({ success: false, anonymous: true });
    }

    const { movieId, progressSeconds = 0, durationSeconds = 0 } = await req.json();
    if (!movieId) {
      return NextResponse.json(
        { error: "ID do filme é obrigatório." },
        { status: 400 }
      );
    }

    // Se assistiu mais de 90%, marca como completed
    const completed = durationSeconds > 0 && progressSeconds / durationSeconds > 0.9 ? 1 : 0;

    const existing = await db.execute({
      sql: `SELECT id FROM history WHERE user_id = ? AND movie_id = ?`,
      args: [user.id, movieId],
    });

    if (existing.rows.length > 0) {
      await db.execute({
        sql: `
          UPDATE history SET 
            progress_seconds = ?,
            duration_seconds = ?,
            completed = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND movie_id = ?
        `,
        args: [progressSeconds, durationSeconds, completed, user.id, movieId],
      });
    } else {
      const historyId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db.execute({
        sql: `
          INSERT INTO history (id, user_id, movie_id, progress_seconds, duration_seconds, completed)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [historyId, user.id, movieId, progressSeconds, durationSeconds, completed],
      });
    }

    return NextResponse.json({ success: true, completed });
  } catch (error: any) {
    console.error("Erro ao salvar histórico:", error);
    return NextResponse.json(
      { error: "Falha ao registrar histórico." },
      { status: 500 }
    );
  }
}
