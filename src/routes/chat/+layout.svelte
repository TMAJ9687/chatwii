<script lang="ts">
  import { onMount } from 'svelte';
  import SiteRulesModal from '$lib/components/chat/SiteRulesModal.svelte';
  let showRules = false;
  let timer: any;

  onMount(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('siteRulesAccepted') !== '1') {
        timer = setTimeout(() => {
          showRules = true;
        }, 5000);
      }
    }
    return () => clearTimeout(timer);
  });

  function handleAccept() {
    showRules = false;
  }
</script>

<div class="h-screen w-screen flex flex-col">
  <slot />
  {#if showRules}
    <SiteRulesModal on:accept={handleAccept} />
  {/if}
</div>