import type { CpoDocument } from '../../AboutTheOrder/types/orderDocuments';

export type NoticeStep = 'inspection' | 'online' | 'newspapers' | 'website' | 'site' | 'people' | 'check' | 'requirements';

export interface InspectionAddress {
  id: string;
  line1: string;
  line2: string;
  townCity: string;
  postcode: string;
  from: string;
  legacyAddress?: string;
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

export interface NoticesResponse {
  record: Partial<Record<NoticeStep, NoticeAnswer>>;
  documents: CpoDocument[];
  reference: string;
  objectionsEmail: string;
  finalObjectionDate: string | null;
  canEdit?: boolean;
}