/* Shared helpers for the migration page tests. Not imported by application code. */
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import type { CasesFileUploadResult, MigratedApplicationResponse } from './types';

const LocationProbe: React.FC = () => {
  const location = useLocation();
  return (
    <div data-testid="location">
      {location.pathname}
      {location.search}
    </div>
  );
};

/** Renders `element` at `path`; any navigation away lands on a probe showing the new location. */
export const renderAt = (element: React.ReactElement, path: string, url: string, state?: unknown) => {
  const [pathname, search] = url.split('?');
  return render(
    <MemoryRouter initialEntries={[{ pathname, search: search ? `?${search}` : '', state }]}>
      <Routes>
        <Route path={path} element={element} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
};

export const sampleUpload: CasesFileUploadResult = {
  uploadId: 'upload-1',
  fileName: 'cases.xlsx',
  sizeBytes: 2048,
  sha256: 'abc',
  caseCount: 2,
  caseIds: ['CASE-1', 'CASE-2'],
  warnings: [],
};

export const sampleApplication = (overrides: Partial<MigratedApplicationResponse> = {}): MigratedApplicationResponse => ({
  migration: {
    batchId: 'INP-25-NOV-001',
    legacyCaseId: 'CASE-1',
    applicationId: '11111111-1111-1111-1111-111111111111',
    desnzRef: 'NWL-2025-000123',
    statuses: {
      validation: 'VALID',
      awsLoad: 'LOADED',
      salesforceLoad: 'LOADED',
      documentRecord: 'PENDING',
    },
    failure: null,
  },
  application: {
    application: { application_id: '11111111-1111-1111-1111-111111111111', desnz_ref: 'NWL-2025-000123', status: 'SUBMITTED' },
    applicationDetails: { line_use_type: 'Electricity' },
    assets: [{ asset_description: 'Pole' }],
  },
  documents: [
    {
      documentId: 'doc-1',
      fileId: 'file-1',
      fileName: 'plan.pdf',
      category: 'NWL_PLAN_INFO',
      uploadedBy: 'Tech Admin',
      uploadedAt: '2026-11-25T10:00:00.000Z',
      scanStatus: 'COMPLETED',
      scanResult: 'CLEAN',
      removable: true,
    },
    {
      documentId: 'doc-2',
      fileId: 'file-2',
      fileName: 'migrated.pdf',
      category: 'WAYLEAVE_OFFER',
      uploadedBy: 'Migration',
      uploadedAt: '2026-11-24T10:00:00.000Z',
      scanStatus: 'PENDING',
      scanResult: null,
      removable: false,
    },
  ],
  documentTypes: [
    { label: 'Application plan', category: 'NWL_PLAN_INFO' },
    { label: 'Wayleave offer', category: 'WAYLEAVE_OFFER' },
    { label: 'Land Registry document', category: 'LAND_REGISTRY', subCategory: 'LAND_REGISTRY' },
  ],
  ...overrides,
});
