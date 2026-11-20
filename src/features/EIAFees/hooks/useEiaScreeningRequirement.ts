import { useCallback, useEffect, useState } from 'react';
import { fetchEiaScreeningRequirement, type EiaScreeningRequirement } from '../../../services/eiafeesservice';
import log from '../../../logger';

// Whether an EIA screening decision is mandatory, and why (SYEIA-1485 Image 2 vs Image 3).
// A failed lookup leaves the requirement unknown (failed: true) rather than treating screening as optional.
export function useEiaScreeningRequirement(applicationId?: string) {
  const [requirement, setRequirement] = useState<EiaScreeningRequirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!applicationId) return;
    let active = true;
    setLoading(true);
    setFailed(false);
    setRequirement(null);
    fetchEiaScreeningRequirement(applicationId)
      .then((result) => { if (active) setRequirement(result); })
      .catch((error) => {
        log.error('[useEiaScreeningRequirement] Failed to load screening requirement', error);
        if (active) setFailed(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);
  const mandatory = !!requirement && (requirement.highVoltage || requirement.sensitiveArea);
  return { loading, failed, retry, mandatory, highVoltage: !!requirement?.highVoltage, sensitiveArea: !!requirement?.sensitiveArea };
}
