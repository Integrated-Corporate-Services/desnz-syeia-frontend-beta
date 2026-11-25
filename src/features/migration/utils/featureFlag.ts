import { isMigrationUiEnabled as isEnabledInConfig } from '../../../config/appConfig';

/** Wrapped so tests can switch the flag without mocking the whole config module. */
export const isMigrationUiEnabled = (): boolean => isEnabledInConfig();
