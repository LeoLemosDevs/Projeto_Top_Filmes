import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await initDb();
    const body = await req.json().catch(() => ({}));
    const path = typeof body.path === "string" ? body.path.slice(0, 200) : "/";
    const movieId = typeof body.movieId === "string" ? body.movieId : null;

    // Não rastrear visitas ao próprio painel admin
    if (path.startsWith("/admin")) {
      return NextResponse.json({ tracked: false });
    }

    const user = await getSessionUser();
    const cookieStore = cookies();
    const visitorId = cookieStore.get("tf_visitor_id")?.value;
    const actorKey = user ? `usr:${user.id}` : visitorId ? `vis:${visitorId}` : "anon";
    const userAgent = (req.headers.get("user-agent") || "").slice(0, 180);

    const evtId = `pv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.execute({
      sql: `
        INSERT INTO analytics_events (id, event_type, path, movie_id, actor_key, user_agent)
        VALUES (?, 'page_view', ?, ?, ?, ?)
      `,
      args: [evtId, path, movieId, actorKey, userAgent],
    });

    return NextResponse.json({ tracked: true });
  } catch (error) {
    return NextResponse.json({ tracked: false });
  }
}
