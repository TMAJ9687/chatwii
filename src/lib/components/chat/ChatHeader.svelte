<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import InboxNotificationBadge from '$lib/components/common/InboxNotificationBadge.svelte';
  import { unreadSendersCount } from '$lib/stores/chatStore';
  import { browser } from '$app/environment';
  import { supabase } from '$lib/services/supabaseClient';
  import LottiePlayer from '$lib/components/common/LottiePlayer.svelte';
  import UniversalSidebar from '$lib/components/common/UniversalSidebar.svelte';
  import SidebarInboxContent from '$lib/components/common/SidebarInboxContent.svelte';
  import SidebarHistoryContent from '$lib/components/common/SidebarHistoryContent.svelte';
  import { chatStore } from '$lib/stores/chatStore';
  import { goto } from '$app/navigation';

  export let currentUserId;

  const dispatch = createEventDispatcher();

  // Ensure chatStore is initialized for real-time updates when user logs in
  $: if (currentUserId) {
    chatStore.init(currentUserId);
  }

  let sidebarOpen = false;
  let sidebarTab: 'inbox' | 'history' = 'inbox';

  let isDarkMode = false;
  let duration = 0;
  let interval;

  onMount(() => {
    isDarkMode = document.documentElement.classList.contains('dark');
    interval = setInterval(() => {
      duration += 1;
    }, 1000);
    return () => clearInterval(interval);
  });

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }

  function formatTime(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  import { deleteUserAccount } from '$lib/utils/deleteUserAccount';

  async function handleLogout() {
    // Get user ID from Supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id) {
      await deleteUserAccount(user.id);
    }
    await supabase.auth.signOut();
    chatStore.reset();
    goto('/session/feedback'); // Redirect to feedback page after logout
  }

  function handleSidebarOpenChat(event) {
    const user = event.detail.user;
    if (user) {
      chatStore.markMessagesAsRead(user.id);
      dispatch('selectUser', user);
      sidebarOpen = false;
    }
  }

  function openSidebar(tab) {
    sidebarTab = tab;
    sidebarOpen = true;
  }
</script>

<header class="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
  <div class="flex items-center space-x-2">
    <h1 class="text-lg font-semibold text-gray-800 dark:text-white">Chat App</h1>
    <span class="text-sm text-green-600">• online</span>
    <span class="text-xs text-gray-500 dark:text-gray-400">🕒 {formatTime(duration)}</span>
  </div>

  <div class="flex items-center space-x-4">
    <!-- Inbox -->
    <button title="Inbox" aria-label="Inbox" class="relative text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-300" on:click={() => openSidebar('inbox')}>
  <div class="w-8 h-8 flex items-center justify-center">
    <LottiePlayer src="/icons/inbox.json" speed={0.5} autoplay={true} />
    <InboxNotificationBadge count={$unreadSendersCount} />
  </div>
</button>
    <!-- History -->
    <button title="History" aria-label="History" class="text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-300" on:click={() => openSidebar('history')}>
      <div class="w-8 h-8 flex items-center justify-center">
        <LottiePlayer src="/icons/history.json" speed={0.5} autoplay={true} />
      </div>
    </button>

    <!-- Theme toggle -->
    <button on:click={toggleDarkMode} title="Toggle Theme" aria-label="Toggle Theme" class="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-300">
      <div class="w-8 h-8 flex items-center justify-center">
        <LottiePlayer src="/icons/theme.json" speed={0.5} autoplay={true} />
      </div>
    </button>

    <!-- Logout -->
    <button on:click={handleLogout} title="Logout" aria-label="Logout" class="text-red-500 hover:text-red-700">
      <div class="w-8 h-8 flex items-center justify-center lottie-logout">
        <LottiePlayer src="/icons/logout.json" speed={0.5} autoplay={true} />
      </div>
    </button>
  </div>
</header>

<UniversalSidebar bind:open={sidebarOpen} on:close={() => sidebarOpen = false}>
  {#if sidebarTab === 'inbox'}
    <SidebarInboxContent {currentUserId} on:openChat={handleSidebarOpenChat} />
  {:else if sidebarTab === 'history'}
    <SidebarHistoryContent {currentUserId} on:openChat={handleSidebarOpenChat} />
  {/if}
</UniversalSidebar>

<style>
.lottie-logout svg * {
  stroke: #ef4444 !important;
}
</style>