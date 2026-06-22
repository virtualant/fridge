<script>
  import { createEventDispatcher } from 'svelte';
  import AddIngredientModal from './AddIngredientModal.svelte';
  const dispatch = createEventDispatcher();

  export let open = false;
  export let ingredients = [];
  export let categories = [];
  export let existing = null; // recipe object for edit mode

  let name = '';
  let description = '';
  let selectedIds = new Set();
  let search = '';
  let loading = false;
  let error = '';
  let showAddIngredient = false;

  $: if (open && existing) {
    name = existing.name;
    description = existing.description || '';
    selectedIds = new Set(existing.ingredients.map(i => i.id));
  }

  $: filtered = ingredients.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  async function onIngredientAdded() {
    const res = await fetch('/api/ingredients');
    ingredients = await res.json();
    dispatch('added');
  }

  function toggleIngredient(id) {
    const s = new Set(selectedIds);
    if (s.has(id)) s.delete(id); else s.add(id);
    selectedIds = s;
  }

  function reset() {
    name = '';
    description = '';
    selectedIds = new Set();
    search = '';
    error = '';
    loading = false;
  }

  function close() {
    reset();
    open = false;
  }

  async function submit() {
    if (!name.trim()) { error = 'Unesite naziv recepta'; return; }
    loading = true;
    error = '';
    try {
      const url = existing ? `/api/recipes/${existing.id}` : '/api/recipes';
      const method = existing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          ingredient_ids: [...selectedIds]
        })
      });
      if (!res.ok) throw new Error();
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
</script>

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click={onBackdrop}>
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-title">{existing ? 'Uredi recept' : 'Novi recept'}</div>

      <label>Naziv recepta</label>
      <input bind:value={name} placeholder="npr. Tjestenina bolognese" autofocus />

      <label>Opis / upute (opcionalno)</label>
      <textarea bind:value={description} placeholder="Kratki opis ili koraci..." rows="3"></textarea>

      <label>Namirnice ({selectedIds.size} odabrano)</label>
      <input
        class="search-input"
        bind:value={search}
        placeholder="🔍 Pretraži namirnice..."
      />
      <div class="ingredient-grid">
        {#each filtered as ing (ing.id)}
          <button
            class="ing-option"
            class:selected={selectedIds.has(ing.id)}
            on:click={() => toggleIngredient(ing.id)}
          >
            {#if selectedIds.has(ing.id)}<span class="check">✓</span>{/if}
            {ing.name}
          </button>
        {/each}
        {#if filtered.length === 0}
          <p class="no-results">Nema rezultata</p>
        {/if}
      </div>

      <button class="new-ing-btn" on:click={() => showAddIngredient = true}>
        ➕ Dodaj novu namirnicu
      </button>

      {#if error}<p class="error">{error}</p>{/if}

      <div class="modal-actions">
        <button class="btn btn-secondary" on:click={close}>Odustani</button>
        <button class="btn btn-primary" on:click={submit} disabled={loading}>
          {loading ? '...' : existing ? 'Spremi izmjene' : 'Spremi recept'}
        </button>
      </div>
    </div>
  </div>
{/if}

<AddIngredientModal
  bind:open={showAddIngredient}
  {categories}
  on:added={onIngredientAdded}
/>

<style>
  textarea {
    font: inherit;
    border: 2px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    width: 100%;
    background: var(--surface);
    color: var(--text);
    outline: none;
    resize: none;
    transition: border-color 0.15s;
  }

  textarea:focus { border-color: var(--primary); }

  .search-input {
    margin-bottom: 10px;
  }

  .ingredient-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 180px;
    overflow-y: auto;
    padding: 4px 2px;
  }

  .ing-option {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 13px;
    border-radius: var(--radius-pill);
    border: 2px solid var(--border);
    background: var(--surface2);
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    transition: background 0.1s, border-color 0.1s;
  }

  .ing-option.selected {
    background: var(--success-light);
    border-color: var(--success);
    color: #1a7a35;
    font-weight: 600;
  }

  .check {
    font-weight: 700;
    color: var(--success);
  }

  .no-results {
    font-size: 13px;
    color: var(--text-muted);
    padding: 8px;
  }

  .new-ing-btn {
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

  .new-ing-btn:active { background: var(--primary-light); }

  .error {
    color: var(--danger);
    font-size: 13px;
    margin-top: 8px;
    text-align: center;
  }
</style>
