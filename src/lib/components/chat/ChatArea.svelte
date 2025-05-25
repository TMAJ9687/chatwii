<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { chatStore } from '$lib/stores/chatStore';
  import { get } from 'svelte/store';
  import UserChatHeader from './UserChatHeader.svelte';
  import MessageList from './MessageList.svelte';
  import MessageInput from './MessageInput.svelte';

  export let user: any = null; // Selected user to chat with
  export let currentUserId: string; // Must be passed in by parent, no default
  export let onClose: () => void = () => {};
  export let onMenu: () => void = () => {};
  export let onOpenBlockedUsers: () => void = () => {}; // New prop for opening blocked users

  let messages = [];
  let blockedUsers = [];
  let unsubscribe: () => void = () => {};
  let unsubscribeMessages: () => void = () => {};
  let unsubscribeBlocked: () => void = () => {};

  onMount(() => {
    // Ensure chat store is initialized
    if (currentUserId && /^[0-9a-fA-F-]{36}$/.test(currentUserId)) {
      chatStore.init(currentUserId);
    }

    // Subscribe to blocked users
    unsubscribeBlocked = chatStore.blockedUsers.subscribe(storeBlocked => {
      blockedUsers = storeBlocked;
    });
  });

  // Automatically mark messages as read for the selected user if their chat is open
  $: {
    if (unsubscribeMessages) unsubscribeMessages();
    if (user && currentUserId) {
      unsubscribeMessages = chatStore.messages.subscribe(($messages) => {
        const hasUnread = $messages.some(
          msg =>
            msg.sender_id === user.id &&
            msg.receiver_id === currentUserId &&
            !msg.read
        );
        if (hasUnread) {
          chatStore.markMessagesAsRead(user.id);
        }
      });
    }
  }

  $: {
    unsubscribe(); // Always clean up previous subscription
    if (user) {
      unsubscribe = chatStore.messages.subscribe((all) => {
        // Filter messages for current conversation and exclude blocked users
        messages = all.filter(
          (m) => {
            const isRelevantConversation = 
              (m.sender_id === currentUserId && m.receiver_id === user.id) ||
              (m.sender_id === user.id && m.receiver_id === currentUserId);
            
            const isBlocked = 
              blockedUsers.includes(m.sender_id) || 
              blockedUsers.includes(m.receiver_id);
            
            return isRelevantConversation && !isBlocked;
          }
        );
      });
    } else {
      messages = [];
    }
  }

  onDestroy(() => {
    unsubscribe();
    unsubscribeBlocked();
    if (unsubscribeMessages) unsubscribeMessages();
  });

  async function handleSend(msg: string) {
    // Don't allow sending messages to blocked users
    if (user && !blockedUsers.includes(user.id)) {
      try {
        await chatStore.sendMessage(user.id, msg);
      } catch (error) {
        // Re-throw error so MessageInput can handle it
        throw error;
      }
    } else {
      throw new Error('Cannot send message to blocked user');
    }
  }

  function handleOpenBlockedUsers() {
    onOpenBlockedUsers();
  }

  // Check if current chat user is blocked
  $: isUserBlocked = user && blockedUsers.includes(user.id);
</script>

{#if user}
  <div class="flex flex-col h-full min-h-0">
    <UserChatHeader 
      {user} 
      on:close={onClose} 
      on:menu={onMenu} 
      on:openBlockedUsers={handleOpenBlockedUsers}
    />
    
    {#if isUserBlocked}
      <div class="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div class="text-center p-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">User Blocked</h3>
          <p class="text-gray-500 dark:text-gray-400">You have blocked this user. No messages can be sent or received.</p>
        </div>
      </div>
    {:else}
      <div class="flex-1 min-h-0 overflow-auto">
        <MessageList {messages} {currentUserId} />
      </div>
      <MessageInput onSend={handleSend} />
    {/if}
  </div>
{:else}
  <div class="flex flex-1 items-center justify-center text-gray-400 text-lg">
    Select a user from the list to start chatting
  </div>
{/if}