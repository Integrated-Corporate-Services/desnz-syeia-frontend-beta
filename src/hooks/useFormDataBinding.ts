import { useRef, useEffect } from 'react';

/**
 * Hook to bind fetched data to form state ONLY once on initial load
 * Prevents overwriting user's unsaved changes when data updates
 * 
 * @param data - Fetched data from backend
 * @param dependencies - Array of dependencies (e.g., [data, applicationId])
 * @param onBind - Callback to bind data to form state
 * 
 * @example
 * useFormDataBinding(
 *   projectData,
 *   [projectData, applicationId],
 *   () => {
 *     if (projectData?.applicationId === applicationId) {
 *       setFormState(projectData);
 *     }
 *   }
 * );
 */
export function useFormDataBinding(
  data: any,
  dependencies: any[],
  onBind: () => void
): void {
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only bind data once
    if (hasLoadedRef.current || !data) {
      return;
    }

    hasLoadedRef.current = true;
    onBind();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // Reset when data becomes null/undefined (switching applications)
  useEffect(() => {
    if (!data) {
      hasLoadedRef.current = false;
    }
  }, [data]);
}
