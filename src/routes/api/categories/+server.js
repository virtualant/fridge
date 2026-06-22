import { json } from '@sveltejs/kit';
import { db, COLORS } from '$lib/db.js';
import { broadcast } from '$lib/sse.js';

export function GET() {
  const cats = db.prepare('SELECT * FROM categories ORDER BY id').all();
  return json(cats);
}

export async function POST({ request }) {
  const { name, emoji } = await request.json();
  if (!name?.trim()) return json({ error: 'Ime je obavezno' }, { status: 400 });

  const count = db.prepare('SELECT COUNT(*) as n FROM categories').get();
  const color = COLORS[count.n % COLORS.length];

  const result = db.prepare(
    'INSERT INTO categories (name, emoji, color) VALUES (?, ?, ?)'
  ).run(name.trim(), emoji || '📦', color);

  broadcast('update');
  return json({ id: result.lastInsertRowid, name: name.trim(), emoji: emoji || '📦', color });
}
