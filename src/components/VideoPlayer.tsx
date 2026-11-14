"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Maximize, RotateCcw, Volume2, Shield } from "lucide-react";
import { processVideoUrl } from "@/lib/video-helper";

interface VideoPlayerProps {
  movieId: string;
  movieTitle: string;
  rawVideoUrl: string;
  initialProgressSeconds?: number;
}

export default function VideoPlayer({
  movieId,
  movieTitle,
  rawVideoUrl,
  initialProgressSeconds = 0,
}: VideoPlayerProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const processed = processVideoUrl(rawVideoUrl);

  // Enviar heartbeat de progresso a cada 10s se for HTML5 video
  useEffect(() => {
    const reportProgress = async (currentSec: number, totalSec: number) => {
      try {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            movieId,
            progressSeconds: Math.floor(currentSec),
            durationSeconds: Math.floor(totalSec),
          }),
        });
      } catch (e) {
        console.error("Falha ao sincronizar progresso:", e);
      }
    };

    let interval: NodeJS.Timeout | null = null;
    if (processed.type === "direct") {
      interval = setInterval(() => {
        if (videoRef.current) {
          reportProgress(
            videoRef.current.currentTime,
            videoRef.current.duration || 0
          );
        }
      }, 10000);
    } else {
      // Para iframes como Google Drive ou YouTube onde não há acesso direto ao currentTime por CORS,
      // registramos o início da reprodução no histórico
      reportProgress(initialProgressSeconds || 60, 7200);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [movieId, processed.type, initialProgressSeconds]);

  // Esconder barra de controle após inatividade
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3500);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center select-none"
    >
      {/* BARRA SUPERIOR DE CONTROLE (VOLTAR E TÍTULO) */}
      <div
        className={`absolute top-0 left-0 right-0 z-40 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white hover:text-brand-gold bg-black/60 hover:bg-black/90 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
            Voltar
          </span>
        </button>

        <div className="text-center px-4">
          <h2 className="text-white font-black text-sm sm:text-base md:text-lg tracking-wide uppercase truncate max-w-md">
            {movieTitle}
          </h2>
          <span className="text-[10px] text-brand-gold font-semibold tracking-widest uppercase">
            Top Filmes Cinema Mode
          </span>
        </div>

        <button
          onClick={toggleFullScreen}
          className="p-2.5 text-white hover:text-brand-gold bg-black/60 hover:bg-black/90 rounded-xl backdrop-blur-md border border-white/10 transition-colors"
          title="Tela Cheia"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>

      {/* RENDERIZADOR DO PLAYER */}
      <div className="w-full h-full flex items-center justify-center">
        {processed.type === "direct" ? (
          <video
            ref={videoRef}
            src={processed.src}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <iframe
            src={processed.src}
            title={movieTitle}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
