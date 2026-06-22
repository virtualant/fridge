<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let title = 'Potvrda';
  export let message = 'Jeste li sigurni?';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-backdrop" on:click={() => dispatch('cancel')}>
  <div class="modal-sheet" on:click|stopPropagation>
    <div class="modal-handle"></div>
    <div class="confirm-emoji">⚠️</div>
    <div class="modal-title">{title}</div>
    <p class="confirm-msg">{message}</p>
    <div class="modal-actions">
      <button class="btn btn-secondary" on:click={() => dispatch('cancel')}>Odustani</button>
      <button class="btn btn-danger" on:click={() => dispatch('confirm')}>Obriši</button>
    </div>
  </div>
</div>

<style>
  .confirm-emoji {
    text-align: center;
    font-size: 40px;
    margin-bottom: 8px;
  }

  .confirm-msg {
    text-align: center;
    color: var(--text-muted);
    font-size: 14px;
    margin-bottom: 4px;
    line-height: 1.5;
  }
</style>
