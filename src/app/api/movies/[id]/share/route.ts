import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await initDb();
    const movieId = params.id;
    const user = await getSessionUser();

    await db.execute({
      sql: `UPDATE movies SET shares_count = COALESCE(shares_count, 0) + 1 WHERE id = ?`,
      args: [movieId],
    });

    const evtId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.execute({
      sql: `INSERT INTO analytics_events (id, event_type, path, movie_id, actor_key) VALUES (?, 'movie_share', ?, ?, ?)`,
      args: [evtId, `/assistir/${movieId}`, movieId, user ? `usr:${user.id}` : "anon"],
    }).catch(() => {});

    const updated = await db.execute({
      sql: `SELECT shares_count FROM movies WHERE id = ?`,
      args: [movieId],
    });

    return NextResponse.json({
      success: true,
      sharesCount: Number(updated.rows[0]?.shares_count || 0),
    });
  } catch (error: any) {
    console.error("Erro ao registrar compartilhamento:", error);
    return NextResponse.json({ error: "Falha ao registrar compartilhamento." }, { status: 500 });
  }
}
