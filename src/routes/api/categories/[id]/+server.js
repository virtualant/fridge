import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { broadcast } from '$lib/sse.js';

export function DELETE({ params }) {
  db.prepare('DELETE FROM categories WHERE id = ?').run(params.id);
  broadcast('update');
  return json({ ok: true });
}
