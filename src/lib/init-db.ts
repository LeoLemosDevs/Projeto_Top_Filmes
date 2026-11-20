import { db } from "./db";
import { OFFICIAL_CATEGORIES } from "./types";
import bcrypt from "bcryptjs";

let initialized = false;

export async function initDb() {
  if (initialized) return;

  // 1. Tabela de Usuários
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'USER',
      avatar_url TEXT,
      email_verified INTEGER DEFAULT 0,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expires DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrações dinâmicas para adicionar colunas se a tabela já existia antes
  try {
    await db.execute(`ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;`);
  } catch {}
  try {
    await db.execute(`ALTER TABLE users ADD COLUMN verification_token TEXT;`);
  } catch {}
  try {
    await db.execute(`ALTER TABLE users ADD COLUMN reset_token TEXT;`);
  } catch {}
  try {
    await db.execute(`ALTER TABLE users ADD COLUMN reset_token_expires DATETIME;`);
  } catch {}

  // 2. Tabela de Filmes
  await db.execute(`
    CREATE TABLE IF NOT EXISTS movies (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      release_year INTEGER NOT NULL,
      synopsis TEXT NOT NULL,
      genre TEXT NOT NULL,
      cover_image_url TEXT NOT NULL,
      video_url TEXT NOT NULL,
      video_type TEXT DEFAULT 'embed',
      duration_minutes INTEGER DEFAULT 100,
      is_featured INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      shares_count INTEGER DEFAULT 0,
      hashtags TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrações dinâmicas v2.0 para tabela movies
  try {
    await db.execute(`ALTER TABLE movies ADD COLUMN likes_count INTEGER DEFAULT 0;`);
  } catch {}
  try {
    await db.execute(`ALTER TABLE movies ADD COLUMN shares_count INTEGER DEFAULT 0;`);
  } catch {}
  try {
    await db.execute(`ALTER TABLE movies ADD COLUMN hashtags TEXT DEFAULT '';`);
  } catch {}

  // 3. Tabela de Categorias
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      display_order INTEGER DEFAULT 0
    );
  `);

  // 4. Tabela de Relação Filme x Categoria
  await db.execute(`
    CREATE TABLE IF NOT EXISTS movie_categories (
      movie_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      PRIMARY KEY (movie_id, category_id),
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  // 5. Tabela de Favoritos ("Minha Lista")
  await db.execute(`
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      movie_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, movie_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
    );
  `);

  // 6. Tabela de Histórico ("Continuar Assistindo")
  await db.execute(`
    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      movie_id TEXT NOT NULL,
      progress_seconds INTEGER DEFAULT 0,
      duration_seconds INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, movie_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
    );
  `);

  // 7. Tabela de Curtidas (v2.0)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS movie_likes (
      id TEXT PRIMARY KEY,
      movie_id TEXT NOT NULL,
      actor_key TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(movie_id, actor_key),
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
    );
  `);

  // 8. Tabela de Analytics & Tráfego (v2.0)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      path TEXT,
      movie_id TEXT,
      actor_key TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  try {
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);`);
  } catch {}

  // 9. Tabela de Sagas & Coleções
  await db.execute(`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      synopsis TEXT DEFAULT '',
      cover_image_url TEXT DEFAULT '',
      backdrop_url TEXT DEFAULT '',
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  try {
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);`);
  } catch {}

  // 10. Tabela de Filmes da Coleção / Saga
  await db.execute(`
    CREATE TABLE IF NOT EXISTS collection_movies (
      collection_id TEXT NOT NULL,
      movie_id TEXT NOT NULL,
      order_index INTEGER DEFAULT 1,
      PRIMARY KEY (collection_id, movie_id),
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
    );
  `);

  // 11. Tabela de Séries & Animes
  await db.execute(`
    CREATE TABLE IF NOT EXISTS series (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      synopsis TEXT NOT NULL,
      genre TEXT NOT NULL,
      content_type TEXT DEFAULT 'SERIES',
      cover_image_url TEXT NOT NULL,
      backdrop_url TEXT DEFAULT '',
      release_year INTEGER NOT NULL,
      status TEXT DEFAULT 'EM_ANDAMENTO',
      is_featured INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      shares_count INTEGER DEFAULT 0,
      hashtags TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  try {
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_series_type ON series(content_type);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_series_slug ON series(slug);`);
  } catch {}

  // 12. Tabela de Temporadas (Seasons)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS seasons (
      id TEXT PRIMARY KEY,
      series_id TEXT NOT NULL,
      season_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      synopsis TEXT DEFAULT '',
      cover_image_url TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(series_id, season_number),
      FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
    );
  `);

  // 13. Tabela de Episódios (Episodes)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS episodes (
      id TEXT PRIMARY KEY,
      season_id TEXT NOT NULL,
      series_id TEXT NOT NULL,
      episode_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      synopsis TEXT DEFAULT '',
      duration_minutes INTEGER DEFAULT 45,
      thumbnail_url TEXT DEFAULT '',
      video_url TEXT NOT NULL,
      video_type TEXT DEFAULT 'embed',
      views_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(season_id, episode_number),
      FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
      FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
    );
  `);
  try {
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_episodes_series ON episodes(series_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_episodes_season ON episodes(season_id);`);
  } catch {}

  // 14. Tabela de Progresso / Histórico de Séries ("Continuar Assistindo Série")
  await db.execute(`
    CREATE TABLE IF NOT EXISTS series_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      series_id TEXT NOT NULL,
      episode_id TEXT NOT NULL,
      progress_seconds INTEGER DEFAULT 0,
      duration_seconds INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, series_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
      FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
    );
  `);

  // Inserir categorias oficiais se não existirem
  for (let i = 0; i < OFFICIAL_CATEGORIES.length; i++) {
    const cat = OFFICIAL_CATEGORIES[i];
    await db.execute({
      sql: `INSERT OR IGNORE INTO categories (id, name, slug, display_order) VALUES (?, ?, ?, ?)`,
      args: [`cat_${cat.slug}`, cat.name, cat.slug, i + 1],
    });
  }

  // Criar ou atualizar Administrador padrão (leoadm)
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "professorleolemos@gmail.com";
  const adminCheck = await db.execute({
    sql: `SELECT id FROM users WHERE email = ?`,
    args: [adminEmail.toLowerCase().trim()],
  });

  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "leo250778";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  if (adminCheck.rows.length === 0) {
    await db.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, ?, 1)`,
      args: [
        "usr_leoadm_01",
        "leoadm",
        adminEmail.toLowerCase().trim(),
        adminHash,
        "ADMIN",
      ],
    });
  } else {
    // Atualiza a senha e role para garantir o acesso solicitado
    await db.execute({
      sql: `UPDATE users SET name = 'leoadm', password_hash = ?, role = 'ADMIN', email_verified = 1 WHERE email = ?`,
      args: [adminHash, adminEmail.toLowerCase().trim()],
    });
  }

  // Criar ou atualizar Usuário padrão (leojulhos)
  const userEmail = "leojulhos@gmail.com";
  const userCheck = await db.execute({
    sql: `SELECT id FROM users WHERE email = ?`,
    args: [userEmail.toLowerCase().trim()],
  });

  const userHash = await bcrypt.hash("123456", 10);

  if (userCheck.rows.length === 0) {
    await db.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, ?, 1)`,
      args: [
        "usr_leojulhos_02",
        "leojulhos",
        userEmail.toLowerCase().trim(),
        userHash,
        "USER",
      ],
    });
  } else {
    await db.execute({
      sql: `UPDATE users SET name = 'leojulhos', password_hash = ?, role = 'USER', email_verified = 1 WHERE email = ?`,
      args: [userHash, userEmail.toLowerCase().trim()],
    });
  }

  initialized = true;
}
