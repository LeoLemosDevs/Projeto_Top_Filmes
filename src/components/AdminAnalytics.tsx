"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Eye,
  Heart,
  Share2,
  Users,
  Globe,
  TrendingUp,
  RefreshCw,
  Film,
  Clock,
  Award,
  Activity,
  ExternalLink,
} from "lucide-react";

interface AnalyticsData {
  summary: {
    totalMovies: number;
    totalUsers: number;
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalPageViews: number;
    pageViewsToday: number;
    movieViewsToday: number;
    activeWatchers: number;
  };
  topWatched: any[];
  topLiked: any[];
  dailyTraffic: {
    day: string;
    label: string;
    pageViews: number;
    movieViews: number;
    likes: number;
    shares: number;
  }[];
  genreBreakdown: {
    genre: string;
    movies_count: number;
    total_views: number;
    total_likes: number;
    total_shares: number;
  }[];
  recentActivity: {
    id: string;
    event_type: string;
    path: string;
    movie_id: string | null;
    movie_title: string | null;
    created_at: string;
  }[];
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Erro ao carregar analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
          Carregando Análise de Tráfego e Audiência...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 bg-brand-surface border border-brand-surfaceBorder rounded-3xl text-center">
        <p className="text-sm text-gray-400">Não foi possível carregar os dados de análise.</p>
        <button
          onClick={() => loadAnalytics(true)}
          className="mt-4 px-4 py-2 bg-brand-gold text-brand-dark rounded-xl font-bold text-xs uppercase"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const { summary, topWatched, topLiked, dailyTraffic, genreBreakdown, recentActivity } = data;

  const maxDailyVal = Math.max(
    1,
    ...dailyTraffic.map((d) => Math.max(d.pageViews, d.movieViews))
  );

  const maxWatchedViews = Math.max(
    1,
    ...topWatched.map((m) => Number(m.views_count || 0))
  );

  const maxGenreViews = Math.max(
    1,
    ...genreBreakdown.map((g) => Number(g.total_views || 0))
  );

  const formatEventLabel = (type: string) => {
    switch (type) {
      case "movie_view":
        return { text: "Assistiu filme", color: "text-brand-gold bg-brand-gold/15 border-brand-gold/30" };
      case "movie_like":
        return { text: "Curtiu filme", color: "text-red-400 bg-brand-red/15 border-brand-red/30" };
      case "movie_share":
        return { text: "Compartilhou", color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" };
      default:
        return { text: "Visitou página", color: "text-blue-300 bg-brand-blue/20 border-brand-blue/40" };
    }
  };

  return (
    <div className="space-y-8">
      {/* BARRA SUPERIOR DO ANALYTICS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-gold" />
            <span>Painel de Análise & Tráfego em Tempo Real</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Acompanhe audiência, tráfego diário, filmes mais assistidos, curtidas e compartilhamentos.
          </p>
        </div>

        <button
          onClick={() => loadAnalytics(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-surfaceElevated hover:bg-brand-blue border border-brand-surfaceBorder text-xs font-bold text-white transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-brand-gold ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Atualizando..." : "Atualizar Métricas"}</span>
        </button>
      </div>

      {/* CARDS DE KPI PRINCIPAIS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-brand-surface border border-brand-surfaceBorder rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Views Filmes</span>
            <Eye className="w-4 h-4 text-brand-gold" />
          </div>
          <p className="text-2xl font-black text-white">{summary.totalViews.toLocaleString("pt-BR")}</p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">
            +{summary.movieViewsToday} hoje
          </p>
        </div>

        <div className="bg-brand-surface border border-brand-surfaceBorder rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tráfego Site</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{summary.totalPageViews.toLocaleString("pt-BR")}</p>
          <p className="text-[10px] text-blue-300 font-semibold mt-1">
            +{summary.pageViewsToday} acessos hoje
          </p>
        </div>

        <div className="bg-brand-surface border border-brand-surfaceBorder rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Curtidas</span>
            <Heart className="w-4 h-4 text-brand-red fill-current" />
          </div>
          <p className="text-2xl font-black text-white">{summary.totalLikes.toLocaleString("pt-BR")}</p>
          <p className="text-[10px] text-gray-400 mt-1">Engajamento direto</p>
        </div>

        <div className="bg-brand-surface border border-brand-surfaceBorder rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Compartilhados</span>
            <Share2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{summary.totalShares.toLocaleString("pt-BR")}</p>
          <p className="text-[10px] text-gray-400 mt-1">Alcance orgânico</p>
        </div>

        <div className="bg-brand-surface border border-brand-surfaceBorder rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Usuários</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">{summary.totalUsers.toLocaleString("pt-BR")}</p>
          <p className="text-[10px] text-gray-400 mt-1">Contas registradas</p>
        </div>

        <div className="bg-brand-surface border border-brand-surfaceBorder rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Em Progresso</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{summary.activeWatchers.toLocaleString("pt-BR")}</p>
          <p className="text-[10px] text-gray-400 mt-1">Continuar assistindo</p>
        </div>
      </div>

      {/* GRÁFICO DE TRÁFEGO DIÁRIO (14 DIAS) */}
      <div className="bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-gold" />
              <span>Tráfego dos Últimos 14 Dias</span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Comparativo diário entre visitas às páginas e reproduções de filmes.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-blue-300">
              <span className="w-3 h-3 rounded bg-brand-blue inline-block" /> Visitas de Página
            </span>
            <span className="flex items-center gap-1.5 text-brand-gold">
              <span className="w-3 h-3 rounded bg-brand-gold inline-block" /> Filmes Assistidos
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5 sm:gap-2 items-end h-48 pt-4 pb-2 border-b border-brand-surfaceBorder/60">
          {dailyTraffic.map((d) => {
            const pageH = Math.max(4, Math.round((d.pageViews / maxDailyVal) * 100));
            const movieH = Math.max(4, Math.round((d.movieViews / maxDailyVal) * 100));
            return (
              <div
                key={d.day}
                className="group relative flex flex-col items-center justify-end h-full"
              >
                {/* Tooltip no hover */}
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-14 left-1/2 -translate-x-1/2 bg-black/95 border border-brand-gold/50 rounded-lg px-2.5 py-1.5 text-[10px] text-white whitespace-nowrap z-20 shadow-xl">
                  <div className="font-bold text-brand-gold">{d.label}</div>
                  <div>Visitas: {d.pageViews}</div>
                  <div>Filmes: {d.movieViews}</div>
                </div>

                <div className="w-full flex items-end justify-center gap-0.5 h-36">
                  <div
                    className="w-2.5 sm:w-3 rounded-t bg-brand-blue/80 group-hover:bg-blue-400 transition-all"
                    style={{ height: `${d.pageViews === 0 ? 3 : pageH}%` }}
                  />
                  <div
                    className="w-2.5 sm:w-3 rounded-t bg-brand-gold/90 group-hover:bg-yellow-300 transition-all"
                    style={{ height: `${d.movieViews === 0 ? 3 : movieH}%` }}
                  />
                </div>
                <span className="text-[9px] text-gray-400 font-mono mt-2">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRID: TOP 10 MAIS ASSISTIDOS + TOP CURTIDOS & GÊNEROS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TOP 10 FILMES MAIS ASSISTIDOS */}
        <div className="lg:col-span-7 bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 shadow-2xl">
          <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2 mb-5">
            <Award className="w-5 h-5 text-brand-gold" />
            <span>Top 10 Filmes Mais Assistidos</span>
          </h3>

          {topWatched.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">
              Nenhum filme cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {topWatched.map((movie, idx) => {
                const views = Number(movie.views_count || 0);
                const pct = Math.max(4, Math.round((views / maxWatchedViews) * 100));
                const rankBadge =
                  idx === 0
                    ? "bg-brand-gold text-brand-dark"
                    : idx === 1
                    ? "bg-gray-300 text-brand-dark"
                    : idx === 2
                    ? "bg-amber-700 text-white"
                    : "bg-brand-surfaceElevated text-gray-300";

                return (
                  <div
                    key={movie.id}
                    className="p-3 rounded-2xl bg-brand-surfaceElevated border border-brand-surfaceBorder/80 hover:border-brand-gold/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${rankBadge}`}
                      >
                        #{idx + 1}
                      </span>

                      <div className="relative w-10 aspect-dvd rounded-md overflow-hidden shrink-0 bg-black">
                        <Image
                          src={movie.cover_image_url || "/logo.png"}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={`/assistir/${movie.id}`}
                            target="_blank"
                            className="text-xs sm:text-sm font-bold text-white hover:text-brand-gold truncate flex items-center gap-1"
                          >
                            <span className="truncate">{movie.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                          </Link>
                          <span className="text-xs font-black text-brand-gold shrink-0">
                            {views} views
                          </span>
                        </div>

                        {/* Barra de audiência */}
                        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden my-1.5">
                          <div
                            className="h-full bg-gradient-to-r from-brand-blue to-brand-gold rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-gray-400">
                          <span>{movie.genre} • {movie.release_year}</span>
                          <span className="flex items-center gap-1 text-red-400 font-semibold">
                            <Heart className="w-3 h-3 fill-current" /> {movie.likes_count || 0}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <Share2 className="w-3 h-3" /> {movie.shares_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: DESEMPENHO POR GÊNERO + MAIS CURTIDOS */}
        <div className="lg:col-span-5 space-y-6">
          {/* DESEMPENHO POR GÊNERO */}
          <div className="bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2 mb-4">
              <Film className="w-5 h-5 text-blue-400" />
              <span>Audiência por Gênero</span>
            </h3>

            <div className="space-y-3">
              {genreBreakdown.map((g) => {
                const pct = Math.max(5, Math.round((Number(g.total_views || 0) / maxGenreViews) * 100));
                return (
                  <div key={g.genre} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-200">
                        {g.genre}{" "}
                        <span className="text-[10px] text-gray-400 font-normal">
                          ({g.movies_count} {Number(g.movies_count) === 1 ? "filme" : "filmes"})
                        </span>
                      </span>
                      <span className="text-brand-gold font-extrabold">
                        {g.total_views} views
                      </span>
                    </div>
                    <div className="w-full h-2 bg-brand-surfaceElevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-blue rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOP 5 MAIS CURTIDOS */}
          <div className="bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-brand-red fill-current" />
              <span>Mais Curtidos pelo Público</span>
            </h3>

            <div className="space-y-2.5">
              {topLiked.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-brand-surfaceElevated border border-brand-surfaceBorder/70"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{m.title}</p>
                    <p className="text-[10px] text-gray-400">
                      {m.genre} • {m.views_count || 0} views
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-brand-red/20 border border-brand-red/40 text-red-300 text-xs font-black flex items-center gap-1 shrink-0">
                    <Heart className="w-3 h-3 fill-current" />
                    {m.likes_count || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LOG DE ATIVIDADE RECENTE */}
      <div className="bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 shadow-2xl">
        <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span>Atividade Recente de Tráfego</span>
        </h3>

        {recentActivity.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            Os eventos de acesso, reproduções, curtidas e compartilhamentos aparecerão aqui em tempo real.
          </p>
        ) : (
          <div className="divide-y divide-brand-surfaceBorder/60">
            {recentActivity.map((ev) => {
              const badge = formatEventLabel(ev.event_type);
              return (
                <div
                  key={ev.id}
                  className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${badge.color}`}>
                      {badge.text}
                    </span>
                    <span className="text-gray-200 font-medium truncate">
                      {ev.movie_title || ev.path || "/"}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {ev.created_at}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
