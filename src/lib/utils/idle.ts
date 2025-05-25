// src/lib/utils/idle.ts
export function setupIdleTimer(
  timeoutMs: number,
  onIdle: () => void
) {
  let timer: ReturnType<typeof setTimeout>;
  const reset = () => {
    clearTimeout(timer);
    timer = setTimeout(onIdle, timeoutMs);
  };

  ['mousemove','mousedown','keydown','touchstart','scroll'].forEach(evt =>
    window.addEventListener(evt, reset)
  );

  // start immediately
  reset();

  return () => {
    clearTimeout(timer);
    ['mousemove','mousedown','keydown','touchstart','scroll'].forEach(evt =>
      window.removeEventListener(evt, reset)
    );
  };
}
