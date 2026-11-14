"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import MovieModal from "@/components/MovieModal";
import { Movie } from "@/lib/types";
import { History as HistoryIcon, Film, ArrowLeft } from "lucide-react";

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        setHistoryList(data.history || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 min-h-screen">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-surfaceBorder">
        <HistoryIcon className="w-6 h-6 text-brand-red" />
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
          Histórico de Reprodução
        </h1>
        <span className="text-xs text-gray-400 font-semibold">
          ({historyList.length})
        </span>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : historyList.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <Film className="w-16 h-16 text-gray-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white uppercase mb-1">
            Nenhum histórico registrado
          </h2>
          <p className="text-gray-400 text-xs mb-6">
            Conforme você assistir aos filmes na plataforma, seu progresso será salvo aqui automaticamente para você continuar de onde parou.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-glowGold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Começar a Assistir</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {historyList.map((item) => (
            <MovieCard
              key={item.history_id}
              movie={item}
              progressSeconds={item.progress_seconds}
              durationSeconds={item.duration_seconds}
              onOpenModal={setSelectedMovie}
            />
          ))}
        </div>
      )}

      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}
