<script lang="ts">
  export let content: string = '';
  export let isSender: boolean = false;

  // Simple, safe regex for most emoji (covers most single-codepoint emoji)
  const emojiRegex = /([\p{Emoji}])/gu;

  function enhanceEmojis(text: string) {
    // Wrap emojis in a span for styling
    return text.replace(emojiRegex, '<span class="chat-emoji">$1</span>');
  }
</script>

<div class="flex w-full mb-1" class:flex-row-reverse={isSender} class:flex-row={!isSender}>
  <div
    class="relative max-w-[70%] px-4 py-2 text-base rounded-2xl message-bubble-content"
    style="background-color: {isSender ? '#04ab95' : '#e5e7eb'}; color: {isSender ? 'white' : '#111827'};"
  >
    {@html enhanceEmojis(content)}
    {#if isSender}
      <span class="absolute bottom-0 right-0 w-4 h-4 overflow-hidden" style="right: -8px;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M0 0 Q8 16 16 0" fill="#04ab95" />
        </svg>
      </span>
    {:else}
      <span class="absolute bottom-0 left-0 w-4 h-4 overflow-hidden" style="left: -8px;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M16 0 Q8 16 0 0" fill="#e5e7eb" />
        </svg>
      </span>
    {/if}
  </div>
</div>

<style>
.message-bubble-content .chat-emoji {
  font-size: 1.2em;
  vertical-align: middle;
}
</style>
