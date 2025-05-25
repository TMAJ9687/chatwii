<script lang="ts">
  import { onClickOutside } from '$lib/utils/onClickOutside';
  import { createEventDispatcher } from 'svelte';
  let open = false;
  const dispatch = createEventDispatcher();
  import { goto } from '$app/navigation';
  function handleClick(option: 'login' | 'register') {
    open = false;
    dispatch(option);
    // Use SvelteKit navigation for SPA
    if (option === 'login') goto('/vip/login');
    if (option === 'register') goto('/vip/register');
  }
</script>
<div class="vip-dropdown absolute top-4 right-4 z-50" use:onClickOutside={() => (open = false)}>
  <button
    class="px-5 py-2 rounded-full border-2 border-yellow-400 text-yellow-800 bg-yellow-100 font-extrabold shadow-lg hover:bg-yellow-200 transition text-base flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
    aria-haspopup="true"
    aria-expanded={open}
    on:click={() => (open = !open)}
    tabindex="0"
  >
    <span class="text-xl">★</span>
    <span>VIP</span>
    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
  </button>
  {#if open}
    <div class="dropdown-menu mt-2 w-56 bg-white border border-yellow-200 rounded-xl shadow-xl flex flex-col py-2 animate-fadeIn">
      <button class="px-5 py-3 text-left text-yellow-800 font-semibold hover:bg-yellow-50 rounded-t-xl transition" on:click={() => handleClick('login')} tabindex="0">
        Login as VIP
      </button>
      <button class="px-5 py-3 text-left text-yellow-900 font-bold hover:bg-yellow-100 rounded-b-xl transition" on:click={() => handleClick('register')} tabindex="0">
        Register and unlock all features
      </button>
    </div>
  {/if}
</div>
<style>
  .vip-dropdown {
    min-width: 120px;
  }
  .dropdown-menu {
    animation: fadeIn 0.18s cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
