import { MIGRATION_ERRORS } from '../constants';

/**
 * Every failure from the migration API is turned into one of these, so pages only deal with
 * a status code and a message. status 0 means the request never got a response (network error).
 */
export class MigrationApiError extends Error {
  readonly status: number;
  readonly code?: string;
  /** The server's `message`, when the response had one. */
  readonly serverMessage?: string;

  constructor(status: number, options: { code?: string; serverMessage?: string } = {}) {
    super(options.serverMessage || options.code || `Request failed with status ${status}`);
    this.name = 'MigrationApiError';
    this.status = status;
    this.code = options.code;
    this.serverMessage = options.serverMessage;
  }
}

export const isMigrationApiError = (error: unknown): error is MigrationApiError =>
  error instanceof MigrationApiError;

export interface ErrorMessageOverrides {
  400?: string;
  404?: string;
  409?: string;
}

/**
 * Map an error to the text shown to the user.
 * 400 and 409 show the server's own message (it is written for users), falling back to the
 * page's default. 404 uses the page's default first because "not found" text is page specific.
 * Anything else, including network errors, gets the generic GOV.UK service problem message.
 */
export const getMigrationErrorMessage = (error: unknown, overrides: ErrorMessageOverrides = {}): string => {
  if (!isMigrationApiError(error)) return MIGRATION_ERRORS.SERVICE;
  switch (error.status) {
    case 400:
      return error.serverMessage || overrides[400] || MIGRATION_ERRORS.SERVICE;
    case 409:
      return error.serverMessage || overrides[409] || MIGRATION_ERRORS.SERVICE;
    case 404:
      return overrides[404] || error.serverMessage || MIGRATION_ERRORS.SERVICE;
    case 429:
      return MIGRATION_ERRORS.TOO_MANY_REQUESTS;
    default:
      return MIGRATION_ERRORS.SERVICE;
  }
};

export const isNotFoundError = (error: unknown): boolean => isMigrationApiError(error) && error.status === 404;
