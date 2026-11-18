"use client";

import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  movieId: string;
  initialCount?: number;
  variant?: "default" | "player" | "hero";
  className?: string;
}

export default function LikeButton({
  movieId,
  initialCount = 0,
  variant = "default",
  className = "",
}: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCount(initialCount);
    fetch(`/api/movies/${movieId}/like`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.liked === "boolean") setLiked(data.liked);
        if (typeof data.likesCount === "number") setCount(data.likesCount);
      })
      .catch(() => {});
  }, [movieId, initialCount]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    // Atualização otimista imediata
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));

    try {
      setLoading(true);
      const res = await fetch(`/api/movies/${movieId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setLiked(Boolean(data.liked));
        if (typeof data.likesCount === "number") {
          setCount(data.likesCount);
        }
      }
    } catch (err) {
      // Reverte em caso de erro
      setLiked(!nextLiked);
      setCount((prev) => Math.max(0, prev + (nextLiked ? -1 : 1)));
    } finally {
      setLoading(false);
    }
  };

  if (variant === "player") {
    return (
      <button
        type="button"
        onClick={handleToggleLike}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl backdrop-blur-md border transition-all ${
          liked
            ? "bg-brand-red/90 text-white border-brand-red shadow-lg"
            : "bg-black/60 hover:bg-black/90 text-white hover:text-brand-red border-white/10"
        } ${className}`}
        title={liked ? "Remover curtida" : "Curtir este filme"}
      >
        <Heart className={`w-4 h-4 transition-transform ${liked ? "fill-current scale-110" : ""}`} />
        <span className="text-xs font-bold">{count}</span>
      </button>
    );
  }

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={handleToggleLike}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all border ${
          liked
            ? "bg-brand-red text-white border-brand-red shadow-lg"
            : "bg-brand-surface/80 hover:bg-brand-surface text-white border-white/20 hover:border-brand-red hover:text-brand-red"
        } ${className}`}
        title={liked ? "Você curtiu este filme" : "Curtir este filme"}
      >
        <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
        <span>{liked ? "Curtido" : "Curtir"}</span>
        <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-xs font-extrabold">{count}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide border transition-all ${
        liked
          ? "bg-brand-red text-white border-brand-red shadow-md"
          : "bg-brand-surfaceElevated hover:bg-brand-surfaceBorder text-gray-200 border-brand-surfaceBorder hover:border-brand-red"
      } ${className}`}
      title={liked ? "Remover curtida" : "Curtir este filme"}
    >
      <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
      <span>{liked ? "Curtido" : "Curtir"}</span>
      <span className="px-1.5 py-0.5 rounded bg-black/30 text-[11px] font-black">{count}</span>
    </button>
  );
}
