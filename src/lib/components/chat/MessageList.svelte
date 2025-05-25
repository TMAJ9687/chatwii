<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import MessageBubble from './MessageBubble.svelte';
  import ScrollToBottom from './ScrollToBottom.svelte';
  import ImageMessage from './ImageMessage.svelte';

  export let messages: Array<{ id: string; sender_id: string; content: string; created_at: string }> = [];
  export let currentUserId: string = 'me'; // Pass from parent

  let container: HTMLDivElement;
  let showScrollDown = false;
  let isNearBottom = true;

  function scrollToBottom(smooth = true) {
    if (container) {
      const behavior = smooth ? 'smooth' : 'auto';
      container.scrollTo({ top: container.scrollHeight, behavior });
    }
  }

  function handleScroll() {
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
    showScrollDown = !isNearBottom;
  }

  // Scroll to bottom on mount
  onMount(() => {
    scrollToBottom(false);
  });

  // Scroll to bottom on new messages if near bottom
  let prevLen = messages.length;
  afterUpdate(() => {
    if (messages.length !== prevLen) {
      prevLen = messages.length;
      if (isNearBottom) scrollToBottom();
    }
  });
</script>
<div
  class="h-full px-6 py-4 space-y-2 bg-white dark:bg-gray-900 relative overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
  bind:this={container}
  on:scroll={handleScroll}
>
  {#if messages.length === 0}
    <div class="text-gray-400 text-center mt-8">No messages yet.</div>
  {:else}
    {#each messages as msg (msg.id)}
      <div class="mb-2 flex flex-col items-{msg.sender_id === currentUserId ? 'end' : 'start'}">
        {#if typeof msg.content === 'string' && msg.content.startsWith('[image:') && msg.content.endsWith(']')}
          <ImageMessage src={msg.content.slice(7, -1)} alt="Image message" />
        {:else}
          <MessageBubble content={msg.content} isSender={msg.sender_id === currentUserId} />
        {/if}
        <div class="text-xs text-gray-400 mt-1 mb-2" style="text-align: {msg.sender_id === currentUserId ? 'right' : 'left'}">
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    {/each}
  {/if}
  <ScrollToBottom show={showScrollDown} onClick={() => scrollToBottom()} />
</div>
