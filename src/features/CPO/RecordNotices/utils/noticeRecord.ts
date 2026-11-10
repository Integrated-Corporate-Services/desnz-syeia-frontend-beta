import type { InspectionAddress, NoticeAnswer } from '../types/notices';

export const inspectionAddresses = (answer?: NoticeAnswer): InspectionAddress[] => answer?.addresses ?? [];

export const inspectionAddressText = (address: InspectionAddress) => [address.line1, address.line2, address.townCity, address.county, address.postcode].filter(Boolean).join(', ');

export const noticeDateText = (value?: string | null) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value))
  ? new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'Not recorded';

export const validNoticeDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

/** UK postcode regex pattern */
export const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;

// Server-side save failures must target a rendered field so the summary link focuses it and the field shows an inline error and border.
export const noticeErrorField = (step: string, message: string, hasCategory: boolean) => {
  if (step === 'online') return 'notice-location';
  if (step === 'website') return /date|live/i.test(message) ? 'liveDate-day' : 'notice-location';
  if (step === 'newspapers' && /date/i.test(message)) return /second/i.test(message) ? 'secondDate-day' : 'firstDate-day';
  if ((step === 'site' || step === 'people') && /date/i.test(message)) return 'completionDate-day';
  return hasCategory ? 'file-upload-input' : 'notices-heading';
};

export const inspectionErrorField = (message: string, addressPage: boolean, datePage: boolean) => {
  if (addressPage) {
    if (/postcode/i.test(message)) return 'postcode';
    if (/town|city/i.test(message)) return 'townCity';
    if (/line 1|line1|street/i.test(message)) return 'line1';
  }
  if (datePage && /date/i.test(message)) return 'inspection-date-day';
  return 'inspection-heading';
};

export const publicationDateForFile = (fileId: string, index: number, answer: NoticeAnswer, previous?: NoticeAnswer) => {
  const previousDate = previous?.evidence?.find(entry => entry.fileId === fileId)?.date;
  const previousDates = [...new Set(previous?.evidence?.map(entry => entry.date).filter(Boolean) || [])].sort();
  const first = previous?.firstDate || previousDates[0];
  const second = previous?.secondDate || previousDates[1];
  const firstInsertion = previousDate && first && previousDate === first ? true : previousDate && second && previousDate === second ? false : index === 0;
  return (firstInsertion ? answer.firstDate : answer.secondDate) || '';
};