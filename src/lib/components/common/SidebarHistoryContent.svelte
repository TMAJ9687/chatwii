<script lang="ts">
  import { chatStore } from '$lib/stores/chatStore';
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  let blockedUsers = [];
  let unsubscribeBlocked = () => {};
  export let currentUserId: string;
  const dispatch = createEventDispatcher();

  let users = [];
  let messages = [];
  let unsubscribeUsers: () => void = () => {};
  let unsubscribeMessages: () => void = () => {};

  onMount(() => {
    // Subscribe to real-time updates from chat store
    unsubscribeUsers = chatStore.users.subscribe(storeUsers => {
      users = storeUsers;
    });
    
    unsubscribeMessages = chatStore.messages.subscribe(storeMessages => {
      messages = storeMessages;
    });

    unsubscribeBlocked = chatStore.blockedUsers.subscribe(storeBlocked => {
      blockedUsers = storeBlocked;
    });

    // Ensure fresh data
    chatStore.fetchUsers();
    chatStore.fetchMessages();
    chatStore.fetchBlockedUsers();
  });

  onDestroy(() => {
    unsubscribeUsers();
    unsubscribeMessages();
    unsubscribeBlocked();
  });

  // Show the most recent message per conversation partner
  $: latestMessages = Array.from(
    (messages || [])
      .reduce((map, msg) => {
        // Get the other person in the conversation
        const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
        if (!map.has(otherId) || new Date(msg.created_at) > new Date(map.get(otherId).created_at)) {
          map.set(otherId, msg);
        }
        return map;
      }, new Map()).values()
  )
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Sort by most recent first

  function getUserById(id: string) {
    return users.find(u => u.id === id);
  }

  // When clicking a message in history, open chat with the other person
  function handleOpenChat(msg) {
    const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
    const user = getUserById(otherId);
    if (user) {
      dispatch('openChat', { user });
    }
  }
</script>

<div>
  <h2 class="text-xl font-semibold mb-4">Message History</h2>
  {#if latestMessages.length === 0}
    <div class="text-gray-400 text-center py-8">No messages yet.</div>
  {:else}
    <ul>
      {#each latestMessages as msg}
        <li
          class="flex items-center gap-3 py-3 px-2 rounded-lg transition { blockedUsers.includes(msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id) ? 'opacity-50 pointer-events-none bg-gray-50 dark:bg-gray-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer' }"
          style="opacity: { blockedUsers.includes(msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id) ? 0.5 : 1 }; cursor: { blockedUsers.includes(msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id) ? 'not-allowed' : 'pointer' }"
          on:click={() => {
            const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
            if (!blockedUsers.includes(otherId)) handleOpenChat(msg);
          }}
        >
          <div class="flex-1 min-w-0 flex items-center gap-1">
            <div class="font-semibold text-gray-900 dark:text-white truncate">
              {#if msg.sender_id === currentUserId}
                To: {getUserById(msg.receiver_id)?.nickname || 'Unknown'}
              {:else}
                From: {getUserById(msg.sender_id)?.nickname || 'Unknown'}
              {/if}
            </div>
            {#if blockedUsers.includes(msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id)}
              <svg class="ml-1 text-red-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            {/if}
          </div>
          <div class="text-xs text-gray-400 ml-2 whitespace-nowrap">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </li>
      {/each}
    </ul>
  {/if}
</div>