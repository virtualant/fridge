<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let recipe;

  let expanded = false;

  $: score = recipe.total > 0 ? recipe.available / recipe.total : 0;
  $: color = getColor(score);
  $: label = recipe.total === 0 ? 'Nema namirnica' : `${recipe.available}/${recipe.total}`;

  function getColor(s) {
    if (s <= 0.2) return '#ff4757';
    if (s <= 0.4) return '#fd9644';
    if (s <= 0.6) return '#ffd43b';
    if (s <= 0.8) return '#a9e34b';
    return '#51cf66';
  }

  // Long-press state per ingredient (keyed by id)
  let pressTimers = {};
  let suppressIngClick = {};
  let shoppingPending = {}; // visual feedback while saving

  function ingPressStart(ing, clientX, clientY) {
    pressTimers[ing.id] = setTimeout(() => {
      suppressIngClick[ing.id] = true;
      navigator.vibrate?.(40);
      dispatch('shoppingtoggle', ing.id);
      shoppingPending[ing.id] = true;
      setTimeout(() => { shoppingPending[ing.id] = false; }, 800);
    }, 500);
  }

  function ingPressEnd(ing) {
    clearTimeout(pressTimers[ing.id]);
  }

  function ingClick(ing) {
    if (suppressIngClick[ing.id]) { suppressIngClick[ing.id] = false; return; }
    dispatch('havetoggle', ing.id);
  }

  // Touch handlers
  function onIngTouchStart(e, ing) { ingPressStart(ing, e.touches[0].clientX, e.touches[0].clientY); }
  function onIngTouchEnd(e, ing) { ingPressEnd(ing); ingClick(ing); }

  // Mouse handlers
  function onIngMouseDown(e, ing) { if (e.button === 0) ingPressStart(ing); }
  function onIngMouseUp(e, ing) { ingPressEnd(ing); }
</script>

<div class="card" style="--score-color:{color}">
  <div class="card-header">
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="card-info" on:click={() => expanded = !expanded}>
      <div class="card-top">
        <h3 class="card-name">{recipe.name}</h3>
        <div class="score-badge" style="background:{color}20;color:{color};border-color:{color}">
          {label}
        </div>
      </div>
      <div class="score-bar">
        <div class="score-fill" style="width:{Math.round(score*100)}%;background:{color}"></div>
      </div>
      {#if recipe.description}
        <p class="card-desc">{recipe.description}</p>
      {/if}
    </div>
    <button class="edit-btn" on:click|stopPropagation={() => dispatch('edit')} title="Uredi recept">✏️</button>
    <button class="delete-btn" on:click|stopPropagation={() => dispatch('delete')} title="Obriši recept">🗑️</button>
  </div>

  {#if expanded && recipe.ingredients.length > 0}
    <div class="ingredients-list">
      <p class="ing-hint">Tapni: imam/nemam · Drži: lista kupnje</p>
      {#each recipe.ingredients as ing (ing.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <span
          class="ing-tag"
          class:have={ing.has_it}
          class:shopping={ing.in_shopping_list}
          class:pending={shoppingPending[ing.id]}
          on:touchstart={(e) => onIngTouchStart(e, ing)}
          on:touchend={(e) => onIngTouchEnd(e, ing)}
          on:touchcancel={() => ingPressEnd(ing)}
          on:mousedown={(e) => onIngMouseDown(e, ing)}
          on:mouseup={(e) => onIngMouseUp(e, ing)}
          on:click={() => ingClick(ing)}
        >
          {ing.has_it ? '✓' : ing.in_shopping_list ? '🛒' : '✗'} {ing.name}
        </span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .card {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 16px;
    box-shadow: var(--shadow);
    border-left: 4px solid var(--score-color);
    transition: border-color 0.3s;
  }

  .card-header {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .card-info {
    flex: 1;
    cursor: pointer;
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .card-name {
    flex: 1;
    font-size: 16px;
    font-weight: 700;
  }

  .score-badge {
    font-size: 13px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    border: 1.5px solid;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .score-bar {
    height: 6px;
    background: var(--surface2);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .score-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s ease, background 0.3s;
  }

  .card-desc {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
    margin-top: 4px;
  }

  .edit-btn, .delete-btn {
    font-size: 20px;
    padding: 4px;
    border-radius: 8px;
    opacity: 0.5;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }

  .edit-btn:active, .delete-btn:active { opacity: 1; }

  .ing-hint {
    width: 100%;
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .ingredients-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }

  .ing-tag {
    font-size: 12px;
    padding: 5px 11px;
    border-radius: var(--radius-pill);
    border: 2px solid transparent;
    background: var(--primary-light);
    color: var(--danger);
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.1s, border-color 0.15s, background 0.15s;
    -webkit-user-select: none;
    user-select: none;
  }

  .ing-tag:active { transform: scale(0.93); }

  .ing-tag.have {
    background: var(--success-light);
    color: #1a7a35;
  }

  .ing-tag.shopping {
    border-color: var(--warning);
    box-shadow: 0 0 0 1px var(--warning);
  }

  .ing-tag.pending {
    transform: scale(1.08);
  }
</style>
