"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Collection, Movie } from "@/lib/types";
import { 
  Layers, 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Check, 
  AlertCircle, 
  Search, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Film,
  Sparkles,
  ExternalLink
} from "lucide-react";

interface AdminSagasProps {
  movies: Movie[];
}

export default function AdminSagas({ movies }: AdminSagasProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [backdropUrl, setBackdropUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
  const [movieSearch, setMovieSearch] = useState("");

  const loadCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/collections");
      const data = await res.json();
      setCollections(data.collections || []);
    } catch (err) {
      console.error("Erro ao carregar coleções:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSynopsis("");
    setCoverImageUrl("");
    setBackdropUrl("");
    setIsFeatured(false);
    setSelectedMovieIds([]);
    setMovieSearch("");
  };

  const handleStartEdit = async (collection: Collection) => {
    try {
      const res = await fetch(`/api/collections/${collection.id}`);
      const data = await res.json();
      const col = data.collection;
      if (col) {
        setIsEditing(true);
        setEditingId(col.id);
        setTitle(col.title || "");
        setSlug(col.slug || "");
        setSynopsis(col.synopsis || "");
        setCoverImageUrl(col.cover_image_url || "");
        setBackdropUrl(col.backdrop_url || "");
        setIsFeatured(Boolean(col.is_featured));
        setSelectedMovieIds(col.movies ? col.movies.map((m: any) => m.id) : []);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      alert("Falha ao carregar detalhes da saga para edição.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFeedback({ type: "error", message: "O título da saga é obrigatório." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      synopsis: synopsis.trim(),
      cover_image_url: coverImageUrl.trim(),
      backdrop_url: backdropUrl.trim(),
      is_featured: isFeatured ? 1 : 0,
      movie_ids: selectedMovieIds,
    };

    try {
      const url = isEditing && editingId ? `/api/collections/${editingId}` : "/api/collections";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao salvar saga.");

      setFeedback({
        type: "success",
        message: isEditing ? "Saga atualizada com sucesso!" : "Saga criada com sucesso!",
      });

      resetForm();
      loadCollections();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao salvar saga." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, sagaTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir a saga "${sagaTitle}"?`)) return;
    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCollections(collections.filter((c) => c.id !== id));
      } else {
        alert("Falha ao excluir saga.");
      }
    } catch {
      alert("Erro ao excluir saga.");
    }
  };

  const toggleMovieSelection = (movieId: string) => {
    if (selectedMovieIds.includes(movieId)) {
      setSelectedMovieIds(selectedMovieIds.filter((id) => id !== movieId));
    } else {
      setSelectedMovieIds([...selectedMovieIds, movieId]);
    }
  };

  const moveMovieOrder = (index: number, direction: "up" | "down") => {
    const nextList = [...selectedMovieIds];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nextList.length) return;
    const temp = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = temp;
    setSelectedMovieIds(nextList);
  };

  const filteredCatalogMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(movieSearch.toLowerCase()) ||
    m.genre.toLowerCase().includes(movieSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* FORMULÁRIO DE CADASTRO / EDIÇÃO DE SAGAS */}
      <div className="bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-surfaceBorder">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-gold/15 text-brand-gold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                {isEditing ? "Editar Saga / Coleção" : "Nova Saga / Coleção"}
              </h2>
              <p className="text-gray-400 text-xs">
                Agrupe filmes da mesma franquia (ex: Alien, Rambo, Star Wars) em ordem cronológica.
              </p>
            </div>
          </div>

          {isEditing && (
            <button
              onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-surfaceElevated hover:bg-brand-surfaceBorder text-gray-300 text-xs font-bold transition-colors"
            >
              <X className="w-4 h-4" /> Cancelar Edição
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Nome da Saga / Coleção *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Saga Alien, Coleção Rambo, Saga Star Wars"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Slug (URL Amigável - Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: saga-alien, colecao-rambo"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Sinopse / Descrição da Franquia
            </label>
            <textarea
              rows={2}
              placeholder="Descreva a história geral ou o universo desta saga..."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                URL do Pôster / Cartaz (Vertical 2:3)
              </label>
              <input
                type="url"
                placeholder="https://image.tmdb.org/t/p/w500/..."
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                URL do Banner / Backdrop (Horizontal 16:9)
              </label>
              <input
                type="url"
                placeholder="https://image.tmdb.org/t/p/original/..."
                value={backdropUrl}
                onChange={(e) => setBackdropUrl(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFeaturedSaga"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold border-brand-surfaceBorder bg-brand-surfaceElevated"
            />
            <label htmlFor="isFeaturedSaga" className="text-xs text-gray-300 font-semibold cursor-pointer">
              Destacar esta saga na Home principal
            </label>
          </div>

          {/* SELEÇÃO E ORDENAÇÃO DE FILMES DA SAGA */}
          <div className="pt-4 border-t border-brand-surfaceBorder">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <Film className="w-4 h-4 text-brand-gold" />
              Filmes Vinculados à Saga ({selectedMovieIds.length} selecionados)
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Ordene os filmes na sequência correta da saga usando as setas para cima/baixo.
            </p>

            {/* LISTA DOS FILMES SELECIONADOS NA ORDEM */}
            {selectedMovieIds.length > 0 && (
              <div className="mb-6 space-y-2 p-4 bg-brand-surfaceElevated/50 rounded-2xl border border-brand-surfaceBorder">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold block mb-2">
                  Ordem de Exibição na Saga:
                </span>
                {selectedMovieIds.map((mId, idx) => {
                  const movie = movies.find((m) => m.id === mId);
                  if (!movie) return null;
                  return (
                    <div
                      key={mId}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-brand-surface border border-brand-surfaceBorder text-xs text-white"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-brand-gold text-brand-dark font-black flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="relative w-8 h-10 rounded overflow-hidden shrink-0 bg-black">
                          <Image
                            src={movie.cover_image_url || "/logo.png"}
                            alt={movie.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-bold truncate">{movie.title}</span>
                        <span className="text-[10px] text-gray-400">({movie.release_year})</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveMovieOrder(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 rounded bg-brand-surfaceElevated hover:bg-brand-surfaceBorder text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Subir na ordem"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMovieOrder(idx, "down")}
                          disabled={idx === selectedMovieIds.length - 1}
                          className="p-1 rounded bg-brand-surfaceElevated hover:bg-brand-surfaceBorder text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Descer na ordem"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMovieSelection(mId)}
                          className="p-1 rounded bg-brand-red/20 text-red-400 hover:bg-brand-red hover:text-white transition-colors"
                          title="Remover da saga"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* BUSCA E SELEÇÃO DE FILMES DO CATÁLOGO */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar filme do catálogo para adicionar à saga..."
                value={movieSearch}
                onChange={(e) => setMovieSearch(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 border border-brand-surfaceBorder rounded-xl p-2 bg-brand-dark/40">
              {filteredCatalogMovies.slice(0, 30).map((m) => {
                const isSelected = selectedMovieIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMovieSelection(m.id)}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? "bg-brand-gold/15 text-brand-gold font-bold border border-brand-gold/30"
                        : "hover:bg-brand-surfaceElevated text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="relative w-6 h-8 rounded overflow-hidden shrink-0 bg-black">
                        <Image
                          src={m.cover_image_url || "/logo.png"}
                          alt={m.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="truncate">{m.title}</span>
                      <span className="text-[10px] text-gray-500">({m.release_year})</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold shrink-0">
                      {isSelected ? "✓ Selecionado" : "+ Adicionar"}
                    </span>
                  </button>
                );
              })}
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
                  <span>{isEditing ? "Atualizar Saga" : "Salvar Saga"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* LISTAGEM DE SAGAS EXISTENTES */}
      <div className="bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-gold" />
          Sagas Cadastradas ({collections.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs">Carregando sagas...</div>
        ) : collections.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            Nenhuma saga cadastrada ainda. Utilize o formulário acima para criar a primeira!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => (
              <div
                key={col.id}
                className="bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg"
              >
                <div className="relative h-36 w-full bg-black">
                  <Image
                    src={col.backdrop_url || col.cover_image_url || "/logo.png"}
                    alt={col.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-surfaceElevated to-transparent" />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black/80 text-brand-gold border border-brand-gold/30">
                      {col.movies_count || col.movies?.length || 0} Filmes
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wide truncate">
                      {col.title}
                    </h4>
                    <p className="text-gray-400 text-xs line-clamp-2 mt-1">
                      {col.synopsis || "Sem sinopse cadastrada."}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-brand-surfaceBorder flex items-center justify-between">
                    <Link
                      href={`/sagas/${col.slug || col.id}`}
                      target="_blank"
                      className="text-xs font-bold text-brand-gold hover:underline flex items-center gap-1"
                    >
                      <span>Ver Página</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(col)}
                        className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-surfaceBorder text-gray-300 hover:text-white transition-colors"
                        title="Editar Saga"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(col.id, col.title)}
                        className="p-1.5 rounded-lg bg-brand-red/20 hover:bg-brand-red text-red-400 hover:text-white transition-colors"
                        title="Excluir Saga"
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
