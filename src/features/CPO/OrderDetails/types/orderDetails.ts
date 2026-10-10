import type { ScanResult, ScanStatus } from '../../../../types/fileUpload';

export type OrderStep = 'name' | 'purpose' | 'special-land' | 'exchange-land' | 'related-applications' | 'add-related-application' | 'related-applications-list' | 'check';
export type RelatedType = 'DCO' | 'S37' | 'CPO' | 'OTHER' | '';

export interface RelatedApplication {
  id: string;
  type: RelatedType;
  otherType: string;
  reference: string;
  siteAddress: string;
  relationship: string;
}

export interface OrderDetails {
  orderName: string;
  purpose: string;
  includesSpecialLand: boolean | null;
  exchangeLand: boolean | null;
  hasRelatedApplications: boolean | null;
  relatedApplications: RelatedApplication[];
  completedAt?: string | null;
}

export interface OrderDocument {
  id: string;
  document_id: string;
  application_id: string;
  file_id: string;
  filename: string;
  s3_key: string;
  bucket_name: string;
  virtual_folder: string;
  storage_provider: string;
  file_content_type: string;
  file_size_bytes: number;
  uploaded_at_timestamp: string;
  added_by: string;
  added_at: string;
  scan_status: ScanStatus | null;
  scan_result: ScanResult | null;
}

export interface OrderDetailsResponse {
  details: OrderDetails;
  documents: OrderDocument[];
  canEdit?: boolean;
}