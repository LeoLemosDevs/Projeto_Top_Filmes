"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Play, Plus, Check, Calendar, Film, Clock, Eye, Hash } from "lucide-react";
import { Movie } from "@/lib/types";
import LikeButton from "@/components/LikeButton";
import ShareButton from "@/components/ShareButton";

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
}

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [savedProgress, setSavedProgress] = useState(0);

  useEffect(() => {
    if (!movie) return;

    // Verificar se há progresso salvo para "Continuar de onde parou"
    let localSec = 0;
    try {
      const raw = localStorage.getItem(`tf_progress_${movie.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && !parsed.completed && parsed.progressSeconds > 5) {
          localSec = parsed.progressSeconds;
        }
      }
    } catch {}
    setSavedProgress(localSec);

    fetch(`/api/history?movieId=${encodeURIComponent(movie.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.completed && typeof data.progressSeconds === "number" && data.progressSeconds > 5) {
          setSavedProgress((prev) => Math.max(prev, data.progressSeconds));
        }
      })
      .catch(() => {});

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

  const parsedHashtags = (movie.hashtags || "")
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1)
    .map((t) => (t.startsWith("#") ? t : `#${t}`));

  const handleTagClick = (tag: string) => {
    onClose();
    router.push(`/?search=${encodeURIComponent(tag)}`);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
    >
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
        <div className="relative w-full h-60 sm:h-72 bg-black flex-shrink-0">
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
            <span className="flex items-center gap-1 text-gray-400">
              <Eye className="w-4 h-4 text-emerald-400" /> {movie.views_count || 0} visualizações
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

          {/* HASHTAGS CLICÁVEIS (SEO + BUSCA) */}
          {parsedHashtags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Hash className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              {parsedHashtags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-surfaceElevated hover:bg-brand-blue border border-brand-surfaceBorder text-blue-300 hover:text-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4">
            <Link
              href={`/assistir/${movie.id}`}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-goldHover text-brand-dark py-3 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all shadow-glowGold"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {savedProgress > 5
                  ? `Continuar de ${formatTime(savedProgress)}`
                  : "Reproduzir Filme"}
              </span>
            </Link>

            <LikeButton
              movieId={movie.id}
              initialCount={movie.likes_count || 0}
              variant="default"
            />

            <ShareButton
              movieId={movie.id}
              movieTitle={movie.title}
              synopsis={movie.synopsis}
              variant="default"
            />

            <button
              onClick={toggleFavorite}
              disabled={loadingFav}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide border transition-all ${
                isFavorite
                  ? "bg-brand-blue text-white border-brand-blue"
                  : "bg-brand-surfaceElevated hover:bg-brand-surfaceBorder text-gray-200 border-brand-surfaceBorder"
              }`}
            >
              {isFavorite ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Na Lista</span>
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
