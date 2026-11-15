export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar_url?: string;
  created_at?: string;
}

export interface Movie {
  id: string;
  title: string;
  release_year: number;
  synopsis: string;
  genre: string;
  cover_image_url: string;
  video_url: string;
  video_type?: 'youtube' | 'gdrive' | 'direct' | 'embed';
  duration_minutes?: number;
  is_featured?: number | boolean;
  views_count?: number;
  created_at?: string;
  updated_at?: string;
  categories?: string[]; // IDs or names of assigned categories
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  movies?: Movie[];
}

export interface Favorite {
  id: string;
  user_id: string;
  movie_id: string;
  movie?: Movie;
  created_at: string;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  movie_id: string;
  movie?: Movie;
  progress_seconds: number;
  duration_seconds: number;
  completed: number | boolean;
  updated_at: string;
}

export const OFFICIAL_CATEGORIES = [
  { name: "Anos 70", slug: "anos-70" },
  { name: "Anos 80", slug: "anos-80" },
  { name: "Anos 90", slug: "anos-90" },
  { name: "Anos 2000", slug: "anos-2000" },
  { name: "Sessão da Tarde", slug: "sessao-da-tarde" },
  { name: "Temperatura Máxima", slug: "temperatura-maxima" },
  { name: "Tele Cine", slug: "tele-cine" },
  { name: "Super Cine", slug: "super-cine" },
  { name: "Sessão das 10", slug: "sessao-das-10" },
  { name: "Força Total", slug: "forca-total" },
  { name: "Corujão", slug: "corujao" },
  { name: "Intercine", slug: "intercine" },
  { name: "Clássicos", slug: "classicos" },
  { name: "Filmes Bíblicos", slug: "filmes-biblicos" },
  { name: "Faroeste", slug: "faroeste" },
] as const;

export const OFFICIAL_GENRES = [
  "Ação",
  "Policial",
  "Faroeste",
  "Bíblico",
  "Terror",
  "Suspense",
  "Clássicos",
  "Drama",
  "Comédia",
  "Artes Marciais",
  "Ficção Científica",
  "Aventura",
  "Anime",
  "Desenho",
  "Romance",
] as const;

export type GenreType = typeof OFFICIAL_GENRES[number];
export type CategorySlug = typeof OFFICIAL_CATEGORIES[number]["slug"];
