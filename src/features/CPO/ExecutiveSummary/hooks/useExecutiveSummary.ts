import { useCallback, useEffect, useState } from 'react';
import { cpoExecutiveSummaryService } from '../services/cpoExecutiveSummaryService';
import type { ExecutiveSummaryDocument } from '../types/executiveSummary';

export const useExecutiveSummary = (applicationId: string) => {
  const [documents, setDocuments] = useState<ExecutiveSummaryDocument[]>([]);
  const [canEdit, setCanEdit] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    cpoExecutiveSummaryService.get(applicationId).then((result) => {
      if (!active) return;
      setDocuments(result.documents);
      setCanEdit(result.canEdit);
    }).catch((error) => {
      if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load the executive summary. Refresh the page.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId]);

  const refreshDocuments = useCallback(
    () => cpoExecutiveSummaryService.get(applicationId).then((result) => setDocuments(result.documents)),
    [applicationId],
  );

  return { documents, setDocuments, canEdit, loading, loadFailed: Boolean(loadError), loadError, refreshDocuments };
};
