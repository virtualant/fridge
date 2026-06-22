<script>
  import { invalidateAll } from '$app/navigation';
  import IngredientPill from '$lib/components/IngredientPill.svelte';
  import AddIngredientModal from '$lib/components/AddIngredientModal.svelte';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';

  export let data;

  let showAddModal = false;
  let confirmDelete = null;
  let dragging = false;
  let overTrash = false;
  let dragIngredientId = null;

  $: grouped = groupByCategory(data.ingredients, data.categories);

  function groupByCategory(ingredients, categories) {
    const map = new Map();
    map.set(null, { name: 'Bez kategorije', emoji: '📦', color: '#f0f0f0', items: [] });

    for (const cat of categories) {
      map.set(cat.id, { name: cat.name, emoji: cat.emoji, color: cat.color, items: [] });
    }

    for (const ing of ingredients) {
      const key = ing.category_id ?? null;
      if (!map.has(key)) map.set(key, { name: 'Bez kategorije', emoji: '📦', color: '#f0f0f0', items: [] });
      map.get(key).items.push(ing);
    }

    return [...map.values()].filter(g => g.items.length > 0);
  }

  async function toggle(id) {
    const ing = data.ingredients.find(i => i.id === id);
    if (!ing) return;
    await fetch(`/api/ingredients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ has_it: !ing.has_it })
    });
    invalidateAll();
  }

  async function toggleShopping(id) {
    const ing = data.ingredients.find(i => i.id === id);
    if (!ing) return;
    await fetch(`/api/ingredients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ in_shopping_list: !ing.in_shopping_list })
    });
    invalidateAll();
  }

  async function deleteIngredient(id) {
    await fetch(`/api/ingredients/${id}`, { method: 'DELETE' });
    invalidateAll();
  }

  function onDragStart(id) {
    dragging = true;
    dragIngredientId = id;
  }

  function onDragOver(id, isOver) {
    overTrash = isOver;
  }

  async function onDragEnd(id, dropped) {
    dragging = false;
    overTrash = false;
    if (dropped) await deleteIngredient(id);
    dragIngredientId = null;
  }
</script>

<div class="page">
  {#if data.ingredients.length === 0}
    <div class="empty-state">
      <div class="emoji">🧊</div>
      <p>Frižider je prazan!</p>
      <p style="font-size:13px;margin-top:6px;color:var(--text-muted)">Dodaj namirnice tipkom + dolje desno</p>
    </div>
  {:else}
    {#each grouped as group}
      <div class="category-section">
        <div class="category-label" style="background:{group.color}20;border-color:{group.color}">
          <span class="cat-emoji">{group.emoji}</span>
          <span class="cat-name">{group.name}</span>
        </div>
        <div class="pills-wrap">
          {#each group.items as ing (ing.id)}
            <IngredientPill
              ingredient={ing}
              on:toggle={() => toggle(ing.id)}
              on:shoppingtoggle={() => toggleShopping(ing.id)}
              on:dragstart={() => onDragStart(ing.id)}
              on:dragover={(e) => onDragOver(ing.id, e.detail)}
              on:dragend={(e) => onDragEnd(ing.id, e.detail.dropped)}
            />
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</div>

{#if dragging}
  <div
    class="trash-zone"
    class:over={overTrash}
  >
    <span class="trash-icon">{overTrash ? '💥' : '🗑️'}</span>
    <span>{overTrash ? 'Pusti za brisanje' : 'Povuci ovdje za brisanje'}</span>
  </div>
{/if}

<button class="fab" on:click={() => showAddModal = true} aria-label="Dodaj namirnicu">+</button>

<AddIngredientModal
  bind:open={showAddModal}
  categories={data.categories}
  on:added={() => invalidateAll()}
/>

<style>
  .page {
    padding: 12px 14px 100px;
  }

  .category-section {
    margin-bottom: 18px;
  }

  .category-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px 4px 8px;
    border-radius: var(--radius-pill);
    border: 1.5px solid transparent;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }

  .cat-emoji { font-size: 16px; }
  .cat-name { }

  .pills-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .trash-zone {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 480px;
    height: 90px;
    background: linear-gradient(to top, #ff4757ee, #ff475799);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    z-index: 150;
    transition: background 0.2s;
    backdrop-filter: blur(4px);
  }

  .trash-zone.over {
    background: linear-gradient(to top, #ff4757ff, #ff4757cc);
  }

  .trash-icon {
    font-size: 28px;
  }
</style>
