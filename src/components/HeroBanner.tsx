"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Plus, Check, Info, Sparkles } from "lucide-react";
import { Movie } from "@/lib/types";

interface HeroBannerProps {
  movie: Movie | null;
  onOpenModal?: (movie: Movie) => void;
}

export default function HeroBanner({ movie, onOpenModal }: HeroBannerProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  if (!movie) {
    return (
      <div className="relative w-full h-[65vh] min-h-[480px] bg-gradient-to-r from-brand-dark via-brand-surface to-brand-dark flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-3xl sm:text-5xl font-black text-brand-gold tracking-widest uppercase">
            TOP FILMES
          </h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base max-w-lg mx-auto">
            O melhor streaming nostálgico com os grandes clássicos do cinema e da TV!
          </p>
        </div>
      </div>
    );
  }

  const toggleFavorite = async () => {
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

  return (
    <div className="relative w-full h-[75vh] min-h-[520px] max-h-[800px] overflow-hidden select-none">
      {/* BACKGROUND IMAGE / BANNER */}
      <div className="absolute inset-0">
        <Image
          src={movie.cover_image_url || "/logo.jfif"}
          alt={movie.title}
          fill
          priority
          className="object-cover object-top opacity-50 blur-[2px] scale-105 transition-transform duration-1000 ease-out"
        />
        {/* GRADIENTS FOR STREAMING CINEMATIC ATMOSPHERE */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent" />
      </div>

      {/* CONTENT CONTAINER */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 z-20">
        {/* DESTAQUE BADGE */}
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-brand-gold text-brand-dark shadow-glowGold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Super Destaque
          </span>
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-brand-blue text-white shadow-md">
            {movie.genre}
          </span>
          <span className="text-xs font-semibold text-gray-300">
            {movie.release_year}
          </span>
        </div>

        {/* TITLE */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] max-w-2xl leading-none">
          {movie.title}
        </h1>

        {/* SYNOPSIS */}
        <p className="text-gray-300 text-xs sm:text-sm md:text-base line-clamp-3 max-w-xl mt-4 leading-relaxed font-normal drop-shadow-md">
          {movie.synopsis}
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6">
          <Link
            href={`/assistir/${movie.id}`}
            className="flex items-center gap-2.5 bg-brand-gold hover:bg-brand-goldHover text-brand-dark px-6 py-3 rounded-xl font-extrabold text-sm sm:text-base tracking-wide uppercase transition-all shadow-glowGold hover:scale-105 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Assistir Agora</span>
          </Link>

          <button
            onClick={toggleFavorite}
            disabled={loadingFav}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm tracking-wide transition-all border ${
              isFavorite
                ? "bg-brand-red text-white border-brand-red shadow-lg"
                : "bg-brand-surface/80 hover:bg-brand-surface text-white border-white/20 hover:border-brand-gold hover:text-brand-gold"
            }`}
          >
            {isFavorite ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Na Minha Lista</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Minha Lista</span>
              </>
            )}
          </button>

          {onOpenModal && (
            <button
              onClick={() => onOpenModal(movie)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-surfaceElevated/80 hover:bg-brand-surfaceElevated text-gray-200 hover:text-white text-sm font-semibold border border-brand-surfaceBorder transition-all"
            >
              <Info className="w-4 h-4" />
              <span>Mais Informações</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
