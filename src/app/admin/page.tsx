"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  PlusCircle, 
  Trash2, 
  Film, 
  Eye, 
  Sparkles, 
  ShieldAlert, 
  ExternalLink,
  Check,
  AlertCircle,
  Pencil,
  Save,
  X
} from "lucide-react";
import { OFFICIAL_CATEGORIES, OFFICIAL_GENRES, Movie } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Edit Mode State
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [loadingMovieEdit, setLoadingMovieEdit] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState<number | string>(new Date().getFullYear());
  const [synopsis, setSynopsis] = useState("");
  const [genre, setGenre] = useState<string>(OFFICIAL_GENRES[0]);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(110);
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["anos-80"]);

  // Verificar se o usuário atual é admin
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user || data.user.role !== "ADMIN") {
          router.push("/login");
        } else {
          loadMovies();
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/movies");
      const data = await res.json();
      setMovies(data.movies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter((s) => s !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

  const handleStartEdit = async (m: Movie) => {
    setEditingMovie(m);
    setTitle(m.title);
    setReleaseYear(m.release_year);
    setSynopsis(m.synopsis);
    setGenre(m.genre);
    setCoverImageUrl(m.cover_image_url);
    setVideoUrl(m.video_url);
    setDurationMinutes(m.duration_minutes || 110);
    setIsFeatured(Boolean(m.is_featured));
    setFeedback(null);

    // Rolar até o topo do formulário
    window.scrollTo({ top: 100, behavior: "smooth" });

    // Buscar categorias atribuídas ao filme
    try {
      setLoadingMovieEdit(true);
      const res = await fetch(`/api/movies/${m.id}`);
      const data = await res.json();
      if (data?.movie?.categories) {
        setSelectedCategories(data.movie.categories.map((c: any) => c.slug));
      }
    } catch (e) {
      console.error("Erro ao carregar categorias do filme:", e);
    } finally {
      setLoadingMovieEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMovie(null);
    setTitle("");
    setReleaseYear(new Date().getFullYear());
    setSynopsis("");
    setGenre(OFFICIAL_GENRES[0]);
    setCoverImageUrl("");
    setVideoUrl("");
    setDurationMinutes(110);
    setIsFeatured(false);
    setSelectedCategories(["anos-80"]);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const url = editingMovie ? `/api/movies/${editingMovie.id}` : "/api/movies";
      const method = editingMovie ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          release_year: releaseYear,
          synopsis,
          genre,
          cover_image_url: coverImageUrl,
          video_url: videoUrl,
          categories: selectedCategories,
          duration_minutes: durationMinutes,
          is_featured: isFeatured,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (editingMovie ? "Erro ao atualizar filme." : "Erro ao publicar filme."));
      }

      setFeedback({ 
        type: "success", 
        message: editingMovie 
          ? `Filme "${title}" atualizado com sucesso!` 
          : "Filme publicado com sucesso no Top Filmes!" 
      });

      // Reset form
      handleCancelEdit();
      loadMovies();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, movieTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir o filme "${movieTitle}"?`)) return;

    try {
      const res = await fetch(`/api/movies/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMovies(movies.filter((m) => m.id !== id));
      }
    } catch (err) {
      alert("Falha ao excluir filme.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* HEADER DO PAINEL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-brand-surfaceBorder">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-blue/20 border border-brand-blue">
            <ShieldAlert className="w-6 h-6 text-brand-gold" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
              Painel do Administrador
            </h1>
            <p className="text-xs text-gray-400">
              Gerencie e publique filmes com suporte a Google Drive, YouTube e players externos.
            </p>
          </div>
        </div>

        {/* METRICS SUMMARY */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-brand-surface border border-brand-surfaceBorder rounded-xl text-center">
            <span className="text-xs text-gray-400 uppercase font-bold block">Filmes</span>
            <span className="text-lg font-black text-brand-gold">{movies.length}</span>
          </div>
          <div className="px-4 py-2 bg-brand-surface border border-brand-surfaceBorder rounded-xl text-center">
            <span className="text-xs text-gray-400 uppercase font-bold block">Sessões TV</span>
            <span className="text-lg font-black text-brand-blueLight">{OFFICIAL_CATEGORIES.length}</span>
          </div>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-xs font-bold ${
            feedback.type === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-brand-red/10 border border-brand-red text-red-400"
          }`}
        >
          {feedback.type === "success" ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORMULÁRIO DE PUBLICAÇÃO E EDIÇÃO */}
        <div className="lg:col-span-7 bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-brand-surfaceBorder">
            <h2 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 text-brand-gold">
              {editingMovie ? (
                <>
                  <Pencil className="w-5 h-5 text-brand-gold" />
                  <span>
                    Editar Filme: <span className="text-white font-semibold underline">{editingMovie.title}</span>
                  </span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  <span>Publicar Novo Filme</span>
                </>
              )}
            </h2>

            {editingMovie && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-700/60 hover:bg-gray-600 text-gray-200 hover:text-white text-xs font-bold transition-all border border-gray-600"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar Edição</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* TÍTULO E ANO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Título do Filme *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Top Gun: Ases Indomáveis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Ano de Lançamento *
                </label>
                <input
                  type="number"
                  required
                  min={1920}
                  max={2030}
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            {/* GÊNERO & DURAÇÃO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Gênero Oficial *
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                >
                  {OFFICIAL_GENRES.map((g) => (
                    <option key={g} value={g} className="bg-brand-surfaceElevated text-white">
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Duração Estimada (minutos)
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 100)}
                  className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            {/* SINOPSE */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Sinopse Completa *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Descreva a história e os destaques da trama..."
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold resize-none"
              />
            </div>

            {/* URL DA CAPA DE DVD (PROPORÇÃO 2:3) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  URL da Capa do Filme (Proporção DVD anos 2000 - 2:3) *
                </label>
                <span className="text-[10px] text-brand-gold font-mono">Ex: 600x900px</span>
              </div>
              <input
                type="url"
                required
                placeholder="https://exemplo.com/poster-capa-dvd.jpg"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
              />
            </div>

            {/* LINK DO VÍDEO (TOKYVIDEO, DAILYMOTION, GOOGLE DRIVE, YOUTUBE, ETC.) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Link do Vídeo (TokyVideo, Dailymotion, Drive, YouTube, Embed) *
                </label>
                <span className="text-[10px] text-emerald-400 font-bold">Multi-plataformas</span>
              </div>
              <input
                type="text"
                required
                placeholder="Cole o link do TokyVideo, Dailymotion, Google Drive, YouTube ou <iframe>..."
                value={videoUrl}
                onChange={(e) => {
                  let val = e.target.value;
                  const iframeMatch = val.match(/src=["']([^"']+)["']/i);
                  if (iframeMatch && iframeMatch[1]) {
                    val = iframeMatch[1];
                  }
                  setVideoUrl(val);
                }}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
              />
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                💡 <strong className="text-gray-300">Suporte completo:</strong> aceita links do <span className="text-brand-gold font-semibold">TokyVideo</span> (incluindo tokyvideo.com/br/video/...), <span className="text-blue-400 font-semibold">Dailymotion</span> (dailymotion.com ou dai.ly), <span className="text-emerald-400 font-semibold">Google Drive</span>, YouTube, Vimeo, Ok.ru, MP4 direto ou código <code className="text-white">&lt;iframe&gt;</code> completo.
              </p>
              {videoUrl.trim() && (
                <div className="mt-2">
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-gold hover:underline font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Testar link do vídeo em nova aba</span>
                  </a>
                </div>
              )}
            </div>

            {/* SELEÇÃO DE CATEGORIAS / SESSÕES DA HOME */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Categorias / Sessões de Exibição na Página Inicial (Marque uma ou mais)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {OFFICIAL_CATEGORIES.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.slug);
                  return (
                    <button
                      type="button"
                      key={cat.slug}
                      onClick={() => handleCategoryToggle(cat.slug)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border ${
                        isChecked
                          ? "bg-brand-blue text-white border-blue-400 shadow-md"
                          : "bg-brand-surfaceElevated text-gray-400 border-brand-surfaceBorder hover:text-white"
                      }`}
                    >
                      {isChecked ? "✓ " : "+ "}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DESTAQUE HERO */}
            <div className="flex items-center gap-3 p-3 bg-brand-surfaceElevated rounded-xl border border-brand-surfaceBorder">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-brand-gold rounded border-brand-surfaceBorder focus:ring-brand-gold"
              />
              <label htmlFor="isFeatured" className="text-xs font-bold text-gray-200 cursor-pointer">
                Exibir este filme no Banner Super Destaque do topo da página inicial
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting || loadingMovieEdit}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-glowGold hover:scale-[1.01] active:scale-[0.99] ${
                editingMovie
                  ? "bg-gradient-to-r from-amber-500 via-brand-gold to-yellow-500 text-brand-dark"
                  : "bg-brand-gold hover:bg-brand-goldHover text-brand-dark"
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
              ) : editingMovie ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações do Filme</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publicar Filme no Catálogo</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* LISTAGEM DOS FILMES CADASTRADOS */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 shadow-2xl flex-1 flex flex-col">
            <h2 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 mb-4">
              <Film className="w-5 h-5 text-brand-blueLight" /> Filmes Publicados ({movies.length})
            </h2>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-3 border-brand-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : movies.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">
                Nenhum filme cadastrado ainda. Use o formulário ao lado para publicar seu primeiro filme!
              </p>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[680px] pr-1">
                {movies.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl bg-brand-surfaceElevated border transition-all ${
                      editingMovie?.id === m.id
                        ? "border-brand-gold ring-1 ring-brand-gold/60 shadow-glowGold/30"
                        : "border-brand-surfaceBorder/80 hover:border-brand-gold/40"
                    }`}
                  >
                    <div className="relative w-12 aspect-dvd rounded-lg overflow-hidden shrink-0 bg-black">
                      <Image
                        src={m.cover_image_url || "/logo.png"}
                        alt={m.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {m.title}
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        {m.release_year} • {m.genre}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-blue/30 text-blue-300 font-semibold">
                          {m.views_count || 0} views
                        </span>
                        {m.is_featured ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-gold/30 text-brand-gold font-bold">
                            Destaque
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(m)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          editingMovie?.id === m.id
                            ? "bg-brand-gold text-brand-dark"
                            : "text-gray-400 hover:text-brand-gold hover:bg-brand-surfaceBorder/40"
                        }`}
                        title="Editar Informações do Filme"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <Link
                        href={`/assistir/${m.id}`}
                        target="_blank"
                        className="p-1.5 text-gray-400 hover:text-brand-blueLight hover:bg-brand-surfaceBorder/40 rounded-lg transition-colors"
                        title="Testar Player"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(m.id, m.title)}
                        className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-brand-surfaceBorder/40 rounded-lg transition-colors"
                        title="Excluir Filme"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
