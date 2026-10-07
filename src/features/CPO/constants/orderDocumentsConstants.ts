import type { UploadStep } from '../types/orderDocuments';

export const DOCUMENT_STEPS = ['order', 'maps', 'reasons', 'additional', 'check'] as const;
export const DOCUMENT_CATEGORIES: Record<UploadStep, string> = {
  order: 'CPO_ORDER', maps: 'CPO_ORDER_MAPS', reasons: 'CPO_STATEMENT_OF_REASONS', additional: 'CPO_ADDITIONAL_DOCUMENTS',
};