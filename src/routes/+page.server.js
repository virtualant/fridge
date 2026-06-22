import { db } from '$lib/db.js';

export function load() {
  const ingredients = db.prepare(`
    SELECT i.*, c.name as category_name, c.color as category_color, c.emoji as category_emoji
    FROM ingredients i
    LEFT JOIN categories c ON i.category_id = c.id
    ORDER BY c.id NULLS LAST, i.name COLLATE NOCASE
  `).all();

  const categories = db.prepare('SELECT * FROM categories ORDER BY id').all();

  return { ingredients, categories };
}
