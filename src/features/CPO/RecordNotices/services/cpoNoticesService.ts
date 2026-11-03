import { buildBackendUrl } from '../../../../utils/apiConfig';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import type { CpoNoticeDocument, InspectionAddress, NoticeAnswer, NoticeStep, NoticesResponse } from '../types/notices';

interface RawInspectionAddress {
  inspection_address_id: string;
  row_version: number;
  address: { line1: string; line2: string | null; town_city: string; county: string | null; postcode: string };
  available_from: string | null;
}

interface RawPublication {
  publication_id: string;
  publication_number: number | null;
  row_version: number;
  published_on: string;
  document_id: string;
}

interface RawRecordNotices {
  application_id: string;
  content_version: number;
  record: {
    row_version: number;
    requirements?: { acknowledged: boolean };
    inspection?: { addresses: RawInspectionAddress[] };
    'order-maps-website'?: { order_maps_url: string | null };
    newspapers?: { publications: RawPublication[] };
    site?: { most_recent_displayed_on: string | null; document_ids: string[] };
    statement_of_service?: { last_person_served_on: string | null; document_ids: string[] };
    check?: { confirmed: boolean };
  };
  documents: { document_id: string; category: string; filename: string }[];
  desnzReference: string;
  can_edit: boolean;
}

interface PatchOperation {
  page_id: string;
  data: Record<string, unknown>;
  /** Inspection address the page targets. Absent for record-level pages. */
  rowId?: string;
}

async function readRaw(response: Response): Promise<RawRecordNotices> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = response.status === 400 && typeof body.message === 'string'
      ? body.message : response.status === 401 ? 'Your session has expired. Sign in again.'
        : response.status === 403 ? 'You do not have permission to access this application.'
          : response.status === 404 ? 'Unable to load or save your publicity record. The requested record was not found.'
            : response.status === 409 ? 'This record has changed since it was loaded. Refresh the page and try again.'
              : 'Unable to load or save your publicity record. Try again.';
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return response.json();
}

function toInspectionAddress(address: RawInspectionAddress): InspectionAddress {
  return {
    id: address.inspection_address_id,
    line1: address.address.line1,
    line2: address.address.line2 ?? '',
    townCity: address.address.town_city,
    county: address.address.county ?? '',
    postcode: address.address.postcode,
    from: address.available_from ?? '',
  };
}

function toNoticesResponse(raw: RawRecordNotices): NoticesResponse {
  const record = raw.record;
  const publications = record.newspapers?.publications ?? [];
  const site = record.site;
  const people = record.statement_of_service;
  const siteDate = site?.most_recent_displayed_on ?? '';
  const peopleDate = people?.last_person_served_on ?? '';
  return {
    record: {
      requirements: { format: 'reference', acknowledged: record.requirements?.acknowledged === true },
      inspection: { format: 'reference', addresses: (record.inspection?.addresses ?? []).map(toInspectionAddress) },
      online: { format: 'reference', url: record['order-maps-website']?.order_maps_url ?? '' },
      website: { format: 'reference', url: record['order-maps-website']?.order_maps_url ?? '' },
      newspapers: {
        format: 'reference',
        firstDate: publications.find(item => item.publication_number === 1)?.published_on ?? '',
        secondDate: publications.find(item => item.publication_number === 2)?.published_on ?? '',
        evidence: publications.map(item => ({ fileId: item.document_id, date: item.published_on })),
      },
      site: {
        format: 'reference',
        completionDate: siteDate,
        evidence: (site?.document_ids ?? []).map(fileId => ({ fileId, date: siteDate })),
      },
      people: {
        format: 'reference',
        completionDate: peopleDate,
        evidence: (people?.document_ids ?? []).map(fileId => ({ fileId, date: peopleDate })),
      },
      check: { format: 'reference', confirmed: record.check?.confirmed === true },
    },
    documents: raw.documents.map((document): CpoNoticeDocument => ({
      document_id: document.document_id,
      file_id: document.document_id,
      category: document.category,
      filename: document.filename,
    })),
    reference: raw.desnzReference,
    objectionsEmail: '',
    finalObjectionDate: null,
  };
}

function rowVersionFor(raw: RawRecordNotices, rowId?: string): number {
  if (!rowId) return raw.record.row_version;
  return raw.record.inspection?.addresses.find(item => item.inspection_address_id === rowId)?.row_version ?? raw.record.row_version;
}

function evidenceIds(answer: NoticeAnswer): string[] {
  return [...new Set((answer.evidence ?? []).map(entry => entry.fileId))];
}

function buildInspectionOperations(raw: RawRecordNotices, desired: InspectionAddress[]): PatchOperation[] {
  const current = raw.record.inspection?.addresses ?? [];
  const desiredIds = new Set(desired.map(address => address.id));
  const operations: PatchOperation[] = current
    .filter(item => !desiredIds.has(item.inspection_address_id))
    .map(item => ({
      page_id: 'inspection-address-remove',
      data: { inspection_address_id: item.inspection_address_id },
      rowId: item.inspection_address_id,
    }));
  for (const address of desired) {
    const existing = current.find(item => item.inspection_address_id === address.id);
    const changed = !existing || existing.address.line1 !== address.line1 || (existing.address.line2 ?? '') !== address.line2
      || existing.address.town_city !== address.townCity || (existing.address.county ?? '') !== (address.county ?? '')
      || existing.address.postcode !== address.postcode;
    if (changed) {
      operations.push({
        page_id: 'inspection-address',
        data: {
          inspection_address_id: address.id,
          inspection_address: {
            line1: address.line1, line2: address.line2 || null, town_city: address.townCity,
            county: address.county || null, postcode: address.postcode,
          },
        },
        rowId: address.id,
      });
    }
    if (address.from && address.from !== (existing?.available_from ?? '')) {
      operations.push({ page_id: 'inspection-date', data: { inspection_address_id: address.id, available_from: address.from }, rowId: address.id });
    }
  }
  return operations;
}

function buildNewspaperOperations(raw: RawRecordNotices, answer: NoticeAnswer): PatchOperation[] {
  const current = raw.record.newspapers?.publications ?? [];
  const publications = (answer.evidence ?? []).filter(entry => entry.date).map(entry => {
    const existing = current.find(item => item.document_id === entry.fileId);
    const publicationNumber = entry.date === answer.firstDate ? 1 : entry.date === answer.secondDate ? 2 : null;
    return {
      ...(existing ? { publication_id: existing.publication_id, expected_row_version: existing.row_version } : {}),
      publication_number: publicationNumber,
      published_on: entry.date,
      document_ids: entry.fileId,
    };
  });
  return [{ page_id: 'newspapers', data: { publications } }];
}

function isUnchangedEvidence(date: string | null | undefined, ids: string[] | undefined, answer: NoticeAnswer): boolean {
  const current = [...(ids ?? [])].sort().join(',');
  const next = [...evidenceIds(answer)].sort().join(',');
  return date === answer.completionDate && current === next;
}

function buildOperations(raw: RawRecordNotices, step: NoticeStep, answer: NoticeAnswer): PatchOperation[] {
  switch (step) {
    case 'requirements':
      return typeof answer.acknowledged === 'boolean'
        ? [{ page_id: 'requirements', data: { requirements_acknowledged: answer.acknowledged } }] : [];
    case 'online':
    case 'website': {
      const url = answer.url?.trim();
      if (!url || url === raw.record['order-maps-website']?.order_maps_url) return [];
      return [{ page_id: 'order-maps-website', data: { order_maps_url: url } }];
    }
    case 'inspection':
      return buildInspectionOperations(raw, answer.addresses ?? []);
    case 'newspapers':
      return buildNewspaperOperations(raw, answer);
    case 'site': {
      const current = raw.record.site;
      if (!answer.completionDate || isUnchangedEvidence(current?.most_recent_displayed_on, current?.document_ids, answer)) return [];
      return [{ page_id: 'site', data: { most_recent_displayed_on: answer.completionDate, document_ids: evidenceIds(answer) } }];
    }
    case 'people': {
      const current = raw.record.statement_of_service;
      if (!answer.completionDate || isUnchangedEvidence(current?.last_person_served_on, current?.document_ids, answer)) return [];
      return [{ page_id: 'statement-of-service', data: { last_person_served_on: answer.completionDate, document_ids: evidenceIds(answer) } }];
    }
    case 'check':
      // Reopening is implicit: the server clears confirmation when any earlier step changes.
      return answer.confirmed === true ? [{ page_id: 'check', data: { confirmed: true } }] : [];
    default:
      return [];
  }
}

async function csrfHeaders(): Promise<Record<string, string>> {
  let headers = getCsrfHeaders();
  if (!headers['X-CSRF-Token']) {
    await fetchCsrfToken();
    headers = getCsrfHeaders();
  }
  if (!headers['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token. Refresh the page.');
  return headers;
}

async function fetchRaw(applicationId: string): Promise<RawRecordNotices> {
  return readRaw(await fetch(buildBackendUrl(`/api/applications/${applicationId}/record-notices`), { credentials: 'include' }));
}

async function applyOperation(applicationId: string, raw: RawRecordNotices, operation: PatchOperation): Promise<RawRecordNotices> {
  const headers = await csrfHeaders();
  return readRaw(await fetch(buildBackendUrl(`/api/applications/${applicationId}/record-notices`), {
    method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({
      expected_content_version: raw.content_version,
      expected_row_version: rowVersionFor(raw, operation.rowId),
      page_id: operation.page_id,
      data: operation.data,
    }),
  }));
}

export const cpoNoticesService = {
  get: async (applicationId: string): Promise<NoticesResponse> =>
    toNoticesResponse(await fetchRaw(applicationId)),
  save: async (applicationId: string, step: NoticeStep, answers: NoticeAnswer, _saveForLater: boolean): Promise<NoticesResponse> => {
    let raw = await fetchRaw(applicationId);
    for (const operation of buildOperations(raw, step, answers)) {
      raw = await applyOperation(applicationId, raw, operation);
    }
    return toNoticesResponse(raw);
  },
};
