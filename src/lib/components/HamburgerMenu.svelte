<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';
  import AddIngredientModal from './AddIngredientModal.svelte';
  import CategoryManagerModal from './CategoryManagerModal.svelte';

  export let open = false;
  export let categories = [];

  let showAddIngredient = false;
  let showCategories = false;

  function navigate(path) {
    open = false;
    goto(path);
  }

  function close() { open = false; }

  async function logout() {
    await fetch('/api/login', { method: 'DELETE' });
    window.location.href = '/login';
  }

  const navItems = [
    { path: '/', label: 'Frižider', emoji: '🧊' },
    { path: '/recepti', label: 'Recepti', emoji: '👨‍🍳' },
    { path: '/kupnja', label: 'Lista kupnje', emoji: '🛒' },
  ];
</script>

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="backdrop" on:click={close}></div>
  <nav class="drawer">
    <div class="drawer-header">
      <span class="drawer-logo">🧊</span>
      <span class="drawer-name">Moj Frižider</span>
      <button class="close-btn" on:click={close}>×</button>
    </div>

    <div class="drawer-section">
      <div class="section-label">Navigacija</div>
      {#each navItems as item}
        <button
          class="nav-item"
          class:active={$page.url.pathname === item.path}
          on:click={() => navigate(item.path)}
        >
          <span class="nav-emoji">{item.emoji}</span>
          {item.label}
        </button>
      {/each}
    </div>

    <div class="drawer-section">
      <div class="section-label">Brze akcije</div>
      <button class="nav-item" on:click={() => { open = false; showAddIngredient = true; }}>
        <span class="nav-emoji">➕</span>
        Nova namirnica
      </button>
      <button class="nav-item" on:click={() => { open = false; showCategories = true; }}>
        <span class="nav-emoji">🗂️</span>
        Upravljanje kategorijama
      </button>
    </div>

    <div class="drawer-section">
      <button class="nav-item logout" on:click={logout}>
        <span class="nav-emoji">🚪</span>
        Odjava
      </button>
    </div>
  </nav>
{/if}

<AddIngredientModal
  bind:open={showAddIngredient}
  {categories}
  on:added={() => invalidateAll()}
/>

<CategoryManagerModal
  bind:open={showCategories}
  {categories}
  on:changed={() => invalidateAll()}
/>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 300;
    backdrop-filter: blur(2px);
  }

  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    max-width: 85vw;
    background: var(--surface);
    z-index: 301;
    display: flex;
    flex-direction: column;
    box-shadow: 4px 0 24px rgba(0,0,0,0.15);
    overflow-y: auto;
    animation: slideIn 0.22s ease;
  }

  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  .drawer-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 16px;
    padding-top: calc(20px + env(safe-area-inset-top));
    background: var(--primary);
    color: #fff;
  }

  .drawer-logo { font-size: 28px; }
  .drawer-name { flex: 1; font-size: 18px; font-weight: 700; }

  .close-btn {
    font-size: 24px;
    color: #fff;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    opacity: 0.8;
  }

  .close-btn:active { opacity: 1; background: rgba(255,255,255,0.2); }

  .drawer-section {
    padding: 16px 12px 8px;
    border-bottom: 1px solid var(--border);
  }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    padding: 0 8px 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 12px;
    border-radius: var(--radius-sm);
    font-size: 15px;
    font-weight: 500;
    text-align: left;
    transition: background 0.1s;
  }

  .nav-item:active, .nav-item.active {
    background: var(--surface2);
    font-weight: 600;
  }

  .nav-emoji { font-size: 20px; width: 28px; text-align: center; }

  .nav-item.logout { color: var(--danger); }
</style>
