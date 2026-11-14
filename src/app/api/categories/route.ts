import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initDb();
    const categoriesResult = await db.execute(`
      SELECT id, name, slug, display_order 
      FROM categories 
      ORDER BY display_order ASC
    `);

    return NextResponse.json({
      categories: categoriesResult.rows,
    });
  } catch (error: any) {
    console.error("Erro ao listar categorias:", error);
    return NextResponse.json(
      { error: "Falha ao carregar categorias." },
      { status: 500 }
    );
  }
}
