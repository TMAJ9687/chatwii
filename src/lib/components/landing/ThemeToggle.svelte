<script lang="ts">
  import { onMount } from 'svelte';
  let dark = false;
  onMount(() => {
    dark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    updateTheme();
  });
  function toggleTheme() {
    dark = !dark;
    localStorage.theme = dark ? 'dark' : 'light';
    updateTheme();
  }
  function updateTheme() {
    document.documentElement.classList.toggle('dark', dark);
  }
</script>
<button
  class="absolute top-4 right-16 p-2 rounded-full bg-white/80 dark:bg-gray-700/80 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition"
  on:click={toggleTheme}
  aria-label="Toggle theme"
  type="button"
>
  {#if dark}
    <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM10 4a6 6 0 010 12A6 6 0 0110 4z" /></svg>
  {:else}
    <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293a8 8 0 01-11.586 0 1 1 0 011.415-1.415 6 6 0 008.757 0 1 1 0 111.414 1.415z" /></svg>
  {/if}
</button>
