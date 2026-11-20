import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
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

    const { id: seriesId } = await params;
    const body = await req.json();
    const { season_number, title, synopsis = "", cover_image_url = "" } = body;

    const num = parseInt(season_number, 10);
    if (!num || num < 1) {
      return NextResponse.json(
        { error: "Número da temporada inválido." },
        { status: 400 }
      );
    }

    const seasonTitle = title && title.trim() ? title.trim() : `Temporada ${num}`;
    const seasonId = `sea_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.execute({
      sql: `
        INSERT INTO seasons (id, series_id, season_number, title, synopsis, cover_image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [seasonId, seriesId, num, seasonTitle, synopsis.trim(), cover_image_url.trim()],
    });

    return NextResponse.json({
      success: true,
      seasonId,
      message: `${seasonTitle} adicionada com sucesso!`,
    });
  } catch (error: any) {
    console.error("Erro ao adicionar temporada:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao adicionar temporada." },
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

    const body = await req.json();
    const { season_id, season_number, title, synopsis = "", cover_image_url = "" } = body;

    if (!season_id) {
      return NextResponse.json(
        { error: "ID da temporada é obrigatório." },
        { status: 400 }
      );
    }

    await db.execute({
      sql: `
        UPDATE seasons 
        SET season_number = ?, title = ?, synopsis = ?, cover_image_url = ?
        WHERE id = ?
      `,
      args: [
        parseInt(season_number, 10),
        title.trim(),
        synopsis.trim(),
        cover_image_url.trim(),
        season_id,
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Temporada atualizada com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar temporada:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar temporada." },
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

    const { searchParams } = new URL(req.url);
    const seasonId = searchParams.get("seasonId");

    if (!seasonId) {
      return NextResponse.json(
        { error: "ID da temporada é obrigatório." },
        { status: 400 }
      );
    }

    // Excluir episódios da temporada
    await db.execute({
      sql: `DELETE FROM episodes WHERE season_id = ?`,
      args: [seasonId],
    });

    // Excluir a temporada
    await db.execute({
      sql: `DELETE FROM seasons WHERE id = ?`,
      args: [seasonId],
    });

    return NextResponse.json({
      success: true,
      message: "Temporada e seus episódios excluídos com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao excluir temporada:", error);
    return NextResponse.json(
      { error: "Erro ao excluir temporada." },
      { status: 500 }
    );
  }
}
