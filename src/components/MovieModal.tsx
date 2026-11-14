"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Play, Plus, Check, Calendar, Film, Clock } from "lucide-react";
import { Movie } from "@/lib/types";

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  useEffect(() => {
    if (!movie) return;

    // Fechar ao pressionar Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movie, onClose]);

  if (!movie) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-brand-surface border border-brand-surfaceBorder rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÃO FECHAR */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/70 hover:bg-brand-red text-white transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* TOP IMAGE / BANNER */}
        <div className="relative w-full h-64 sm:h-80 bg-black flex-shrink-0">
          <Image
            src={movie.cover_image_url || "/logo.png"}
            alt={movie.title}
            fill
            className="object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-brand-surface/40 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-brand-blue text-white mb-2 inline-block">
                {movie.genre}
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white uppercase drop-shadow-lg leading-tight">
                {movie.title}
              </h3>
            </div>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-300 border-b border-brand-surfaceBorder pb-3">
            <span className="flex items-center gap-1 text-brand-gold font-bold">
              <Calendar className="w-4 h-4" /> {movie.release_year}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {movie.duration_minutes || 110} min
            </span>
            <span className="flex items-center gap-1">
              <Film className="w-4 h-4 text-blue-400" /> {movie.genre}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-1">
              Sinopse
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {movie.synopsis}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3 pt-4">
            <Link
              href={`/assistir/${movie.id}`}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-goldHover text-brand-dark py-3 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all shadow-glowGold"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Reproduzir Filme</span>
            </Link>

            <button
              onClick={toggleFavorite}
              disabled={loadingFav}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wide border transition-all ${
                isFavorite
                  ? "bg-brand-red text-white border-brand-red"
                  : "bg-brand-surfaceElevated hover:bg-brand-surfaceBorder text-gray-200 border-brand-surfaceBorder"
              }`}
            >
              {isFavorite ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Favorito</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Minha Lista</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
