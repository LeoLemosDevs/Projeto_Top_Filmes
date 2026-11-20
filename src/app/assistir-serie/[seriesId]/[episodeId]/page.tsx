"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { ArrowLeft, Tv } from "lucide-react";

export default function WatchSeriesPage({
  params,
}: {
  params: Promise<{ seriesId: string; episodeId: string }>;
}) {
  const router = useRouter();
  const { seriesId, episodeId } = use(params);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!episodeId) return;

    fetch(`/api/episodes/${episodeId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Episódio não encontrado.");
        return res.json();
      })
      .then((d) => {
        setData(d);
      })
      .catch((err) => {
        setError(err.message || "Falha ao carregar o episódio.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [episodeId]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-brand-gold text-xs font-bold uppercase tracking-widest">
          Iniciando episódio...
        </p>
      </div>
    );
  }

  if (error || !data?.episode) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Tv className="w-16 h-16 text-gray-600 mb-2" />
        <h2 className="text-xl font-bold text-white uppercase">
          {error || "Episódio indisponível"}
        </h2>
        <button
          onClick={() => router.push(`/series/${seriesId}`)}
          className="flex items-center gap-2 bg-brand-gold text-brand-dark px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Série</span>
        </button>
      </div>
    );
  }

  const ep = data.episode;
  const prevEp = data.prevEpisode;
  const nextEp = data.nextEpisode;
  const allEps = data.allEpisodes || [];

  return (
    <VideoPlayer
      movieTitle={`${ep.series_title} • ${ep.title}`}
      rawVideoUrl={ep.video_url}
      synopsis={ep.synopsis}
      durationMinutes={ep.duration_minutes || 45}
      backUrl={`/series/${ep.series_slug || seriesId}`}
      seriesId={seriesId}
      episodeId={ep.id}
      seasonNumber={ep.season_number}
      episodeNumber={ep.episode_number}
      prevEpisodeUrl={prevEp ? `/assistir-serie/${seriesId}/${prevEp.id}` : undefined}
      nextEpisodeUrl={nextEp ? `/assistir-serie/${seriesId}/${nextEp.id}` : undefined}
      allEpisodes={allEps}
    />
  );
}
