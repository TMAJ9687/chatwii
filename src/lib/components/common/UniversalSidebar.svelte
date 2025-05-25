<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { onClickOutside } from '$lib/utils/onClickOutside';
  export let open: boolean = false;
  const dispatch = createEventDispatcher();
  let sidebarRef: HTMLElement;
  let visible = false;
  let animating = false;

  // Handle opening animation
  $: if (open && !visible) {
    visible = true;
    animating = true;
    // Small delay to ensure DOM is updated before animation
    setTimeout(() => {
      animating = false;
    }, 50);
  }

  function handleClose() {
    if (animating) return; // Prevent closing during opening animation
    dispatch('close');
  }

  // Handle closing animation
  $: if (!open && visible && !animating) {
    setTimeout(() => {
      visible = false;
    }, 350);
  }
</script>

{#if visible}
  <div class="fixed inset-0 z-40 flex">
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black transition-opacity duration-300 {open ? 'bg-opacity-30' : 'bg-opacity-0'}"
      style="backdrop-filter: {open ? 'blur(2px)' : 'none'}; pointer-events: {open ? 'auto' : 'none'};"
      on:click={handleClose}
    />
    <!-- Sidebar -->
    <aside
      bind:this={sidebarRef}
      use:onClickOutside={() => { if (open && !animating) handleClose(); }}
      class="fixed right-0 top-0 h-full w-80 max-w-full bg-white dark:bg-gray-900 shadow-xl overflow-y-auto transition-transform duration-350 ease-in-out {open && !animating ? 'translate-x-0' : 'translate-x-full'}"
      style="border-top-left-radius: 2rem; border-bottom-left-radius: 2rem; pointer-events: auto;"
      tabindex="-1"
    >
      <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white transition" on:click={handleClose} aria-label="Close sidebar">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-7 h-7">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="pt-16 pb-8 px-6">
        <slot />
      </div>
    </aside>
  </div>
{/if}

<style>
  .transition-transform {
    transition-property: transform;
  }
  .transition-opacity {
    transition-property: opacity;
  }
  .duration-350 {
    transition-duration: 350ms;
  }
  .duration-300 {
    transition-duration: 300ms;
  }
  .translate-x-0 {
    transform: translateX(0);
  }
  .translate-x-full {
    transform: translateX(100%);
  }
  .ease-in-out {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>