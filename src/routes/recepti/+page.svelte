<script>
  import { invalidateAll } from '$app/navigation';
  import RecipeCard from '$lib/components/RecipeCard.svelte';
  import AddRecipeModal from '$lib/components/AddRecipeModal.svelte';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';

  export let data;

  let showAddModal = false;
  let editRecipe = null;
  let confirmDelete = null;

  async function deleteRecipe(id) {
    await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    invalidateAll();
    confirmDelete = null;
  }

  async function toggleShopping(ingredientId) {
    const ing = data.recipes.flatMap(r => r.ingredients).find(i => i.id === ingredientId);
    if (!ing) return;
    await fetch(`/api/ingredients/${ingredientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ in_shopping_list: !ing.in_shopping_list })
    });
    invalidateAll();
  }

  async function toggleHave(ingredientId) {
    const ing = data.recipes.flatMap(r => r.ingredients).find(i => i.id === ingredientId);
    if (!ing) return;
    await fetch(`/api/ingredients/${ingredientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ has_it: !ing.has_it })
    });
    invalidateAll();
  }
</script>

<div class="page">
  {#if data.recipes.length === 0}
    <div class="empty-state">
      <div class="emoji">👨‍🍳</div>
      <p>Još nema recepata</p>
      <p style="font-size:13px;margin-top:6px;color:var(--text-muted)">Dodaj recept tipkom + dolje desno</p>
    </div>
  {:else}
    <div class="recipes-list">
      {#each data.recipes as recipe (recipe.id)}
        <RecipeCard
          {recipe}
          on:edit={() => editRecipe = recipe}
          on:delete={() => confirmDelete = recipe}
          on:shoppingtoggle={(e) => toggleShopping(e.detail)}
          on:havetoggle={(e) => toggleHave(e.detail)}
        />
      {/each}
    </div>
  {/if}
</div>

<button class="fab" on:click={() => showAddModal = true} aria-label="Dodaj recept">+</button>

<AddRecipeModal
  bind:open={showAddModal}
  ingredients={data.allIngredients}
  categories={data.categories}
  on:added={() => invalidateAll()}
/>

<AddRecipeModal
  open={!!editRecipe}
  existing={editRecipe}
  ingredients={data.allIngredients}
  categories={data.categories}
  on:added={() => { invalidateAll(); editRecipe = null; }}
/>

{#if confirmDelete}
  <ConfirmModal
    title="Brisanje recepta"
    message="Obrisati recept «{confirmDelete.name}»?"
    on:confirm={() => deleteRecipe(confirmDelete.id)}
    on:cancel={() => confirmDelete = null}
  />
{/if}

<style>
  .page {
    padding: 12px 14px 100px;
  }

  .recipes-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
