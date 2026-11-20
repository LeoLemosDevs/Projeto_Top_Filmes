"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Maximize, 
  RotateCcw, 
  ExternalLink, 
  Clock, 
  Hash,
  SkipBack,
  SkipForward,
  ListVideo,
  X,
  Play
} from "lucide-react";
import { processVideoUrl } from "@/lib/video-helper";
import LikeButton from "@/components/LikeButton";
import ShareButton from "@/components/ShareButton";

interface VideoPlayerProps {
  movieId?: string;
  movieTitle: string;
  rawVideoUrl: string;
  synopsis?: string;
  durationMinutes?: number;
  hashtags?: string;
  initialLikesCount?: number;
  initialProgressSeconds?: number;
  // Propriedades para Séries e Animes
  backUrl?: string;
  seriesId?: string;
  episodeId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  prevEpisodeUrl?: string;
  nextEpisodeUrl?: string;
  allEpisodes?: Array<{
    id: string;
    episode_number: number;
    title: string;
    season_number?: number;
    thumbnail_url?: string;
  }>;
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

export default function VideoPlayer({
  movieId = "",
  movieTitle,
  rawVideoUrl,
  synopsis = "",
  durationMinutes = 110,
  hashtags = "",
  initialLikesCount = 0,
  initialProgressSeconds = 0,
  backUrl,
  seriesId,
  episodeId,
  seasonNumber,
  episodeNumber,
  prevEpisodeUrl,
  nextEpisodeUrl,
  allEpisodes = [],
}: VideoPlayerProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isSeries = Boolean(seriesId && episodeId);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [resumeSeconds, setResumeSeconds] = useState<number>(initialProgressSeconds);
  const [progressReady, setProgressReady] = useState<boolean>(false);
  const [showResumeBanner, setShowResumeBanner] = useState<boolean>(false);
  const [playerResetKey, setPlayerResetKey] = useState<number>(0);

  // Referências para salvar progresso com precisão sem re-renderizar o iframe
  const currentSecRef = useRef<number>(initialProgressSeconds);
  const totalSecRef = useRef<number>((durationMinutes || 110) * 60);
  const appliedDirectSeekRef = useRef<boolean>(false);

  const storageKey = isSeries
    ? `tf_progress_series_${seriesId}_${episodeId}`
    : `tf_progress_${movieId}`;

  // 1. Carregar progresso salvo do banco (/api/history?movieId=) e do localStorage
  useEffect(() => {
    let active = true;

    async function loadSavedProgress() {
      let localSec = 0;
      try {
        const rawLocal = localStorage.getItem(storageKey);
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (parsed && !parsed.completed && typeof parsed.progressSeconds === "number") {
            localSec = parsed.progressSeconds;
          }
        }
      } catch {}

      let serverSec = initialProgressSeconds || 0;
      let serverCompleted = false;
      if (!isSeries && movieId) {
        try {
          const res = await fetch(`/api/history?movieId=${encodeURIComponent(movieId)}`);
          if (res.ok) {
            const data = await res.json();
            if (typeof data.progressSeconds === "number") {
              serverSec = data.progressSeconds;
            }
            if (typeof data.durationSeconds === "number" && data.durationSeconds > 0) {
              totalSecRef.current = data.durationSeconds;
            }
            serverCompleted = Boolean(data.completed);
          }
        } catch {}
      }

      if (!active) return;

      const bestStart = serverCompleted ? 0 : Math.max(localSec, serverSec);
      const validStart = bestStart > 5 ? bestStart : 0;

      currentSecRef.current = validStart;
      setResumeSeconds(validStart);
      if (validStart > 5) {
        setShowResumeBanner(true);
      }
      setProgressReady(true);
    }

    loadSavedProgress();
    return () => {
      active = false;
    };
  }, [movieId, initialProgressSeconds, storageKey, isSeries]);

  // Esconder banner de "Continuar de onde parou" automaticamente após 8 segundos
  useEffect(() => {
    if (!showResumeBanner) return;
    const t = setTimeout(() => setShowResumeBanner(false), 8000);
    return () => clearTimeout(t);
  }, [showResumeBanner]);

  const processed = processVideoUrl(rawVideoUrl, resumeSeconds);
  const [activeSrc, setActiveSrc] = useState(processed.src);

  // Atualizar URL do player sempre que o progresso inicial ou reset mudar
  useEffect(() => {
    const nextProcessed = processVideoUrl(rawVideoUrl, resumeSeconds);
    setActiveSrc(nextProcessed.src);

    // Fallback dinâmico para TokyVideo caso ainda tenha slug
    if (
      nextProcessed.type === "tokyvideo" &&
      !/tokyvideo\.com\/(?:[a-zA-Z]{2}\/)?embed\/\d+/i.test(nextProcessed.src)
    ) {
      fetch(`/api/resolve-video?url=${encodeURIComponent(rawVideoUrl)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.resolved && data.resolved !== nextProcessed.src) {
            setActiveSrc(data.resolved);
          }
        })
        .catch(() => {});
    }
  }, [rawVideoUrl, resumeSeconds, playerResetKey]);

  // Função para persistir progresso no servidor + localStorage
  const persistProgress = useCallback(
    (sec: number, total: number, useBeacon = false, reset = false) => {
      const safeSec = reset ? 0 : Math.max(0, Math.floor(sec));
      const safeTotal = Math.max(60, Math.floor(total || (durationMinutes || 110) * 60));
      const completed = !reset && safeTotal > 60 && safeSec / safeTotal > 0.92;

      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            progressSeconds: safeSec,
            durationSeconds: safeTotal,
            completed,
            updatedAt: Date.now(),
          })
        );
      } catch {}

      if (isSeries && seriesId && episodeId) {
        const seriesPayload = JSON.stringify({
          series_id: seriesId,
          episode_id: episodeId,
          progress_seconds: safeSec,
          duration_seconds: safeTotal,
          completed: completed ? 1 : 0,
        });

        if (useBeacon && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          const blob = new Blob([seriesPayload], { type: "application/json" });
          navigator.sendBeacon("/api/series/history", blob);
          return;
        }

        fetch("/api/series/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: seriesPayload,
        }).catch(() => {});
        return;
      }

      if (!movieId) return;

      const payload = JSON.stringify({
        movieId,
        progressSeconds: safeSec,
        durationSeconds: safeTotal,
        reset,
      });

      if (useBeacon && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/history", blob);
        return;
      }

      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      }).catch(() => {});
    },
    [movieId, durationMinutes, storageKey]
  );

  // 2. Acompanhamento contínuo do tempo assistido (HTML5 direto + iframes)
  useEffect(() => {
    if (!progressReady) return;

    let tickInterval: NodeJS.Timeout | null = null;
    let syncInterval: NodeJS.Timeout | null = null;

    if (processed.type === "direct") {
      syncInterval = setInterval(() => {
        if (videoRef.current && !videoRef.current.paused) {
          const cur = videoRef.current.currentTime;
          const dur = videoRef.current.duration || totalSecRef.current;
          currentSecRef.current = cur;
          totalSecRef.current = dur;
          persistProgress(cur, dur);
        }
      }, 5000);
    } else {
      // Para iframes (YouTube, Dailymotion, TokyVideo, Drive, Vimeo):
      // Incrementa o tempo enquanto o usuário está com a aba aberta assistindo
      tickInterval = setInterval(() => {
        if (typeof document !== "undefined" && !document.hidden) {
          currentSecRef.current += 1;
        }
      }, 1000);

      syncInterval = setInterval(() => {
        if (currentSecRef.current > 5) {
          persistProgress(currentSecRef.current, totalSecRef.current);
        }
      }, 10000);
    }

    const handleVisibilityOrUnload = () => {
      if (processed.type === "direct" && videoRef.current) {
        currentSecRef.current = videoRef.current.currentTime;
        totalSecRef.current = videoRef.current.duration || totalSecRef.current;
      }
      if (currentSecRef.current > 5) {
        persistProgress(currentSecRef.current, totalSecRef.current, true);
      }
    };

    window.addEventListener("beforeunload", handleVisibilityOrUnload);
    document.addEventListener("visibilitychange", handleVisibilityOrUnload);

    return () => {
      if (tickInterval) clearInterval(tickInterval);
      if (syncInterval) clearInterval(syncInterval);
      window.removeEventListener("beforeunload", handleVisibilityOrUnload);
      document.removeEventListener("visibilitychange", handleVisibilityOrUnload);
      handleVisibilityOrUnload();
    };
  }, [progressReady, processed.type, persistProgress]);

  // Reiniciar filme do zero
  const handleRestartFromBeginning = () => {
    currentSecRef.current = 0;
    appliedDirectSeekRef.current = false;
    setResumeSeconds(0);
    setShowResumeBanner(false);
    setPlayerResetKey((k) => k + 1);
    persistProgress(0, totalSecRef.current, false, true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  // Esconder barra de controle após inatividade
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 4000);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const parsedHashtags = (hashtags || "")
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1)
    .map((t) => (t.startsWith("#") ? t : `#${t}`));

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center select-none"
    >
      {/* BARRA SUPERIOR DE CONTROLE */}
      <div
        className={`absolute top-0 left-0 right-0 z-40 p-3 sm:p-5 bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-center justify-between gap-2 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* CONTROLES DA ESQUERDA: VOLTAR & NAVEGAÇÃO DE EPISÓDIOS */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => {
              if (backUrl) router.push(backUrl);
              else router.back();
            }}
            className="flex items-center gap-2 text-white hover:text-brand-gold bg-black/60 hover:bg-black/90 px-3 sm:px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-lg shrink-0"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline text-xs sm:text-sm font-bold uppercase tracking-wider">
              Voltar
            </span>
          </button>

          {/* BOTÃO EPISÓDIO ANTERIOR */}
          {prevEpisodeUrl && (
            <Link
              href={prevEpisodeUrl}
              className="p-2 text-white hover:text-brand-gold bg-black/60 hover:bg-black/90 rounded-xl backdrop-blur-md border border-white/10 transition-colors shrink-0"
              title="Episódio Anterior"
            >
              <SkipBack className="w-4 h-4" />
            </Link>
          )}

          {/* BOTÃO PRÓXIMO EPISÓDIO */}
          {nextEpisodeUrl && (
            <Link
              href={nextEpisodeUrl}
              className="p-2 text-white hover:text-brand-gold bg-black/60 hover:bg-black/90 rounded-xl backdrop-blur-md border border-white/10 transition-colors shrink-0"
              title="Próximo Episódio"
            >
              <SkipForward className="w-4 h-4" />
            </Link>
          )}

          {/* BOTÃO DRAWER DE EPISÓDIOS */}
          {allEpisodes && allEpisodes.length > 0 && (
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="flex items-center gap-1.5 p-2 text-white hover:text-brand-gold bg-black/60 hover:bg-black/90 rounded-xl backdrop-blur-md border border-white/10 transition-colors shrink-0"
              title="Ver Todos os Episódios"
            >
              <ListVideo className="w-4 h-4 text-brand-gold" />
              <span className="hidden md:inline text-xs font-bold uppercase">Episódios</span>
            </button>
          )}
        </div>

        <div className="text-center px-2 min-w-0 flex-1">
          <h1 className="text-white font-black text-xs sm:text-base md:text-lg tracking-wide uppercase truncate">
            {movieTitle}
          </h1>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {isSeries && seasonNumber && episodeNumber ? (
              <span className="text-[11px] text-brand-gold font-extrabold tracking-wider uppercase bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/30">
                T{seasonNumber} : Ep. {episodeNumber}
              </span>
            ) : (
              <span className="text-[10px] text-brand-gold font-semibold tracking-widest uppercase">
                Top Filmes Cinema
              </span>
            )}
            {parsedHashtags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/?search=${encodeURIComponent(tag)}`}
                className="hidden md:inline-flex items-center text-[10px] text-blue-300 hover:text-brand-gold transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* CURTIR (SE FILME) */}
          {movieId && (
            <LikeButton
              movieId={movieId}
              initialCount={initialLikesCount}
              variant="player"
            />
          )}

          {/* COMPARTILHAR */}
          {movieId && (
            <ShareButton
              movieId={movieId}
              movieTitle={movieTitle}
              synopsis={synopsis}
              variant="player"
            />
          )}

          {/* RECOMEÇAR DO INÍCIO */}
          {resumeSeconds > 5 && (
            <button
              onClick={handleRestartFromBeginning}
              className="hidden sm:flex p-2 text-white hover:text-brand-gold bg-black/60 hover:bg-black/90 rounded-xl backdrop-blur-md border border-white/10 transition-colors"
              title="Assistir desde o início"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* ABRIR NO PLAYER EXTERNO */}
          {activeSrc && (
            <a
              href={activeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2 text-white hover:text-brand-gold bg-black/60 hover:bg-black/90 rounded-xl backdrop-blur-md border border-white/10 transition-colors"
              title="Abrir no player externo / site de origem"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* TELA CHEIA */}
          <button
            onClick={toggleFullScreen}
            className="p-2 text-white hover:text-brand-gold bg-black/60 hover:bg-black/90 rounded-xl backdrop-blur-md border border-white/10 transition-colors"
            title="Tela Cheia"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOAST DE "CONTINUANDO DE ONDE PAROU" */}
      {showResumeBanner && resumeSeconds > 5 && (
        <div className="absolute bottom-20 left-4 sm:left-6 z-40 bg-brand-surface/95 backdrop-blur-md border border-brand-gold/50 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 max-w-sm animate-fade-in">
          <div className="p-2 rounded-xl bg-brand-gold/20 text-brand-gold shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-white">
              Continuando de <span className="text-brand-gold">{formatTime(resumeSeconds)}</span>
            </p>
            <p className="text-[11px] text-gray-400">
              {processed.type === "tokyvideo" || processed.type === "gdrive" || processed.type === "embed"
                ? `Seu último ponto salvo foi ${formatTime(resumeSeconds)}.`
                : "Retomando automaticamente de onde você parou."}
            </p>
          </div>
          <button
            onClick={handleRestartFromBeginning}
            className="px-2.5 py-1.5 rounded-lg bg-brand-surfaceElevated hover:bg-brand-gold hover:text-brand-dark text-[10px] font-extrabold uppercase tracking-wider text-gray-200 transition-colors shrink-0 border border-brand-surfaceBorder"
          >
            Do Início
          </button>
        </div>
      )}

      {/* RENDERIZADOR DO PLAYER */}
      <div className="w-full h-full flex items-center justify-center">
        {!progressReady ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">
              Verificando ponto de parada...
            </span>
          </div>
        ) : processed.type === "direct" ? (
          <video
            key={`direct-${playerResetKey}`}
            ref={videoRef}
            src={activeSrc}
            controls
            autoPlay
            playsInline
            onLoadedMetadata={() => {
              if (videoRef.current && resumeSeconds > 5 && !appliedDirectSeekRef.current) {
                appliedDirectSeekRef.current = true;
                videoRef.current.currentTime = resumeSeconds;
              }
            }}
            onPause={() => {
              if (videoRef.current) {
                persistProgress(
                  videoRef.current.currentTime,
                  videoRef.current.duration || totalSecRef.current
                );
              }
            }}
            className="w-full h-full object-contain"
          />
        ) : (
          <iframe
            key={`${activeSrc}-${playerResetKey}`}
            src={activeSrc}
            title={movieTitle}
            className="w-full h-full border-0 bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; screen-wake-lock"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>

      {/* DRAWER LATERAL DE EPISÓDIOS (PARA SÉRIES E ANIMES) */}
      {drawerOpen && isSeries && (
        <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] bg-brand-dark/95 backdrop-blur-xl border-l border-brand-surfaceBorder z-50 p-4 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-surfaceBorder">
            <div className="flex items-center gap-2">
              <ListVideo className="w-4 h-4 text-brand-gold" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Episódios
              </h3>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
            {allEpisodes.map((ep) => {
              const isSelected = ep.id === episodeId;
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push(`/assistir-serie/${seriesId}/${ep.id}`);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-brand-gold/15 border-brand-gold text-white"
                      : "bg-brand-surfaceElevated/60 border-brand-surfaceBorder/80 text-gray-300 hover:bg-brand-surfaceElevated hover:border-brand-gold/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-gold block mb-0.5">
                      {ep.season_number ? `T${ep.season_number} • ` : ""}Ep. {ep.episode_number}
                    </span>
                    <h4 className="text-xs font-bold truncate">
                      {ep.title}
                    </h4>
                  </div>
                  {isSelected ? (
                    <span className="text-[10px] font-black uppercase text-brand-gold bg-brand-gold/20 px-2 py-0.5 rounded border border-brand-gold/40">
                      Assistindo
                    </span>
                  ) : (
                    <Play className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
