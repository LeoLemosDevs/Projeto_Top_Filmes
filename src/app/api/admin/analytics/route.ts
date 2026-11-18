import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initDb();
    const user = await getSessionUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso restrito ao Administrador." },
        { status: 403 }
      );
    }

    // 1. Totais Gerais de Filmes, Views, Curtidas e Compartilhamentos
    const movieStatsRes = await db.execute(`
      SELECT 
        COUNT(*) as total_movies,
        COALESCE(SUM(views_count), 0) as total_views,
        COALESCE(SUM(likes_count), 0) as total_likes,
        COALESCE(SUM(shares_count), 0) as total_shares
      FROM movies
    `);

    // 2. Total de Usuários e Histórico Ativo
    const userStatsRes = await db.execute(`SELECT COUNT(*) as total_users FROM users`);
    const historyStatsRes = await db.execute(`SELECT COUNT(*) as active_watchers FROM history WHERE completed = 0`);

    // 3. Tráfego de Páginas e Eventos de Hoje
    const trafficTotalsRes = await db.execute(`
      SELECT
        SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) as total_page_views,
        SUM(CASE WHEN event_type = 'page_view' AND date(created_at) = date('now') THEN 1 ELSE 0 END) as page_views_today,
        SUM(CASE WHEN event_type = 'movie_view' AND date(created_at) = date('now') THEN 1 ELSE 0 END) as movie_views_today
      FROM analytics_events
    `);

    // 4. Top 10 Filmes Mais Assistidos
    const topWatchedRes = await db.execute(`
      SELECT id, title, release_year, genre, cover_image_url, 
             COALESCE(views_count, 0) as views_count,
             COALESCE(likes_count, 0) as likes_count,
             COALESCE(shares_count, 0) as shares_count,
             COALESCE(hashtags, '') as hashtags
      FROM movies
      ORDER BY views_count DESC, likes_count DESC
      LIMIT 10
    `);

    // 5. Top 5 Filmes Mais Curtidos
    const topLikedRes = await db.execute(`
      SELECT id, title, release_year, genre, cover_image_url,
             COALESCE(views_count, 0) as views_count,
             COALESCE(likes_count, 0) as likes_count,
             COALESCE(shares_count, 0) as shares_count
      FROM movies
      ORDER BY likes_count DESC, views_count DESC
      LIMIT 5
    `);

    // 6. Tráfego Diário (Últimos 14 dias)
    const dailyRes = await db.execute(`
      SELECT 
        date(created_at) as day,
        SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) as page_views,
        SUM(CASE WHEN event_type = 'movie_view' THEN 1 ELSE 0 END) as movie_views,
        SUM(CASE WHEN event_type = 'movie_like' THEN 1 ELSE 0 END) as likes,
        SUM(CASE WHEN event_type = 'movie_share' THEN 1 ELSE 0 END) as shares
      FROM analytics_events
      WHERE created_at >= datetime('now', '-13 days')
      GROUP BY date(created_at)
      ORDER BY day ASC
    `);

    // Preencher os últimos 14 dias consecutivos
    const dailyMap = new Map<string, any>();
    for (const row of dailyRes.rows) {
      dailyMap.set(String(row.day), {
        day: String(row.day),
        pageViews: Number(row.page_views || 0),
        movieViews: Number(row.movie_views || 0),
        likes: Number(row.likes || 0),
        shares: Number(row.shares || 0),
      });
    }

    const dailyTraffic = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDay = d.toISOString().slice(0, 10);
      const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      const existing = dailyMap.get(isoDay);
      dailyTraffic.push({
        day: isoDay,
        label,
        pageViews: existing ? existing.pageViews : 0,
        movieViews: existing ? existing.movieViews : 0,
        likes: existing ? existing.likes : 0,
        shares: existing ? existing.shares : 0,
      });
    }

    // 7. Desempenho por Gênero
    const genreRes = await db.execute(`
      SELECT 
        genre,
        COUNT(*) as movies_count,
        COALESCE(SUM(views_count), 0) as total_views,
        COALESCE(SUM(likes_count), 0) as total_likes,
        COALESCE(SUM(shares_count), 0) as total_shares
      FROM movies
      GROUP BY genre
      ORDER BY total_views DESC, movies_count DESC
    `);

    // 8. Atividade Recente
    const recentRes = await db.execute(`
      SELECT 
        e.id, e.event_type, e.path, e.movie_id, e.created_at,
        m.title as movie_title
      FROM analytics_events e
      LEFT JOIN movies m ON e.movie_id = m.id
      ORDER BY e.created_at DESC
      LIMIT 15
    `);

    const mStats: any = movieStatsRes.rows[0] || {};
    const uStats: any = userStatsRes.rows[0] || {};
    const hStats: any = historyStatsRes.rows[0] || {};
    const tStats: any = trafficTotalsRes.rows[0] || {};

    return NextResponse.json({
      summary: {
        totalMovies: Number(mStats.total_movies || 0),
        totalUsers: Number(uStats.total_users || 0),
        totalViews: Number(mStats.total_views || 0),
        totalLikes: Number(mStats.total_likes || 0),
        totalShares: Number(mStats.total_shares || 0),
        totalPageViews: Number(tStats.total_page_views || 0),
        pageViewsToday: Number(tStats.page_views_today || 0),
        movieViewsToday: Number(tStats.movie_views_today || 0),
        activeWatchers: Number(hStats.active_watchers || 0),
      },
      topWatched: topWatchedRes.rows,
      topLiked: topLikedRes.rows,
      dailyTraffic,
      genreBreakdown: genreRes.rows,
      recentActivity: recentRes.rows,
    });
  } catch (error: any) {
    console.error("Erro ao carregar analytics:", error);
    return NextResponse.json(
      { error: "Falha ao carregar painel de análise." },
      { status: 500 }
    );
  }
}
