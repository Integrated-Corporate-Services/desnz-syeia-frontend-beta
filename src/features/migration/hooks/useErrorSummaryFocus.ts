import { useEffect, useRef } from 'react';

/** Moves focus to the error summary whenever a new set of errors is shown (GOV.UK pattern). */
export const useErrorSummaryFocus = (errorCount: number, trigger?: unknown) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (errorCount > 0 && ref.current) {
      ref.current.focus();
    }
  }, [errorCount, trigger]);
  return ref;
};
