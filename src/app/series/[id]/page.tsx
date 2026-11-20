"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Series, Season, Episode } from "@/lib/types";
import { 
  Play, 
  ArrowLeft, 
  Tv, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  Film
} from "lucide-react";

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [series, setSeries] = useState<Series | null>(null);
  const [activeSeasonNumber, setActiveSeasonNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeries() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/series/${id}`);
        const data = await res.json();
        if (data.series) {
          setSeries(data.series);
          // Se tiver temporadas, selecionar a primeira por padrão
          if (data.series.seasons && data.series.seasons.length > 0) {
            // Se o usuário tem progresso, focar na temporada onde ele parou
            const userProgress = (data.series as any).user_progress;
            if (userProgress?.season_number) {
              setActiveSeasonNumber(userProgress.season_number);
            } else {
              setActiveSeasonNumber(data.series.seasons[0].season_number);
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar série:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSeries();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 px-4 max-w-7xl mx-auto">
        <div className="h-96 rounded-3xl bg-brand-surface animate-pulse mb-8" />
        <div className="h-12 w-64 rounded-xl bg-brand-surface animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-brand-surface animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen pt-36 px-4 text-center max-w-lg mx-auto">
        <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Conteúdo não encontrado</h1>
        <p className="text-gray-400 text-sm mb-6">
          A série ou anime procurado não existe ou foi removido do catálogo.
        </p>
        <Link
          href="/series"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-gold text-brand-dark font-extrabold uppercase text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Séries
        </Link>
      </div>
    );
  }

  const isAnime = series.content_type === "ANIME";
  const seasons: Season[] = series.seasons || [];
  const activeSeason = seasons.find((s) => s.season_number === activeSeasonNumber) || seasons[0];
  const episodes: Episode[] = activeSeason?.episodes || [];

  const userProgress = (series as any).user_progress;
  // Primeiro episódio da primeira temporada para o botão de começar
  const firstEpisode = seasons[0]?.episodes?.[0];

  return (
    <div className="min-h-screen pb-24 pt-20">
      {/* HERO BANNER DA SÉRIE / ANIME */}
      <div className="relative w-full h-[450px] sm:h-[520px] overflow-hidden">
        <Image
          src={series.backdrop_url || series.cover_image_url || "/logo.png"}
          alt={series.title}
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-brand-dark/40 to-brand-dark" />

        {/* BOTÃO VOLTAR */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <Link
            href={isAnime ? "/animes" : "/series"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md border border-white/10 transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 text-brand-gold" /> Voltar para {isAnime ? "Animes" : "Séries"}
          </Link>
        </div>

        {/* INFORMAÇÕES HERO */}
        <div className="absolute bottom-8 left-4 sm:left-8 right-4 sm:right-8 max-w-4xl z-20">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-md ${
                isAnime ? "bg-purple-600" : "bg-blue-600"
              }`}
            >
              {isAnime ? "Anime" : "Série"}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-brand-gold bg-black/60 border border-brand-gold/30 backdrop-blur-md">
              {series.genre}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-300 bg-black/60 border border-white/10 backdrop-blur-md">
              {series.release_year}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-400 bg-black/60 border border-emerald-500/30 backdrop-blur-md">
              {series.status === "FINALIZADA" ? "Série Completa" : "Em Exibição"}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-400 bg-black/60 border border-white/10 backdrop-blur-md">
              {seasons.length} {seasons.length === 1 ? "Temporada" : "Temporadas"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            {series.title}
          </h1>

          <p className="text-gray-300 text-xs sm:text-sm mt-3 line-clamp-3 leading-relaxed drop-shadow max-w-2xl">
            {series.synopsis}
          </p>

          {/* BOTÕES DE AÇÃO HERO */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {userProgress ? (
              <Link
                href={`/assistir-serie/${series.id}/${userProgress.episode_id}`}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-gold hover:bg-brand-goldHover text-brand-dark font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-glowGold hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Continuar de Onde Parou (T{userProgress.season_number}:E{userProgress.episode_number})</span>
              </Link>
            ) : firstEpisode ? (
              <Link
                href={`/assistir-serie/${series.id}/${firstEpisode.id}`}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-gold hover:bg-brand-goldHover text-brand-dark font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-glowGold hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Começar a Assistir (T1:E1)</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* SELETOR DE TEMPORADAS E LISTA DE EPISÓDIOS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* ABAS DAS TEMPORADAS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-brand-surfaceBorder">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-brand-gold">|</span> Episódios
            </h2>
            <p className="text-gray-400 text-xs mt-1">
              Escolha a temporada e selecione o episódio que deseja assistir.
            </p>
          </div>

          {/* SEASON TABS */}
          {seasons.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {seasons.map((season) => (
                <button
                  key={season.id}
                  onClick={() => setActiveSeasonNumber(season.season_number)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shrink-0 ${
                    activeSeasonNumber === season.season_number
                      ? "bg-brand-gold text-brand-dark shadow-glowGold scale-105"
                      : "bg-brand-surfaceElevated text-gray-300 hover:text-white border border-brand-surfaceBorder hover:border-gray-500"
                  }`}
                >
                  {season.title || `Temporada ${season.season_number}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* EPISODES GRID */}
        {!episodes || episodes.length === 0 ? (
          <div className="text-center py-16 bg-brand-surface/50 rounded-2xl border border-brand-surfaceBorder">
            <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              Nenhum episódio cadastrado nesta temporada ainda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {episodes.map((ep) => {
              const isCurrent = userProgress?.episode_id === ep.id;
              return (
                <Link
                  key={ep.id}
                  href={`/assistir-serie/${series.id}/${ep.id}`}
                  className={`group relative bg-brand-surface hover:bg-brand-surfaceElevated border rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col justify-between ${
                    isCurrent
                      ? "border-brand-gold shadow-glowGold/30"
                      : "border-brand-surfaceBorder hover:border-brand-gold/60"
                  }`}
                >
                  {/* THUMBNAIL (16:9) */}
                  <div className="relative aspect-video w-full overflow-hidden bg-brand-surfaceElevated">
                    <Image
                      src={ep.thumbnail_url || series.backdrop_url || series.cover_image_url || "/logo.png"}
                      alt={ep.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-black/30" />

                    {/* OVERLAY PLAY ICON */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-11 h-11 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center shadow-glowGold transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* BADGE NÚMERO DO EPISÓDIO */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/85 text-white border border-white/20 backdrop-blur-md shadow-md">
                        Ep. {ep.episode_number}
                      </span>
                    </div>

                    {/* BADGE DURAÇÃO */}
                    {ep.duration_minutes && (
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-gray-300 backdrop-blur-md border border-white/10 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-brand-gold" />
                          <span>{ep.duration_minutes} min</span>
                        </span>
                      </div>
                    )}

                    {/* BADGE ONDE PAROU */}
                    {isCurrent && (
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-brand-gold text-brand-dark shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Assistindo</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* INFO DO EPISÓDIO */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white group-hover:text-brand-gold transition-colors uppercase tracking-wide line-clamp-1">
                        {ep.title}
                      </h4>
                      <p className="text-gray-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {ep.synopsis || "Clique para assistir a este episódio completo."}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-brand-surfaceBorder/60 flex items-center justify-between text-xs font-bold text-brand-gold">
                      <span>Assistir Agora</span>
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
