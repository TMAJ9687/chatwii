<script lang="ts">
  export let users = [];
  export let blockedUsers = [];
  export let onClose;
  export let isInSidebar = false; // New prop to determine if used in sidebar
  import { chatStore } from '$lib/stores/chatStore';
  import { onMount, onDestroy } from 'svelte';
  
  let loadingMap = {};
  let unsubscribeUsers = () => {};
  let unsubscribeBlocked = () => {};

  // Subscribe to real-time updates
  onMount(() => {
    unsubscribeUsers = chatStore.users.subscribe(storeUsers => {
      if (isInSidebar) {
        users = storeUsers;
      }
    });
    
    unsubscribeBlocked = chatStore.blockedUsers.subscribe(storeBlocked => {
      blockedUsers = storeBlocked;
    });
  });

  onDestroy(() => {
    unsubscribeUsers();
    unsubscribeBlocked();
  });

  function getBlockedList() {
    return users.filter(u => blockedUsers.includes(u.id));
  }

  async function handleUnblock(userId) {
    loadingMap = { ...loadingMap, [userId]: true };
    try {
      await chatStore.unblockUser(userId);
      console.log('User unblocked successfully:', userId);
    } catch (error) {
      console.error('Error unblocking user:', error);
    } finally {
      loadingMap = { ...loadingMap, [userId]: false };
    }
  }

  $: blockedList = getBlockedList();
  $: console.log('BlockedUserModal - Users:', users.length, 'Blocked IDs:', blockedUsers, 'Blocked list:', blockedList.length);
</script>

{#if !isInSidebar}
  <!-- Modal version -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
      <h2 class="text-lg font-bold mb-3">Blocked Users</h2>
      {#if blockedList.length === 0}
        <div class="text-gray-500 text-center py-8">You haven't blocked anyone.</div>
      {:else}
        <ul class="mb-4 divide-y divide-gray-200 dark:divide-gray-800 space-y-2">
          {#each blockedList as user}
            <li class="flex items-center justify-between py-3 px-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div class="flex items-center gap-3">
                <img
                  src={user.avatar || `/avatars/standard/${user.gender || 'male'}.png`}
                  alt={user.name}
                  class="w-8 h-8 rounded-full object-cover border border-gray-300"
                />
                <span class="font-medium text-gray-900 dark:text-white">{user.name}</span>
              </div>
              <button 
                class="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-60 text-sm" 
                on:click={() => handleUnblock(user.id)} 
                disabled={loadingMap[user.id]}
              >
                {loadingMap[user.id] ? 'Unblocking...' : 'Unblock'}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
      <div class="flex justify-end mt-4">
        <button 
          class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600" 
          on:click={onClose}
        >
          Close
        </button>
      </div>
    </div>
  </div>
{:else}
  <!-- Sidebar version -->
  <div class="h-full flex flex-col">
    {#if blockedList.length === 0}
      <div class="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-center py-8">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          <p>You haven't blocked anyone yet.</p>
        </div>
      </div>
    {:else}
      <div class="flex-1 overflow-y-auto">
        <ul class="space-y-3">
          {#each blockedList as user}
            <li class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3 mb-3">
                <img
                  src={user.avatar || `/avatars/standard/${user.gender || 'male'}.png`}
                  alt={user.name}
                  class="w-10 h-10 rounded-full object-cover border border-gray-300"
                />
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">@{user.nickname}</p>
                </div>
              </div>
              <button 
                class="w-full px-3 py-2 rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-60 text-sm font-medium" 
                on:click={() => handleUnblock(user.id)} 
                disabled={loadingMap[user.id]}
              >
                {loadingMap[user.id] ? 'Unblocking...' : 'Unblock User'}
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
{/if}