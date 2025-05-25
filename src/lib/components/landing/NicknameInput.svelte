<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { validateNickname } from '$lib/utils/validators';
  export let nickname: string;
  export let error: string;
  export let charCount: number;
  export let onInput: (value: string) => void;
  export let onRandom: () => void;
  export let disabled: boolean = false;
  const dispatch = createEventDispatcher();
</script>
<div class="flex flex-col gap-1 w-full">
  <div class="relative w-full">
    <input
      class="w-full rounded-xl border border-orange-200 bg-[#fff8f1] px-6 py-4 text-2xl font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
      type="text"
      maxlength="16"
      placeholder="Your nickname"
      bind:value={nickname}
      on:input={(e) => onInput(e.target.value)}
      disabled={disabled}
      aria-label="Your nickname"
      autocomplete="off"
      spellcheck={false}
    />
    <button
      class="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/80 shadow hover:bg-orange-100 transition border border-orange-100"
      on:click={onRandom}
      tabindex="-1"
      type="button"
      aria-label="Random nickname"
      disabled={disabled}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9M4 4l16 16" /></svg>
    </button>
  </div>
  <div class="flex justify-between items-center mt-2">
    <span class="text-gray-400 text-xs">{charCount}/16</span>
    {#if error}
      <span class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold shadow-sm ml-2">{error}</span>
    {/if}
  </div>
</div>
