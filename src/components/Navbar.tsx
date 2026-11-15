"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { 
  Search, 
  Film, 
  Bookmark, 
  History as HistoryIcon, 
  ShieldAlert, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  Play,
  Download
} from "lucide-react";
import { OFFICIAL_GENRES } from "@/lib/types";

interface UserState {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserState | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-brand-dark/95 backdrop-blur-md border-b border-brand-surfaceBorder shadow-xl shadow-black/50"
          : "bg-gradient-to-b from-black/90 via-black/50 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* LOGO & BRAND */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-gold shadow-glowGold transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Top Filmes Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-black tracking-widest text-brand-gold uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                TOP FILMES
              </span>
              <span className="text-[10px] tracking-wider text-blue-400 font-semibold -mt-1 uppercase">
                O Melhor do Cinema
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-brand-gold ${
                pathname === "/" ? "text-brand-gold font-bold" : "text-gray-300"
              }`}
            >
              Início
            </Link>

            {/* Dropdown de Gêneros */}
            <div className="relative">
              <button
                onClick={() => setIsGenresOpen(!isGenresOpen)}
                className="flex items-center gap-1 text-gray-300 hover:text-brand-gold transition-colors py-2"
              >
                <span>Gêneros</span>
                <span className="text-xs">▼</span>
              </button>
              {isGenresOpen && (
                <div 
                  className="absolute left-0 mt-2 w-64 bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl shadow-2xl p-3 grid grid-cols-2 gap-1 z-50 backdrop-blur-md"
                  onMouseLeave={() => setIsGenresOpen(false)}
                >
                  {OFFICIAL_GENRES.map((g) => (
                    <Link
                      key={g}
                      href={`/?genre=${encodeURIComponent(g)}`}
                      onClick={() => setIsGenresOpen(false)}
                      className="px-3 py-2 rounded-lg text-xs text-gray-300 hover:bg-brand-blue hover:text-white transition-colors"
                    >
                      {g}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/minha-lista"
              className={`flex items-center gap-1.5 transition-colors hover:text-brand-gold ${
                pathname === "/minha-lista" ? "text-brand-gold font-bold" : "text-gray-300"
              }`}
            >
              <Bookmark className="w-4 h-4 text-brand-gold" />
              <span>Minha Lista</span>
            </Link>

            <Link
              href="/historico"
              className={`flex items-center gap-1.5 transition-colors hover:text-brand-gold ${
                pathname === "/historico" ? "text-brand-gold font-bold" : "text-gray-300"
              }`}
            >
              <HistoryIcon className="w-4 h-4 text-brand-blueLight" />
              <span>Histórico</span>
            </Link>
          </nav>
        </div>

        {/* RIGHT ACTIONS: SEARCH & USER */}
        <div className="flex items-center gap-3">
          {/* BOTÃO BAIXAR APP */}
          <Link
            href="/baixar-app"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 hover:from-emerald-500 hover:to-green-400 text-white text-xs font-bold tracking-wide transition-all shadow-md hover:scale-105 active:scale-95 border border-emerald-400/40"
            title="Baixar App para Android / TV Box"
          >
            <Download className="w-3.5 h-3.5 text-white animate-bounce" />
            <span className="hidden sm:inline">Baixar App</span>
            <span className="sm:hidden">App</span>
          </Link>

          {/* SEARCH BAR */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-brand-surface border border-brand-blue/50 rounded-full px-3 py-1.5 shadow-lg w-48 sm:w-64 transition-all">
                <Search className="w-4 h-4 text-brand-gold mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar títulos, anos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-gray-400 focus:outline-none w-full"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-400 hover:text-white ml-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-300 hover:text-brand-gold hover:bg-brand-surface/80 rounded-full transition-colors"
                title="Pesquisar filme"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* PAINEL ADMIN (SE FOR ADMIN) */}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/40 border border-brand-blue text-blue-300 hover:text-white text-xs font-semibold tracking-wide transition-all shadow-glowBlue"
            >
              <ShieldAlert className="w-4 h-4 text-brand-gold" />
              <span>Painel Admin</span>
            </Link>
          )}

          {/* USER MENU */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-brand-surface border border-brand-surfaceBorder rounded-full pl-3 pr-2 py-1">
                <span className="text-xs text-gray-200 font-medium max-w-[120px] truncate">
                  {user.name.split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-gray-400 hover:text-brand-red rounded-full hover:bg-brand-surfaceElevated transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 bg-brand-gold hover:bg-brand-goldHover text-brand-dark px-4 py-2 rounded-full font-bold text-xs tracking-wider uppercase transition-all shadow-glowGold hover:scale-105"
            >
              <UserIcon className="w-4 h-4" />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
