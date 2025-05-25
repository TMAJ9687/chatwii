<script lang="ts">
  export let show = false;
  export let onClick: () => void = () => {};
</script>

{#if show}
  <button
    class="absolute bottom-5 right-8 z-20 p-2 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600 transition"
    on:click={onClick}
    aria-label="Scroll to bottom"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
    </svg>
  </button>
{/if}
