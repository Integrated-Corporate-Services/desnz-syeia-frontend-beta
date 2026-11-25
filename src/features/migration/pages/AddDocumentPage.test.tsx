import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  role: 'TECH_ADMIN',
  pendingFiles: [] as File[],
  triggerUpload: vi.fn(),
  lastProps: {} as Record<string, unknown>,
}));
vi.mock('../../../context/AuthUserContext', () => ({
  useAuthUserContext: () => ({ user: { role: mocks.role, user_id: 'u1' }, loading: false }),
}));
vi.mock('../../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <span data-testid="page-title">{title}</span>,
}));
vi.mock('../services/migrationApi', async () => {
  const actual = await vi.importActual<typeof import('../services/migrationApi')>('../services/migrationApi');
  return { migrationUploadEndpoints: actual.migrationUploadEndpoints, getMigratedApplication: vi.fn() };
});
vi.mock('../../../components/FileUpload', async () => {
  const ReactModule = await vi.importActual<typeof import('react')>('react');
  const FileUploadStub = ReactModule.forwardRef((props: Record<string, unknown>, ref) => {
    mocks.lastProps = props;
    ReactModule.useImperativeHandle(ref, () => ({
      getPendingFiles: () => mocks.pendingFiles,
      triggerUpload: mocks.triggerUpload,
      isBusy: () => false,
    }));
    return <input id="file-upload-input" type="file" aria-label="stub file input" />;
  });
  return { default: FileUploadStub };
});

import AddDocumentRoute from './AddDocumentPage';
import { getMigratedApplication } from '../services/migrationApi';
import { MigrationApiError } from '../utils/errors';
import { renderAt, sampleApplication } from '../testUtils';
import { MIGRATION_PATHS } from '../constants';

const APP_ID = '11111111-1111-1111-1111-111111111111';
const URL = '/admin/migration/applications/NWL-2025-000123/documents/new';
const renderPage = () => renderAt(<AddDocumentRoute />, MIGRATION_PATHS.ADD_DOCUMENT, URL);
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Upload document' }));

describe('AddDocumentPage', () => {
  beforeEach(() => {
    mocks.role = 'TECH_ADMIN';
    mocks.pendingFiles = [];
    mocks.triggerUpload.mockReset();
    vi.mocked(getMigratedApplication).mockReset().mockResolvedValue(sampleApplication());
  });

  it('lists the document types from the API in a select', async () => {
    renderPage();
    const select = await screen.findByLabelText('Document type');
    const options = Array.from((select as HTMLSelectElement).options).map((option) => option.textContent);
    expect(options).toEqual(['Select a document type', 'Application plan', 'Wayleave offer', 'Land Registry document']);
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/admin/migration/applications/NWL-2025-000123');
  });

  it('points FileUpload at the migration upload endpoints for the application ID', async () => {
    renderPage();
    fireEvent.change(await screen.findByLabelText('Document type'), { target: { value: 'LAND_REGISTRY|LAND_REGISTRY' } });
    expect(mocks.lastProps).toMatchObject({
      applicationId: APP_ID,
      category: 'LAND_REGISTRY',
      subCategory: 'LAND_REGISTRY',
      uploadEndpoints: {
        presignedUrl: `/api/admin/migration/applications/${APP_ID}/documents/presigned-url`,
        confirm: `/api/admin/migration/applications/${APP_ID}/documents/confirm`,
      },
    });
  });

  it('asks for a document type and a file', async () => {
    renderPage();
    await screen.findByLabelText('Document type');
    submit();
    const summary = await screen.findByRole('alert');
    expect(screen.getByRole('link', { name: 'Select a document type' })).toHaveAttribute('href', '#document-type');
    expect(screen.getByRole('link', { name: 'Select a file' })).toHaveAttribute('href', '#file-upload-input');
    await waitFor(() => expect(summary).toHaveFocus());
    expect(screen.getByTestId('page-title')).toHaveTextContent('Error: Add a document');
    expect(mocks.triggerUpload).not.toHaveBeenCalled();
  });

  it('uploads and returns to the application page with a success message', async () => {
    mocks.pendingFiles = [new File(['x'], 'plan.pdf')];
    mocks.triggerUpload.mockResolvedValue({ uploadedFiles: [{ id: 'f1', scanStatus: 'COMPLETED', scanResult: 'CLEAN' }], applicationDocuments: [], scanErrors: [] });
    renderPage();
    fireEvent.change(await screen.findByLabelText('Document type'), { target: { value: 'NWL_PLAN_INFO|' } });
    submit();
    expect(await screen.findByTestId('location')).toHaveTextContent('/admin/migration/applications/NWL-2025-000123');
    expect(mocks.triggerUpload).toHaveBeenCalledTimes(1);
  });

  it('does not report success when the scan finished without a CLEAN result', async () => {
    mocks.pendingFiles = [new File(['x'], 'plan.pdf')];
    mocks.triggerUpload.mockResolvedValue({ uploadedFiles: [{ id: 'f1', scanStatus: 'COMPLETED', scanResult: null }], applicationDocuments: [], scanErrors: [] });
    renderPage();
    fireEvent.change(await screen.findByLabelText('Document type'), { target: { value: 'NWL_PLAN_INFO|' } });
    submit();
    expect(await screen.findByRole('link', { name: 'The selected file could not be checked for viruses. Try uploading it again' })).toBeInTheDocument();
    expect(screen.queryByTestId('location')).not.toBeInTheDocument();
  });

  it('allows only one file per upload', async () => {
    renderPage();
    await screen.findByLabelText('Document type');
    expect(mocks.lastProps.maxFiles).toBe(1);
  });

  it('shows virus scan and upload errors from FileUpload', async () => {
    mocks.pendingFiles = [new File(['x'], 'bad.pdf')];
    mocks.triggerUpload.mockResolvedValue({
      uploadedFiles: [],
      applicationDocuments: [],
      scanErrors: ['bad.pdf contains a virus and could not be uploaded. Remove the file and try again.'],
    });
    renderPage();
    fireEvent.change(await screen.findByLabelText('Document type'), { target: { value: 'NWL_PLAN_INFO|' } });
    submit();
    expect(
      await screen.findByRole('link', { name: 'bad.pdf contains a virus and could not be uploaded. Remove the file and try again.' })
    ).toBeInTheDocument();
  });

  it('shows "Application not found or not migrated" for a 404', async () => {
    vi.mocked(getMigratedApplication).mockRejectedValue(new MigrationApiError(404));
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Application not found or not migrated' })).toBeInTheDocument();
  });

  it('redirects users who are not Tech Admins', () => {
    mocks.role = 'SUPERUSER';
    renderPage();
    expect(screen.getByTestId('location')).toHaveTextContent('/application-dashboard');
  });
});
