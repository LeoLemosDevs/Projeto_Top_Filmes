import { NextResponse } from "next/server";
import { resolveVideoUrlAsync, processVideoUrl } from "@/lib/video-helper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "Parâmetro url é obrigatório." }, { status: 400 });
    }

    const processed = await resolveVideoUrlAsync(url);

    return NextResponse.json({
      success: true,
      original: url,
      resolved: processed.src,
      type: processed.type,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao resolver vídeo." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = body?.url;

    if (!url) {
      return NextResponse.json({ error: "Campo url é obrigatório." }, { status: 400 });
    }

    const processed = await resolveVideoUrlAsync(url);

    return NextResponse.json({
      success: true,
      original: url,
      resolved: processed.src,
      type: processed.type,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao resolver vídeo." }, { status: 500 });
  }
}
