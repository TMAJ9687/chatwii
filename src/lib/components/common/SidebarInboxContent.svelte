<script lang="ts">
  import { chatStore } from '$lib/stores/chatStore';
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  export let currentUserId: string;
  
  let users = [];
  let messages = [];
  let unsubscribeUsers: () => void = () => {};
  let unsubscribeMessages: () => void = () => {};
  const dispatch = createEventDispatcher();

  onMount(() => {
    // Subscribe to real-time updates from chat store
    unsubscribeUsers = chatStore.users.subscribe(storeUsers => {
      users = storeUsers;
    });
    
    unsubscribeMessages = chatStore.messages.subscribe(storeMessages => {
      messages = storeMessages;
    });

    // Ensure fresh data
    chatStore.fetchUsers();
    chatStore.fetchMessages();
  });

  onDestroy(() => {
    unsubscribeUsers();
    unsubscribeMessages();
  });

  // Find the latest message per conversation (inbox style)
  $: conversations = Array.from(
    messages.reduce((map, msg) => {
      // The conversation key is the other participant
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

  function handleOpenChat(msg) {
    const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
    const user = getUserById(otherId);
    if (user) {
      dispatch('openChat', { user });
    }
  }
</script>

<div>
  <h2 class="text-xl font-semibold mb-4">Inbox</h2>
  {#if conversations.length === 0}
    <div class="text-gray-400 text-center py-8">No conversations yet.</div>
  {:else}
    <ul>
      {#each conversations as convo}
        <li class="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition" on:click={() => handleOpenChat(convo)}>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-900 dark:text-white truncate">
              {#if convo.sender_id === currentUserId}
                {getUserById(convo.receiver_id)?.nickname || 'Unknown'}
              {:else}
                {getUserById(convo.sender_id)?.nickname || 'Unknown'}
              {/if}
            </div>
            <div class="text-xs text-gray-500 truncate">{convo.content}</div>
          </div>
          <div class="text-xs text-gray-400 ml-2 whitespace-nowrap">{new Date(convo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </li>
      {/each}
    </ul>
  {/if}
</div>