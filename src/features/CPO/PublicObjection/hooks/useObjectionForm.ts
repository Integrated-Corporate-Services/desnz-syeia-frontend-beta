import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CHANGE_PARAM, OBJECTION_ROUTES } from '../constants/objectionRoutes';
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

  // Opened from a Change link on check your answers: keep that across pages and return there after saving.
  const [searchParams] = useSearchParams();
  const changing = searchParams.get(CHANGE_PARAM) === 'true';
  const withChange = useCallback((route: string) => (changing ? `${route}?${CHANGE_PARAM}=true` : route), [changing]);
  const goNext = (route: string) => navigate(changing ? OBJECTION_ROUTES.CHECK_ANSWERS : route);

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

  /** Runs an API call; returns its result, or null when it failed and errors are shown. */
  const act = useCallback(async <T,>(work: () => Promise<T>): Promise<T | null> => {
    setSaving(true);
    setErrors([]);
    try {
      return await work();
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

  /** Runs a save; returns the updated journey, or null when the save failed and errors are shown. */
  const save = useCallback(async (work: () => Promise<ObjectionJourney>): Promise<ObjectionJourney | null> => {
    const saved = await act(work);
    if (saved) setJourney(saved);
    return saved;
  }, [act]);

  const errorFor = (fieldId: string) => errors.find((error) => error.fieldId === fieldId)?.message;

  // As in S37 and NWL: changing a field removes its inline error and its error summary entry.
  const clearError = useCallback((fieldId: string) => {
    setErrors((current) => (current.some((error) => error.fieldId === fieldId) ? current.filter((error) => error.fieldId !== fieldId) : current));
  }, []);

  return { journey, setJourney, loading, saving, errors, setErrors, errorFor, clearError, act, save, navigate, changing, withChange, goNext };
}
