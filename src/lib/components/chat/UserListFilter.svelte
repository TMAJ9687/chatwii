<script lang="ts">
import { onClickOutside } from '$lib/utils/onClickOutside';
import { createEventDispatcher } from 'svelte';
import FlagIcon from '$lib/components/common/FlagIcon.svelte';

export let filterGender: string[] = [];
export let filterAge: [number, number] = [18, 80];
export let filterCountries: string[] = [];
export let ignoreSelector: string | undefined = undefined;
import { countries as allCountriesRaw } from '$lib/data/countries';

// Prepare countries list: fallback any non-Israel country to Palestine, else use the country
const allCountries = allCountriesRaw.map(c =>
  c.code === 'IL' ? { code: 'PS', name: 'Palestine' } : c
);

export let maxCountries = 2;

const dispatch = createEventDispatcher();

function clearFilters() {
  dispatch('clear');
}

function close() {
  dispatch('close');
}

function handleCountryToggle(countryCode: string) {
  let newSelection = [...filterCountries];
  
  if (newSelection.includes(countryCode)) {
    // Remove if already selected
    newSelection = newSelection.filter(code => code !== countryCode);
  } else {
    // Add if not selected and under limit
    if (newSelection.length < maxCountries) {
      newSelection.push(countryCode);
    }
  }
  
  dispatch('updateCountries', newSelection);
}

function removeCountry(countryCode: string) {
  const newSelection = filterCountries.filter(code => code !== countryCode);
  dispatch('updateCountries', newSelection);
}
</script>

<div class="absolute right-0 mt-2 z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 w-64 userlist-filter-popover" use:onClickOutside on:click_outside>
  <div class="mb-3">
    <div class="font-semibold text-xs mb-1">Gender</div>
    <label class="flex items-center gap-2 text-sm mb-1">
      <input type="checkbox" value="male" checked={filterGender.includes('male')} on:change={() => dispatch('updateGender', 'male')} /> Male
    </label>
    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" value="female" checked={filterGender.includes('female')} on:change={() => dispatch('updateGender', 'female')} /> Female
    </label>
  </div>
  
  <div class="mb-3">
    <div class="font-semibold text-xs mb-1">Age Range</div>
    <div class="flex items-center gap-2">
      <input type="range" min="18" max="80" value={filterAge[0]} step="1" class="w-20" on:input={e => dispatch('updateAge', [parseInt(e.target.value), filterAge[1]])} />
      <span class="text-xs">{filterAge[0]}</span>
      <span>-</span>
      <input type="range" min="18" max="80" value={filterAge[1]} step="1" class="w-20" on:input={e => dispatch('updateAge', [filterAge[0], parseInt(e.target.value)])} />
      <span class="text-xs">{filterAge[1]}</span>
    </div>
  </div>
  
  <div class="mb-3">
    <div class="font-semibold text-xs mb-1">Country</div>
    
    <!-- Selected countries display -->
    {#if filterCountries.length > 0}
      <div class="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
        {#each filterCountries as code}
          {@const country = allCountries.find(c => c.code === code)}
          {#if country}
            <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              <FlagIcon code={code} width={16} height={12} />
              {country.name}
              <button 
                type="button" 
                class="ml-1 text-blue-600 hover:text-blue-800 font-bold"
                on:click={() => removeCountry(code)}
              >
                ×
              </button>
            </span>
          {/if}
        {/each}
      </div>
    {/if}
    
    <!-- Country selection list -->
    <div class="max-h-32 overflow-y-auto border rounded text-sm">
      {#each allCountries as country}
        {@const isSelected = filterCountries.includes(country.code)}
        {@const isDisabled = !isSelected && filterCountries.length >= maxCountries}
        <label class="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer {isDisabled ? 'opacity-50 cursor-not-allowed' : ''}">
          <input 
            type="checkbox" 
            checked={isSelected}
            disabled={isDisabled}
            on:change={() => handleCountryToggle(country.code)}
          />
          <FlagIcon code={country.code} width={18} height={12} />
          <span class="text-xs">{country.name}</span>
        </label>
      {/each}
    </div>
    
    <div class="text-xs text-gray-400 mt-1">
      {filterCountries.length}/{maxCountries} countries selected
    </div>
  </div>
  
  <button class="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-xs rounded p-1 font-semibold" on:click={clearFilters} type="button">
    Clear Filter
  </button>
</div>

<style>
  .userlist-filter-popover {
    outline: none;
  }
</style>