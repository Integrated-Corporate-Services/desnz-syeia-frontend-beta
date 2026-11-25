import { describe, expect, it } from 'vitest';
import { MIGRATION_ERRORS, CASES_FILE_MAX_BYTES } from '../constants';
import { groupDocuments } from './documents';
import { getMigrationErrorMessage, MigrationApiError } from './errors';
import { formatDateTime, formatFileSize, getScanDisplay, getStatusDisplay, humaniseCode, pageTitle } from './format';
import { validateBatchId, validateCasesFile, validateReference } from './validation';

const fileOf = (name: string, size: number) => {
  const file = new File(['x'], name);
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('validation', () => {
  it('validates batch IDs with GOV.UK messages', () => {
    expect(validateBatchId('  ')).toBe('Enter a batch ID');
    expect(validateBatchId('a'.repeat(81))).toBe('Batch ID must be 80 characters or fewer');
    expect(validateBatchId('INP 25')).toBe('Batch ID can only include letters, numbers, hyphens and underscores');
    expect(validateBatchId('INP-25_NOV-001')).toBeNull();
  });

  it('validates the cases file', () => {
    expect(validateCasesFile(null)).toBe('Select an Excel file');
    expect(validateCasesFile(fileOf('cases.csv', 10))).toBe('The selected file must be an XLSX');
    expect(validateCasesFile(fileOf('cases.xlsx', CASES_FILE_MAX_BYTES + 1))).toBe('The selected file must be smaller than 20MB');
    expect(validateCasesFile(fileOf('cases.xlsx', 0))).toBe(MIGRATION_ERRORS.FILE_EMPTY);
    expect(validateCasesFile(fileOf('CASES.XLSX', 10))).toBeNull();
  });

  it('validates the reference', () => {
    expect(validateReference('')).toBe('Enter a DESNZ reference or application ID');
    expect(validateReference('NWL-1')).toBeNull();
  });
});

describe('getMigrationErrorMessage', () => {
  it('uses the server message for 400 and 409', () => {
    expect(getMigrationErrorMessage(new MigrationApiError(400, { serverMessage: 'Bad file' }))).toBe('Bad file');
    expect(getMigrationErrorMessage(new MigrationApiError(409, { serverMessage: 'Taken' }), { 409: 'Default' })).toBe('Taken');
    expect(getMigrationErrorMessage(new MigrationApiError(409), { 409: 'Default' })).toBe('Default');
  });

  it('prefers the page text for 404', () => {
    expect(getMigrationErrorMessage(new MigrationApiError(404, { serverMessage: 'x' }), { 404: 'Not here' })).toBe('Not here');
  });

  it('uses the generic message for network and server errors', () => {
    expect(getMigrationErrorMessage(new MigrationApiError(0))).toBe(MIGRATION_ERRORS.SERVICE);
    expect(getMigrationErrorMessage(new MigrationApiError(500, { serverMessage: 'stack trace' }))).toBe(MIGRATION_ERRORS.SERVICE);
    expect(getMigrationErrorMessage(new Error('boom'))).toBe(MIGRATION_ERRORS.SERVICE);
  });
});

describe('format', () => {
  it('maps every status to plain English, with a readable fallback', () => {
    expect(getStatusDisplay('batch', 'READY_FOR_APPROVAL')).toEqual({ label: 'Waiting for approval', colour: 'yellow' });
    expect(getStatusDisplay('preflight', 'PREFLIGHT_FAILED').label).toBe('Upload checks failed');
    expect(getStatusDisplay('batch', 'SOMETHING_NEW')).toEqual({ label: 'Something new', colour: 'grey' });
    expect(getStatusDisplay('batch', null).label).toBe('Not started');
  });

  it('maps scan status and result', () => {
    expect(getScanDisplay('COMPLETED', 'CLEAN').label).toBe('No viruses found');
    expect(getScanDisplay('COMPLETED', 'INFECTED').label).toBe('Virus found');
    expect(getScanDisplay('COMPLETED', null).label).toBe('Virus check failed');
    expect(getScanDisplay(null, null).label).toBe('Checking for viruses');
  });

  it('formats values', () => {
    expect(formatFileSize(512)).toBe('512 bytes');
    expect(formatFileSize(2048)).toBe('2.0KB');
    expect(formatFileSize(3 * 1024 * 1024)).toBe('3.0MB');
    expect(formatDateTime('2026-11-25T14:05:00.000Z')).toBe('25 November 2026 at 2:05pm');
    expect(formatDateTime(null)).toBe('Not available');
    expect(humaniseCode('line_use_type')).toBe('Line use type');
    expect(humaniseCode('applicationDetails')).toBe('Application details');
    expect(pageTitle('Title', true)).toBe('Error: Title');
  });
});

describe('groupDocuments', () => {
  it('groups by document type label in API order', () => {
    const groups = groupDocuments(
      [
        { documentId: '1', fileId: 'f1', fileName: 'b.pdf', category: 'WAYLEAVE_OFFER' },
        { documentId: '2', fileId: 'f2', fileName: 'a.pdf', category: 'NWL_PLAN_INFO' },
        { documentId: '3', fileId: 'f3', fileName: 'c.pdf', category: 'UNKNOWN_TYPE' },
      ],
      [
        { label: 'Application plan', category: 'NWL_PLAN_INFO' },
        { label: 'Wayleave offer', category: 'WAYLEAVE_OFFER' },
      ]
    );
    expect(groups.map((group) => group.label)).toEqual(['Application plan', 'Wayleave offer', 'Unknown type']);
  });
});
