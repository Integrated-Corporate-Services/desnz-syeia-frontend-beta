import { useEffect, useState } from 'react';
import { applicationApiService } from '../../../services/applicationApiService';
import log from '../../../logger';

export type EditableDraftCheck = 'idle' | 'loading' | 'editable' | 'locked';

// SYEIA-1485: whether the applicant can still change a draft application. Only asked for when needed (enabled);
// a failed lookup counts as locked so the page stays read-only.
export function useEditableDraft(applicationId: string | undefined, enabled: boolean): EditableDraftCheck {
  const [state, setState] = useState<EditableDraftCheck>('idle');

  useEffect(() => {
    if (!enabled || !applicationId) return;
    let active = true;
    setState('loading');
    applicationApiService
      .getApplicationById(applicationId)
      .then((application) => {
        const editable = application?.status?.toLowerCase() === 'draft' && application?.permissions?.canEdit !== false;
        if (active) setState(editable ? 'editable' : 'locked');
      })
      .catch((error) => {
        log.error('[useEditableDraft] Failed to load application', error);
        if (active) setState('locked');
      });
    return () => { active = false; };
  }, [applicationId, enabled]);

  return state;
}
