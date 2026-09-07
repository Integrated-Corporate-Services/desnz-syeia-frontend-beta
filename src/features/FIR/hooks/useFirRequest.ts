import { useEffect, useState } from 'react';
import { getFurtherInformationRequest } from '../services';
import type { FurtherInformationRequest } from '../types';
import { FIR_MESSAGES } from '../constants/fir.constants';

export const useFirRequest = (applicationId?: string, requestId?: string) => {
  const [request, setRequest] = useState<FurtherInformationRequest | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(applicationId && requestId));

  useEffect(() => {
    if (!applicationId || !requestId) {
      setLoading(false);
      return;
    }

    let active = true;
    void getFurtherInformationRequest(applicationId, requestId)
      .then((result) => { if (active) setRequest(result); })
      .catch(() => { if (active) setError(FIR_MESSAGES.REQUEST_LOAD_FAILED); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [applicationId, requestId]);

  return { request, error, setError, loading };
};
