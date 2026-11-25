import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ role: 'TECH_ADMIN' }));
vi.mock('../../../context/AuthUserContext', () => ({
  useAuthUserContext: () => ({ user: { role: mocks.role, user_id: 'u1' }, loading: false }),
}));
vi.mock('../../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <span data-testid="page-title">{title}</span>,
}));
vi.mock('../services/migrationApi', () => ({ uploadCasesFile: vi.fn() }));

import CasesFileRoute from './CasesFilePage';
import { uploadCasesFile } from '../services/migrationApi';
import { MigrationApiError } from '../utils/errors';
import { renderAt, sampleUpload } from '../testUtils';
import { CASES_FILE_MAX_BYTES, MIGRATION_PATHS, WIZARD_STORAGE_KEY } from '../constants';

const renderPage = () => renderAt(<CasesFileRoute />, MIGRATION_PATHS.NEW_BATCH_FILE, MIGRATION_PATHS.NEW_BATCH_FILE);

const chooseFile = (name: string, size = 100) => {
  const file = new File(['x'], name);
  Object.defineProperty(file, 'size', { value: size });
  fireEvent.change(screen.getByLabelText('Upload a file'), { target: { files: [file] } });
  return file;
};

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Upload and continue' }));

describe('CasesFilePage', () => {
  beforeEach(() => {
    mocks.role = 'TECH_ADMIN';
    vi.mocked(uploadCasesFile).mockReset();
    sessionStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify({ batchId: 'INP-001' }));
  });

  it('sends the admin back to the batch ID page when there is no batch ID', () => {
    sessionStorage.clear();
    renderPage();
    expect(screen.getByTestId('location')).toHaveTextContent(MIGRATION_PATHS.NEW_BATCH);
  });

  it('renders a file upload with hint and the batch ID caption', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Upload the cases file' })).toBeInTheDocument();
    expect(screen.getByText('Migration: INP-001')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload a file')).toHaveAttribute('type', 'file');
  });

  it('asks for a file when none is chosen', async () => {
    renderPage();
    submit();
    const summary = await screen.findByRole('alert');
    expect(screen.getByRole('link', { name: 'Select an Excel file' })).toHaveAttribute('href', '#cases-file');
    await waitFor(() => expect(summary).toHaveFocus());
    expect(screen.getByTestId('page-title')).toHaveTextContent('Error: Upload the cases file');
  });

  it('rejects a file that is not xlsx', async () => {
    renderPage();
    chooseFile('cases.csv');
    submit();
    expect(await screen.findByRole('link', { name: 'The selected file must be an XLSX' })).toBeInTheDocument();
  });

  it('rejects a file over 20MB', async () => {
    renderPage();
    chooseFile('cases.xlsx', CASES_FILE_MAX_BYTES + 1);
    submit();
    expect(await screen.findByRole('link', { name: 'The selected file must be smaller than 20MB' })).toBeInTheDocument();
    expect(uploadCasesFile).not.toHaveBeenCalled();
  });

  it('shows the server message from a 400', async () => {
    vi.mocked(uploadCasesFile).mockRejectedValue(
      new MigrationApiError(400, { code: 'MISSING_HEADER', serverMessage: 'The selected file must have an ENERGY_PORTAL_REF column' })
    );
    renderPage();
    chooseFile('cases.xlsx');
    submit();
    expect(
      await screen.findByRole('link', { name: 'The selected file must have an ENERGY_PORTAL_REF column' })
    ).toBeInTheDocument();
  });

  it('uploads the file, stores the result and goes to the check page', async () => {
    vi.mocked(uploadCasesFile).mockResolvedValue(sampleUpload);
    renderPage();
    const file = chooseFile('cases.xlsx');
    submit();
    expect(await screen.findByTestId('location')).toHaveTextContent(MIGRATION_PATHS.NEW_BATCH_CHECK);
    expect(uploadCasesFile).toHaveBeenCalledWith('INP-001', file);
    expect(JSON.parse(sessionStorage.getItem(WIZARD_STORAGE_KEY) || '{}')).toEqual({ batchId: 'INP-001', upload: sampleUpload });
  });

  it('disables the button while uploading', async () => {
    let resolve: (value: typeof sampleUpload) => void = () => undefined;
    vi.mocked(uploadCasesFile).mockImplementation(() => new Promise((r) => (resolve = r)));
    renderPage();
    chooseFile('cases.xlsx');
    submit();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Upload and continue' })).toBeDisabled());
    expect(screen.getByRole('status')).toHaveTextContent('Uploading and checking the file');
    resolve(sampleUpload);
    expect(await screen.findByTestId('location')).toBeInTheDocument();
  });

  it('redirects users who are not Tech Admins', () => {
    mocks.role = 'APPLICANT_USER';
    renderPage();
    expect(screen.getByTestId('location')).toHaveTextContent('/application-dashboard');
  });
});
