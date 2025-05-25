/**
 * Svelte action for detecting clicks outside an element.
 * Usage: <div use:onClickOutside={{handler, ignoreSelector}}>
 */
type OnClickOutsideOptions = {
  handler: () => void;
  ignoreSelector?: string;
};

export function onClickOutside(node: HTMLElement, options: OnClickOutsideOptions) {
  // Handle case where options might be undefined during initial render
  if (!options || typeof options !== 'object') {
    return {
      update(newOptions: OnClickOutsideOptions) {
        // Re-initialize when proper options are provided
        if (newOptions && typeof newOptions === 'object' && newOptions.handler) {
          return onClickOutside(node, newOptions);
        }
      },
      destroy() {}
    };
  }

  let currentHandler = options.handler;
  let currentIgnoreSelector = options.ignoreSelector;
  let timeoutId: number;
  let isListening = false;

  const handleClick = (event: MouseEvent) => {
    if (!event.target || !node || !currentHandler || typeof currentHandler !== 'function') return;

    const target = event.target as HTMLElement;

    // Check if the click is inside any element matching the ignore selector
    const isIgnored = currentIgnoreSelector 
      ? target.closest(currentIgnoreSelector) !== null
      : false;

    if (!node.contains(target) && !isIgnored) {
      try {
        currentHandler();
      } catch (error) {
        console.warn('Error in onClickOutside handler:', error);
      }
    }
  };

  const startListening = () => {
    if (!isListening && typeof currentHandler === 'function') {
      document.addEventListener('mousedown', handleClick, true);
      isListening = true;
    }
  };

  const stopListening = () => {
    if (isListening) {
      document.removeEventListener('mousedown', handleClick, true);
      isListening = false;
    }
  };

  if (typeof currentHandler === 'function') {
    timeoutId = setTimeout(startListening, 100);
  } else {
    timeoutId = setTimeout(() => {
      if (typeof currentHandler === 'function') {
        startListening();
      }
    }, 250);
  }

  return {
    update(newOptions: OnClickOutsideOptions) {
      if (!newOptions || typeof newOptions !== 'object') return;
      
      currentHandler = newOptions.handler;
      currentIgnoreSelector = newOptions.ignoreSelector;
      if (!isListening && newOptions.handler && typeof newOptions.handler === 'function') {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(startListening, 100);
      }
    },
    destroy() {
      clearTimeout(timeoutId);
      stopListening();
    }
  };
}