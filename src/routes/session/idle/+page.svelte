<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

  let countdown = 30 * 60; // 30 minutes in seconds
  let intervalId: any;

  const reconnect = async () => {
    await supabase.from('user_presence').upsert({ user_id: supabase.auth.user()?.id, online: true });
    goto('/chat');
  };

  onMount(() => {
    intervalId = setInterval(async () => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(intervalId);
        import { deleteUserAccount } from '$lib/utils/deleteUserAccount';
        await deleteUserAccount(supabase.auth.user()?.id);
        await supabase.auth.signOut();
        goto('/session/feedback');
      }
    }, 1000);
  });

  onDestroy(() => clearInterval(intervalId));
</script>

<main class="max-w-md mx-auto p-6 text-center space-y-4">
  <h1 class="text-2xl font-semibold">You’ve been idle</h1>
  <p class="text-gray-600">For your security, you’ll be logged out in</p>
  <div class="text-4xl font-mono">{Math.floor(countdown/60)}:{String(countdown%60).padStart(2,'0')}</div>
  <button on:click={reconnect} class="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600">
    Re-connect
  </button>
</main>
