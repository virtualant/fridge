<script>
  import { onMount, createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let ingredient;

  let el;
  let timer = null;
  let longPressed = false;
  let isDragging = false;
  let dragX = 0;
  let dragY = 0;
  let overTrash = false;
  let startX = 0;
  let startY = 0;

  const LONG_PRESS_MS = 500;
  const DRAG_THRESHOLD = 10;

  function onTouchStart(e) {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    longPressed = false;
    isDragging = false;

    timer = setTimeout(() => {
      longPressed = true;
      suppressClick = true;
      navigator.vibrate?.(40);
      dispatch('dragstart');
    }, LONG_PRESS_MS);
  }

  function onTouchMove(e) {
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - startX);
    const dy = Math.abs(t.clientY - startY);

    if (!longPressed && (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD)) {
      clearTimeout(timer);
      return;
    }

    if (longPressed) {
      e.preventDefault();
      if (!isDragging) isDragging = true;
      dragX = t.clientX;
      dragY = t.clientY;
      const isOver = dragY > window.innerHeight - 100;
      if (isOver !== overTrash) {
        overTrash = isOver;
        dispatch('dragover', isOver);
      }
    }
  }

  function onTouchEnd() {
    clearTimeout(timer);

    if (isDragging) {
      dispatch('dragend', { dropped: overTrash });
    } else if (longPressed) {
      dispatch('shoppingtoggle');
      dispatch('dragend', { dropped: false });
    } else {
      dispatch('toggle');
    }

    isDragging = false;
    longPressed = false;
    overTrash = false;
  }

  function onTouchCancel() {
    clearTimeout(timer);
    if (isDragging) dispatch('dragend', { dropped: false });
    isDragging = false;
    longPressed = false;
    overTrash = false;
  }

  function onClick() {
    if (suppressClick) { suppressClick = false; return; }
    dispatch('toggle');
  }

  // --- Mouse support (desktop) ---
  let mouseDown = false;
  let suppressClick = false;

  function onMouseDown(e) {
    if (e.button !== 0) return;
    mouseDown = true;
    suppressClick = false;
    startX = e.clientX;
    startY = e.clientY;
    longPressed = false;
    isDragging = false;

    timer = setTimeout(() => {
      if (!mouseDown) return;
      longPressed = true;
      suppressClick = true;
      dispatch('dragstart');
    }, LONG_PRESS_MS);
  }

  function onMouseMove(e) {
    if (!mouseDown) return;
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);

    if (!longPressed && (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD)) {
      clearTimeout(timer);
      return;
    }

    if (longPressed) {
      isDragging = true;
      dragX = e.clientX;
      dragY = e.clientY;
      const isOver = dragY > window.innerHeight - 100;
      if (isOver !== overTrash) {
        overTrash = isOver;
        dispatch('dragover', isOver);
      }
    }
  }

  function onMouseUp() {
    if (!mouseDown) return;
    mouseDown = false;
    clearTimeout(timer);

    if (isDragging) {
      dispatch('dragend', { dropped: overTrash });
    } else if (longPressed) {
      dispatch('shoppingtoggle');
      dispatch('dragend', { dropped: false });
    }
    // click() handles the normal tap case

    isDragging = false;
    longPressed = false;
    overTrash = false;
  }

  onMount(() => {
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<span
  bind:this={el}
  class="pill"
  class:has-it={ingredient.has_it}
  class:shopping={ingredient.in_shopping_list}
  class:dragging={isDragging}
  on:touchstart={onTouchStart}
  on:touchend={onTouchEnd}
  on:touchcancel={onTouchCancel}
  on:mousedown={onMouseDown}
  on:click={onClick}
>
  {ingredient.name}
</span>

{#if isDragging}
  <span
    class="pill has-it drag-clone"
    class:drag-over-trash={overTrash}
    style="left:{dragX}px;top:{dragY}px;"
  >
    {ingredient.name}
  </span>
{/if}

<style>
  .pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: var(--radius-pill);
    border: 2px solid var(--border);
    background: var(--surface2);
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
    touch-action: manipulation;
    -webkit-user-select: none;
    user-select: none;
  }

  .pill:active {
    transform: scale(0.94);
  }

  .pill.has-it {
    background: var(--success-light);
    border-color: var(--success);
    color: #1a7a35;
    font-weight: 600;
  }

  .pill.shopping {
    border-color: var(--warning);
    box-shadow: 0 0 0 2px var(--warning);
  }

  .pill.shopping:not(.has-it) {
    background: var(--warning-light);
    color: #7a5c00;
  }

  .pill.dragging {
    opacity: 0.3;
  }

  .drag-clone {
    position: fixed;
    transform: translate(-50%, -50%) scale(1.1);
    pointer-events: none;
    z-index: 500;
    box-shadow: var(--shadow-lg);
    transition: background 0.15s, border-color 0.15s;
  }

  .drag-clone.drag-over-trash {
    background: #ff4757;
    border-color: #ff4757;
    color: #fff;
  }
</style>
