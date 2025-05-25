<script lang="ts">
  export let count: number = 0;
</script>

{#if count > 0}
  <span class="inbox-badge">{count}</span>
{/if}

<style>
.inbox-badge {
  position: absolute;
  top: -0.25em;
  right: -0.25em;
  background: #ef4444;
  color: #fff;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 9999px;
  padding: 0.15em 0.55em;
  box-shadow: 0 1px 5px rgba(0,0,0,0.15);
  min-width: 1.5em;
  text-align: center;
  line-height: 1.2;
  pointer-events: none;
  user-select: none;
  z-index: 10;
}
</style>
