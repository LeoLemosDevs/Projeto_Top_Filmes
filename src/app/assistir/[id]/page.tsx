"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { Movie } from "@/lib/types";
import { ArrowLeft, Film } from "lucide-react";

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) return;

    fetch(`/api/movies/${movieId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Filme não encontrado.");
        return res.json();
      })
      .then((data) => {
        setMovie(data.movie);
      })
      .catch((err) => {
        setError(err.message || "Falha ao carregar o filme.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [movieId]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-brand-gold text-xs font-bold uppercase tracking-widest">
          Iniciando reprodução...
        </p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Film className="w-16 h-16 text-gray-600 mb-2" />
        <h2 className="text-xl font-bold text-white uppercase">
          {error || "Filme indisponível"}
        </h2>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-brand-gold text-brand-dark px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>
      </div>
    );
  }

  return (
    <VideoPlayer
      movieId={movie.id}
      movieTitle={movie.title}
      rawVideoUrl={movie.video_url}
    />
  );
}
