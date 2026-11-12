import { useEffect, useState } from 'react';
import { fetchEiaScreeningRequirement, type EiaScreeningRequirement } from '../../../services/eiafeesservice';
import log from '../../../logger';

// Whether an EIA screening decision is mandatory, and why (SYEIA-1485 Image 2 vs Image 3).
export function useEiaScreeningRequirement(applicationId?: string) {
  const [requirement, setRequirement] = useState<EiaScreeningRequirement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicationId) return;
    let active = true;
    setLoading(true);
    fetchEiaScreeningRequirement(applicationId)
      .then((result) => { if (active) setRequirement(result); })
      .catch((error) => {
        log.error('[useEiaScreeningRequirement] Failed to load screening requirement', error);
        if (active) setRequirement({ highVoltage: false, sensitiveArea: false });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId]);

  const mandatory = !!requirement && (requirement.highVoltage || requirement.sensitiveArea);
  return { loading, mandatory, highVoltage: !!requirement?.highVoltage, sensitiveArea: !!requirement?.sensitiveArea };
}
