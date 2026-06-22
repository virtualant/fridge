<script>
  import { onMount } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import '../app.css';
  import HamburgerMenu from '$lib/components/HamburgerMenu.svelte';

  export let data;

  let menuOpen = false;

  onMount(() => {
    const es = new EventSource('/api/events');
    es.addEventListener('update', () => invalidateAll());
    return () => es.close();
  });

  $: title = $page.url.pathname === '/' ? '🧊 Frižider'
    : $page.url.pathname.startsWith('/recepti') ? '👨‍🍳 Recepti'
    : $page.url.pathname.startsWith('/kupnja') ? '🛒 Lista kupnje'
    : '🧊 Frižider';
</script>

<div class="app-shell">
  <header class="topbar">
    <button class="hamburger-btn" on:click={() => menuOpen = true} aria-label="Izbornik">
      <span></span><span></span><span></span>
    </button>
    <h1 class="topbar-title">{title}</h1>
    <div class="topbar-right"></div>
  </header>

  <main class="content">
    <slot />
  </main>

  <nav class="bottom-nav">
    <a href="/" class="nav-tab" class:active={$page.url.pathname === '/'}>
      <span class="nav-icon">🧊</span>
      <span class="nav-label">Frižider</span>
    </a>
    <a href="/recepti" class="nav-tab" class:active={$page.url.pathname.startsWith('/recepti')}>
      <span class="nav-icon">👨‍🍳</span>
      <span class="nav-label">Recepti</span>
    </a>
    <a href="/kupnja" class="nav-tab" class:active={$page.url.pathname.startsWith('/kupnja')}>
      <span class="nav-icon">🛒</span>
      <span class="nav-label">Kupnja</span>
    </a>
  </nav>
</div>

<HamburgerMenu bind:open={menuOpen} categories={data.categories} />

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    max-width: 480px;
    margin: 0 auto;
    background: var(--bg);
  }

  .topbar {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    padding-top: calc(12px + env(safe-area-inset-top));
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    gap: 12px;
    flex-shrink: 0;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
  }

  .topbar-title {
    flex: 1;
    font-size: 18px;
    font-weight: 700;
    text-align: center;
    letter-spacing: -0.01em;
  }

  .topbar-right {
    width: 40px;
  }

  .hamburger-btn {
    width: 40px;
    height: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    padding: 4px;
    border-radius: var(--radius-sm);
    transition: background 0.15s;
  }

  .hamburger-btn:active {
    background: var(--surface2);
  }

  .hamburger-btn span {
    display: block;
    height: 2px;
    background: var(--text);
    border-radius: 2px;
    transition: transform 0.2s;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .bottom-nav {
    display: flex;
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding-bottom: env(safe-area-inset-bottom);
    flex-shrink: 0;
    box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
  }

  .nav-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 4px 8px;
    text-decoration: none;
    color: var(--text-muted);
    gap: 3px;
    transition: color 0.15s;
    -webkit-tap-highlight-color: transparent;
  }

  .nav-tab.active {
    color: var(--primary);
  }

  .nav-icon {
    font-size: 22px;
    line-height: 1;
  }

  .nav-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }
</style>
