import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { broadcast } from '$lib/sse.js';

export async function PATCH({ params, request }) {
  const { name, description, ingredient_ids } = await request.json();
  if (!name?.trim()) return json({ error: 'Ime je obavezno' }, { status: 400 });

  db.prepare('UPDATE recipes SET name = ?, description = ? WHERE id = ?')
    .run(name.trim(), description?.trim() || '', params.id);

  db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').run(params.id);

  if (ingredient_ids?.length) {
    const insert = db.prepare(
      'INSERT OR IGNORE INTO recipe_ingredients (recipe_id, ingredient_id) VALUES (?, ?)'
    );
    for (const iid of ingredient_ids) insert.run(params.id, iid);
  }

  broadcast('update');
  return json({ ok: true });
}

export function DELETE({ params }) {
  db.prepare('DELETE FROM recipes WHERE id = ?').run(params.id);
  broadcast('update');
  return json({ ok: true });
}
