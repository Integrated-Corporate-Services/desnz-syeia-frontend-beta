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
  evidence?: { fileId: string; date: string; publicationId?: string; expectedRowVersion?: number }[];
  confirmed?: boolean | null;
}

export interface CpoNoticeDocument {
  document_id: string;
  /** Equal to document_id; kept so the evidence pickers can keep addressing files by fileId. */
  file_id: string;
  category: string;
  filename: string;
}

export interface NoticesResponse {
  record: Partial<Record<NoticeStep, NoticeAnswer>>;
  documents: CpoNoticeDocument[];
  reference: string;
  objectionsEmail: string;
  finalObjectionDate: string | null;
}