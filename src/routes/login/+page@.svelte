<script>
  import { goto } from '$app/navigation';
  import '../../app.css';

  let username = '';
  let password = '';
  let loading = false;
  let error = '';

  async function submit() {
    if (!username || !password) return;
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const data = await res.json();
        error = data.error || 'Greška pri prijavi';
        loading = false;
        return;
      }
      goto('/', { invalidateAll: true });
    } catch {
      error = 'Greška u komunikaciji';
      loading = false;
    }
  }
</script>

<div class="login-page">
  <div class="login-card">
    <div class="logo">🧊</div>
    <h1>Moj Frižider</h1>
    <p class="subtitle">Prijavi se za nastavak</p>

    <form on:submit|preventDefault={submit}>
      <label>Korisničko ime</label>
      <input
        type="text"
        bind:value={username}
        autocomplete="username"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
      />

      <label>Lozinka</label>
      <input
        type="password"
        bind:value={password}
        autocomplete="current-password"
      />

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <button type="submit" class="btn-login" disabled={loading}>
        {loading ? 'Prijavljivanje...' : 'Prijavi se'}
      </button>
    </form>
  </div>
</div>

<style>
  .login-page {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: linear-gradient(135deg, #fef9f0 0%, #ffe0e0 100%);
  }

  .login-card {
    background: var(--surface);
    border-radius: 24px;
    padding: 32px 24px;
    width: 100%;
    max-width: 380px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    text-align: center;
  }

  .logo {
    font-size: 56px;
    margin-bottom: 8px;
  }

  h1 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .subtitle {
    color: var(--text-muted);
    font-size: 14px;
    margin-bottom: 24px;
  }

  form {
    text-align: left;
  }

  .btn-login {
    width: 100%;
    margin-top: 24px;
    padding: 14px;
    background: var(--primary);
    color: #fff;
    border-radius: var(--radius-sm);
    font-size: 15px;
    font-weight: 700;
    transition: opacity 0.15s, transform 0.1s;
  }

  .btn-login:active { transform: scale(0.97); }
  .btn-login:disabled { opacity: 0.6; }

  .error {
    color: var(--danger);
    font-size: 13px;
    margin-top: 12px;
    text-align: center;
    padding: 8px;
    background: var(--primary-light);
    border-radius: 8px;
  }
</style>
