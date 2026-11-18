import type { Metadata } from "next";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";
import WatchClient from "./WatchClient";

export const dynamic = "force-dynamic";

async function getMovieForSeo(id: string) {
  try {
    await initDb();
    const res = await db.execute({
      sql: `SELECT id, title, release_year, synopsis, genre, cover_image_url, duration_minutes, views_count, likes_count, hashtags, created_at FROM movies WHERE id = ?`,
      args: [id],
    });
    if (res.rows.length === 0) return null;
    return res.rows[0] as any;
  } catch {
    return null;
  }
}

function extractKeywords(movie: any): string[] {
  const base = [
    movie.title,
    `${movie.title} assistir online`,
    `${movie.title} ${movie.release_year}`,
    movie.genre,
    "Top Filmes",
    "filmes clássicos",
    "assistir filme completo",
  ];

  const tags = String(movie.hashtags || "")
    .split(/[\s,]+/)
    .map((t) => t.replace(/^#/, "").trim())
    .filter(Boolean);

  return Array.from(new Set([...base, ...tags]));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const movie = await getMovieForSeo(params.id);

  if (!movie) {
    return {
      title: "Assistir Filme | Top Filmes",
      description: "Assista aos maiores clássicos do cinema online grátis no Top Filmes.",
    };
  }

  const hashtagsText = movie.hashtags ? ` ${movie.hashtags}` : "";
  const description = `${String(movie.synopsis || "").slice(0, 155)}...${hashtagsText}`.trim();
  const keywords = extractKeywords(movie);
  const pageUrl = `https://topfilmes-six.vercel.app/assistir/${movie.id}`;

  return {
    title: `${movie.title} (${movie.release_year}) - Assistir Online | Top Filmes`,
    description,
    keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${movie.title} (${movie.release_year}) | Top Filmes`,
      description,
      url: pageUrl,
      siteName: "Top Filmes",
      type: "video.movie",
      images: movie.cover_image_url
        ? [
            {
              url: movie.cover_image_url,
              width: 600,
              height: 900,
              alt: movie.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${movie.title} (${movie.release_year}) | Top Filmes`,
      description,
      images: movie.cover_image_url ? [movie.cover_image_url] : [],
    },
  };
}

export default async function WatchPage({
  params,
}: {
  params: { id: string };
}) {
  const movie = await getMovieForSeo(params.id);

  const jsonLd = movie
    ? {
        "@context": "https://schema.org",
        "@type": "Movie",
        name: movie.title,
        description: movie.synopsis,
        image: movie.cover_image_url,
        datePublished: String(movie.release_year),
        genre: movie.genre,
        keywords: extractKeywords(movie).join(", "),
        url: `https://topfilmes-six.vercel.app/assistir/${movie.id}`,
        duration: `PT${movie.duration_minutes || 110}M`,
        interactionStatistic: [
          {
            "@type": "InteractionCounter",
            interactionType: { "@type": "WatchAction" },
            userInteractionCount: Number(movie.views_count || 0),
          },
          {
            "@type": "InteractionCounter",
            interactionType: { "@type": "LikeAction" },
            userInteractionCount: Number(movie.likes_count || 0),
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <WatchClient movieId={params.id} />
    </>
  );
}
