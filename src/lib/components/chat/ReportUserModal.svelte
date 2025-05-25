<script lang="ts">
  export let user;
  export let onClose;
  import { chatStore } from '$lib/stores/chatStore';
  import { onClickOutside } from '$lib/utils/onClickOutside';
  
  let submitting = false;
  let error = '';
  let success = false;
  let selectedReason = '';
  let otherText = '';
  let modalRef;
  
  const reasons = [
    {
      value: 'under_age',
      label: 'Under Age',
      description: 'User under 18 years old'
    },
    {
      value: 'abusive',
      label: 'Abusive Behavior',
      description: 'Threatening, hateful behavior'
    },
    {
      value: 'scam',
      label: 'Financial Scam',
      description: 'Attempting financial scams, fraud'
    },
    {
      value: 'spam',
      label: 'Spam Messages',
      description: 'Sending unsolicited spam messages'
    },
    {
      value: 'inappropriate',
      label: 'Inappropriate Content',
      description: 'Sharing inappropriate, explicit content'
    },
    {
      value: 'other',
      label: 'Other',
      description: 'Other reason not listed above'
    }
  ];

  async function handleSubmit() {
    submitting = true;
    error = '';
    
    let reason = selectedReason;
    if (selectedReason === 'other') {
      if (!otherText.trim() || otherText.trim().length < 10) {
        error = 'Please provide at least 10 characters describing the issue.';
        submitting = false;
        return;
      }
      if (otherText.trim().length > 100) {
        error = 'Description must be 100 characters or less.';
        submitting = false;
        return;
      }
      reason = `Other: ${otherText.trim()}`;
    }
    
    if (!reason) {
      error = 'Please select a reason for reporting.';
      submitting = false;
      return;
    }

    try {
      await chatStore.reportUser(user.id, reason);
      success = true;
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      error = 'Failed to submit report. Please try again.';
    } finally {
      submitting = false;
    }
  }

  function handleClose() {
    if (!submitting) {
      onClose();
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
  <div 
    bind:this={modalRef}
    use:onClickOutside={handleClose}
    class="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
  >
    {#if success}
      <div class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Report Submitted</h3>
        <p class="text-gray-600 dark:text-gray-400">Thank you for reporting. We'll review this case and take appropriate action.</p>
      </div>
    {:else}
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Report User</h2>
        <button 
          on:click={handleClose} 
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          disabled={submitting}
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form on:submit|preventDefault={handleSubmit}>
        <div class="mb-4">
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Why are you reporting <span class="font-semibold text-gray-900 dark:text-white">{user.name}</span>?
          </p>
          
          <div class="space-y-3">
            {#each reasons as reason}
              <label class="block cursor-pointer group">
                <div class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                  {selectedReason === reason.value ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600' : ''}">
                  <input 
                    type="radio" 
                    name="reason" 
                    bind:group={selectedReason} 
                    value={reason.value} 
                    disabled={submitting}
                    class="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-900 dark:text-white">{reason.label}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{reason.description}</div>
                  </div>
                </div>
              </label>
            {/each}
          </div>
        </div>

        {#if selectedReason === 'other'}
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Please describe the issue (10-100 characters):
            </label>
            <textarea 
              bind:value={otherText}
              placeholder="Describe the specific issue..."
              maxlength="100"
              class="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="3"
              disabled={submitting}
            ></textarea>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {otherText.length}/100 characters
            </div>
          </div>
        {/if}

        {#if error}
          <div class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
            <div class="text-red-700 dark:text-red-300 text-sm">{error}</div>
          </div>
        {/if}

        <div class="flex gap-3 justify-end">
          <button 
            type="button" 
            on:click={handleClose}
            disabled={submitting}
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting || !selectedReason}
            class="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {#if submitting}
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Submitting...
            {:else}
              Submit Report
            {/if}
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>