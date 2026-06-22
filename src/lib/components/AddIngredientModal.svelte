<script>
  import { createEventDispatcher } from 'svelte';
  import AddCategoryModal from './AddCategoryModal.svelte';
  const dispatch = createEventDispatcher();

  export let open = false;
  export let categories = [];

  let name = '';
  let categoryId = '';
  let loading = false;
  let error = '';
  let showNewCat = false;

  // Refresh categories list after adding new one
  async function onCategoryAdded() {
    const res = await fetch('/api/categories');
    categories = await res.json();
    dispatch('added');
  }

  function reset() {
    name = '';
    categoryId = categories[0]?.id ?? '';
    error = '';
    loading = false;
  }

  function close() {
    reset();
    open = false;
  }

  async function submit() {
    if (!name.trim()) { error = 'Unesite ime namirnice'; return; }
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), category_id: categoryId || null })
      });
      if (!res.ok) throw new Error('Greška');
      dispatch('added');
      close();
    } catch {
      error = 'Greška pri spremanju';
    } finally {
      loading = false;
    }
  }

  function onBackdrop(e) {
    if (e.target === e.currentTarget) close();
  }

  $: if (open && !categoryId && categories.length) {
    categoryId = categories[0].id;
  }
</script>

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click={onBackdrop}>
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-title">Nova namirnica</div>

      <label>Naziv</label>
      <input
        bind:value={name}
        placeholder="npr. Mlijeko, Jaja, Jogurt..."
        on:keydown={e => e.key === 'Enter' && submit()}
        autofocus
      />

      <label>Kategorija</label>
      <select bind:value={categoryId}>
        <option value="">— Bez kategorije —</option>
        {#each categories as cat}
          <option value={cat.id}>{cat.emoji} {cat.name}</option>
        {/each}
      </select>

      <button class="new-cat-btn" on:click={() => showNewCat = true}>
        ＋ Dodaj novu kategoriju
      </button>

      {#if error}<p class="error">{error}</p>{/if}

      <div class="modal-actions">
        <button class="btn btn-secondary" on:click={close}>Odustani</button>
        <button class="btn btn-primary" on:click={submit} disabled={loading}>
          {loading ? '...' : 'Dodaj'}
        </button>
      </div>
    </div>
  </div>
{/if}

<AddCategoryModal
  bind:open={showNewCat}
  on:added={onCategoryAdded}
/>

<style>
  .new-cat-btn {
    display: block;
    width: 100%;
    margin-top: 10px;
    padding: 10px;
    border-radius: var(--radius-sm);
    background: var(--surface2);
    color: var(--primary);
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    transition: background 0.1s;
  }

  .new-cat-btn:active { background: var(--primary-light); }

  .error {
    color: var(--danger);
    font-size: 13px;
    margin-top: 8px;
    text-align: center;
  }
</style>
