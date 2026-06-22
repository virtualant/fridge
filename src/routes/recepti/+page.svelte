<script>
  import { invalidateAll } from '$app/navigation';
  import RecipeCard from '$lib/components/RecipeCard.svelte';
  import AddRecipeModal from '$lib/components/AddRecipeModal.svelte';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';

  export let data;

  let showAddModal = false;
  let editRecipe = null;
  let confirmDelete = null;

  function deleteRecipe(id) {
    data.recipes = data.recipes.filter(r => r.id !== id);
    confirmDelete = null;
    fetch(`/api/recipes/${id}`, { method: 'DELETE' }).catch(() => invalidateAll());
  }

  function toggleShopping(ingredientId) {
    let next = null;
    for (const r of data.recipes) {
      for (const ing of r.ingredients) {
        if (ing.id === ingredientId) {
          if (next === null) next = ing.in_shopping_list ? 0 : 1;
          ing.in_shopping_list = next;
        }
      }
    }
    if (next === null) return;
    data.recipes = data.recipes;
    fetch(`/api/ingredients/${ingredientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ in_shopping_list: next })
    }).catch(() => invalidateAll());
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
