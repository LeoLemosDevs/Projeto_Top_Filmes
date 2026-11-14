"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import MovieModal from "@/components/MovieModal";
import { Movie } from "@/lib/types";
import { Bookmark, Film, ArrowLeft } from "lucide-react";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) => {
        setFavorites(data.favorites || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 min-h-screen">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-surfaceBorder">
        <Bookmark className="w-6 h-6 text-brand-gold" />
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
          Minha Lista de Favoritos
        </h1>
        <span className="text-xs text-gray-400 font-semibold">
          ({favorites.length})
        </span>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <Film className="w-16 h-16 text-gray-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white uppercase mb-1">
            Sua lista está vazia
          </h2>
          <p className="text-gray-400 text-xs mb-6">
            Você ainda não adicionou nenhum clássico aos seus favoritos. Navegue pelo catálogo e clique no ícone (+) nos filmes que deseja salvar!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-glowGold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explorar Filmes</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {favorites.map((fav) => (
            <MovieCard
              key={fav.favorite_id}
              movie={fav}
              isFavoriteInitial={true}
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
