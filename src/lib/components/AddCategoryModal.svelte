<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let open = false;
  export let existing = null;

  let name = '';
  let emoji = '📦';
  let loading = false;
  let error = '';

  const EMOJI_OPTIONS = [
    // Opće
    '📦','🍽️','🥣','🧂','🧊','🧻',
    // Mliječni
    '🧀','🥛','🧈','🍦',
    // Meso, riba
    '🥩','🍗','🥓','🍖','🐟','🦐','🦑','🐙',
    // Povrće
    '🥦','🥬','🥕','🌽','🥔','🍅','🧅','🧄','🫑','🥒','🍆','🌶️','🫒','🍄','🥑',
    // Voće
    '🍎','🍏','🍌','🍇','🍓','🫐','🍉','🍊','🍋','🥝','🍑','🍒','🍍','🥭','🥥','🍐',
    // Žitarice, kruh
    '🍞','🥐','🥖','🥨','🥯','🌾','🍚','🍜','🍝','🌮','🌯',
    // Jaja, umaci
    '🥚','🍯','🫙','🥫','🧴','🫗',
    // Pića
    '🥤','☕','🍵','🧃','🍷','🍺','🍶','🥂','🍾','💧',
    // Slatko
    '🍫','🍬','🍭','🍩','🍪','🎂','🧁','🍰',
    // Zamrznuto, ostalo
    '🍕','🍔','🌭','🥪','🌿','🥜','🫘'
  ];

  let wasOpen = false;
  $: {
    if (open && !wasOpen) {
      if (existing) {
        name = existing.name;
        emoji = existing.emoji;
      } else {
        name = '';
        emoji = '📦';
      }
      error = '';
      loading = false;
    }
    wasOpen = open;
  }

  function close() {
    open = false;
    dispatch('close');
  }

  async function submit() {
    if (!name.trim()) { error = 'Unesite ime kategorije'; return; }
    loading = true;
    error = '';
    try {
      const url = existing ? `/api/categories/${existing.id}` : '/api/categories';
      const method = existing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), emoji })
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
</script>

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click={onBackdrop}>
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-title">{existing ? 'Uredi kategoriju' : 'Nova kategorija'}</div>

      <label>Naziv</label>
      <input
        bind:value={name}
        placeholder="npr. Mliječni proizvodi"
        on:keydown={e => e.key === 'Enter' && submit()}
      />

      <label>Ikonica</label>
      <div class="emoji-grid">
        {#each EMOJI_OPTIONS as opt}
          <button
            class="emoji-btn"
            class:selected={emoji === opt}
            on:click={() => emoji = opt}
          >{opt}</button>
        {/each}
      </div>

      {#if error}<p class="error">{error}</p>{/if}

      <div class="modal-actions">
        <button class="btn btn-secondary" on:click={close}>Odustani</button>
        <button class="btn btn-primary" on:click={submit} disabled={loading}>
          {loading ? '...' : existing ? 'Spremi izmjene' : 'Spremi'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
    gap: 6px;
    margin-top: 4px;
    max-height: 260px;
    overflow-y: auto;
    padding: 4px 2px;
  }

  .emoji-btn {
    aspect-ratio: 1;
    font-size: 22px;
    border-radius: var(--radius-sm);
    border: 2px solid transparent;
    background: var(--surface2);
    transition: border-color 0.1s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .emoji-btn.selected {
    border-color: var(--primary);
    background: var(--primary-light);
  }

  .emoji-btn:active { transform: scale(0.9); }

  .error {
    color: var(--danger);
    font-size: 13px;
    margin-top: 8px;
    text-align: center;
  }
</style>
