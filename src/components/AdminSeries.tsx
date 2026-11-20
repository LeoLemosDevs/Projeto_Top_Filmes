"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Series, Season, Episode, OFFICIAL_GENRES } from "@/lib/types";
import { 
  Tv, 
  Sparkles, 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Check, 
  AlertCircle, 
  X, 
  ExternalLink,
  Play,
  Film,
  Calendar,
  Clock,
  Layers,
  ChevronRight
} from "lucide-react";

export default function AdminSeries() {
  const [activeType, setActiveType] = useState<"SERIES" | "ANIME">("SERIES");
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Series Form State
  const [isEditingSeries, setIsEditingSeries] = useState(false);
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [genre, setGenre] = useState<string>("Ficção Científica");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [backdropUrl, setBackdropUrl] = useState("");
  const [releaseYear, setReleaseYear] = useState<number | string>(new Date().getFullYear());
  const [status, setStatus] = useState<string>("EM_ANDAMENTO");
  const [isFeatured, setIsFeatured] = useState(false);
  const [hashtags, setHashtags] = useState("");

  // Seasons & Episodes Sub-Management State
  const [selectedSeries, setSelectedSeries] = useState<any | null>(null);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const [isAddingSeason, setIsAddingSeason] = useState(false);
  const [newSeasonNumber, setNewSeasonNumber] = useState(1);
  const [newSeasonTitle, setNewSeasonTitle] = useState("");

  // Episode Form State
  const [isAddingEpisode, setIsAddingEpisode] = useState(false);
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null);
  const [epNumber, setEpNumber] = useState<number>(1);
  const [epTitle, setEpTitle] = useState("");
  const [epSynopsis, setEpSynopsis] = useState("");
  const [epDuration, setEpDuration] = useState<number>(45);
  const [epThumbnail, setEpThumbnail] = useState("");
  const [epVideoUrl, setEpVideoUrl] = useState("");
  const [resolvingEpVideo, setResolvingEpVideo] = useState(false);

  const loadSeries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/series?type=${activeType}`);
      const data = await res.json();
      setSeriesList(data.series || []);
    } catch (err) {
      console.error("Erro ao listar séries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeries();
  }, [activeType]);

  const loadSeriesDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/series/${id}`);
      const data = await res.json();
      if (data.series) {
        setSelectedSeries(data.series);
        if (data.series.seasons && data.series.seasons.length > 0) {
          setActiveSeasonId(data.series.seasons[0].id);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes da série:", err);
    }
  };

  const resetSeriesForm = () => {
    setIsEditingSeries(false);
    setEditingSeriesId(null);
    setTitle("");
    setSlug("");
    setSynopsis("");
    setGenre(activeType === "ANIME" ? "Anime" : "Ficção Científica");
    setCoverImageUrl("");
    setBackdropUrl("");
    setReleaseYear(new Date().getFullYear());
    setStatus("EM_ANDAMENTO");
    setIsFeatured(false);
    setHashtags("");
  };

  const handleStartEditSeries = (s: Series) => {
    setIsEditingSeries(true);
    setEditingSeriesId(s.id);
    setTitle(s.title || "");
    setSlug(s.slug || "");
    setSynopsis(s.synopsis || "");
    setGenre(s.genre || (activeType === "ANIME" ? "Anime" : "Ação"));
    setCoverImageUrl(s.cover_image_url || "");
    setBackdropUrl(s.backdrop_url || "");
    setReleaseYear(s.release_year || new Date().getFullYear());
    setStatus(s.status || "EM_ANDAMENTO");
    setIsFeatured(Boolean(s.is_featured));
    setHashtags(s.hashtags || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSeriesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !synopsis.trim() || !coverImageUrl.trim()) {
      setFeedback({ type: "error", message: "Preencha título, sinopse e pôster." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      synopsis: synopsis.trim(),
      genre: genre.trim(),
      content_type: activeType,
      cover_image_url: coverImageUrl.trim(),
      backdrop_url: backdropUrl.trim(),
      release_year: parseInt(releaseYear as string, 10),
      status,
      is_featured: isFeatured ? 1 : 0,
      hashtags: hashtags.trim(),
    };

    try {
      const url = isEditingSeries && editingSeriesId ? `/api/series/${editingSeriesId}` : "/api/series";
      const method = isEditingSeries ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao salvar série.");

      setFeedback({
        type: "success",
        message: isEditingSeries ? "Atualizado com sucesso!" : "Cadastrado com sucesso!",
      });

      resetSeriesForm();
      loadSeries();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao salvar." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSeries = async (id: string, sTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${sTitle}" e todas as suas temporadas/episódios?`)) return;
    try {
      const res = await fetch(`/api/series/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSeriesList(seriesList.filter((s) => s.id !== id));
        if (selectedSeries?.id === id) setSelectedSeries(null);
      } else {
        alert("Falha ao excluir série.");
      }
    } catch {
      alert("Erro ao excluir.");
    }
  };

  // Temporadas
  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries) return;
    try {
      const res = await fetch(`/api/series/${selectedSeries.id}/seasons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season_number: newSeasonNumber,
          title: newSeasonTitle.trim() || `Temporada ${newSeasonNumber}`,
        }),
      });
      if (res.ok) {
        setIsAddingSeason(false);
        setNewSeasonTitle("");
        loadSeriesDetails(selectedSeries.id);
      } else {
        alert("Falha ao adicionar temporada.");
      }
    } catch {
      alert("Erro ao adicionar temporada.");
    }
  };

  const handleDeleteSeason = async (seasonId: string) => {
    if (!selectedSeries) return;
    if (!confirm("Tem certeza que deseja excluir esta temporada e todos os seus episódios?")) return;
    try {
      const res = await fetch(`/api/series/${selectedSeries.id}/seasons?seasonId=${seasonId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadSeriesDetails(selectedSeries.id);
      }
    } catch {
      alert("Erro ao excluir temporada.");
    }
  };

  // Episódios
  const handleEpVideoBlur = async () => {
    if (
      epVideoUrl.includes("tokyvideo.com") &&
      !/tokyvideo\.com\/(?:[a-zA-Z]{2}\/)?embed\/\d+/i.test(epVideoUrl)
    ) {
      try {
        setResolvingEpVideo(true);
        const res = await fetch(`/api/resolve-video?url=${encodeURIComponent(epVideoUrl)}`);
        const data = await res.json();
        if (data?.resolved && data.resolved !== epVideoUrl) {
          setEpVideoUrl(data.resolved);
        }
      } catch (err) {
        console.error("Erro ao resolver URL do Tokyvideo:", err);
      } finally {
        setResolvingEpVideo(false);
      }
    }
  };

  const handleEpisodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries || !activeSeasonId || !epVideoUrl.trim() || !epTitle.trim()) {
      alert("Preencha título e link do vídeo.");
      return;
    }

    try {
      if (editingEpisodeId) {
        // Atualizar episódio
        const res = await fetch(`/api/episodes/${editingEpisodeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: epTitle.trim(),
            synopsis: epSynopsis.trim(),
            episode_number: epNumber,
            duration_minutes: epDuration,
            thumbnail_url: epThumbnail.trim(),
            video_url: epVideoUrl.trim(),
          }),
        });
        if (res.ok) {
          resetEpisodeForm();
          loadSeriesDetails(selectedSeries.id);
        }
      } else {
        // Criar episódio
        const res = await fetch("/api/episodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            season_id: activeSeasonId,
            series_id: selectedSeries.id,
            episode_number: epNumber,
            title: epTitle.trim(),
            synopsis: epSynopsis.trim(),
            duration_minutes: epDuration,
            thumbnail_url: epThumbnail.trim(),
            video_url: epVideoUrl.trim(),
          }),
        });
        if (res.ok) {
          resetEpisodeForm();
          loadSeriesDetails(selectedSeries.id);
        }
      }
    } catch {
      alert("Erro ao salvar episódio.");
    }
  };

  const resetEpisodeForm = () => {
    setIsAddingEpisode(false);
    setEditingEpisodeId(null);
    setEpNumber(1);
    setEpTitle("");
    setEpSynopsis("");
    setEpDuration(45);
    setEpThumbnail("");
    setEpVideoUrl("");
  };

  const handleEditEpisode = (ep: Episode) => {
    setIsAddingEpisode(true);
    setEditingEpisodeId(ep.id);
    setEpNumber(ep.episode_number);
    setEpTitle(ep.title);
    setEpSynopsis(ep.synopsis || "");
    setEpDuration(ep.duration_minutes || 45);
    setEpThumbnail(ep.thumbnail_url || "");
    setEpVideoUrl(ep.video_url);
  };

  const handleDeleteEpisode = async (epId: string) => {
    if (!confirm("Excluir este episódio?")) return;
    try {
      const res = await fetch(`/api/episodes/${epId}`, { method: "DELETE" });
      if (res.ok) {
        loadSeriesDetails(selectedSeries.id);
      }
    } catch {
      alert("Erro ao excluir episódio.");
    }
  };

  const activeSeason = selectedSeries?.seasons?.find((s: any) => s.id === activeSeasonId);

  return (
    <div className="space-y-8">
      {/* SELETOR DE ABA: SÉRIES OU ANIMES */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setActiveType("SERIES");
            setSelectedSeries(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all border ${
            activeType === "SERIES"
              ? "bg-blue-600 text-white border-blue-400 shadow-lg scale-105"
              : "bg-brand-surface text-gray-400 border-brand-surfaceBorder hover:text-white"
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Gerenciar Séries</span>
        </button>

        <button
          onClick={() => {
            setActiveType("ANIME");
            setSelectedSeries(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all border ${
            activeType === "ANIME"
              ? "bg-purple-600 text-white border-purple-400 shadow-lg scale-105"
              : "bg-brand-surface text-gray-400 border-brand-surfaceBorder hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Gerenciar Animes</span>
        </button>
      </div>

      {/* FORMULÁRIO DE CADASTRO / EDIÇÃO DE SÉRIE OU ANIME */}
      <div className="bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-surfaceBorder">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl text-white ${
                activeType === "ANIME" ? "bg-purple-600/30 text-purple-400" : "bg-blue-600/30 text-blue-400"
              }`}
            >
              {activeType === "ANIME" ? <Sparkles className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                {isEditingSeries
                  ? `Editar ${activeType === "ANIME" ? "Anime" : "Série"}`
                  : `Novo(a) ${activeType === "ANIME" ? "Anime" : "Série"}`}
              </h2>
              <p className="text-gray-400 text-xs">
                Cadastre o título e depois gerencie suas temporadas e episódios.
              </p>
            </div>
          </div>

          {isEditingSeries && (
            <button
              onClick={resetSeriesForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-surfaceElevated hover:bg-brand-surfaceBorder text-gray-300 text-xs font-bold transition-colors"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          )}
        </div>

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

        <form onSubmit={handleSeriesSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Título *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Breaking Bad, Stranger Things, Naruto Shippuden"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Gênero Principal
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold transition-colors"
              >
                {OFFICIAL_GENRES.map((g) => (
                  <option key={g} value={g} className="bg-brand-surface text-white">
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Sinopse da Série / Anime *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Descreva a história geral da série ou anime..."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Pôster (Vertical 2:3) *
              </label>
              <input
                type="url"
                required
                placeholder="https://image.tmdb.org/t/p/w500/..."
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Backdrop / Banner (Horizontal 16:9)
              </label>
              <input
                type="url"
                placeholder="https://image.tmdb.org/t/p/original/..."
                value={backdropUrl}
                onChange={(e) => setBackdropUrl(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Ano
                </label>
                <input
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-2 py-3 text-xs text-white focus:outline-none focus:border-brand-gold transition-colors"
                >
                  <option value="EM_ANDAMENTO" className="bg-brand-surface text-white">
                    Em Exibição
                  </option>
                  <option value="FINALIZADA" className="bg-brand-surface text-white">
                    Finalizada
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Hashtags SEO (para o Google)
              </label>
              <input
                type="text"
                placeholder="#Series #TopFilmes #Dublado"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isFeaturedSeries"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold border-brand-surfaceBorder bg-brand-surfaceElevated"
              />
              <label htmlFor="isFeaturedSeries" className="text-xs text-gray-300 font-semibold cursor-pointer">
                Exibir em destaque no topo da página de {activeType === "ANIME" ? "Animes" : "Séries"}
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-surfaceBorder flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-gold hover:bg-brand-goldHover text-brand-dark font-black text-xs uppercase tracking-wider transition-all shadow-glowGold hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditingSeries ? "Atualizar" : "Salvar e Continuar"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* PAINEL DE GESTÃO DE TEMPORADAS E EPISÓDIOS (QUANDO UMA SÉRIE É SELECIONADA) */}
      {selectedSeries && (
        <div className="bg-brand-surface border-2 border-brand-gold/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-brand-surfaceBorder">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-16 rounded-xl overflow-hidden shrink-0 bg-black border border-brand-surfaceBorder">
                <Image
                  src={selectedSeries.cover_image_url || "/logo.png"}
                  alt={selectedSeries.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold block">
                  Gerenciando Temporadas & Episódios:
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">
                  {selectedSeries.title}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setSelectedSeries(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-surfaceElevated hover:bg-brand-surfaceBorder text-gray-300 text-xs font-bold transition-colors shrink-0"
            >
              <X className="w-4 h-4" /> Fechar Gestor
            </button>
          </div>

          {/* LISTA DAS TEMPORADAS */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Temporadas da Série:
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewSeasonNumber((selectedSeries.seasons?.length || 0) + 1);
                  setIsAddingSeason(!isAddingSeason);
                }}
                className="text-xs font-bold text-brand-gold hover:underline flex items-center gap-1 uppercase"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Adicionar Temporada</span>
              </button>
            </div>

            {/* FORMULÁRIO ADICIONAR TEMPORADA */}
            {isAddingSeason && (
              <form onSubmit={handleAddSeason} className="mb-4 p-4 rounded-2xl bg-brand-surfaceElevated border border-brand-surfaceBorder flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="Nº"
                  value={newSeasonNumber}
                  onChange={(e) => setNewSeasonNumber(parseInt(e.target.value, 10))}
                  className="w-20 bg-brand-surface border border-brand-surfaceBorder rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Nome (ex: Temporada 1, Arco Chunin)"
                  value={newSeasonTitle}
                  onChange={(e) => setNewSeasonTitle(e.target.value)}
                  className="flex-1 min-w-[200px] bg-brand-surface border border-brand-surfaceBorder rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-gold text-brand-dark font-extrabold text-xs uppercase"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSeason(false)}
                  className="px-3 py-2 rounded-xl bg-brand-surface border border-brand-surfaceBorder text-gray-300 text-xs"
                >
                  Cancelar
                </button>
              </form>
            )}

            {/* ABAS DAS TEMPORADAS */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
              {selectedSeries.seasons?.map((season: Season) => (
                <div
                  key={season.id}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all shrink-0 ${
                    activeSeasonId === season.id
                      ? "bg-brand-gold text-brand-dark border-brand-gold font-extrabold"
                      : "bg-brand-surfaceElevated text-gray-300 border-brand-surfaceBorder hover:border-gray-500"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSeasonId(season.id)}
                    className="text-xs uppercase tracking-wider"
                  >
                    {season.title || `Temporada ${season.season_number}`} ({season.episodes?.length || 0})
                  </button>
                  {selectedSeries.seasons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSeason(season.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Excluir Temporada"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* EPISÓDIOS DA TEMPORADA ATIVA */}
          {activeSeason && (
            <div className="pt-4 border-t border-brand-surfaceBorder">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Film className="w-4 h-4 text-brand-gold" />
                  Episódios de {activeSeason.title} ({activeSeason.episodes?.length || 0})
                </h4>

                <button
                  type="button"
                  onClick={() => {
                    resetEpisodeForm();
                    setEpNumber((activeSeason.episodes?.length || 0) + 1);
                    setIsAddingEpisode(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-gold hover:bg-brand-goldHover text-brand-dark font-black text-xs uppercase tracking-wider transition-all shadow-glowGold"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Novo Episódio</span>
                </button>
              </div>

              {/* FORMULÁRIO DO EPISÓDIO */}
              {isAddingEpisode && (
                <form
                  onSubmit={handleEpisodeSubmit}
                  className="mb-6 p-5 rounded-2xl bg-brand-surfaceElevated border border-brand-gold/50 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-brand-surfaceBorder">
                    <span className="text-xs font-black uppercase text-brand-gold">
                      {editingEpisodeId ? "Editar Episódio" : "Cadastrar Novo Episódio"}
                    </span>
                    <button
                      type="button"
                      onClick={resetEpisodeForm}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                        Nº Episódio
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={epNumber}
                        onChange={(e) => setEpNumber(parseInt(e.target.value, 10))}
                        className="w-full bg-brand-surface border border-brand-surfaceBorder rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                        Título do Episódio *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Episódio 1 - O Começo"
                        value={epTitle}
                        onChange={(e) => setEpTitle(e.target.value)}
                        className="w-full bg-brand-surface border border-brand-surfaceBorder rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                        Duração (Minutos)
                      </label>
                      <input
                        type="number"
                        value={epDuration}
                        onChange={(e) => setEpDuration(parseInt(e.target.value, 10))}
                        className="w-full bg-brand-surface border border-brand-surfaceBorder rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                      Link do Vídeo * (TokyVideo, Dailymotion, Drive, YouTube, Ok.ru, MP4)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        required
                        placeholder="https://www.tokyvideo.com/br/video/... ou https://geo.dailymotion.com/..."
                        value={epVideoUrl}
                        onChange={(e) => setEpVideoUrl(e.target.value)}
                        onBlur={handleEpVideoBlur}
                        className="w-full bg-brand-surface border border-brand-surfaceBorder rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                      />
                      {resolvingEpVideo && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-brand-gold animate-pulse">
                          Auto-resolvendo ID Tokyvideo...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                        Thumbnail do Episódio (16:9 Opcional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://image.tmdb.org/t/p/w500/..."
                        value={epThumbnail}
                        onChange={(e) => setEpThumbnail(e.target.value)}
                        className="w-full bg-brand-surface border border-brand-surfaceBorder rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                        Sinopse do Episódio
                      </label>
                      <input
                        type="text"
                        placeholder="Resumo do episódio..."
                        value={epSynopsis}
                        onChange={(e) => setEpSynopsis(e.target.value)}
                        className="w-full bg-brand-surface border border-brand-surfaceBorder rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={resetEpisodeForm}
                      className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-surfaceBorder text-gray-300 text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-brand-gold text-brand-dark font-black text-xs uppercase tracking-wider"
                    >
                      Salvar Episódio
                    </button>
                  </div>
                </form>
              )}

              {/* LISTA DOS EPISÓDIOS */}
              {activeSeason.episodes?.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  Nenhum episódio cadastrado nesta temporada ainda.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeSeason.episodes?.map((ep: Episode) => (
                    <div
                      key={ep.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-xl bg-brand-surfaceElevated border border-brand-surfaceBorder text-xs text-white hover:border-brand-gold/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-black text-brand-gold font-black flex items-center justify-center shrink-0 border border-brand-surfaceBorder">
                          {ep.episode_number}
                        </span>
                        <div className="min-w-0">
                          <h5 className="font-bold truncate">{ep.title}</h5>
                          <span className="text-[10px] text-gray-400">
                            {ep.duration_minutes} min • {ep.video_type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/assistir-serie/${selectedSeries.id}/${ep.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-brand-gold/20 hover:bg-brand-gold text-brand-gold hover:text-brand-dark transition-colors"
                          title="Assistir Episódio"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEditEpisode(ep)}
                          className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-surfaceBorder text-gray-300 hover:text-white transition-colors"
                          title="Editar Episódio"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEpisode(ep.id)}
                          className="p-1.5 rounded-lg bg-brand-red/20 hover:bg-brand-red text-red-400 hover:text-white transition-colors"
                          title="Excluir Episódio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LISTAGEM DE SÉRIES OU ANIMES CADASTRADOS */}
      <div className="bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          {activeType === "ANIME" ? <Sparkles className="w-5 h-5 text-purple-400" /> : <Tv className="w-5 h-5 text-blue-400" />}
          {activeType === "ANIME" ? "Animes Cadastrados" : "Séries Cadastradas"} ({seriesList.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs">Carregando catálogo...</div>
        ) : seriesList.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            Nenhum(a) {activeType === "ANIME" ? "anime" : "série"} cadastrado(a) ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seriesList.map((item) => (
              <div
                key={item.id}
                className="bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg"
              >
                <div className="relative h-40 w-full bg-black">
                  <Image
                    src={item.backdrop_url || item.cover_image_url || "/logo.png"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-surfaceElevated to-transparent" />
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black/80 text-brand-gold border border-brand-gold/30">
                      {item.seasons_count || 0} Temporadas
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black/80 text-gray-300 border border-white/10">
                      {item.episodes_count || 0} EPs
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wide truncate">
                      {item.title}
                    </h4>
                    <p className="text-gray-400 text-xs line-clamp-2 mt-1">
                      {item.synopsis}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-brand-surfaceBorder flex items-center justify-between">
                    <button
                      onClick={() => loadSeriesDetails(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-brand-gold text-brand-dark text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-glowGold hover:scale-105 transition-all"
                    >
                      <span>Temporadas & EPs</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEditSeries(item)}
                        className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-surfaceBorder text-gray-300 hover:text-white transition-colors"
                        title="Editar Informações"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSeries(item.id, item.title)}
                        className="p-1.5 rounded-lg bg-brand-red/20 hover:bg-brand-red text-red-400 hover:text-white transition-colors"
                        title="Excluir Série"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
