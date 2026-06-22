import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { broadcast } from '$lib/sse.js';

export async function PATCH({ params, request }) {
  const body = await request.json();
  const ingredient = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(params.id);
  if (!ingredient) return json({ error: 'Nije pronađeno' }, { status: 404 });

  const hasIt = 'has_it' in body ? (body.has_it ? 1 : 0) : ingredient.has_it;
  const inShopping = 'in_shopping_list' in body ? (body.in_shopping_list ? 1 : 0) : ingredient.in_shopping_list;

  db.prepare(
    'UPDATE ingredients SET has_it = ?, in_shopping_list = ? WHERE id = ?'
  ).run(hasIt, inShopping, params.id);

  broadcast('update');
  return json({ ok: true });
}

export function DELETE({ params }) {
  db.prepare('DELETE FROM ingredients WHERE id = ?').run(params.id);
  broadcast('update');
  return json({ ok: true });
}
