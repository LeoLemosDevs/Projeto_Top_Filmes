"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Collection } from "@/lib/types";
import { Layers, Film, Search, ArrowRight, Play, Sparkles } from "lucide-react";

export default function SagasPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCollections() {
      try {
        setLoading(true);
        const res = await fetch("/api/collections");
        const data = await res.json();
        setCollections(data.collections || []);
      } catch (err) {
        console.error("Erro ao carregar sagas:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCollections();
  }, []);

  const filtered = collections.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.synopsis && c.synopsis.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-20 pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-brand-surfaceBorder">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-brand-gold/20 text-brand-gold border border-brand-gold/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Franquias e Universos
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <Layers className="w-8 h-8 text-brand-gold" />
            Sagas & <span className="text-brand-gold">Coleções</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl">
            Assista a todas as suas sagas favoritas em ordem cronológica. De Alien e Star Wars a Rambo e muito mais!
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar saga ou franquia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
          />
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-brand-surface border border-brand-surfaceBorder animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-brand-surface/40 rounded-3xl border border-brand-surfaceBorder">
          <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Nenhuma saga encontrada</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            {search ? "Tente buscar por outro termo ou remova o filtro." : "Ainda não há sagas cadastradas no momento."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((saga) => (
            <Link
              key={saga.id}
              href={`/sagas/${saga.slug || saga.id}`}
              className="group relative bg-brand-surface rounded-2xl overflow-hidden border border-brand-surfaceBorder hover:border-brand-gold/60 transition-all duration-300 hover:scale-[1.02] shadow-xl flex flex-col"
            >
              {/* BACKDROP IMAGE / BANNER */}
              <div className="relative h-48 w-full overflow-hidden bg-brand-surfaceElevated">
                <Image
                  src={saga.backdrop_url || saga.cover_image_url || "/logo.png"}
                  alt={saga.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-brand-surface/40 to-transparent" />

                {/* BADGE TOTAL DE FILMES */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-brand-dark/90 backdrop-blur-md border border-brand-gold/40 text-[11px] font-extrabold text-brand-gold flex items-center gap-1 shadow-lg">
                  <Film className="w-3 h-3" />
                  <span>{saga.movies_count || saga.movies?.length || 0} Filmes</span>
                </div>
              </div>

              {/* SAGA DETAILS */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-brand-gold transition-colors uppercase tracking-wide line-clamp-1">
                    {saga.title}
                  </h3>
                  <p className="text-gray-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                    {saga.synopsis || "Confira todos os filmes desta grande franquia reunidos em uma ordem perfeita para maratonar."}
                  </p>
                </div>

                {/* MINI PREVIEWS DOS POSTERS DOS FILMES */}
                {saga.movies && saga.movies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-brand-surfaceBorder/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                      Filmes inclusos:
                    </span>
                    <div className="flex items-center gap-2 overflow-hidden">
                      {saga.movies.slice(0, 4).map((m: any, idx: number) => (
                        <div
                          key={m.id || idx}
                          className="relative w-12 h-16 rounded-md overflow-hidden border border-brand-surfaceBorder shrink-0 bg-black shadow-md"
                          title={m.title}
                        >
                          <Image
                            src={m.cover_image_url || "/logo.png"}
                            alt={m.title || "Filme"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {(saga.movies_count || 0) > 4 && (
                        <div className="w-12 h-16 rounded-md bg-brand-surfaceElevated border border-brand-surfaceBorder flex items-center justify-center text-[11px] font-bold text-brand-gold shrink-0">
                          +{Number(saga.movies_count) - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between text-xs font-bold text-brand-gold">
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explorar Franquia <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="p-2 rounded-full bg-brand-gold text-brand-dark group-hover:bg-brand-goldHover transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
