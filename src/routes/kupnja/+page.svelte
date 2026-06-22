<script>
  import { invalidateAll } from '$app/navigation';

  export let data;

  function markBought(id) {
    data.items = data.items.filter(i => i.id !== id);
    fetch(`/api/ingredients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ has_it: true, in_shopping_list: false })
    }).catch(() => invalidateAll());
  }

  function removeFromList(id) {
    data.items = data.items.filter(i => i.id !== id);
    fetch(`/api/ingredients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ in_shopping_list: false })
    }).catch(() => invalidateAll());
  }
</script>

<div class="page">
  {#if data.items.length === 0}
    <div class="empty-state">
      <div class="emoji">🛒</div>
      <p>Lista je prazna</p>
      <p style="font-size:13px;margin-top:6px;color:var(--text-muted)">Dugo drži namirnicu na početnom ekranu da je dodaš ovdje</p>
    </div>
  {:else}
    <p class="hint">Tapni ✓ kad kupiš, ili × za ukloniti s liste</p>
    <div class="items-list">
      {#each data.items as item (item.id)}
        <div class="shopping-item">
          <div class="item-info">
            <span class="item-emoji">{item.category_emoji || '📦'}</span>
            <div>
              <div class="item-name">{item.name}</div>
              {#if item.category_name}
                <div class="item-cat">{item.category_name}</div>
              {/if}
            </div>
          </div>
          <div class="item-actions">
            <button class="action-btn buy" on:click={() => markBought(item.id)} title="Kupljeno">
              ✓
            </button>
            <button class="action-btn remove" on:click={() => removeFromList(item.id)} title="Makni s liste">
              ×
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .page {
    padding: 12px 14px 32px;
  }

  .hint {
    font-size: 12px;
    color: var(--text-muted);
    text-align: center;
    margin-bottom: 14px;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .shopping-item {
    background: var(--surface);
    border-radius: var(--radius-sm);
    padding: 14px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: var(--shadow);
  }

  .item-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .item-emoji {
    font-size: 24px;
  }

  .item-name {
    font-size: 15px;
    font-weight: 600;
  }

  .item-cat {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 1px;
  }

  .item-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    transition: transform 0.1s;
  }

  .action-btn:active { transform: scale(0.9); }

  .buy {
    background: var(--success-light);
    color: #2a9d4a;
  }

  .remove {
    background: var(--primary-light);
    color: var(--danger);
  }
</style>
