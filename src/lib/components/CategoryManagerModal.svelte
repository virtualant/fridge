<script>
  import { createEventDispatcher } from 'svelte';
  import AddCategoryModal from './AddCategoryModal.svelte';
  import ConfirmModal from './ConfirmModal.svelte';
  const dispatch = createEventDispatcher();

  export let open = false;
  export let categories = [];

  let showAddCat = false;
  let confirmDelete = null;

  async function refresh() {
    const res = await fetch('/api/categories');
    categories = await res.json();
    dispatch('changed');
  }

  async function doDelete(id) {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    confirmDelete = null;
    await refresh();
  }

  function close() {
    open = false;
  }

  function onBackdrop(e) {
    if (e.target === e.currentTarget) close();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click={onBackdrop}>
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-title">Kategorije</div>

      {#if categories.length === 0}
        <p class="empty-note">Nema kategorija</p>
      {:else}
        <div class="cat-list">
          {#each categories as cat (cat.id)}
            <div class="cat-row" style="background:{cat.color}25">
              <span class="cat-emoji">{cat.emoji}</span>
              <span class="cat-name">{cat.name}</span>
              <button class="del-btn" on:click={() => confirmDelete = cat} title="Obriši">
                🗑️
              </button>
            </div>
          {/each}
        </div>
      {/if}

      <button class="add-cat-btn" on:click={() => showAddCat = true}>
        ＋ Dodaj novu kategoriju
      </button>

      <div class="modal-actions">
        <button class="btn btn-secondary" on:click={close}>Zatvori</button>
      </div>
    </div>
  </div>
{/if}

<AddCategoryModal bind:open={showAddCat} on:added={refresh} />

{#if confirmDelete}
  <ConfirmModal
    title="Brisanje kategorije"
    message="Obrisati «{confirmDelete.name}»? Namirnice iz te kategorije će preći u «Bez kategorije»."
    on:confirm={() => doDelete(confirmDelete.id)}
    on:cancel={() => confirmDelete = null}
  />
{/if}

<style>
  .cat-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cat-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: var(--radius-sm);
  }

  .cat-emoji { font-size: 22px; }

  .cat-name {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
  }

  .del-btn {
    font-size: 18px;
    padding: 6px;
    border-radius: 8px;
    opacity: 0.6;
    transition: opacity 0.15s;
  }

  .del-btn:active { opacity: 1; }

  .add-cat-btn {
    display: block;
    width: 100%;
    margin-top: 14px;
    padding: 11px;
    border-radius: var(--radius-sm);
    background: var(--surface2);
    color: var(--primary);
    font-size: 14px;
    font-weight: 600;
    text-align: center;
  }

  .add-cat-btn:active { background: var(--primary-light); }

  .empty-note {
    text-align: center;
    color: var(--text-muted);
    font-size: 14px;
    padding: 12px;
  }
</style>
