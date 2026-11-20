"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Series } from "@/lib/types";
import SeriesCard from "@/components/SeriesCard";
import { Tv, Sparkles, Search, Play, Filter } from "lucide-react";

const SERIES_GENRES = [
  "Todos",
  "Ficção Científica",
  "Ação",
  "Drama",
  "Terror",
  "Suspense",
  "Comédia",
  "Policial",
  "Aventura",
  "Fantasia",
];

export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");

  useEffect(() => {
    async function loadSeries() {
      try {
        setLoading(true);
        const res = await fetch("/api/series?type=SERIES");
        const data = await res.json();
        setSeriesList(data.series || []);
      } catch (err) {
        console.error("Erro ao carregar séries:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSeries();
  }, []);

  const filtered = seriesList.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.synopsis && s.synopsis.toLowerCase().includes(search.toLowerCase()));
    const matchesGenre =
      selectedGenre === "Todos" || s.genre?.toLowerCase() === selectedGenre.toLowerCase();
    return matchesSearch && matchesGenre;
  });

  const featured = seriesList.find((s) => s.is_featured) || (seriesList.length > 0 ? seriesList[0] : null);

  return (
    <div className="min-h-screen pb-24 pt-20">
      {/* FEATURED SERIES BANNER */}
      {featured && (
        <div className="relative w-full h-[380px] sm:h-[460px] overflow-hidden mb-8">
          <Image
            src={featured.backdrop_url || featured.cover_image_url || "/logo.png"}
            alt={featured.title}
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-brand-dark/40 to-brand-dark" />

          <div className="absolute bottom-8 left-4 sm:left-8 right-4 max-w-3xl z-20">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-lg flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5" /> Destaque em Séries
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-brand-gold bg-black/60 border border-brand-gold/30 backdrop-blur-md">
                {featured.genre}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              {featured.title}
            </h1>

            <p className="text-gray-300 text-xs sm:text-sm mt-3 line-clamp-3 leading-relaxed drop-shadow max-w-2xl">
              {featured.synopsis}
            </p>

            <div className="mt-5 flex items-center gap-3">
              <Link
                href={`/series/${featured.slug || featured.id}`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-gold hover:bg-brand-goldHover text-brand-dark font-extrabold text-xs uppercase tracking-wider transition-all shadow-glowGold hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Ver Temporadas e Episódios</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION & FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-brand-surfaceBorder">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3">
              <Tv className="w-7 h-7 text-blue-500" />
              Catálogo de <span className="text-brand-gold">Séries</span>
            </h2>
            <p className="text-gray-400 text-xs mt-1">
              Todas as temporadas e episódios organizados para você acompanhar suas séries favoritas.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar série..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>
        </div>

        {/* GENRE CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-4 mb-6">
          {SERIES_GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all shrink-0 ${
                selectedGenre === g
                  ? "bg-brand-gold text-brand-dark shadow-glowGold scale-105"
                  : "bg-brand-surfaceElevated text-gray-300 hover:text-white border border-brand-surfaceBorder hover:border-gray-500"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* SERIES GRID */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-2xl bg-brand-surface border border-brand-surfaceBorder animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-brand-surface/40 rounded-3xl border border-brand-surfaceBorder">
            <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhuma série encontrada</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              {search || selectedGenre !== "Todos"
                ? "Tente alterar os filtros de busca ou gênero."
                : "Ainda não há séries cadastradas no momento."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filtered.map((serie) => (
              <SeriesCard key={serie.id} series={serie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
