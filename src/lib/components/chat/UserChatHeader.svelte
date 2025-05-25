<script lang="ts">
  export let user: any;
  import FlagIcon from '$lib/components/common/FlagIcon.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import BlockUserModal from './BlockUserModal.svelte';
  import ReportUserModal from './ReportUserModal.svelte';
  import { chatStore } from '$lib/stores/chatStore';
  import { onClickOutside } from '$lib/utils/onClickOutside';
  
  const dispatch = createEventDispatcher();

  let showMenu = false;
  let showBlockModal = false;
  let showReportModal = false;
  let menuRef;
  let users = [];
  let blockedUsers = [];

  // Subscribe to store data
  onMount(() => {
    const unsubscribeUsers = chatStore.users.subscribe(storeUsers => {
      users = storeUsers;
    });
    
    const unsubscribeBlocked = chatStore.blockedUsers.subscribe(storeBlocked => {
      blockedUsers = storeBlocked;
    });

    return () => {
      unsubscribeUsers();
      unsubscribeBlocked();
    };
  });

  function openBlock() {
    showBlockModal = true;
    showMenu = false;
  }
  
  function openReport() {
    showReportModal = true;
    showMenu = false;
  }
  
  function openBlocked() {
    // Dispatch event to parent to open blocked users sidebar
    dispatch('openBlockedUsers');
    showMenu = false;
  }
  
  function closeModals() {
    showBlockModal = false;
    showReportModal = false;
  }

  function closeMenu() {
    showMenu = false;
  }

  async function handleBlock() {
    await chatStore.blockUser(user.id);
    closeModals();
    // Close the chat since user is now blocked
    dispatch('close');
  }
</script>

<div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white dark:bg-gray-900 rounded-t-xl w-full">
  <div class="flex items-center gap-3 min-w-0">
    <img
      src={user.avatar || `/avatars/standard/${user.gender || 'male'}.png`}
      alt={user.name}
      class="w-12 h-12 rounded-full object-cover border-2 {user.role === 'VIP' ? 'border-yellow-400' : 'border-gray-300'}"
    />
    <div class="flex flex-col min-w-0">
      <div class="flex items-center gap-2 min-w-0">
        <span class="font-semibold text-gray-900 dark:text-white truncate">{user.name}</span>
        {#if user.role === 'VIP'}
          <span class="text-xs bg-yellow-300 text-yellow-800 px-1 py-0.5 rounded font-bold">VIP</span>
        {/if}
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-300">
        <FlagIcon code={user.country.code} width={20} height={14} />
        <span>{user.country.name}</span>
        <span class="text-pink-500">{user.gender}</span>
        <span class="text-pink-500">{user.age}</span>
      </div>
    </div>
  </div>
  <div class="flex items-center gap-2">
    <div class="relative">
      <button 
        class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" 
        on:click={() => showMenu = !showMenu} 
        title="More options"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19.5" cy="12" r="1.5" />
          <circle cx="4.5" cy="12" r="1.5" />
        </svg>
      </button>
      {#if showMenu}
        <div 
          bind:this={menuRef}
          use:onClickOutside={closeMenu}
          class="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded shadow-lg z-50 border border-gray-200 dark:border-gray-700"
        >
          <button 
            class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400" 
            on:click={openBlock}
          >
            Block User
          </button>
          <button 
            class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-yellow-600 dark:text-yellow-400" 
            on:click={openReport}
          >
            Report User
          </button>
          <button 
            class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" 
            on:click={openBlocked}
          >
            View Blocked Users
          </button>
        </div>
      {/if}
    </div>
    <button 
      class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" 
      on:click={() => dispatch('close')} 
      title="Close chat"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>

<!-- Modals -->
{#if showBlockModal}
  <BlockUserModal {user} onClose={closeModals} onConfirm={handleBlock} />
{/if}

{#if showReportModal}
  <ReportUserModal {user} onClose={closeModals} />
{/if}