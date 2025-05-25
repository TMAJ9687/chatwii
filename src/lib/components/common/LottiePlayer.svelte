<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import lottie from 'lottie-web';
  export let src: string; // URL to the JSON file
  export let autoplay: boolean = true;
  export let speed: number = 1;
  let container: HTMLDivElement;
  let animation: any;

  onMount(async () => {
    animation = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true, // Always loop for persistent animation
      autoplay,
      path: src,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
    });
    animation.setSpeed(speed);
  });
  onDestroy(() => {
    if (animation) animation.destroy();
  });
</script>

<div bind:this={container} class="w-full h-full flex items-center justify-center"></div>
