/**
 * Works Overview Form - Error Types & Constants
 */

export interface ValidationError {
    field: string;
    message: string;
}

export { WORKS_OVERVIEW_VALIDATION_MESSAGES } from '../../../constants/workOverviewError';
