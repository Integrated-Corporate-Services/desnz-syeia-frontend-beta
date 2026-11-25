import { LAST_STARTED_BATCH_STORAGE_KEY, WIZARD_STORAGE_KEY } from '../constants';
import type { NewBatchWizardState } from '../types';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('migrationWizardStorage');

const read = <T>(key: string): T | null => {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    logger.warn('Could not read migration wizard state', { key, error });
    return null;
  }
};

const write = (key: string, value: unknown): void => {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.warn('Could not save migration wizard state', { key, error });
  }
};

export const readWizardState = (): NewBatchWizardState => read<NewBatchWizardState>(WIZARD_STORAGE_KEY) ?? {};
export const writeWizardState = (state: NewBatchWizardState | null): void => write(WIZARD_STORAGE_KEY, state);
export const readLastStartedBatch = (): string | null => read<string>(LAST_STARTED_BATCH_STORAGE_KEY);
export const writeLastStartedBatch = (batchId: string | null): void => write(LAST_STARTED_BATCH_STORAGE_KEY, batchId);
