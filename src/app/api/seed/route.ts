import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";

export const dynamic = "force-dynamic";

const SEED_MOVIES = [
  {
    title: "Top Gun: Ases Indomáveis",
    release_year: 1986,
    synopsis: "A escola de armas de combate da Marinha é onde os melhores dos melhores treinam. Pete 'Maverick' Mitchell é um ousado piloto que compete para ser o melhor dos melhores.",
    genre: "Ação",
    cover_image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    video_url: "https://www.youtube.com/watch?v=qSqVVswa420",
    duration_minutes: 110,
    is_featured: 1,
    categories: ["anos-80", "super-cine", "classicos", "forca-total"]
  },
  {
    title: "De Volta para o Futuro",
    release_year: 1985,
    synopsis: "Marty McFly, um adolescente de 17 anos, é acidentalmente enviado trinta anos no passado em um DeLorean que viaja no tempo, inventado pelo excêntrico cientista Doc Brown.",
    genre: "Ficção Científica",
    cover_image_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    video_url: "https://www.youtube.com/watch?v=qvsgGtivCgs",
    duration_minutes: 116,
    is_featured: 1,
    categories: ["anos-80", "sessao-da-tarde", "classicos"]
  },
  {
    title: "O Exterminador do Futuro 2",
    release_year: 1991,
    synopsis: "Um ciborgue idêntico ao que tentou matar Sarah Connor agora deve proteger seu filho de dez anos, John, de um ciborgue mais avançado e poderoso feito de metal líquido.",
    genre: "Ação",
    cover_image_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80",
    video_url: "https://www.youtube.com/watch?v=CRRlbK5w8AE",
    duration_minutes: 137,
    is_featured: 0,
    categories: ["anos-90", "temperatura-maxima", "tele-cine"]
  },
  {
    title: "Curtindo a Vida Adoidado",
    release_year: 1986,
    synopsis: "Um garoto do ensino médio com um talento para matar aula decide ter um dia especial de folga de Chicago com sua namorada e seu melhor amigo antes de se formar.",
    genre: "Aventura",
    cover_image_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
    video_url: "https://www.youtube.com/watch?v=0h6bXF5u4gA",
    duration_minutes: 103,
    is_featured: 0,
    categories: ["anos-80", "sessao-da-tarde", "classicos"]
  },
  {
    title: "Matrix",
    release_year: 1999,
    synopsis: "Quando uma bela estranha leva o hacker Neo a um submundo proibido, ele descobre a verdade chocante: a vida que ele conhece é uma elaborada simulação criada por inteligências artificiais.",
    genre: "Ficção Científica",
    cover_image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    video_url: "https://www.youtube.com/watch?v=vKQi3bBA1y8",
    duration_minutes: 136,
    is_featured: 1,
    categories: ["anos-90", "intercine", "super-cine", "sessao-das-10"]
  },
  {
    title: "Gladiador",
    release_year: 2000,
    synopsis: "Um ex-general romano parte em busca de vingança contra o imperador corrupto que assassinou sua família e o enviou para a escravidão nas arenas de batalha.",
    genre: "Ação",
    cover_image_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    video_url: "https://www.youtube.com/watch?v=owK1qxDselE",
    duration_minutes: 155,
    is_featured: 0,
    categories: ["anos-2000", "tele-cine", "super-cine"]
  },
  {
    title: "O Poderoso Chefão",
    release_year: 1972,
    synopsis: "O patriarca idoso de uma dinastia do crime organizado em Nova York transfere o controle de seu império clandestino para seu filho mais novo e relutante.",
    genre: "Policial",
    cover_image_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    video_url: "https://www.youtube.com/watch?v=sY1S349g3gU",
    duration_minutes: 175,
    is_featured: 0,
    categories: ["anos-70", "classicos", "corujao"]
  },
  {
    title: "Rambo: Programado Para Matar",
    release_year: 1982,
    synopsis: "Um veterano do Vietnã traumatizado recorre a suas habilidades de combate quando um xerife autoritário e seus delegados o perseguem pelas florestas de Oregon.",
    genre: "Ação",
    cover_image_url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80",
    video_url: "https://www.youtube.com/watch?v=4vPeTSRw580",
    duration_minutes: 93,
    is_featured: 0,
    categories: ["anos-80", "forca-total", "temperatura-maxima"]
  }
];

export async function GET() {
  try {
    await initDb();

    // Checar se já temos filmes
    const countCheck = await db.execute("SELECT COUNT(*) as count FROM movies");
    const count = Number(countCheck.rows[0].count);

    if (count > 0) {
      return NextResponse.json({
        message: "Banco de dados já contém filmes cadastrados.",
        total: count,
      });
    }

    // Inserir filmes de exemplo
    for (const item of SEED_MOVIES) {
      const movieId = `mov_seed_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db.execute({
        sql: `
          INSERT INTO movies (
            id, title, release_year, synopsis, genre, 
            cover_image_url, video_url, video_type, 
            duration_minutes, is_featured
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'youtube', ?, ?)
        `,
        args: [
          movieId,
          item.title,
          item.release_year,
          item.synopsis,
          item.genre,
          item.cover_image_url,
          item.video_url,
          item.duration_minutes,
          item.is_featured,
        ],
      });

      for (const slug of item.categories) {
        const catRes = await db.execute({
          sql: "SELECT id FROM categories WHERE slug = ?",
          args: [slug],
        });
        if (catRes.rows.length > 0) {
          await db.execute({
            sql: "INSERT OR IGNORE INTO movie_categories (movie_id, category_id) VALUES (?, ?)",
            args: [movieId, catRes.rows[0].id],
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Banco semeado com sucesso com os grandes clássicos do Top Filmes!",
      total_created: SEED_MOVIES.length,
    });
  } catch (error: any) {
    console.error("Erro no seed:", error);
    return NextResponse.json(
      { error: "Falha ao popular o banco de dados." },
      { status: 500 }
    );
  }
}
