import {
  BATCH_ID_MAX_LENGTH,
  BATCH_ID_PATTERN,
  CASES_FILE_MAX_BYTES,
  MIGRATION_ERRORS,
} from '../constants';

/** Returns the error message for a batch ID, or null when it is valid. */
export const validateBatchId = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return MIGRATION_ERRORS.BATCH_ID_REQUIRED;
  if (trimmed.length > BATCH_ID_MAX_LENGTH) return MIGRATION_ERRORS.BATCH_ID_TOO_LONG;
  if (!BATCH_ID_PATTERN.test(trimmed)) return MIGRATION_ERRORS.BATCH_ID_PATTERN;
  return null;
};

/** Returns the error message for the cases file, or null when it is valid. */
export const validateCasesFile = (file: File | null | undefined): string | null => {
  if (!file) return MIGRATION_ERRORS.FILE_REQUIRED;
  if (!file.name.toLowerCase().endsWith('.xlsx')) return MIGRATION_ERRORS.FILE_NOT_XLSX;
  if (file.size === 0) return MIGRATION_ERRORS.FILE_EMPTY;
  if (file.size > CASES_FILE_MAX_BYTES) return MIGRATION_ERRORS.FILE_TOO_LARGE;
  return null;
};

export const validateReference = (value: string): string | null =>
  value.trim() ? null : MIGRATION_ERRORS.REFERENCE_REQUIRED;
