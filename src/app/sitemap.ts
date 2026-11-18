import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://topfilmes-six.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/baixar-app`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  try {
    await initDb();
    const res = await db.execute(`SELECT id, updated_at, created_at FROM movies ORDER BY created_at DESC`);
    const movieRoutes: MetadataRoute.Sitemap = res.rows.map((row: any) => ({
      url: `${baseUrl}/assistir/${row.id}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    return [...staticRoutes, ...movieRoutes];
  } catch {
    return staticRoutes;
  }
}
