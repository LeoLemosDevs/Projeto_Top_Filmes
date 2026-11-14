"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Plus, Check, Info } from "lucide-react";
import { Movie } from "@/lib/types";

interface MovieCardProps {
  movie: Movie;
  onOpenModal?: (movie: Movie) => void;
  progressSeconds?: number;
  durationSeconds?: number;
  isFavoriteInitial?: boolean;
}

export default function MovieCard({
  movie,
  onOpenModal,
  progressSeconds,
  durationSeconds,
  isFavoriteInitial = false,
}: MovieCardProps) {
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [loadingFav, setLoadingFav] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoadingFav(true);
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: movie.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsFavorite(data.isFavorite);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFav(false);
    }
  };

  const progressPercent =
    durationSeconds && durationSeconds > 0
      ? Math.min(100, Math.round((progressSeconds! / durationSeconds) * 100))
      : 0;

  return (
    <div className="group relative flex-shrink-0 w-36 sm:w-44 md:w-52 transition-all duration-300 hover:scale-105 hover:z-20">
      {/* DVD CASE WRAPPER */}
      <div className="relative aspect-dvd w-full rounded-xl overflow-hidden bg-brand-surface shadow-dvd group-hover:shadow-dvdHover border border-brand-surfaceBorder/80 group-hover:border-brand-gold/60 transition-all">
        {/* LOMBARDA DE DVD / EFEITO ACRÍLICO RETRO */}
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-r from-white/20 to-transparent z-10 pointer-events-none" />

        {/* POSTER IMAGE */}
        <Image
          src={movie.cover_image_url || "/logo.jfif"}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 208px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* BADGE DE GÊNERO & ANO */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-blue/90 text-white backdrop-blur-md shadow-md border border-blue-400/30">
            {movie.genre}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-black/80 text-brand-gold border border-brand-gold/40">
            {movie.release_year}
          </span>
        </div>

        {/* OVERLAY HOVER / TOUCH */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10">
          <h4 className="text-white font-bold text-xs sm:text-sm line-clamp-1 drop-shadow-md">
            {movie.title}
          </h4>
          <p className="text-gray-300 text-[10px] line-clamp-2 mt-0.5 mb-3 leading-tight font-normal">
            {movie.synopsis}
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            <Link
              href={`/assistir/${movie.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 bg-brand-gold hover:bg-brand-goldHover text-brand-dark py-1.5 px-2 rounded-lg font-bold text-xs transition-colors shadow-glowGold"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Assistir</span>
            </Link>

            <button
              onClick={toggleFavorite}
              disabled={loadingFav}
              title={isFavorite ? "Remover dos Favoritos" : "Adicionar à Minha Lista"}
              className={`p-1.5 rounded-lg border transition-colors ${
                isFavorite
                  ? "bg-brand-red text-white border-brand-red shadow-md"
                  : "bg-black/60 text-white border-white/40 hover:border-brand-gold hover:text-brand-gold"
              }`}
            >
              {isFavorite ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            {onOpenModal && (
              <button
                onClick={() => onOpenModal(movie)}
                title="Mais Informações"
                className="p-1.5 rounded-lg bg-black/60 text-white border border-white/40 hover:border-brand-blueLight hover:text-brand-blueLight transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* PROGRESS BAR (CONTINUAR ASSISTINDO) */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800 z-10">
            <div
              className="h-full bg-brand-red transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* TITULO ABAIXO DO DVD (MOBILE / DEFAULT) */}
      <div className="mt-2 px-1">
        <p className="text-xs font-semibold text-gray-200 truncate group-hover:text-brand-gold transition-colors">
          {movie.title}
        </p>
        <p className="text-[10px] text-gray-400">
          {movie.release_year} • {movie.genre}
        </p>
      </div>
    </div>
  );
}
