"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Series } from "@/lib/types";
import { Tv, Sparkles, Play, Calendar, Film } from "lucide-react";

interface SeriesCardProps {
  series: Series;
}

export default function SeriesCard({ series }: SeriesCardProps) {
  const isAnime = series.content_type === "ANIME";

  return (
    <Link
      href={`/series/${series.slug || series.id}`}
      className="group relative flex flex-col bg-brand-surface rounded-2xl overflow-hidden border border-brand-surfaceBorder hover:border-brand-gold/60 transition-all duration-300 hover:scale-[1.03] shadow-lg hover:shadow-2xl"
    >
      {/* POSTER CONTAINER (2:3 ASPECT RATIO) */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-brand-surfaceElevated">
        <Image
          src={series.cover_image_url || "/logo.png"}
          alt={series.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* OVERLAYS & BADGES */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* BADGE TIPO (SÉRIE OU ANIME) */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
              isAnime
                ? "bg-purple-600/90 text-white border border-purple-400/50"
                : "bg-blue-600/90 text-white border border-blue-400/50"
            }`}
          >
            {isAnime ? "Anime" : "Série"}
          </span>
        </div>

        {/* BADGE TOTAL TEMPORADAS */}
        {(series.seasons_count || 0) > 0 && (
          <div className="absolute top-2.5 right-2.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/80 text-brand-gold border border-brand-gold/30 backdrop-blur-md shadow-md flex items-center gap-1">
              <Tv className="w-2.5 h-2.5" />
              <span>{series.seasons_count} {Number(series.seasons_count) === 1 ? "Temp" : "Temps"}</span>
            </span>
          </div>
        )}

        {/* PLAY BUTTON NO HOVER */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center shadow-glowGold transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* BADGE ANO E GÊNERO NA PARTE INFERIOR DO POSTER */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-bold text-gray-300">
          <span className="bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10 text-white">
            {series.release_year}
          </span>
          <span className="bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded backdrop-blur-sm border border-brand-gold/30">
            {series.genre}
          </span>
        </div>
      </div>

      {/* METADADOS INFERIORES */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-black text-white group-hover:text-brand-gold transition-colors uppercase tracking-wide line-clamp-1">
            {series.title}
          </h3>
          <p className="text-gray-400 text-[11px] mt-1 line-clamp-2 leading-relaxed">
            {series.synopsis}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-brand-surfaceBorder/60 flex items-center justify-between text-[11px] text-gray-400">
          <span className="font-semibold text-brand-gold">
            {series.episodes_count ? `${series.episodes_count} episódios` : "Acompanhar"}
          </span>
          <span className="text-[10px] uppercase font-bold text-gray-500">
            {series.status === "FINALIZADA" ? "Completa" : "Em exibição"}
          </span>
        </div>
      </div>
    </Link>
  );
}
