"use client";

import React, { useState } from "react";
import { Share2, Copy, Check, X, MessageCircle, Send } from "lucide-react";

interface ShareButtonProps {
  movieId: string;
  movieTitle: string;
  synopsis?: string;
  variant?: "default" | "player" | "hero";
  className?: string;
}

export default function ShareButton({
  movieId,
  movieTitle,
  synopsis = "",
  variant = "default",
  className = "",
}: ShareButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/assistir/${movieId}`;
    }
    return `https://topfilmes-six.vercel.app/assistir/${movieId}`;
  };

  const trackShare = () => {
    fetch(`/api/movies/${movieId}/share`, { method: "POST" }).catch(() => {});
  };

  const handleMainClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = getShareUrl();
    const shareText = `🎬 Assista "${movieTitle}" grátis no Top Filmes!`;

    // Em celulares modernos com Web Share API, abre a folha nativa de compartilhamento
    if (typeof navigator !== "undefined" && typeof navigator.share === "function" && window.innerWidth < 768) {
      try {
        await navigator.share({
          title: `${movieTitle} | Top Filmes`,
          text: shareText,
          url,
        });
        trackShare();
        return;
      } catch {
        // Se o usuário cancelar ou navegador bloquear, abre o menu visual
      }
    }

    setMenuOpen((prev) => !prev);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackShare();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      trackShare();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareUrl = getShareUrl();
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`🎬 Assista "${movieTitle}" no Top Filmes! ${synopsis ? synopsis.slice(0, 80) + "..." : ""}`);

  const buttonClasses =
    variant === "player"
      ? "flex items-center gap-1.5 px-3 py-2 text-white hover:text-brand-gold bg-black/60 hover:bg-black/90 rounded-xl backdrop-blur-md border border-white/10 transition-colors"
      : variant === "hero"
      ? "flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-surfaceElevated/80 hover:bg-brand-surfaceElevated text-gray-200 hover:text-brand-gold text-sm font-bold border border-brand-surfaceBorder hover:border-brand-gold transition-all"
      : "flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide border bg-brand-surfaceElevated hover:bg-brand-surfaceBorder text-gray-200 border-brand-surfaceBorder hover:border-brand-gold hover:text-brand-gold transition-all";

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleMainClick}
        className={buttonClasses}
        title="Compartilhar Filme"
      >
        <Share2 className="w-4 h-4" />
        {variant !== "player" && <span>Compartilhar</span>}
      </button>

      {menuOpen && (
        <>
          {/* Backdrop invisível para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
            }}
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-2 w-64 bg-brand-surface border border-brand-surfaceBorder rounded-2xl shadow-2xl p-4 z-50 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-brand-surfaceBorder pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-brand-gold">
                Compartilhar Filme
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="text-gray-400 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/40 border border-sky-400/40 text-sky-300 text-xs font-bold transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 text-xs font-bold transition-colors"
              >
                <span>Facebook</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-700/40 hover:bg-gray-600/60 border border-gray-500/40 text-gray-200 text-xs font-bold transition-colors"
              >
                <span>X / Twitter</span>
              </a>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                copied
                  ? "bg-emerald-500 text-brand-dark"
                  : "bg-brand-gold hover:bg-brand-goldHover text-brand-dark"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Link do Filme</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
