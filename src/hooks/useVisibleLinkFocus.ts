import { useEffect } from 'react';

const BOTTOM_CLEARANCE = 120;

export function useVisibleLinkFocus() {
  useEffect(() => {
    const keepLinkVisible = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLAnchorElement) || !target.matches(':focus-visible')) return;

      requestAnimationFrame(() => {
        if (document.activeElement !== target) return;
        const bottom = target.getBoundingClientRect().bottom;
        const visualViewport = window.visualViewport;
        const viewportBottom = visualViewport
          ? visualViewport.offsetTop + visualViewport.height
          : window.innerHeight;
        if (bottom > viewportBottom - BOTTOM_CLEARANCE) {
          window.scrollBy({ top: bottom - viewportBottom + BOTTOM_CLEARANCE, behavior: 'instant' });
        }
      });
    };

    document.addEventListener('focusin', keepLinkVisible);
    return () => document.removeEventListener('focusin', keepLinkVisible);
  }, []);
}