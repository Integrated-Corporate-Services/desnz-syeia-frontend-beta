import { useCallback, useState } from 'react';
import type { CasesFileUploadResult, NewBatchWizardState } from '../types';
import { readWizardState, writeWizardState } from '../utils/wizardStorage';

/**
 * State for the "start a migration batch" pages, kept in sessionStorage so a refresh on the
 * file or check page keeps the admin's progress. Pages that find required state missing send
 * the admin back to the first page.
 */
export const useNewBatchWizard = () => {
  const [state, setState] = useState<NewBatchWizardState>(() => readWizardState());

  const update = useCallback((next: NewBatchWizardState | null) => {
    writeWizardState(next);
    setState(next ?? {});
  }, []);

  const setBatchId = useCallback(
    (batchId: string) => {
      const current = readWizardState();
      // A different batch ID makes an earlier upload invalid: it was staged under the old ID.
      update(current.batchId === batchId ? { ...current, batchId } : { batchId });
    },
    [update]
  );

  const setUpload = useCallback(
    (upload: CasesFileUploadResult) => update({ ...readWizardState(), upload }),
    [update]
  );

  const clear = useCallback(() => update(null), [update]);

  return { state, setBatchId, setUpload, clear };
};
