import { useMemo } from 'react';
import { useConsultationDetails } from './useConsultationDetails';
import { useAuthUser } from './useAuthUser';
import { ConsultationStatus } from '../constants/consultationStatus';

/**
 * Custom hook to check if consultations have started for an application
 * Returns object with consultationsStarted boolean and loading state
 *
 * @param applicationId - The application ID to check consultations for
 * @returns object - { consultationsStarted: boolean, loading: boolean }
 */
export function useConsultationsStarted(applicationId: string | undefined): { consultationsStarted: boolean; loading: boolean } {
    const { user } = useAuthUser();
    const { consultations, loading } = useConsultationDetails(applicationId, user?.user_id);

    const consultationsStarted = useMemo(() => {
        if (!consultations || consultations.length === 0) {
            return false;
        }

        return consultations.some((consultation) => consultation.status.toLowerCase() !== ConsultationStatus.NOT_STARTED.toLowerCase());
    }, [consultations]);

    return { consultationsStarted, loading };
}
