import type { NoticeStep } from '../types/notices';

export const NOTICE_STEPS = ['inspection', 'online', 'newspapers', 'website', 'site', 'people', 'check'] as const;
export const NOTICE_CATEGORIES: Partial<Record<NoticeStep, string>> = {
  newspapers: 'CPO_NEWSPAPER_NOTICES', site: 'CPO_SITE_NOTICES', people: 'CPO_QUALIFYING_PERSON_NOTICES',
};