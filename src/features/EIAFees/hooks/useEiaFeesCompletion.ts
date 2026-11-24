import { useEffect, useState } from 'react';
import { progressApiService } from '../../../services/progressApiService';
import { SUBSECTIONS } from '../../../constants/sections';
import { APPLICATION_STATUS } from '../../../constants/status';
import type { ProgressItem } from '../../../types/progress';
import log from '../../../logger';

export type EiaFeesCompletionCheck = 'idle' | 'loading' | 'complete' | 'incomplete';

// SYEIA-1485: whether the EIA fees task is Completed. A full EIA whose report was uploaded but whose answer save then
// failed is left In progress; this lets the pages keep a way to finish that save. Only asked for when needed (enabled);
// a failed lookup counts as complete, so the pages stay read-only.
export function useEiaFeesCompletion(applicationId: string | undefined, enabled: boolean): EiaFeesCompletionCheck {
  const [state, setState] = useState<EiaFeesCompletionCheck>('idle');

  useEffect(() => {
    if (!enabled || !applicationId) return;
    let active = true;
    setState('loading');
    progressApiService
      .fetchApplicationProgress(applicationId)
      .then((progress: ProgressItem[]) => {
        const eiaFees = (progress ?? []).find((item) => item.subsection_name === SUBSECTIONS.EIA_FEES);
        if (active) setState(eiaFees?.status === APPLICATION_STATUS.COMPLETED ? 'complete' : 'incomplete');
      })
      .catch((error) => {
        log.error('[useEiaFeesCompletion] Failed to load progress', error);
        if (active) setState('complete');
      });
    return () => { active = false; };
  }, [applicationId, enabled]);

  return state;
}
