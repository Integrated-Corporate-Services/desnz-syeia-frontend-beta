import type { OrderDetails, OrderDocument } from './orderDetails';

export type DocumentStep = 'order' | 'maps' | 'reasons' | 'additional' | 'check';
export type UploadStep = Exclude<DocumentStep, 'check'>;

export interface CpoDocument extends OrderDocument {
  category: string;
}

export interface OrderDocumentsResponse {
  orderDetails: Partial<OrderDetails>;
  documents: CpoDocument[];
  canEdit?: boolean;
}