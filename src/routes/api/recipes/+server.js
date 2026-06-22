import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { broadcast } from '$lib/sse.js';

export function GET() {
  const recipes = db.prepare('SELECT * FROM recipes ORDER BY created_at DESC').all();

  const result = recipes.map(r => {
    const total = db.prepare(
      'SELECT COUNT(*) as n FROM recipe_ingredients WHERE recipe_id = ?'
    ).get(r.id).n;
    const available = db.prepare(`
      SELECT COUNT(*) as n FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = ? AND i.has_it = 1
    `).get(r.id).n;
    const ingredientsList = db.prepare(`
      SELECT i.id, i.name, i.has_it FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = ?
      ORDER BY i.name
    `).all(r.id);
    return { ...r, total, available, ingredients: ingredientsList };
  });

  return json(result);
}

export async function POST({ request }) {
  const { name, description, ingredient_ids } = await request.json();
  if (!name?.trim()) return json({ error: 'Ime je obavezno' }, { status: 400 });

  const result = db.prepare(
    'INSERT INTO recipes (name, description) VALUES (?, ?)'
  ).run(name.trim(), description?.trim() || '');

  const recipeId = result.lastInsertRowid;
  if (ingredient_ids?.length) {
    const insertRI = db.prepare(
      'INSERT OR IGNORE INTO recipe_ingredients (recipe_id, ingredient_id) VALUES (?, ?)'
    );
    for (const iid of ingredient_ids) {
      insertRI.run(recipeId, iid);
    }
  }

  broadcast('update');
  return json({ id: recipeId });
}
