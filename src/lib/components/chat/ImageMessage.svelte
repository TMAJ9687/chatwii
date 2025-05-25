<script lang="ts">
  export let src: string; // Image URL
  export let alt = 'Image';
  let revealed = false;
  let showModal = false;

  function handleReveal() {
    revealed = true;
  }
  function handleRevert() {
    revealed = false;
  }
  function handleShowModal() {
    showModal = true;
  }
  function handleCloseModal() {
    showModal = false;
  }
</script>

<div class="relative w-[300px] h-[300px] max-w-full max-h-[300px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
  <img
    src={src}
    alt={alt}
    class="object-cover w-full h-full transition-all duration-300 {revealed ? '' : 'blur-[12px]'} grayscale cursor-pointer"
    on:click={() => revealed && handleShowModal()}
    draggable={false}
  />
  <div class="absolute bottom-2 left-2 flex gap-2">
    {#if !revealed}
      <button class="px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700" on:click={handleReveal}>Reveal</button>
    {:else}
      <button class="px-2 py-1 rounded bg-gray-600 text-white text-xs hover:bg-gray-700" on:click={handleRevert}>Revert</button>
    {/if}
  </div>
</div>

{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
    <div class="relative max-w-3xl w-full max-h-[90vh] flex items-center justify-center">
      <img src={src} alt={alt} class="object-contain max-w-full max-h-[80vh] bg-white rounded-lg" draggable={false} />
      <button class="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" on:click={handleCloseModal}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  </div>
{/if}
