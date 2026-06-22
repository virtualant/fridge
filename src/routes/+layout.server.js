import { db } from '$lib/db.js';

export function load() {
  const categories = db.prepare('SELECT * FROM categories ORDER BY id').all();
  return { categories };
}
