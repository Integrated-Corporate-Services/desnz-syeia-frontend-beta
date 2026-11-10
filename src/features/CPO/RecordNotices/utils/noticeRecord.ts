import type { InspectionAddress, NoticeAnswer } from '../types/notices';

export const inspectionAddresses = (answer?: NoticeAnswer): InspectionAddress[] => answer?.addresses ?? [];

export const inspectionAddressText = (address: InspectionAddress) => [address.line1, address.line2, address.townCity, address.county, address.postcode].filter(Boolean).join(', ');

export const noticeDateText = (value?: string | null) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value))
  ? new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'Not recorded';

export const validNoticeDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

/** Check if a date string is a valid real calendar date in YYYY-MM-DD format */
export const isValidNoticeDate = (value: string): { valid: boolean; message?: string } => {
  // Check if empty
  if (!value || !value.trim()) return { valid: false, message: 'Enter a date' };

  // Check format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { valid: false, message: 'Enter a valid date (format: YYYY-MM-DD)' };

  // Check if Date.parse returns finite (catches things like "2026-13-01")
  if (!Number.isFinite(Date.parse(value))) return { valid: false, message: 'Enter a valid date' };

  // Check if the date is a real calendar date (rejects 2026-02-30, 31/2/2026, etc.)
  const parsed = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime())) return { valid: false, message: 'Enter a valid date' };

  // Check if formatting rounds-trips correctly
  if (parsed.toISOString().slice(0, 10) !== value) return { valid: false, message: 'Enter a valid date' };

  return { valid: true };
};

/** UK postcode regex pattern */
export const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;

const DATE_SUBJECTS: Record<string, string> = {
  firstDate: 'First date the notice appeared',
  secondDate: 'Second date the notice appeared',
  liveDate: 'Date the notice went live',
};

// Distinguishes a blank date, a partly entered date and an impossible date (e.g. 31 February) so each gets an accurate message.
export const noticeDateError = (step: string, key: string, value: string, emptyMessage: string) => {
  if (!value) return emptyMessage;
  const subject = DATE_SUBJECTS[key] ?? (step === 'site' ? 'Date the site notices were displayed' : step === 'people' ? 'Date the last person was served' : 'Completion date');
  const [year = '', month = '', day = ''] = value.split('-');
  if (!year && !month && !day) return emptyMessage;
  const missing = [!day && 'day', !month && 'month', !year && 'year'].filter(Boolean);
  if (missing.length) return `${subject} must include a ${missing.length > 1 ? `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}` : missing[0]}`;
  if (year.length !== 4) return `${subject} year must include 4 numbers`;
  return validNoticeDate(value) ? undefined : `${subject} must be a real date`;
};

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