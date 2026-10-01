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
        const availableHeight = window.visualViewport?.height ?? window.innerHeight;
        if (bottom > availableHeight - BOTTOM_CLEARANCE) {
          window.scrollBy({ top: bottom - availableHeight + BOTTOM_CLEARANCE, behavior: 'instant' });
        }
      });
    };

    document.addEventListener('focusin', keepLinkVisible);
    return () => document.removeEventListener('focusin', keepLinkVisible);
  }, []);
}