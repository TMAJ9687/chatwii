<script lang="ts">
import FlagIcon from '$lib/components/common/FlagIcon.svelte';
import { onMount } from 'svelte';
import { chatStore } from '$lib/stores/chatStore';
import UserListFilter from './UserListFilter.svelte';

export let users = [];
export let selectedUser = null;
export let onSelect = (user) => {};
export let currentUserId = '';

let blockedUsers = [];

// Filter state
let showFilter = false;
let filterGender: string[] = [];
let filterAge = [18, 80];
let filterCountries: string[] = [];
let filterActive = false;

import { countries as allCountriesRaw } from '$lib/data/countries';

// Prepare countries list: fallback any non-Israel country to Palestine, else use the country
$: allCountries = allCountriesRaw.map(c =>
  c.code === 'IL' ? c : { code: 'PS', name: 'Palestine' }
);

// (Optional) Set maxCountries based on user role
let maxCountries = 2; // TODO: make dynamic for VIP/admin

// Subscribe to blocked users
onMount(() => {
  const unsubscribe = chatStore.blockedUsers.subscribe(storeBlocked => {
    blockedUsers = storeBlocked;
  });
  return unsubscribe;
});

// Only show users who are not the current user and have completed their profile
$: displayUsers = users.filter(u => {
  if (u.id === currentUserId || !u.nickname || !u.nickname.trim().length) return false;
  if (filterGender.length && !filterGender.includes(u.gender)) return false;
  if (u.age < filterAge[0] || u.age > filterAge[1]) return false;
  if (filterCountries.length && !filterCountries.includes(u.country?.code)) return false;
  return true;
});

$: filterActive = !!(filterGender.length || filterCountries.length || filterAge[0] !== 18 || filterAge[1] !== 80);

// Check if a user is blocked
function isUserBlocked(userId) {
  return blockedUsers.includes(userId);
}

function clearFilters() {
  filterGender = [];
  filterAge = [18, 80];
  filterCountries = [];
}

function toggleFilter(event) {
  event.stopPropagation(); // Prevent the click from bubbling up
  event.preventDefault(); // Also prevent default behavior
  showFilter = !showFilter;
}
</script>

<div class="px-2 py-2 h-full flex flex-col">
  <div class="bg-gray-300 rounded-xl p-1.5 flex-shrink-0">
    <!-- Online users header -->
    <div class="flex items-center justify-between mb-2 px-2">
      <span class="text-xs font-semibold text-gray-500">Online users ({displayUsers.length})</span>
      <div class="relative">
        <button 
          data-filter-trigger
          class="p-1 hover:bg-gray-100 rounded transition relative" 
          aria-label="Filter users"
          class:!bg-blue-100={filterActive}
          on:click={toggleFilter}
          on:mousedown|stopPropagation
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          {#if filterActive}
            <span class="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
          {/if}
        </button>
        {#if showFilter}
          <UserListFilter
            ignoreSelector="[data-filter-trigger]"
            {filterGender}
            {filterAge}
            {filterCountries}
            {allCountries}
            {maxCountries}
            on:updateGender={e => {
              const gender = e.detail;
              if (filterGender.includes(gender)) {
                filterGender = filterGender.filter(g => g !== gender);
              } else {
                filterGender = [...filterGender, gender];
              }
            }}
            on:updateAge={e => filterAge = e.detail}
            on:updateCountries={e => filterCountries = e.detail}
            on:clear={clearFilters}
            on:close={() => showFilter = false}
          />
        {/if}
      </div>
    </div>
  </div>
  <div class="flex-grow overflow-y-auto pr-1">
    {#each displayUsers as user}
      {@const isBlocked = isUserBlocked(user.id)}
      <div class="mb-1 mt-1 w-full">
        <div
          class="py-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border bg-white dark:bg-gray-800 shadow-sm flex items-center cursor-pointer transition-all gap-2 h-[88px] min-h-[88px]
            {user.role === 'VIP' ? 'vip-card' : ''} 
            {user.role === 'ADMIN' ? 'admin-card' : ''} 
            {isBlocked ? 'blocked-card' : ''}"
          on:click={() => { 
            if (!isBlocked) {
              selectedUser = user; 
              onSelect(user); 
            }
          }}
        >
        <!-- Avatar with role border -->
        <img
          src={user.avatar || `/avatars/standard/${user.gender || 'male'}.png`}
          alt={user.name}
          class="w-[62px] h-[62px] rounded-full object-cover border-2
            {user.role === 'ADMIN' ? 'border-red-500' : user.role === 'VIP' ? 'border-yellow-400' : 'border-gray-300'}
            {isBlocked ? 'grayscale opacity-60' : ''}"
        />
        <!-- Main info line -->
        <div class="flex-1 min-w-0 flex flex-col justify-center">
          <div class="flex items-center gap-1 min-w-0">
            <span class="font-semibold text-gray-800 dark:text-gray-200 truncate text-base {isBlocked ? 'opacity-60' : ''}">{user.name}</span>
            {#if isBlocked}
              <span class="ml-1 text-red-500 flex-shrink-0 flex items-center" title="Blocked user">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
              </span>
            {/if}
            {#if user.role === 'ADMIN'}
              <span class="ml-1 text-xs bg-red-600 text-white px-1 py-0.5 rounded font-bold animate-pulse flex-shrink-0">ADMIN</span>
            {:else if user.role === 'VIP'}
              <span class="ml-1 text-xs bg-yellow-400 text-gray-900 px-1 py-0.5 rounded font-bold flex-shrink-0">VIP</span>
            {/if}
            <span class="ml-2 flex items-center gap-1 flex-shrink-0 {isBlocked ? 'opacity-60' : ''}">
              {#if user.gender === 'female'}
                <svg class="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a6 6 0 0 0-1 11.9V17H9a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2v-3.1A6 6 0 0 0 12 2zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>
              {:else}
                <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 2h-4a1 1 0 1 0 0 2h1.586l-3.293 3.293a6 6 0 1 0 1.414 1.414L18 5.414V7a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1zm-7 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>
              {/if}
              <span class="text-xs text-gray-700 dark:text-gray-200 font-medium">{user.age}</span>
            </span>
          </div>
          <!-- Country flag and name below main info -->
          <div class="flex items-center justify-start gap-1 mt-1 mb-1 {isBlocked ? 'opacity-60' : ''}">
            <FlagIcon code={user.country.code} width={28} height={20} />
            <span class="text-xs text-gray-500 font-semibold">{user.country.name}</span>
          </div>
          <!-- Interests -->
          <div class="flex flex-wrap gap-1 mt-1 {isBlocked ? 'opacity-60' : ''}">
            {#each (user.interests || []).slice(0, (user.role === 'VIP' || user.role === 'ADMIN') ? 3 : 2) as interest, i}
              <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg truncate interest-tag">{interest}</span>
              {#if ((user.role === 'VIP' || user.role === 'ADMIN') && i === 2 && (user.interests || []).length > 3) || (user.role !== 'VIP' && user.role !== 'ADMIN' && i === 1 && (user.interests || []).length > 2)}
                <span class="text-xs text-gray-400">...</span>
              {/if}
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/each}
  </div>
</div>

<style>
  .vip-card {
    box-shadow: 0 0 8px rgba(252, 211, 77, 0.5);
    border-color: rgba(252, 211, 77, 0.5);
  }
  .admin-card {
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
    border-color: rgba(239, 68, 68, 0.6);
  }
  .blocked-card {
    background-color: #f8f8f8 !important;
    border-color: #d1d5db !important;
    opacity: 0.7;
    cursor: not-allowed !important;
  }
  .blocked-card:hover {
    background-color: #f8f8f8 !important;
  }
  .avatar-container {
    transform: scale(1.15);
  }
  .interest-tag {
    line-height: 1.2;
    max-width: 100px;
  }
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 4px rgba(255, 0, 0, 0.8), 0 0 8px rgba(255, 0, 0, 0.6);
    }
    50% {
      box-shadow: 0 0 8px rgba(255, 0, 0, 1), 0 0 12px rgba(255, 0, 0, 0.9);
    }
  }
  .animate-glow {
    animation: glow 1.5s infinite;
  }
</style>