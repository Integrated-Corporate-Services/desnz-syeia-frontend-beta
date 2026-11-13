/**
 * EIA Fees - Validation (SYEIA-1485)
 */

import { EIAFeesErrorField, EIA_FEES_ERROR_MESSAGES, type ValidationError } from './eiaFeesErrors';
import type { EiaAssessment } from '../constants/eiaAssessment';

export const validateAssessment = (assessment: EiaAssessment | '', allowedOptions: EiaAssessment[]): ValidationError[] =>
    assessment && allowedOptions.includes(assessment)
        ? []
        : [{ field: EIAFeesErrorField.ASSESSMENT, message: EIA_FEES_ERROR_MESSAGES.ASSESSMENT.REQUIRED }];

export const validateEiaReport = (fileCount: number): ValidationError[] =>
    fileCount > 0 ? [] : [{ field: EIAFeesErrorField.EIA_REPORT, message: EIA_FEES_ERROR_MESSAGES.EIA_REPORT.REQUIRED }];

export const getFieldErrorMessage = (field: string, errors: ValidationError[]): string =>
    errors.find((e) => e.field === field)?.message ?? '';
