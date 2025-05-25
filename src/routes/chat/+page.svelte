<script lang="ts">
import UserList from '$lib/components/chat/UserList.svelte';
import ChatArea from '$lib/components/chat/ChatArea.svelte';
import ChatWelcome from '$lib/components/chat/ChatWelcome.svelte';
import ChatHeader from '$lib/components/chat/ChatHeader.svelte';
import UniversalSidebar from '$lib/components/common/UniversalSidebar.svelte';
import BlockedUserModal from '$lib/components/chat/BlockedUserModal.svelte';
import { chatStore } from '$lib/stores/chatStore';

import { onMount, onDestroy } from 'svelte';
import { supabase } from '$lib/services/supabaseClient';

let users = [];
let selectedUser = null;
let error = '';
let currentUserId: string | null = null;
let unsubscribeUsers: () => void = () => {};
let blockedUsers = [];
let unsubscribeBlocked: () => void = () => {};

// Blocked users sidebar state
let showBlockedSidebar = false;

onMount(async () => {
  try {
    // Get logged-in user's UUID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      error = 'You must be logged in to access chat.';
      return;
    }
    
    currentUserId = user.id;
    
    // Initialize chat store with current user
    await chatStore.init(currentUserId);
    
    // Subscribe to users from chat store for real-time updates
    unsubscribeUsers = chatStore.users.subscribe(storeUsers => {
      users = storeUsers;
    });

    // Subscribe to blocked users
    unsubscribeBlocked = chatStore.blockedUsers.subscribe(storeBlocked => {
      blockedUsers = storeBlocked;
    });
    
  } catch (e) {
    error = e.message || 'Could not initialize chat.';
  }
});

onDestroy(() => {
  unsubscribeUsers();
  unsubscribeBlocked();
});

function handleSelectUser(user) {
  selectedUser = user;
}

function handleCloseChat() {
  selectedUser = null;
}

function handleHeaderSelectUser(event) {
  selectedUser = event.detail;
}

function handleOpenBlockedUsers() {
  showBlockedSidebar = true;
}

function handleCloseBlokcedSidebar() {
  showBlockedSidebar = false;
}
</script>

<ChatHeader {currentUserId} on:selectUser={handleHeaderSelectUser} />
<div class="flex-1 flex min-h-0">
  <aside class="w-80 bg-white border-r border-gray-100 flex flex-col">
    <UserList {users} {selectedUser} {currentUserId} onSelect={handleSelectUser} />
  </aside>
  <main class="flex-1 bg-gray-50 min-h-0 flex">
    {#if !selectedUser}
      <div class="flex-1 flex items-center justify-center">
        <ChatWelcome />
      </div>
    {:else}
      <div class="flex-1 flex flex-col min-h-0">
        {#if currentUserId && /^[0-9a-fA-F-]{36}$/.test(currentUserId)}
          <ChatArea 
            user={selectedUser} 
            {currentUserId} 
            onClose={handleCloseChat} 
            onOpenBlockedUsers={handleOpenBlockedUsers}
          />
        {:else}
          <div class="flex-1 flex items-center justify-center text-gray-400">
            Loading user session...
          </div>
        {/if}
      </div>
    {/if}
  </main>
</div>

<!-- Blocked Users Sidebar -->
<UniversalSidebar bind:open={showBlockedSidebar} on:close={handleCloseBlokcedSidebar}>
  <div class="h-full">
    <h2 class="text-xl font-semibold mb-4">Blocked Users</h2>
    <BlockedUserModal 
      {users} 
      {blockedUsers} 
      onClose={handleCloseBlokcedSidebar}
      isInSidebar={true}
    />
  </div>
</UniversalSidebar>

{#if error}
  <div class="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
    {error}
  </div>
{/if}