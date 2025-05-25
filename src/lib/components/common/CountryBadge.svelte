<script lang="ts">
  export let code: string = 'US';
  export let name: string = 'United States';
  export let className: string = '';
  export let style: string = '';
</script>
<div class={`flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 ${className}`} style={style}>
  <img
    src={`/flags/${(code || 'us').toLowerCase()}.svg`}
    alt={name || 'United States'}
    class="h-6 w-8 rounded shadow border bg-white object-cover"
    on:error={(e) => e.target.src = '/flags/us.svg'}
  />
  <span class="font-medium text-base">{name || 'United States'}</span>
</div>
