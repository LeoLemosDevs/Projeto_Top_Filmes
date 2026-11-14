"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import MovieModal from "@/components/MovieModal";
import MovieCard from "@/components/MovieCard";
import { Movie, Category, OFFICIAL_GENRES } from "@/lib/types";
import { Film, Sparkles, Tv, Clock, Bookmark, Filter } from "lucide-react";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentGenre = searchParams.get("genre");
  const searchQuery = searchParams.get("search");

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [favoritesList, setFavoritesList] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados da Home
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Se tiver busca ou gênero ativo
        if (currentGenre || searchQuery) {
          const params = new URLSearchParams();
          if (currentGenre) params.set("genre", currentGenre);
          if (searchQuery) params.set("search", searchQuery);

          const res = await fetch(`/api/movies?${params.toString()}`);
          const data = await res.json();
          setFilteredMovies(data.movies || []);
        } else {
          // Home normal: carregar agrupado por categorias e destaques
          const res = await fetch("/api/movies?grouped=1");
          const data = await res.json();

          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
            setFeaturedMovies(data.featured || []);
          } else {
            // Se o banco estiver vazio, aciona o seed para criar os dados iniciais
            await fetch("/api/seed");
            const retryRes = await fetch("/api/movies?grouped=1");
            const retryData = await retryRes.json();
            setCategories(retryData.categories || []);
            setFeaturedMovies(retryData.featured || []);
          }
        }

        // Carregar histórico e favoritos do usuário logado
        fetch("/api/history")
          .then((r) => r.json())
          .then((d) => setHistoryList(d.history || []))
          .catch(() => {});

        fetch("/api/favorites")
          .then((r) => r.json())
          .then((d) => setFavoritesList(d.favorites || []))
          .catch(() => {});
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentGenre, searchQuery]);

  const clearFilters = () => {
    router.push("/");
  };

  const heroMovie = featuredMovies.length > 0 ? featuredMovies[0] : null;

  return (
    <div className="relative pb-16">
      {/* SE ESTIVER COM FILTRO DE BUSCA OU GÊNERO */}
      {currentGenre || searchQuery ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-surfaceBorder">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-brand-gold" />
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                {currentGenre && `Gênero: ${currentGenre}`}
                {searchQuery && `Busca: "${searchQuery}"`}
              </h1>
              <span className="text-xs text-gray-400 font-semibold">
                ({filteredMovies.length} encontrados)
              </span>
            </div>

            <button
              onClick={clearFilters}
              className="text-xs text-brand-gold hover:underline font-bold tracking-wider uppercase"
            >
              Limpar Filtros
            </button>
          </div>

          {filteredMovies.length === 0 ? (
            <div className="py-20 text-center">
              <Film className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                Nenhum filme encontrado para este filtro.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-brand-gold text-brand-dark rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                Ver Todo o Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onOpenModal={setSelectedMovie}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* HOME TRADICIONAL ESTILO NETFLIX */
        <>
          {/* HERO BANNER DESTAQUE */}
          <HeroBanner movie={heroMovie} onOpenModal={setSelectedMovie} />

          {/* BARRA DE FILTROS RÁPIDOS POR GÊNERO */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-30">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> Gêneros:
              </span>
              {OFFICIAL_GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => router.push(`/?genre=${encodeURIComponent(g)}`)}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-surfaceElevated hover:bg-brand-blue border border-brand-surfaceBorder hover:border-blue-400 text-gray-300 hover:text-white transition-all shrink-0 whitespace-nowrap shadow-sm"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {/* FILEIRA: CONTINUAR ASSISTINDO (HISTÓRICO) */}
            {historyList.length > 0 && (
              <section className="relative px-4 sm:px-6 lg:px-8 my-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-brand-red" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide uppercase">
                    <span className="text-brand-red">|</span> Continuar Assistindo
                  </h2>
                </div>
                <div
                  className="flex items-center gap-4 overflow-x-auto scroll-smooth scrollbar-none py-2"
                  style={{ scrollbarWidth: "none" }}
                >
                  {historyList.map((item) => (
                    <MovieCard
                      key={item.history_id}
                      movie={item}
                      progressSeconds={item.progress_seconds}
                      durationSeconds={item.duration_seconds}
                      onOpenModal={setSelectedMovie}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* FILEIRA: MINHA LISTA (FAVORITOS) */}
            {favoritesList.length > 0 && (
              <section className="relative px-4 sm:px-6 lg:px-8 my-6">
                <div className="flex items-center gap-2 mb-3">
                  <Bookmark className="w-5 h-5 text-brand-gold" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide uppercase">
                    <span className="text-brand-gold">|</span> Minha Lista
                  </h2>
                </div>
                <div
                  className="flex items-center gap-4 overflow-x-auto scroll-smooth scrollbar-none py-2"
                  style={{ scrollbarWidth: "none" }}
                >
                  {favoritesList.map((fav) => (
                    <MovieCard
                      key={fav.favorite_id}
                      movie={fav}
                      isFavoriteInitial={true}
                      onOpenModal={setSelectedMovie}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* FILEIRAS DAS 13 CATEGORIAS OFICIAIS */}
            {categories.map((cat) => (
              <MovieRow
                key={cat.id}
                title={cat.name}
                movies={cat.movies || []}
                onOpenModal={setSelectedMovie}
                icon={<Tv className="w-5 h-5 text-brand-blueLight" />}
              />
            ))}
          </div>
        </>
      )}

      {/* MODAL DE DETALHES DO FILME */}
      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-dark flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
