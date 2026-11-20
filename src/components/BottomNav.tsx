"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Film, 
  Tv,
  Sparkles,
  Layers,
  Bookmark, 
  History as HistoryIcon, 
  User, 
  ShieldAlert,
  Download
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setIsLogged(true);
          if (data.user.role === "ADMIN") setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  // Ocultar bottom nav se estiver assistindo em tela cheia
  if (pathname.startsWith("/assistir")) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-dark/95 backdrop-blur-lg border-t border-brand-surfaceBorder/80 px-2 py-2">
      <nav className="flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            pathname === "/" ? "text-brand-gold font-bold" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Início</span>
        </Link>

        <Link
          href="/series"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            pathname.startsWith("/series") ? "text-blue-400 font-bold" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Séries</span>
        </Link>

        <Link
          href="/animes"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            pathname.startsWith("/animes") ? "text-purple-400 font-bold" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Animes</span>
        </Link>

        <Link
          href="/sagas"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            pathname.startsWith("/sagas") ? "text-brand-gold font-bold" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Sagas</span>
        </Link>

        <Link
          href="/minha-lista"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            pathname === "/minha-lista" ? "text-brand-gold font-bold" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Lista</span>
        </Link>

        {isAdmin ? (
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
              pathname === "/admin" ? "text-brand-gold font-bold" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <ShieldAlert className="w-5 h-5 text-brand-gold" />
            <span className="text-[10px] tracking-tight">Admin</span>
          </Link>
        ) : (
          <Link
            href="/baixar-app"
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
              pathname === "/baixar-app" ? "text-emerald-400 font-bold" : "text-gray-400 hover:text-emerald-400"
            }`}
          >
            <Download className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] tracking-tight text-emerald-400 font-bold">App</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
