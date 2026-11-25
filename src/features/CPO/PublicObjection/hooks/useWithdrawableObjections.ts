import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { OBJECTION_MESSAGES } from '../constants/objectionContent';
import { ObjectionJourneyMissing, publicObjectionService } from '../services/publicObjectionService';
import type { WithdrawableObjection } from '../types/objectionJourney';

interface Withdrawable {
  objections: WithdrawableObjection[];
  selected: string[];
}

/** The objections the verified email can withdraw (SYEIA-2943). Without a verified withdraw journey, back to the start. */
export function useWithdrawableObjections() {
  const navigate = useNavigate();
  const [withdrawable, setWithdrawable] = useState<Withdrawable | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    publicObjectionService.getWithdrawable()
      .then((loaded) => { if (active) setWithdrawable(loaded); })
      .catch((failure) => {
        if (!active) return;
        if (failure instanceof ObjectionJourneyMissing) navigate(OBJECTION_ROUTES.REFERENCE, { replace: true });
        else setLoadError((failure as Error).message || OBJECTION_MESSAGES.SERVICE_ERROR);
      });
    return () => { active = false; };
  }, [navigate]);

  return { withdrawable, loadError };
}
