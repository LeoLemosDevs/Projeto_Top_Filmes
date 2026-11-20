const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
env.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) process.env[k] = v.join('=');
});
const { createClient } = require('@libsql/client/web');
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function migrate() {
  console.log('Migrating Turso DB for Sagas, Series and Animes...');
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

  console.log('Checking created tables...');
  const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Tables in Turso DB:', tables.rows.map(r => r.name));
}

migrate().catch(console.error);
