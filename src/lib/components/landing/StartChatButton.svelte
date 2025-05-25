<script lang="ts">
  export let loading: boolean = false;
  export let disabled: boolean = false;
  export let onClick: () => void;
</script>
<button
  class="w-full bg-orange-400 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-orange-500 transition flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
  on:click={onClick}
  disabled={disabled || loading}
  type="button"
>
  {#if loading}
    <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
    Starting…
  {:else}
    Start Chat
  {/if}
</button>
