<script lang="ts">
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { supabase } from '$lib/services/supabaseClient';
import { countries } from '$lib/data/countries';
import { interestsList } from '$lib/data/interests';
import GenderSelect from '$lib/components/profiles/GenderSelect.svelte';
import InterestsSelect from '$lib/components/profiles/InterestsSelect.svelte';
import CountryBadge from '$lib/components/common/CountryBadge.svelte';
import { onClickOutside } from '$lib/utils/onClickOutside';
let nickname = '';
let gender: 'female' | 'male' | null = null;
let age: number | null = null;
let country_code = '';
let selectedCountryName = '';
let interests: string[] = [];
let loading = false;
let error = '';
onMount(async () => {
  let user = null;
  if (supabase.auth.getUser) {
    // Supabase JS v2
    const { data, error } = await supabase.auth.getUser();
    user = data?.user;
  } else if (supabase.auth.user) {
    // Supabase JS v1 fallback
    user = supabase.auth.user();
  }
  if (user && user.user_metadata && user.user_metadata.nickname) {
    nickname = user.user_metadata.nickname;
  } else {
    error = 'You must be logged in to complete your profile.';
    return;
  }
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      gender = data.gender;
      age = data.age;
      country_code = data.country_code;
      interests = data.interests || [];
    }
  }
  const c = countries.find((c) => c.code === country_code);
  if (c) selectedCountryName = c.name;
  else {
    country_code = 'US';
    selectedCountryName = 'United States';
  }
});
function setGender(g) { gender = g; }
function setInterests(v) { interests = v; }
async function submit() {
  loading = true; error = '';
  try {
    let user = null;
    if (supabase.auth.getUser) {
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    } else if (supabase.auth.user) {
      user = supabase.auth.user();
    }
    if (!user) throw new Error('You must be logged in to continue.');
    await supabase.from('profiles').upsert({
      id: user.id,
      nickname: user.user_metadata.nickname,
      role: 'standard', gender, age, country_code, interests
    });
    goto('/chat');
  } catch (e) {
    error = e.message || 'Error saving profile.';
  } finally { loading = false; }
}
</script>
<div class="min-h-screen flex items-center justify-center bg-parchment">
  <form class="bg-white rounded-2xl shadow-xl px-8 py-7 max-w-md w-full border border-gray-100 relative" on:submit|preventDefault={submit}>
    <button type="button" class="text-orange-400 text-sm absolute left-6 top-5" on:click={() => goto('/')}>Back</button>
    <h2 class="text-center text-2xl font-bold mb-4 mt-8">Hi, {nickname}</h2>
    <label class="block font-semibold text-center mt-4">Gender <span class="text-red-400">*</span></label>
    <GenderSelect {gender} {setGender} />
    <label class="block font-semibold text-center">Age <span class="text-red-400">*</span></label>
    <select class="w-full rounded-xl border border-gray-200 bg-orange-50 px-4 py-3 mt-1 mb-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-200 transition mx-auto" bind:value={age} required>
      <option value="" disabled selected>Select age</option>
      {#each Array(63) as _, i}
        <option value={i+18}>{i+18}</option>
      {/each}
    </select>
    <button type="submit" class="w-full bg-orange-500 text-white font-semibold py-3 rounded-full mt-2 shadow hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={!gender || !age || loading}>
      {#if loading}
        <svg class="animate-spin h-5 w-5 mr-2 inline-block" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        Saving…
      {:else}
        Continue to Chat
      {/if}
    </button>
    <label class="block font-semibold mt-6">Country</label>
    <CountryBadge code={country_code || 'US'} name={selectedCountryName || 'United States'} className="w-full mb-4" style="min-width:260px" />
    <label class="block font-semibold">Interests <span class="text-gray-400 font-normal">(max 2)</span></label>
    <InterestsSelect {interests} {setInterests} options={interestsList} onCloseMenu={() => {}} />
    {#if error}
      <div class="text-red-500 text-sm mb-2">{error}</div>
    {/if}

  </form>
</div>
