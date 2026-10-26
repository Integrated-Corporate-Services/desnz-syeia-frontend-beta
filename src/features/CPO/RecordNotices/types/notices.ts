export type NoticeStep = 'inspection' | 'online' | 'newspapers' | 'website' | 'site' | 'people' | 'check' | 'requirements';

export interface InspectionAddress {
  id: string;
  line1: string;
  line2: string;
  townCity: string;
  county?: string;
  postcode: string;
  from: string;
}

export interface NoticeAnswer {
  format?: 'reference';
  addresses?: InspectionAddress[];
  firstDate?: string;
  secondDate?: string;
  acknowledged?: boolean;
  address?: string;
  url?: string;
  from?: string;
  until?: string;
  liveDate?: string;
  completionDate?: string;
  evidence?: { fileId: string; date: string }[];
  confirmed?: boolean | null;
}

export interface CpoNoticeDocument {
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

export interface NoticesResponse {
  record: Partial<Record<NoticeStep, NoticeAnswer>>;
  documents: CpoNoticeDocument[];
  reference: string;
  objectionsEmail: string;
  finalObjectionDate: string | null;
}