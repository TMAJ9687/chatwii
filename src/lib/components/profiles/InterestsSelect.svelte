<script lang="ts">
  import { onClickOutside } from '$lib/utils/onClickOutside';
  export let interests: string[];
  export let setInterests: (v: string[]) => void;
  export let options: string[];
  export let onCloseMenu: () => void = () => {};
  let open = false;
  function closeMenu() { open = false; onCloseMenu(); }
</script>
<div class="relative mb-4">
  <button
    type="button"
    class="w-full rounded-lg border border-gray-200 bg-orange-50 px-3 py-2 text-sm flex justify-between items-center shadow-sm"
    on:click={() => open = !open}
    aria-expanded={open}
  >
    <span class="truncate">
      {#if interests.length > 0}
        {interests.join(', ')}
      {:else}
        <span class="text-gray-400">Add interests</span>
      {/if}
    </span>
    <svg class="w-4 h-4 ml-2 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
  </button>
  {#if open}
    <div
      class="absolute left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow max-h-44 overflow-auto flex flex-wrap gap-2 p-2"
      use:onClickOutside={closeMenu}
    >
      {#each options as interest}
        <button
          type="button"
          class="px-3 py-1 rounded-full text-xs font-medium border border-gray-200 hover:bg-orange-100 focus:bg-orange-200 transition"
          class:bg-orange-200={interests.includes(interest)}
          disabled={interests.length >= 2 && !interests.includes(interest)}
          on:click={() => {
            if (interests.includes(interest)) setInterests(interests.filter(i => i !== interest));
            else if (interests.length < 2) setInterests([...interests, interest]);
          }}
        >
          {interest}
        </button>
      {/each}
    </div>
  {/if}
</div>
