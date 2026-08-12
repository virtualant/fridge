import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { broadcast } from '$lib/sse.js';

export async function PATCH({ params, request }) {
  const { name, emoji } = await request.json();
  if (!name?.trim()) return json({ error: 'Ime je obavezno' }, { status: 400 });

  db.prepare('UPDATE categories SET name = ?, emoji = ? WHERE id = ?')
    .run(name.trim(), emoji || '📦', params.id);

  broadcast('update');
  return json({ ok: true });
}

export function DELETE({ params }) {
  db.prepare('DELETE FROM categories WHERE id = ?').run(params.id);
  broadcast('update');
  return json({ ok: true });
}
