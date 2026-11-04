import type { NoticeStep } from '../types/notices';

export const NOTICE_STEPS = ['requirements', 'inspection', 'online', 'newspapers', 'site', 'people', 'check'] as const;
export const NOTICE_HEADINGS: Record<NoticeStep, string> = {
  requirements: 'What your public notices must include', inspection: 'Record order inspection addresses',
  online: 'Enter the website address', newspapers: 'Record the newspaper notices',
  website: 'Record the website notice', site: 'Record the site notices', people: 'Upload a statement of service (optional)', check: 'Check public notices',
};
export const NOTICE_LABELS: Partial<Record<NoticeStep, string>> = {
  requirements: 'Notice requirements',
  inspection: 'Inspection addresses', online: 'Enter the website address', newspapers: 'Record the newspaper notices',
  website: 'Website notice', site: 'Record the site notices', people: 'Statement of service', check: 'Public notices',
};
export const NOTICE_CATEGORIES: Partial<Record<NoticeStep, string>> = {
  newspapers: 'CPO_NEWSPAPER_NOTICES', site: 'CPO_SITE_NOTICES', people: 'CPO_QUALIFYING_PERSON_NOTICES',
};