<script lang="ts">
  export let code: string = 'US';
  export let width: number = 20;
  export let height: number = 20;
  export let className: string = '';
</script>
<img
  src={`/flags/${(code || 'us').toLowerCase()}.svg`}
  alt={code}
  class={`inline-block rounded object-cover border bg-white shadow ${className}`}
  style={`width: ${width}px; height: ${height}px; min-width: ${width}px; min-height: ${height}px;`}
  on:error={(e) => e.target.src = '/flags/us.svg'}
/>
