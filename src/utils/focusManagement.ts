/**
 * Focus Management Utilities
 * 
 * WCAG 2.1 AA Compliance - Issue #21: Focus Indicator Visibility
 * WCAG 2.4.7 Focus Visible (Level AA)
 * 
 * Provides utilities to ensure focused elements remain visible
 * and don't get hidden behind fixed headers or browser chrome.
 */

/**
 * Ensures an element is scrolled into view and remains visible
 * even when behind fixed headers or browser UI.
 * 
 * @param element - The HTML element to bring into view
 * @param options - Optional scroll behavior configuration
 * 
 * @example
 * ```typescript
 * const submitButton = document.getElementById('submit-button');
 * if (submitButton) {
 *   ensureFocusVisible(submitButton);
 * }
 * ```
 */
export const ensureFocusVisible = (
  element: HTMLElement,
  options: ScrollIntoViewOptions = {}
): void => {
  const defaultOptions: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: 'center', // Keep element in middle of viewport
    inline: 'nearest',
  };

  element.scrollIntoView({ ...defaultOptions, ...options });
};

/**
 * Sets focus on an element and ensures it's visible in the viewport.
 * Useful for skip links, form validation errors, and dynamic content.
 * 
 * @param element - The HTML element to focus
 * @param scrollOptions - Optional scroll behavior configuration
 * 
 * @example
 * ```typescript
 * // Focus on first error in form
 * const firstError = document.querySelector('[aria-invalid="true"]');
 * if (firstError instanceof HTMLElement) {
 *   focusElement(firstError);
 * }
 * ```
 */
export const focusElement = (
  element: HTMLElement,
  scrollOptions?: ScrollIntoViewOptions
): void => {
  // Ensure element is focusable
  if (!element.hasAttribute('tabindex') && !isNativelyFocusable(element)) {
    element.setAttribute('tabindex', '-1');
  }

  // Focus the element
  element.focus();

  // Ensure it's visible
  ensureFocusVisible(element, scrollOptions);
};

/**
 * Checks if an element is natively focusable (doesn't need tabindex).
 * 
 * @param element - The HTML element to check
 * @returns True if element is natively focusable
 */
const isNativelyFocusable = (element: HTMLElement): boolean => {
  const focusableElements = [
    'A',
    'BUTTON',
    'INPUT',
    'SELECT',
    'TEXTAREA',
    'DETAILS',
    'SUMMARY',
  ];

  return focusableElements.includes(element.tagName);
};

/**
 * Focuses the first element with an error in a form.
 * Typically used after form validation fails.
 * 
 * @param formElement - The form element to search within
 * @returns True if an error element was found and focused
 * 
 * @example
 * ```typescript
 * const form = document.querySelector('form');
 * if (form) {
 *   const focused = focusFirstError(form);
 *   if (!focused) {
 *     console.log('No errors found in form');
 *   }
 * }
 * ```
 */
export const focusFirstError = (formElement: HTMLElement): boolean => {
  // Find first element with aria-invalid="true" or in error state
  const errorElement = formElement.querySelector<HTMLElement>(
    '[aria-invalid="true"], .govuk-input--error, .govuk-textarea--error, .govuk-select--error'
  );

  if (errorElement) {
    focusElement(errorElement);
    return true;
  }

  return false;
};

/**
 * Focuses the error summary component at the top of the page.
 * Should be called when form validation fails.
 * 
 * @returns True if error summary was found and focused
 * 
 * @example
 * ```typescript
 * // In form submission handler
 * if (hasValidationErrors) {
 *   focusErrorSummary();
 * }
 * ```
 */
export const focusErrorSummary = (): boolean => {
  const errorSummary = document.querySelector<HTMLElement>(
    '.govuk-error-summary'
  );

  if (errorSummary) {
    focusElement(errorSummary);
    return true;
  }

  return false;
};

/**
 * Manages focus for skip links - ensures main content is focused
 * when skip link is activated.
 * 
 * @param targetId - The ID of the target element to focus
 * @returns True if target was found and focused
 * 
 * @example
 * ```typescript
 * // In SkipLink component
 * const handleSkipLinkClick = (e: React.MouseEvent) => {
 *   e.preventDefault();
 *   handleSkipLinkFocus('main-content');
 * };
 * ```
 */
export const handleSkipLinkFocus = (targetId: string): boolean => {
  const target = document.getElementById(targetId);

  if (target) {
    focusElement(target, { block: 'start' });
    return true;
  }

  return false;
};

/**
 * Traps focus within a modal dialog or overlay.
 * Prevents focus from escaping to background content.
 * 
 * @param container - The container element to trap focus within
 * @returns Cleanup function to remove event listeners
 * 
 * @example
 * ```typescript
 * useEffect(() => {
 *   const modalElement = modalRef.current;
 *   if (modalElement && isOpen) {
 *     const cleanup = trapFocus(modalElement);
 *     return cleanup;
 *   }
 * }, [isOpen]);
 * ```
 */
export const trapFocus = (container: HTMLElement): (() => void) => {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTab = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  // Focus first element
  firstElement?.focus();

  // Add event listener
  container.addEventListener('keydown', handleTab);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTab);
  };
};

/**
 * Restores focus to a previously focused element.
 * Useful when closing modals or returning from overlays.
 * 
 * @param element - The element to restore focus to
 * 
 * @example
 * ```typescript
 * const previouslyFocused = document.activeElement as HTMLElement;
 * // ... open modal ...
 * // ... close modal ...
 * restoreFocus(previouslyFocused);
 * ```
 */
export const restoreFocus = (element: HTMLElement | null): void => {
  if (element && document.body.contains(element)) {
    focusElement(element);
  }
};
