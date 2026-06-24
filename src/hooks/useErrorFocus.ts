import { useRef, useEffect } from 'react';

/**
 * Custom hook to focus error summary when errors are present
 * Improves accessibility for keyboard and screen reader users
 * WCAG 2.1 Best Practice - SC 3.3.1 Error Identification
 * 
 * @param hasErrors - Boolean indicating whether errors are present
 * @returns Ref to attach to the error summary element
 * 
 * @example
 * const errorSummaryRef = useErrorFocus(Object.keys(errors).length > 0);
 * 
 * <div 
 *   className="govuk-error-summary" 
 *   role="alert"
 *   tabIndex={-1}
 *   ref={errorSummaryRef}
 * >
 *   <h2 className="govuk-error-summary__title">There is a problem</h2>
 *   {/* error list *\/}
 * </div>
 */
export const useErrorFocus = (hasErrors: boolean) => {
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasErrors && errorSummaryRef.current) {
      // Focus the error summary so screen readers announce it
      errorSummaryRef.current.focus();
    }
  }, [hasErrors]);

  return errorSummaryRef;
};

export default useErrorFocus;
