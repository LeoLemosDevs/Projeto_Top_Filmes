import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import { getSessionUser } from "@/lib/auth";
import { processVideoUrl, resolveVideoUrlAsync } from "@/lib/video-helper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const genre = searchParams.get("genre");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const grouped = searchParams.get("grouped");

    // Se pedir agrupado por categorias para a home
    if (grouped === "1") {
      const categoriesResult = await db.execute(`
        SELECT id, name, slug, display_order 
        FROM categories 
        ORDER BY display_order ASC
      `);

      const moviesResult = await db.execute(`
        SELECT m.*, mc.category_id
        FROM movies m
        INNER JOIN movie_categories mc ON m.id = mc.movie_id
        ORDER BY m.created_at DESC
      `);

      const categoriesWithMovies = categoriesResult.rows.map((cat: any) => {
        const catMovies = moviesResult.rows
          .filter((m: any) => m.category_id === cat.id)
          .map((m: any) => {
            const { category_id, ...movieData } = m;
            return movieData;
          });

        return {
          ...cat,
          movies: catMovies,
        };
      });

      // Também buscar filmes em destaque para o banner
      const featuredResult = await db.execute(`
        SELECT * FROM movies WHERE is_featured = 1 ORDER BY updated_at DESC LIMIT 5
      `);

      return NextResponse.json({
        categories: categoriesWithMovies,
        featured: featuredResult.rows.length > 0 ? featuredResult.rows : moviesResult.rows.slice(0, 3),
      });
    }

    // Consulta customizada
    let sql = `
      SELECT DISTINCT m.* 
      FROM movies m
    `;
    const joins: string[] = [];
    const where: string[] = [];
    const args: any[] = [];

    if (categorySlug) {
      joins.push(`INNER JOIN movie_categories mc ON m.id = mc.movie_id`);
      joins.push(`INNER JOIN categories c ON mc.category_id = c.id`);
      where.push(`c.slug = ?`);
      args.push(categorySlug);
    }

    if (genre) {
      where.push(`m.genre = ?`);
      args.push(genre);
    }

    if (search) {
      const cleanSearch = search.trim();
      const searchNoHash = cleanSearch.startsWith("#") ? cleanSearch.slice(1) : cleanSearch;
      where.push(`(m.title LIKE ? OR m.synopsis LIKE ? OR m.hashtags LIKE ? OR m.genre LIKE ?)`);
      args.push(`%${cleanSearch}%`);
      args.push(`%${cleanSearch}%`);
      args.push(`%${searchNoHash}%`);
      args.push(`%${searchNoHash}%`);
    }

    if (featured === "1") {
      where.push(`m.is_featured = 1`);
    }

    if (joins.length > 0) {
      sql += " " + joins.join(" ");
    }
    if (where.length > 0) {
      sql += " WHERE " + where.join(" AND ");
    }

    sql += " ORDER BY m.created_at DESC";

    const result = await db.execute({ sql, args });

    return NextResponse.json({
      movies: result.rows,
    });
  } catch (error: any) {
    console.error("Erro ao buscar filmes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar catálogo de filmes." },
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
      release_year,
      synopsis,
      genre,
      cover_image_url,
      video_url,
      categories, // array de slugs ou ids de categorias
      duration_minutes = 110,
      is_featured = 0,
      hashtags = "",
    } = body;

    if (!title || !release_year || !synopsis || !genre || !cover_image_url || !video_url) {
      return NextResponse.json(
        { error: "Por favor preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    const movieId = `mov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const processed = await resolveVideoUrlAsync(video_url);
    const finalVideoUrl = processed.src || video_url.trim();
    const cleanHashtags = typeof hashtags === "string" ? hashtags.trim() : "";

    await db.execute({
      sql: `
        INSERT INTO movies (
          id, title, release_year, synopsis, genre, 
          cover_image_url, video_url, video_type, 
          duration_minutes, is_featured, hashtags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        movieId,
        title.trim(),
        parseInt(release_year, 10),
        synopsis.trim(),
        genre.trim(),
        cover_image_url.trim(),
        finalVideoUrl,
        processed.type,
        parseInt(duration_minutes, 10) || 100,
        is_featured ? 1 : 0,
        cleanHashtags,
      ],
    });

    // Vincular categorias se enviadas
    if (Array.isArray(categories) && categories.length > 0) {
      for (const catIdentifier of categories) {
        // Obter id da categoria por slug ou id
        const catQuery = await db.execute({
          sql: `SELECT id FROM categories WHERE id = ? OR slug = ?`,
          args: [catIdentifier, catIdentifier],
        });

        if (catQuery.rows.length > 0) {
          const categoryId = catQuery.rows[0].id as string;
          await db.execute({
            sql: `INSERT OR IGNORE INTO movie_categories (movie_id, category_id) VALUES (?, ?)`,
            args: [movieId, categoryId],
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      movieId,
      message: "Filme publicado com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao cadastrar filme:", error);
    return NextResponse.json(
      { error: "Falha ao publicar o filme no sistema." },
      { status: 500 }
    );
  }
}
