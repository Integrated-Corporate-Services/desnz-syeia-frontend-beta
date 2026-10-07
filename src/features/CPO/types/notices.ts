import type { CpoDocument } from './orderDocuments';

export type NoticeStep = 'inspection' | 'online' | 'newspapers' | 'website' | 'site' | 'people' | 'check' | 'requirements';

export interface NoticeAnswer {
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