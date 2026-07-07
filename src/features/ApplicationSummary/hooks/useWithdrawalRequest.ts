import { useEffect, useState } from 'react';
import { applicationApiService } from '../../../services/applicationApiService';
import { WithdrawalRequest } from '../types';

interface UseWithdrawalRequestResult {
    withdrawalRequest: WithdrawalRequest | null;
    loading: boolean;
}

export const useWithdrawalRequest = (applicationId: string | undefined): UseWithdrawalRequestResult => {
    const [withdrawalRequest, setWithdrawalRequest] = useState<WithdrawalRequest | null>(null);
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
