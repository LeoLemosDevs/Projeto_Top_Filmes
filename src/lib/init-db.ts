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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

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
