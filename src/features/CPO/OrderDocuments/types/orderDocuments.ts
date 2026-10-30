import type { OrderDetails } from '../../OrderDetails/types/orderDetails';

export type DocumentStep = 'order' | 'maps' | 'reasons' | 'additional' | 'check';
export type UploadStep = Exclude<DocumentStep, 'check'>;

export interface CpoDocument {
  document_id: string;
  application_id: string;
  file_id: string;
  category: string;
  added_by: string;
  added_at: string;
  filename: string;
  s3_key: string;
  file_content_type: string;
  file_size_bytes: number;
  uploaded_at_timestamp: string;
}
export interface OrderDocumentsResponse {
  orderDetails: Partial<OrderDetails>;
  documents: CpoDocument[];
}