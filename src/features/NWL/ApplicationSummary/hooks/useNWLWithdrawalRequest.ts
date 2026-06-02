import { useEffect, useState } from 'react';
import { applicationApiService } from '../../../../services/applicationApiService';
import { NWLWithdrawalRequest } from '../types';

interface UseNWLWithdrawalRequestResult {
    withdrawalRequest: NWLWithdrawalRequest | null;
    loading: boolean;
}

export const useNWLWithdrawalRequest = (
    applicationId: string | undefined
): UseNWLWithdrawalRequestResult => {
    const [withdrawalRequest, setWithdrawalRequest] = useState<NWLWithdrawalRequest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!applicationId) {
            setWithdrawalRequest(null);
            setLoading(false);
            return;
        }

        let isMounted = true;

        const fetchWithdrawalRequest = async () => {
            try {
                const withdrawalData = await applicationApiService.getWithdrawalRequest(applicationId);

                if (!isMounted) return;

                if (withdrawalData === null) {
                    setWithdrawalRequest(null);
                    return;
                }

                if (withdrawalData?.success && withdrawalData?.data) {
                    setWithdrawalRequest(withdrawalData.data);
                } else {
                    setWithdrawalRequest(null);
                }
            } catch {
                if (isMounted) {
                    setWithdrawalRequest(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchWithdrawalRequest();

        return () => {
            isMounted = false;
        };
    }, [applicationId]);

    return { withdrawalRequest, loading };
};
