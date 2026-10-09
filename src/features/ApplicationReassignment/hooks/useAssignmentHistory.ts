import { useEffect, useState } from 'react';
import { applicationApiService } from '../../../services/applicationApiService';
import type { AssignmentDetails } from '../types/applicationReassignment';

export function useAssignmentHistory(applicationId: string | undefined) {
    const [state, setState] = useState<{
        applicationId?: string;
        details: AssignmentDetails | null;
        loading: boolean;
        error: string | null;
    }>({ details: null, loading: true, error: null });
    useEffect(() => {
        let active = true;
        if (!applicationId) {
            setState({ details: null, loading: false, error: 'Application reference is required' });
            return;
        }
        setState({ applicationId, details: null, loading: true, error: null });
        applicationApiService
            .getAssignmentHistory(applicationId)
            .then((details: AssignmentDetails) => {
                if (active) setState({ applicationId, details, loading: false, error: null });
            })
            .catch(() => {
                if (active)
                    setState({
                        applicationId,
                        details: null,
                        loading: false,
                        error: 'Unable to load reassignment history. Try again later.',
                    });
            });
        return () => {
            active = false;
        };
    }, [applicationId]);
    return state.applicationId === applicationId
        ? state
        : {
              details: null,
              loading: Boolean(applicationId),
              error: applicationId ? null : 'Application reference is required',
          };
}
