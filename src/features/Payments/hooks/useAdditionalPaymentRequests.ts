import { useEffect, useState } from 'react';
import { AdditionalPaymentError, AdditionalPaymentRequest, listAdditionalPayments } from '../../../services/additionalPaymentsService';
import { ADDITIONAL_PAYMENT_ERRORS } from '../constants/additionalPayments';

export function useAdditionalPaymentRequests(applicationId: string) {
  const [requests, setRequests] = useState<AdditionalPaymentRequest[]>([]);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setRequests([]);
    setError('');
    listAdditionalPayments(applicationId).then(data => {
      if (active) setRequests(data.requests);
    }).catch(reason => {
      if (active && !(reason instanceof AdditionalPaymentError && reason.status === 404)) {
        setError(ADDITIONAL_PAYMENT_ERRORS.summary);
      }
    });
    return () => { active = false; };
  }, [applicationId, attempt]);

  return { requests, error, retry: () => setAttempt(value => value + 1) };
}