import { useCallback, useEffect, useState } from 'react';
import { getMigratedApplication } from '../services/migrationApi';
import type { MigratedApplicationResponse } from '../types';

interface State {
  data: MigratedApplicationResponse | null;
  loading: boolean;
  error: unknown;
}

/** Loads GET /applications/:reference and exposes a reload for after changes. */
export const useMigratedApplication = (reference: string | undefined) => {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    if (!reference) return;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await getMigratedApplication(reference);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error });
    }
  }, [reference]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load };
};

/** The application's UUID: from the migration block when present, otherwise the application row. */
export const resolveApplicationId = (data: MigratedApplicationResponse | null, fallback?: string): string => {
  const fromMigration = data?.migration?.applicationId;
  const fromApplication = data?.application?.application?.application_id;
  return (fromMigration || (typeof fromApplication === 'string' ? fromApplication : '') || fallback || '') as string;
};

export const resolveDesnzRef = (data: MigratedApplicationResponse | null): string | null => {
  const fromMigration = data?.migration?.desnzRef;
  const fromApplication = data?.application?.application?.desnz_ref;
  return fromMigration || (typeof fromApplication === 'string' ? fromApplication : null);
};
