import type { UploadStep } from '../types/orderDocuments';

export const DOCUMENT_STEPS = ['order', 'reasons', 'additional', 'check'] as const;
export const DOCUMENT_CATEGORIES: Record<UploadStep, string> = {
  order: 'CPO_ORDER_DOCUMENTS', maps: 'CPO_ORDER_MAPS', reasons: 'CPO_STATEMENT_OF_REASONS', additional: 'CPO_ADDITIONAL_DOCUMENTS',
};

export const DOCUMENT_GROUP_CATEGORIES = {
  order: ['CPO_ORDER_DOCUMENTS', 'CPO_ORDER', 'CPO_ORDER_MAPS'],
  reasons: ['CPO_STATEMENT_OF_REASONS'],
  additional: ['CPO_ADDITIONAL_DOCUMENTS'],
};