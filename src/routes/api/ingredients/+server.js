import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { broadcast } from '$lib/sse.js';

export function GET() {
  const rows = db.prepare(`
    SELECT i.*, c.name as category_name, c.color as category_color, c.emoji as category_emoji
    FROM ingredients i
    LEFT JOIN categories c ON i.category_id = c.id
    ORDER BY c.id NULLS LAST, i.name
  `).all();
  return json(rows);
}

export async function POST({ request }) {
  const { name, category_id } = await request.json();
  if (!name?.trim()) return json({ error: 'Ime je obavezno' }, { status: 400 });

  const result = db.prepare(
    'INSERT INTO ingredients (name, category_id) VALUES (?, ?)'
  ).run(name.trim(), category_id || null);

  broadcast('update');
  return json({ id: result.lastInsertRowid });
}
