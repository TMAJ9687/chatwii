<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';

  const dispatch = createEventDispatcher();
  let showWarning = false;

  // Prevent background scroll
  onMount(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  });

  function acceptRules() {
    // Persist acceptance until logout (localStorage)
    localStorage.setItem('siteRulesAccepted', '1');
    document.body.style.overflow = '';
    dispatch('accept'); // Svelte event
  }

  function declineRules() {
    showWarning = true;
  }

  function warningNo() {
    showWarning = false;
  }

  function warningYes() {
    localStorage.removeItem('siteRulesAccepted');
    document.body.style.overflow = '';
    goto('/'); // Kick out to landing page
  }
</script>

{#if !showWarning}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center relative animate-fade-in">
      <h2 class="mb-4 text-2xl font-bold text-gray-800">Site Rules</h2>
      <ul class="text-left space-y-3 mb-8">
        <li class="font-bold text-red-600">Age Restriction: Must be 18 or older to use.</li>
        <li>Respectful Communication: Treat everyone respectfully; no harassment or hate.</li>
        <li>No NSFW Content: Share no explicit, obscene, or inappropriate content.</li>
        <li>Protect Your Privacy: Don't share personal information (yours or others').</li>
        <li>No Spam or Advertising: No unsolicited messages, spam, or advertising.</li>
        <li>User Responsibility: Staff aren't responsible for site misuse.</li>
      </ul>
      <div class="flex gap-4 justify-center">
        <button class="flex-1 py-2 rounded-lg font-semibold bg-[#229c90] text-white hover:bg-[#1e877a] transition text-lg" on:click={acceptRules}>Accept</button>
        <button class="flex-1 py-2 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition text-lg" on:click={declineRules}>Decline</button>
      </div>
    </div>
  </div>
{:else}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center relative animate-fade-in">
      <h2 class="mb-4 text-xl font-bold text-red-600">Warning</h2>
      <p class="mb-8 text-gray-700">If you aren't willing to comply to those rules you'll be kicked out.</p>
      <div class="flex gap-4 justify-center">
        <button class="flex-1 py-2 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition text-lg" on:click={warningYes}>Yes</button>
        <button class="flex-1 py-2 rounded-lg font-semibold bg-[#229c90] text-white hover:bg-[#1e877a] transition text-lg" on:click={warningNo}>No</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .animate-fade-in {
    animation: fadeIn 0.25s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.97); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
