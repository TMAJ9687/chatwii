<script lang="ts">
  export let gender: 'female' | 'male' | null;
  export let setGender: (g: 'female' | 'male') => void;
</script>
<div class="flex gap-4 justify-center mt-2 mb-6">
  <button
    type="button"
    class="px-6 py-2 rounded-full border font-medium focus:outline-none focus:ring-2 transition shadow-sm"
    class:bg-pink-100={gender === 'female'}
    class:border-pink-300={gender === 'female'}
    class:text-pink-600={gender === 'female'}
    class:bg-white={gender !== 'female'}
    class:border-gray-200={gender !== 'female'}
    class:text-gray-700={gender !== 'female'}
    on:click={() => setGender('female')}
    aria-pressed={gender === 'female'}
  >
    Female
  </button>
  <button
    type="button"
    class="px-6 py-2 rounded-full border font-medium focus:outline-none focus:ring-2 transition shadow-sm"
    class:bg-blue-100={gender === 'male'}
    class:border-blue-300={gender === 'male'}
    class:text-blue-600={gender === 'male'}
    class:bg-white={gender !== 'male'}
    class:border-gray-200={gender !== 'male'}
    class:text-gray-700={gender !== 'male'}
    on:click={() => setGender('male')}
    aria-pressed={gender === 'male'}
  >
    Male
  </button>
</div>
