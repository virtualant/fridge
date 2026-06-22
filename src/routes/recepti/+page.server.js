import { db } from '$lib/db.js';

export function load() {
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
    const ingredients = db.prepare(`
      SELECT i.id, i.name, i.has_it, i.in_shopping_list FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = ? ORDER BY i.name COLLATE NOCASE
    `).all(r.id);
    return { ...r, total, available, ingredients };
  });

  const allIngredients = db.prepare(
    'SELECT i.*, c.name as category_name FROM ingredients i LEFT JOIN categories c ON i.category_id = c.id ORDER BY i.name COLLATE NOCASE'
  ).all();

  return { recipes: result, allIngredients };
}
