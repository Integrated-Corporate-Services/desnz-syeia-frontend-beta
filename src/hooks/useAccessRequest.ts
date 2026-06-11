/**
 * @deprecated Use useAccessRequestContext from AccessRequestContext instead
 * This hook is now a wrapper around the context for backwards compatibility
 */
import { useAccessRequestContext } from '../context/AccessRequestContext';

export type { AccessRequestFormData } from '../context/AccessRequestContext';

export function useAccessRequest() {
  return useAccessRequestContext();
}
