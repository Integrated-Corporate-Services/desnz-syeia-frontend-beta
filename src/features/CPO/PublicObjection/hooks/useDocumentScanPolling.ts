import { useEffect } from 'react';
import { DOCUMENT_SCAN_POLL_MS } from '../constants/objectionContent';
import { publicObjectionService } from '../services/publicObjectionService';
import type { ObjectionJourney } from '../types/objectionJourney';

/** Re-reads the journey while any uploaded document is still being virus scanned. */
export function useDocumentScanPolling(
  journey: ObjectionJourney | null,
  onUpdate: (journey: ObjectionJourney) => void,
) {
  const checking = Boolean(journey?.documents.some((document) => document.status === 'checking'));

  useEffect(() => {
    if (!checking) return undefined;
    let active = true;
    const timer = window.setTimeout(() => {
      publicObjectionService.get()
        .then((updated) => { if (active) onUpdate(updated); })
        .catch(() => undefined);
    }, DOCUMENT_SCAN_POLL_MS);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [checking, journey, onUpdate]);
}
