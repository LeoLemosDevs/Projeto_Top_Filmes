import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VISITOR_COOKIE = "tf_visitor_id";

async function getActorKey() {
  const user = await getSessionUser();
  if (user?.id) {
    return { actorKey: `usr:${user.id}`, newVisitorId: null };
  }

  const cookieStore = cookies();
  const existing = cookieStore.get(VISITOR_COOKIE)?.value;
  if (existing) {
    return { actorKey: `vis:${existing}`, newVisitorId: null };
  }

  const generated = `v_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  return { actorKey: `vis:${generated}`, newVisitorId: generated };
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await initDb();
    const movieId = params.id;
    const { actorKey } = await getActorKey();

    const movieRes = await db.execute({
      sql: `SELECT likes_count FROM movies WHERE id = ?`,
      args: [movieId],
    });

    if (movieRes.rows.length === 0) {
      return NextResponse.json({ error: "Filme não encontrado." }, { status: 404 });
    }

    const likeRes = await db.execute({
      sql: `SELECT id FROM movie_likes WHERE movie_id = ? AND actor_key = ?`,
      args: [movieId, actorKey],
    });

    return NextResponse.json({
      liked: likeRes.rows.length > 0,
      likesCount: Number(movieRes.rows[0].likes_count || 0),
    });
  } catch (error: any) {
    console.error("Erro ao consultar curtida:", error);
    return NextResponse.json({ error: "Erro ao consultar curtidas." }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await initDb();
    const movieId = params.id;
    const { actorKey, newVisitorId } = await getActorKey();

    const movieCheck = await db.execute({
      sql: `SELECT id, likes_count FROM movies WHERE id = ?`,
      args: [movieId],
    });

    if (movieCheck.rows.length === 0) {
      return NextResponse.json({ error: "Filme não encontrado." }, { status: 404 });
    }

    const existing = await db.execute({
      sql: `SELECT id FROM movie_likes WHERE movie_id = ? AND actor_key = ?`,
      args: [movieId, actorKey],
    });

    let liked = false;

    if (existing.rows.length > 0) {
      // Remover curtida
      await db.execute({
        sql: `DELETE FROM movie_likes WHERE movie_id = ? AND actor_key = ?`,
        args: [movieId, actorKey],
      });
      await db.execute({
        sql: `UPDATE movies SET likes_count = MAX(0, COALESCE(likes_count, 0) - 1) WHERE id = ?`,
        args: [movieId],
      });
      liked = false;
    } else {
      // Adicionar curtida
      const likeId = `lk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.execute({
        sql: `INSERT OR IGNORE INTO movie_likes (id, movie_id, actor_key) VALUES (?, ?, ?)`,
        args: [likeId, movieId, actorKey],
      });
      await db.execute({
        sql: `UPDATE movies SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = ?`,
        args: [movieId],
      });

      // Registrar no analytics
      const evtId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.execute({
        sql: `INSERT INTO analytics_events (id, event_type, path, movie_id, actor_key) VALUES (?, 'movie_like', ?, ?, ?)`,
        args: [evtId, `/assistir/${movieId}`, movieId, actorKey],
      }).catch(() => {});

      liked = true;
    }

    const updated = await db.execute({
      sql: `SELECT likes_count FROM movies WHERE id = ?`,
      args: [movieId],
    });

    const response = NextResponse.json({
      success: true,
      liked,
      likesCount: Number(updated.rows[0]?.likes_count || 0),
    });

    if (newVisitorId) {
      response.cookies.set(VISITOR_COOKIE, newVisitorId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    console.error("Erro ao curtir filme:", error);
    return NextResponse.json({ error: "Falha ao registrar curtida." }, { status: 500 });
  }
}
