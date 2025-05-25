<script lang="ts">
import LottiePlayer from '$lib/components/common/LottiePlayer.svelte';
  import ImageUploadModal from './ImageUploadModal.svelte';
  import { getDeviceFingerprint } from '$lib/utils/deviceFingerprint';
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';
  // emoji-picker-element is a web component
  let emojiPickerRef;
  let emojiPickerLoaded = false;

  import { onDestroy } from 'svelte';
  let emojiPickerCleanup;
  onMount(() => {
    if (typeof window !== 'undefined') {
      import('emoji-picker-element').then(() => {
        emojiPickerLoaded = true;
        setTimeout(() => {
          console.log('emojiPickerRef (onMount):', emojiPickerRef);
          if (emojiPickerRef) {
            emojiPickerRef.addEventListener('emoji-click', handleEmojiClick);
            emojiPickerRef.addEventListener('click', handlePickerAnyClick);
            emojiPickerCleanup = () => {
              emojiPickerRef.removeEventListener('emoji-click', handleEmojiClick);
              emojiPickerRef.removeEventListener('click', handlePickerAnyClick);
            };
          } else {
            console.warn('emojiPickerRef is not bound!');
          }
        }, 0);
      });
    }
  });
  onDestroy(() => {
    if (emojiPickerCleanup) emojiPickerCleanup();
  });
  export let onSend: (message: string) => void;

  let uploadCountToday = 0;
  function getUploadCountToday() {
    const fp = getDeviceFingerprint();
    const key = `img_uploads_${fp}_${new Date().toISOString().slice(0,10)}`;
    return Number(localStorage.getItem(key) || '0');
  }
  function incrementUploadCount() {
    const fp = getDeviceFingerprint();
    const key = `img_uploads_${fp}_${new Date().toISOString().slice(0,10)}`;
    const count = getUploadCountToday() + 1;
    localStorage.setItem(key, count.toString());
    uploadCountToday = count;
  }

  // Initialize uploadCountToday on mount
  onMount(() => {
    uploadCountToday = getUploadCountToday();
  });



  let message = '';
  let sending = false;
  let error = '';

  // Image upload modal state
  let showImageModal = false;

  // Character counter & input limit logic
  const MAX_CHAR = 120;
  function handleInput(e) {
    if (e.target.value.length > MAX_CHAR) {
      message = e.target.value.slice(0, MAX_CHAR);
    } else {
      message = e.target.value;
    }
  }

  // Emoji icon click handler
  let showEmojiPicker = false;
  let textareaRef: HTMLTextAreaElement;

  function handleEmojiIconClick() {
    showEmojiPicker = !showEmojiPicker;
  }



  // Handle emoji click from emoji-picker-element
  function handleEmojiClick(event) {
    console.log('emoji-click event:', event);
    const emoji = event.detail && event.detail.unicode;
    console.log('emoji from event:', emoji);
    if (!emoji) return;
    if (textareaRef) {
      const start = textareaRef.selectionStart;
      const end = textareaRef.selectionEnd;
      message = message.slice(0, start) + emoji + message.slice(end);
      // Move cursor after inserted emoji
      setTimeout(() => {
        textareaRef.focus();
        textareaRef.selectionStart = textareaRef.selectionEnd = start + emoji.length;
      }, 0);
    } else {
      message += emoji;
    }
    showEmojiPicker = false;
  }

  function handlePickerAnyClick(event) {
    console.log('emoji-picker element click:', event);
  }

  async function handleSubmit() {
    if (!message.trim() || sending) return;
    
    sending = true;
    error = '';
    
    try {
      await onSend(message.trim());
      message = '';
    } catch (err) {
      error = err.message || 'Failed to send message';
      // Clear error after 3 seconds
      setTimeout(() => {
        error = '';
      }, 3000);
    } finally {
      sending = false;
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  function handleImageIconClick() {
    showImageModal = true;
  }
  function handleImageCancel() {
    showImageModal = false;
  }
  function handleImageSend(imageUrl: string) {
    showImageModal = false;
    // Send a special message format, e.g. [image:url]
    if (imageUrl) {
      onSend(`[image:${imageUrl}]`);
      uploadCountToday = getUploadCountToday(); // Ensure counter updates after upload
    }
  }
</script>

<div class="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
  {#if error}
    <div class="mb-2 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm rounded">
      {error}
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit} class="flex items-end gap-1">
    <!-- Image upload icon button (left) -->
    <div class="flex flex-col items-center justify-center mr-1" style="height: 40px;">
      <button type="button" class="p-1 rounded-full image-btn-custom" on:click={handleImageIconClick} aria-label="Upload image">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 image-icon-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2" stroke="currentColor" fill="none"/>
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5a2.828 2.828 0 0 0-4 0l-7 7" stroke-width="2" stroke="currentColor" fill="none" />
        </svg>
      </button>
      <div class="text-xs text-gray-500 font-semibold mt-0.5">{uploadCountToday}/10</div>
    </div>
    <div class="relative flex-1">
      <div class="absolute bottom-full right-0 mb-2 z-50" style="min-width:320px;max-width:400px;" class:hidden={!showEmojiPicker}>
        <emoji-picker
          bind:this={emojiPickerRef}
          style="box-shadow: 0 2px 16px rgba(0,0,0,0.14); border-radius: 12px; font-size: 18px;"
        />
      </div>
      <textarea
        bind:this={textareaRef}
        bind:value={message}
        on:keydown={handleKeyDown}
        on:input={handleInput}
        placeholder="Type your message..."
        class="w-full resize-none rounded-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-base min-h-[44px] max-h-[120px]"
        rows="1"
        maxlength={120}
        disabled={sending}
        style="min-width:260px;"
      ></textarea>
      <!-- Emoji icon button (right, inside input) -->
      <button type="button" class="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-full emoji-btn-custom" on:click={handleEmojiIconClick} aria-label="Insert emoji" tabindex="0">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 emoji-icon-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" stroke-width="2" fill="none"/>
          <circle cx="9" cy="10" r="1" fill="currentColor" />
          <circle cx="15" cy="10" r="1" fill="currentColor" />
        </svg>
      </button>
    </div>
    <button
      type="submit"
      disabled={!message.trim() || sending}
      class="ml-1 rounded-full text-white send-btn-custom disabled:opacity-50 disabled:cursor-not-allowed"
      style="background:#229c90; min-width:40px; min-height:40px; width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:0; position:relative; top:-2px;"  aria-label="Send message"
    >
      {#if sending}
        <svg class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      {:else}
        <span style="display:inline-block;width:24px;height:24px;">
          <LottiePlayer src="/icons/send.json" autoplay={true} speed={0.6} />
        </span>
      {/if}
    </button>
    <style>
      .send-btn-custom {
        background: #229c90;
        transition: background 0.18s;
        box-shadow: 0 1px 4px rgba(34,156,144,0.08);
      }
      .send-btn-custom:hover:not(:disabled), .send-btn-custom:focus:not(:disabled) {
        background: #18776d;
      }
      .image-btn-custom {
        color: #229c90;
        background: transparent;
        transition: background 0.18s;
      }
      .image-btn-custom:hover, .image-btn-custom:focus {
        background: #e0f6f3;
      }
      .image-icon-custom {
        color: #229c90;
        stroke: #229c90;
      }
      .emoji-btn-custom {
        color: #229c90;
        background: transparent;
        transition: background 0.18s;
      }
      .emoji-btn-custom:hover, .emoji-btn-custom:focus {
        background: #e0f6f3;
      }
      .emoji-icon-custom {
        color: #229c90;
        stroke: #229c90;
      }
    </style>
  </form>

  <div class="flex items-center justify-between mt-1">
    <div></div>
    <div class="text-xs font-semibold" style="color: {message.length >= 120 ? '#ef4444' : message.length >= 110 ? '#f59e42' : message.length >= 100 ? '#fde047' : '#6b7280'}">
      {message.length}/120
    </div>
  </div>
  {#if message.length >= 120}
    <div class="text-xs text-red-600 mt-1">You've reached the message character limit.</div>
  {/if}
  {#if showImageModal}
    <ImageUploadModal onSend={handleImageSend} onCancel={handleImageCancel} />
  {/if}
</div>