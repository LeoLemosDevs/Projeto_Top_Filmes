import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(req: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get("type"); // 'SERIES' | 'ANIME'
    const genre = searchParams.get("genre");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    let sql = `
      SELECT s.*,
             (SELECT COUNT(*) FROM seasons sea WHERE sea.series_id = s.id) as seasons_count,
             (SELECT COUNT(*) FROM episodes ep WHERE ep.series_id = s.id) as episodes_count
      FROM series s
    `;
    const where: string[] = [];
    const args: any[] = [];

    if (contentType) {
      where.push(`s.content_type = ?`);
      args.push(contentType.toUpperCase());
    }

    if (genre) {
      where.push(`s.genre = ?`);
      args.push(genre);
    }

    if (featured === "1") {
      where.push(`s.is_featured = 1`);
    }

    if (search) {
      const cleanSearch = search.trim();
      const cleanNoHash = cleanSearch.startsWith("#") ? cleanSearch.slice(1) : cleanSearch;
      where.push(`(s.title LIKE ? OR s.synopsis LIKE ? OR s.hashtags LIKE ? OR s.genre LIKE ?)`);
      args.push(`%${cleanSearch}%`);
      args.push(`%${cleanSearch}%`);
      args.push(`%${cleanNoHash}%`);
      args.push(`%${cleanNoHash}%`);
    }

    if (where.length > 0) {
      sql += ` WHERE ` + where.join(" AND ");
    }

    sql += ` ORDER BY s.created_at DESC`;

    const result = await db.execute({ sql, args });

    return NextResponse.json({ series: result.rows });
  } catch (error: any) {
    console.error("Erro ao listar séries:", error);
    return NextResponse.json(
      { error: "Falha ao carregar catálogo de séries." },
      { status: 500 }
    );
  }
}

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
      title,
      slug: customSlug,
      synopsis,
      genre,
      content_type = "SERIES",
      cover_image_url,
      backdrop_url = "",
      release_year,
      status = "EM_ANDAMENTO",
      is_featured = 0,
      hashtags = "",
    } = body;

    if (!title || !synopsis || !genre || !cover_image_url || !release_year) {
      return NextResponse.json(
        { error: "Título, sinopse, gênero, pôster e ano de lançamento são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanTitle = title.trim();
    const finalSlug = customSlug && customSlug.trim() ? slugify(customSlug) : slugify(cleanTitle);
    const seriesId = `ser_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const normalizedType = content_type === "ANIME" ? "ANIME" : "SERIES";

    await db.execute({
      sql: `
        INSERT INTO series (
          id, title, slug, synopsis, genre, content_type,
          cover_image_url, backdrop_url, release_year, status,
          is_featured, hashtags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        seriesId,
        cleanTitle,
        finalSlug,
        synopsis.trim(),
        genre.trim(),
        normalizedType,
        cover_image_url.trim(),
        backdrop_url.trim(),
        parseInt(release_year, 10),
        status,
        is_featured ? 1 : 0,
        typeof hashtags === "string" ? hashtags.trim() : "",
      ],
    });

    // Criar automaticamente a "Temporada 1" por padrão para facilitar o cadastro
    const seasonId = `sea_${Date.now()}_1`;
    await db.execute({
      sql: `INSERT OR IGNORE INTO seasons (id, series_id, season_number, title) VALUES (?, ?, 1, 'Temporada 1')`,
      args: [seasonId, seriesId],
    });

    return NextResponse.json({
      success: true,
      seriesId,
      message: `${normalizedType === "ANIME" ? "Anime" : "Série"} cadastrado(a) com sucesso!`,
    });
  } catch (error: any) {
    console.error("Erro ao cadastrar série:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao cadastrar no sistema." },
      { status: 500 }
    );
  }
}
