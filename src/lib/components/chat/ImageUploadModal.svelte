<script lang="ts">
  import { onClickOutside } from '$lib/utils/onClickOutside';
  import { getDeviceFingerprint } from '$lib/utils/deviceFingerprint';
  import { supabase } from '$lib/supabaseClient';
  export let onSend: (imageUrl: string) => void;
  export let onCancel: () => void;
  let file: File | null = null;
  let previewUrl = '';
  let error = '';
  let loading = false;
  let progress = 0;
  let dragActive = false;

  // Supabase config (replace with your env vars if needed)
  const BUCKET = 'message-media';

  // Upload limit logic
  const MAX_UPLOADS = 10;
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

  import { onMount } from 'svelte';
  onMount(() => {
    uploadCountToday = getUploadCountToday();
  });

  function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) selectFile(input.files[0]);
  }
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragActive = false;
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
    }
  }
  function handleDrag(e: DragEvent) {
    e.preventDefault();
    dragActive = e.type === 'dragenter';
  }
  function selectFile(f: File) {
    if (!f.type.startsWith('image/')) {
      error = 'Only image files are allowed.';
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      error = 'Image must be <4MB.';
      return;
    }
    file = f;
    error = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      previewUrl = ev.target?.result as string;
    };
    reader.readAsDataURL(f);
  }

  async function handleSend() {
    if (!file) {
      error = 'No image selected.';
      return;
    }
    if (getUploadCountToday() >= MAX_UPLOADS) {
      error = 'Upload limit reached (10 per day).';
      return;
    }
    loading = true;
    error = '';
    progress = 0;
    try {
      // Unique filename: device + timestamp + random
      const fp = getDeviceFingerprint();
      const ext = file.name.split('.').pop();
      const filename = `img_${fp}_${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;
      // DEBUG: log file and type
      console.log('Uploading file:', file, 'type:', file.type);
      // Remove metadata for now
      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });
      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        error = JSON.stringify(uploadError) || uploadError.message || uploadError.error_description || 'Upload failed (Supabase)';
        return;
      }
      // Get public URL
      const { data: pub, error: pubError } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      if (pubError || !pub || !pub.publicUrl) {
        console.error('Supabase public URL error:', pubError);
        error = pubError?.message || 'Failed to get image URL';
        return;
      }
      incrementUploadCount();
      onSend(pub.publicUrl);
    } catch (e: any) {
      console.error('Image upload exception:', e);
      error = e.message || 'Upload failed (exception)';
    } finally {
      loading = false;
      progress = 0;
    }
  }

  function handleCancel() {
    file = null;
    previewUrl = '';
    error = '';
    onCancel();
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-sm relative" use:onClickOutside={onCancel} tabindex="0">
    <h2 class="text-lg font-bold mb-2 text-center">Send Image</h2>
    <div class="text-center text-sm font-semibold mb-2">
      {uploadCountToday}/{MAX_UPLOADS} images uploaded today
    </div>
    <div 
      class="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-xl p-4 bg-blue-50 dark:bg-gray-800 transition mb-3 cursor-pointer hover:border-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
      on:drop={handleDrop}
      on:dragover|preventDefault
      on:dragenter={handleDrag}
      on:dragleave={handleDrag}
      class:!border-blue-500={dragActive}
      class:!bg-blue-100={dragActive}
      tabindex="0"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
      <input type="file" accept="image/*" on:change={handleFileChange} class="hidden" id="imgfile" />
      <label for="imgfile" class="text-blue-600 cursor-pointer font-medium">{file ? 'Change Image' : 'Click or Drag to Upload'}</label>
      <span class="text-xs text-gray-500 mt-1">Max 4MB, image only</span>
    </div>
    {#if previewUrl}
      <div class="mb-4 flex items-center justify-center">
        <img src={previewUrl} alt="Preview" class="rounded-xl object-cover shadow-lg border border-gray-200 dark:border-gray-700" style="width: 300px; height: 300px; max-width: 100%; max-height: 300px;" />
      </div>
    {/if}
    {#if error}
      <div class="text-red-500 text-sm mb-2 text-center">{error}</div>
    {/if}
    {#if loading}
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div class="h-full bg-blue-500 transition-all" style="width: {progress * 100}%"></div>
      </div>
      <div class="text-blue-600 text-sm text-center mb-2">Uploading...</div>
    {/if}
    <div class="flex gap-3 justify-end mt-2">
      <button class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50" on:click={handleCancel} disabled={loading}>Cancel</button>
      <button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60" on:click={handleSend} disabled={!file || loading}>Send</button>
    </div>
  </div>
</div>
