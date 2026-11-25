import { MIGRATION_CONTENT, NO_STATUS_DISPLAY, STATUS_DISPLAY, type StatusDisplay, type StatusKind } from '../constants';

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Europe/London',
});

/** GOV.UK style date and time, for example "25 November 2026 at 2:05pm". */
export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return MIGRATION_CONTENT.NOT_AVAILABLE;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return MIGRATION_CONTENT.NOT_AVAILABLE;
  const parts = dateTimeFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('day')} ${get('month')} ${get('year')} at ${get('hour')}:${get('minute')}${get('dayPeriod').toLowerCase()}`;
};

export const formatFileSize = (sizeInBytes: number | null | undefined): string => {
  if (sizeInBytes === null || sizeInBytes === undefined || Number.isNaN(sizeInBytes)) return MIGRATION_CONTENT.NOT_AVAILABLE;
  if (sizeInBytes < 1024) return `${sizeInBytes} bytes`;
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)}KB`;
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)}MB`;
};

export const formatCount = (value: number | null | undefined): string =>
  value === null || value === undefined ? MIGRATION_CONTENT.NOT_AVAILABLE : String(value);

/** "SOME_CODE_VALUE" or "someCodeValue" -> "Some code value". */
export const humaniseCode = (code: string): string => {
  const words = code
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const getStatusDisplay = (kind: StatusKind, status: string | null | undefined): StatusDisplay => {
  if (!status) return NO_STATUS_DISPLAY;
  const normalised = status.toUpperCase();
  return STATUS_DISPLAY[kind][normalised] ?? { label: humaniseCode(status), colour: 'grey' };
};

/** The virus check uses both scan_status and scan_result from uploaded_files. */
export const getScanDisplay = (scanStatus: string | null | undefined, scanResult: string | null | undefined): StatusDisplay => {
  const result = (scanResult || '').toUpperCase();
  if (result === 'INFECTED') return STATUS_DISPLAY.scan.INFECTED;
  const status = (scanStatus || '').toUpperCase();
  if (status === 'COMPLETED') return STATUS_DISPLAY.scan.CLEAN;
  return getStatusDisplay('scan', scanStatus || 'PENDING');
};

export const normaliseWarning = (warning: string | { message: string }): string =>
  typeof warning === 'string' ? warning : warning.message;

export const pageTitle = (title: string, hasErrors: boolean): string => (hasErrors ? `Error: ${title}` : title);
