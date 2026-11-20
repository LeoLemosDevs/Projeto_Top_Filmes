import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";
import { resolveVideoUrlAsync } from "@/lib/video-helper";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await initDb();
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso restrito ao Administrador." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      season_id,
      series_id,
      episode_number,
      title,
      synopsis = "",
      duration_minutes = 45,
      thumbnail_url = "",
      video_url,
    } = body;

    if (!season_id || !series_id || !episode_number || !title || !video_url) {
      return NextResponse.json(
        { error: "Temporada, série, número, título e link do vídeo são obrigatórios." },
        { status: 400 }
      );
    }

    const epNum = parseInt(episode_number, 10);
    const duration = parseInt(duration_minutes, 10) || 45;

    // Resolução inteligente do link do vídeo (TokyVideo ID, Dailymotion, Google Drive, YouTube, etc.)
    const processed = await resolveVideoUrlAsync(video_url);
    const finalVideoUrl = processed.src || video_url.trim();

    const episodeId = `ep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.execute({
      sql: `
        INSERT INTO episodes (
          id, season_id, series_id, episode_number, title,
          synopsis, duration_minutes, thumbnail_url,
          video_url, video_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        episodeId,
        season_id,
        series_id,
        epNum,
        title.trim(),
        synopsis.trim(),
        duration,
        thumbnail_url.trim(),
        finalVideoUrl,
        processed.type,
      ],
    });

    return NextResponse.json({
      success: true,
      episodeId,
      message: `Episódio ${epNum} cadastrado com sucesso!`,
    });
  } catch (error: any) {
    console.error("Erro ao cadastrar episódio:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao cadastrar episódio." },
      { status: 500 }
    );
  }
}
