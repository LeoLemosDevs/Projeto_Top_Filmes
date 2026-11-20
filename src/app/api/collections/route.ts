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
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");

    let sql = `
      SELECT c.*,
             (SELECT COUNT(*) FROM collection_movies cm WHERE cm.collection_id = c.id) as movies_count
      FROM collections c
    `;
    const where: string[] = [];
    const args: any[] = [];

    if (featured === "1") {
      where.push(`c.is_featured = 1`);
    }

    if (search) {
      where.push(`(c.title LIKE ? OR c.synopsis LIKE ?)`);
      args.push(`%${search.trim()}%`);
      args.push(`%${search.trim()}%`);
    }

    if (where.length > 0) {
      sql += ` WHERE ` + where.join(" AND ");
    }

    sql += ` ORDER BY c.created_at DESC`;

    const result = await db.execute({ sql, args });

    // Para cada coleção, buscar até 4 filmes para preview de cartazes
    const collections = await Promise.all(
      result.rows.map(async (row: any) => {
        const moviesResult = await db.execute({
          sql: `
            SELECT m.id, m.title, m.cover_image_url, m.release_year, cm.order_index
            FROM movies m
            INNER JOIN collection_movies cm ON m.id = cm.movie_id
            WHERE cm.collection_id = ?
            ORDER BY cm.order_index ASC
            LIMIT 4
          `,
          args: [row.id],
        });

        return {
          ...row,
          movies: moviesResult.rows,
        };
      })
    );

    return NextResponse.json({ collections });
  } catch (error: any) {
    console.error("Erro ao listar coleções:", error);
    return NextResponse.json(
      { error: "Falha ao carregar sagas e coleções." },
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
      synopsis = "",
      cover_image_url = "",
      backdrop_url = "",
      is_featured = 0,
      movie_ids = [],
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "O título da saga/coleção é obrigatório." },
        { status: 400 }
      );
    }

    const cleanTitle = title.trim();
    const finalSlug = customSlug && customSlug.trim() ? slugify(customSlug) : slugify(cleanTitle);
    const collectionId = `col_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.execute({
      sql: `
        INSERT INTO collections (
          id, title, slug, synopsis, cover_image_url, backdrop_url, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        collectionId,
        cleanTitle,
        finalSlug,
        synopsis.trim(),
        cover_image_url.trim(),
        backdrop_url.trim(),
        is_featured ? 1 : 0,
      ],
    });

    // Inserir filmes vinculados com a ordem
    if (Array.isArray(movie_ids) && movie_ids.length > 0) {
      for (let i = 0; i < movie_ids.length; i++) {
        const mId = movie_ids[i];
        if (mId) {
          await db.execute({
            sql: `INSERT OR IGNORE INTO collection_movies (collection_id, movie_id, order_index) VALUES (?, ?, ?)`,
            args: [collectionId, mId, i + 1],
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      collectionId,
      message: "Saga/Coleção criada com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao criar saga/coleção:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao criar saga/coleção." },
      { status: 500 }
    );
  }
}
