import { useEffect, useState } from 'react';
import { applicationApiService } from '../../../../services/applicationApiService';
import type { WithdrawalRequest } from '../../../ApplicationSummary/types/withdrawal';

/**
 * Looks up the CPO withdrawal request. Unlike the shared hook, a failed lookup is reported as failed
 * rather than as "no request", so the page does not offer another withdrawal when one may exist.
 */
export const useCpoWithdrawalRequest = (applicationId: string) => {
  const [withdrawalRequest, setWithdrawalRequest] = useState<WithdrawalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true); setFailed(false); setWithdrawalRequest(null);
    applicationApiService.getWithdrawalRequest(applicationId).then((response) => {
      if (active) setWithdrawalRequest(response?.success && response.data ? response.data : null);
    }).catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId, attempt]);

  return { withdrawalRequest, loading, failed, retry: () => setAttempt((current) => current + 1) };
};