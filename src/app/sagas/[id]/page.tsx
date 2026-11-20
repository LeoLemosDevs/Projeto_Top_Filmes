"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Collection, Movie } from "@/lib/types";
import MovieModal from "@/components/MovieModal";
import { 
  Play, 
  ArrowLeft, 
  Film, 
  Calendar, 
  Clock, 
  Layers, 
  Sparkles,
  Info
} from "lucide-react";

export default function SagaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaga() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/collections/${id}`);
        const data = await res.json();
        if (data.collection) {
          setCollection(data.collection);
          setMovies(data.collection.movies || []);
        }
      } catch (err) {
        console.error("Erro ao carregar saga:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSaga();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 px-4 max-w-7xl mx-auto">
        <div className="h-96 rounded-3xl bg-brand-surface animate-pulse mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-brand-surface animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen pt-36 px-4 text-center max-w-lg mx-auto">
        <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Saga não encontrada</h1>
        <p className="text-gray-400 text-sm mb-6">
          A franquia procurada não existe ou foi removida do catálogo.
        </p>
        <Link
          href="/sagas"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-gold text-brand-dark font-extrabold uppercase text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Sagas
        </Link>
      </div>
    );
  }

  const firstMovie = movies.length > 0 ? movies[0] : null;

  return (
    <div className="min-h-screen pb-24 pt-20">
      {/* HERO BANNER DA SAGA */}
      <div className="relative w-full h-[450px] sm:h-[520px] overflow-hidden">
        <Image
          src={collection.backdrop_url || collection.cover_image_url || "/logo.png"}
          alt={collection.title}
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-brand-dark/40 to-brand-dark" />

        {/* BOTÃO VOLTAR */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <Link
            href="/sagas"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md border border-white/10 transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 text-brand-gold" /> Voltar para Todas as Sagas
          </Link>
        </div>

        {/* INFORMAÇÕES HERO */}
        <div className="absolute bottom-10 left-4 sm:left-8 right-4 sm:right-8 max-w-4xl z-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-brand-gold text-brand-dark shadow-glowGold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Franquia Oficial
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/60 text-gray-300 border border-white/10 backdrop-blur-md flex items-center gap-1.5">
              <Film className="w-3 h-3 text-brand-gold" /> {movies.length} Filmes na Ordem
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            {collection.title}
          </h1>

          {collection.synopsis && (
            <p className="text-gray-300 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed drop-shadow line-clamp-3">
              {collection.synopsis}
            </p>
          )}

          {firstMovie && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/assistir/${firstMovie.id}`}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-brand-gold hover:bg-brand-goldHover text-brand-dark font-black text-sm uppercase tracking-wider transition-all shadow-glowGold hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Começar Pelo 1º Filme ({firstMovie.title})</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* LISTA DE FILMES DA SAGA NA ORDEM */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-surfaceBorder">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-brand-gold">|</span> Cronologia dos Filmes
            </h2>
            <p className="text-gray-400 text-xs mt-1">
              Assista na ordem de lançamento e conheça a evolução da história completa.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">
            {movies.length} Títulos
          </span>
        </div>

        {movies.length === 0 ? (
          <div className="text-center py-16 bg-brand-surface/50 rounded-2xl border border-brand-surfaceBorder">
            <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              Nenhum filme vinculado a esta saga ainda. O administrador pode adicionar filmes no painel.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {movies.map((movie: any, index: number) => {
              const orderNum = movie.order_index || index + 1;
              return (
                <div
                  key={movie.id}
                  className="group relative bg-brand-surface hover:bg-brand-surfaceElevated border border-brand-surfaceBorder hover:border-brand-gold/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-lg"
                >
                  <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                    {/* NÚMERO NA ORDEM */}
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-dark border-2 border-brand-gold/60 text-brand-gold font-black text-base sm:text-lg shrink-0 shadow-md">
                      #{orderNum}
                    </div>

                    {/* CARTAZ DO FILME */}
                    <div className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-brand-surfaceBorder bg-black shadow-md">
                      <Image
                        src={movie.cover_image_url || "/logo.png"}
                        alt={movie.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* DETALHES DO FILME */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/30">
                          {movie.genre}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
                          <Calendar className="w-3 h-3" /> {movie.release_year}
                        </span>
                        {movie.duration_minutes && (
                          <span className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
                            <Clock className="w-3 h-3" /> {movie.duration_minutes} min
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white group-hover:text-brand-gold transition-colors uppercase tracking-wide truncate">
                        {movie.title}
                      </h3>

                      <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {movie.synopsis}
                      </p>
                    </div>
                  </div>

                  {/* AÇÕES */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-surfaceBorder/60">
                    <button
                      onClick={() => setSelectedMovie(movie)}
                      className="px-3.5 py-2.5 rounded-xl bg-brand-surfaceElevated hover:bg-brand-surfaceBorder text-gray-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                      title="Ver Detalhes"
                    >
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                      <span className="hidden sm:inline">Detalhes</span>
                    </button>

                    <Link
                      href={`/assistir/${movie.id}`}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-goldHover text-brand-dark font-extrabold text-xs uppercase tracking-wider transition-all shadow-glowGold hover:scale-105 active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Assistir</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE DETALHES DO FILME SE CLICADO */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
