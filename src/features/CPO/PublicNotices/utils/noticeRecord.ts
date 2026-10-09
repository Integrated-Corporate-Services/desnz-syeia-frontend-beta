import type { InspectionAddress, NoticeAnswer } from '../types/notices';

export const inspectionAddresses = (answer?: NoticeAnswer): InspectionAddress[] => answer?.addresses ?? (answer?.address ? [{
  id: '00000000-0000-4000-8000-000000000001', line1: answer.address, line2: '', townCity: '', postcode: '', from: answer.from || '', legacyAddress: answer.address,
}] : []);

export const inspectionAddressText = (address: InspectionAddress) => address.legacyAddress || [address.line1, address.line2, address.townCity, address.postcode].filter(Boolean).join(', ');

export const noticeDateText = (value?: string | null) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value))
  ? new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'Not recorded';

export const validNoticeDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

export const publicationDateForFile = (fileId: string, index: number, answer: NoticeAnswer, previous?: NoticeAnswer) => {
  const previousDate = previous?.evidence?.find(entry => entry.fileId === fileId)?.date;
  const previousDates = [...new Set(previous?.evidence?.map(entry => entry.date).filter(Boolean) || [])].sort();
  const first = previous?.firstDate || previousDates[0];
  const second = previous?.secondDate || previousDates[1];
  const firstInsertion = previousDate && first && previousDate === first ? true : previousDate && second && previousDate === second ? false : index === 0;
  return (firstInsertion ? answer.firstDate : answer.secondDate) || '';
};