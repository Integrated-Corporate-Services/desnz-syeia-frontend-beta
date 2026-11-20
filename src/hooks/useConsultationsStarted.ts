import { useCallback, useMemo } from 'react';
import { useConsultationDetails } from './useConsultationDetails';
import { useAuthUser } from './useAuthUser';
import { ConsultationStatus } from '../constants/consultationStatus';

/**
 * Custom hook to check if consultations have started for an application
 * Returns object with consultationsStarted boolean and loading state
 *
 * @param applicationId - The application ID to check consultations for
 * @returns object - { consultationsStarted, loading, checked, error, retry }
 * (checked is true once the consultations have been fetched successfully; loading is false before the fetch starts;
 * error holds the last fetch failure and retry fetches again)
 */
export function useConsultationsStarted(applicationId: string | undefined): { consultationsStarted: boolean; loading: boolean; checked: boolean; error: string | null; retry: () => void } {
    const { user } = useAuthUser();
    const { consultations, loading, checked, error, refetch } = useConsultationDetails(applicationId, user?.user_id);
    const retry = useCallback(() => { void refetch(); }, [refetch]);

    const consultationsStarted = useMemo(() => {
        if (!consultations || consultations.length === 0) {
            return false;
        }

        return consultations.some((consultation) => consultation.status.toLowerCase() !== ConsultationStatus.NOT_STARTED.toLowerCase());
    }, [consultations]);

    return { consultationsStarted, loading, checked, error, retry };
}
