<script lang="ts">
  export let user;
  export let onClose;
  export let onConfirm = null; // Optional callback for when block is confirmed
  import { chatStore } from '$lib/stores/chatStore';
  let submitting = false;

  async function handleBlock() {
    submitting = true;
    try {
      await chatStore.blockUser(user.id);
      if (onConfirm) {
        onConfirm();
      }
      onClose();
    } catch (error) {
      console.error('Error blocking user:', error);
    } finally {
      submitting = false;
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
  <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
    <h2 class="text-lg font-bold mb-3">Block User</h2>
    <p class="mb-4">Are you sure you want to block <span class="font-semibold">{user.name}</span>? You won't receive messages from them and they won't be able to send you messages.</p>
    <div class="flex gap-2 justify-end">
      <button 
        class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600" 
        on:click={onClose} 
        disabled={submitting}
      >
        Cancel
      </button>
      <button 
        class="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-60" 
        on:click={handleBlock} 
        disabled={submitting}
      >
        {submitting ? 'Blocking...' : 'Block'}
      </button>
    </div>
  </div>
</div>