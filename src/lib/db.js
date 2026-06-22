import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';

const COLORS = [
  '#ffd6d6', '#ffd6f0', '#e8d6ff', '#d6e8ff',
  '#d6f5ff', '#d6ffd6', '#f0ffd6', '#fff3d6', '#ffd6b3'
];

if (!globalThis.__db) {
  const dataDir = process.env.DATA_DIR || join(process.cwd(), 'data');
  mkdirSync(dataDir, { recursive: true });
  const db = new Database(join(dataDir, 'frizider.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '📦',
      color TEXT NOT NULL DEFAULT '#e8f4f8'
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      has_it INTEGER NOT NULL DEFAULT 0,
      in_shopping_list INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
      PRIMARY KEY (recipe_id, ingredient_id)
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as n FROM categories').get();
  if (count.n === 0) {
    const insert = db.prepare('INSERT INTO categories (name, emoji, color) VALUES (?, ?, ?)');
    insert.run('Voće', '🍎', COLORS[0]);
    insert.run('Povrće', '🥦', COLORS[1]);
    insert.run('Pića', '🥤', COLORS[2]);
    insert.run('Ostalo', '🥫', COLORS[3]);
  }

  globalThis.__db = db;
}

export const db = globalThis.__db;
export { COLORS };
