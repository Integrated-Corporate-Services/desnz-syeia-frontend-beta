import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { fieldIdFor, OBJECTION_MESSAGES } from '../constants/objectionContent';
import { ObjectionFieldErrors, ObjectionJourneyMissing, publicObjectionService } from '../services/publicObjectionService';
import type { ObjectionJourney } from '../types/objectionJourney';

export interface SummaryError {
  fieldId: string;
  message: string;
}

/**
 * Loads the journey from the session (or skips loading on the first page) and runs saves,
 * turning API field errors into error summary entries. A missing journey sends the user back to the start.
 */
export function useObjectionForm({ loadJourney = true } = {}) {
  const navigate = useNavigate();
  const [journey, setJourney] = useState<ObjectionJourney | null>(null);
  const [loading, setLoading] = useState(loadJourney);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<SummaryError[]>([]);

  const restart = useCallback(() => navigate(OBJECTION_ROUTES.REFERENCE, { replace: true }), [navigate]);

  useEffect(() => {
    if (!loadJourney) return undefined;
    let active = true;
    publicObjectionService.get()
      .then((loaded) => { if (active) setJourney(loaded); })
      .catch((failure) => {
        if (!active) return;
        if (failure instanceof ObjectionJourneyMissing) restart();
        else setErrors([{ fieldId: 'general', message: (failure as Error).message || OBJECTION_MESSAGES.SERVICE_ERROR }]);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadJourney, restart]);

  /** Runs a save; returns the updated journey, or null when the save failed and errors are shown. */
  const save = useCallback(async (work: () => Promise<ObjectionJourney>): Promise<ObjectionJourney | null> => {
    setSaving(true);
    setErrors([]);
    try {
      const saved = await work();
      setJourney(saved);
      return saved;
    } catch (failure) {
      if (failure instanceof ObjectionFieldErrors) {
        setErrors(failure.errors.map(({ field, message }) => ({ fieldId: fieldIdFor(field), message })));
      } else if (failure instanceof ObjectionJourneyMissing) {
        restart();
      } else {
        setErrors([{ fieldId: 'general', message: (failure as Error).message || OBJECTION_MESSAGES.SERVICE_ERROR }]);
      }
      return null;
    } finally {
      setSaving(false);
    }
  }, [restart]);

  const errorFor = (fieldId: string) => errors.find((error) => error.fieldId === fieldId)?.message;

  return { journey, setJourney, loading, saving, errors, errorFor, save, navigate };
}
