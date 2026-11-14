"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";
import { Movie } from "@/lib/types";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onOpenModal?: (movie: Movie) => void;
  icon?: React.ReactNode;
}

export default function MovieRow({ title, movies, onOpenModal, icon }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) {
    return null;
  }

  const handleScroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative my-6 px-4 sm:px-6 lg:px-8 group">
      {/* HEADER DA CATEGORIA */}
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
          <span className="text-brand-gold">|</span> {title}
        </h2>
        <span className="text-xs text-gray-400 font-medium">({movies.length})</span>
      </div>

      {/* BOTÃO ESQUERDO (DESKTOP) */}
      <button
        onClick={() => handleScroll("left")}
        aria-label="Rolar para esquerda"
        className="hidden md:flex absolute left-2 top-[55%] -translate-y-1/2 z-30 w-10 h-10 items-center justify-center rounded-full bg-brand-dark/80 text-brand-gold border border-brand-gold/40 hover:bg-brand-gold hover:text-brand-dark hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* LISTA HORIZONTAL (CARROSSEL) */}
      <div
        ref={rowRef}
        className="flex items-center gap-4 overflow-x-auto scroll-smooth scrollbar-none py-2 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onOpenModal={onOpenModal} />
        ))}
      </div>

      {/* BOTÃO DIREITO (DESKTOP) */}
      <button
        onClick={() => handleScroll("right")}
        aria-label="Rolar para direita"
        className="hidden md:flex absolute right-2 top-[55%] -translate-y-1/2 z-30 w-10 h-10 items-center justify-center rounded-full bg-brand-dark/80 text-brand-gold border border-brand-gold/40 hover:bg-brand-gold hover:text-brand-dark hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
}
