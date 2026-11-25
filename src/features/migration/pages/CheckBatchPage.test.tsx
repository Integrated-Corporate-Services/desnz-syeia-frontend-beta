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
vi.mock('../services/migrationApi', () => ({ startBatch: vi.fn() }));

import CheckBatchRoute from './CheckBatchPage';
import { startBatch } from '../services/migrationApi';
import { MigrationApiError } from '../utils/errors';
import { renderAt, sampleUpload } from '../testUtils';
import { LAST_STARTED_BATCH_STORAGE_KEY, MIGRATION_PATHS, WIZARD_STORAGE_KEY } from '../constants';

const renderPage = () => renderAt(<CheckBatchRoute />, MIGRATION_PATHS.NEW_BATCH_CHECK, MIGRATION_PATHS.NEW_BATCH_CHECK);
const setWizard = (state: unknown) => sessionStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(state));
const startButton = () => screen.getByRole('button', { name: /Start migration|Starting migration/ });

describe('CheckBatchPage', () => {
  beforeEach(() => {
    mocks.role = 'TECH_ADMIN';
    vi.mocked(startBatch).mockReset();
    setWizard({ batchId: 'INP-001', upload: sampleUpload });
  });

  it('shows the summary with change links, case IDs and the cannot be undone warning', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Check the batch before you start' })).toBeInTheDocument();
    expect(screen.getByText('INP-001')).toBeInTheDocument();
    expect(screen.getByText('cases.xlsx')).toBeInTheDocument();
    expect(screen.getByText('2.0KB')).toBeInTheDocument();
    expect(screen.getByText('CASE-1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Change batch ID' })).toHaveAttribute('href', MIGRATION_PATHS.NEW_BATCH);
    expect(screen.getByRole('link', { name: 'Change cases file' })).toHaveAttribute('href', MIGRATION_PATHS.NEW_BATCH_FILE);
    expect(screen.getByText(/Starting a migration cannot be undone/)).toBeInTheDocument();
  });

  it('hides a long list of case IDs in a details component and shows warnings', () => {
    const caseIds = Array.from({ length: 12 }, (_, index) => `CASE-${index + 1}`);
    setWizard({ batchId: 'INP-001', upload: { ...sampleUpload, caseIds, caseCount: 12, warnings: ['Duplicate case ID CASE-3'] } });
    renderPage();
    expect(screen.getByText('Show all 12 case IDs')).toBeInTheDocument();
    expect(screen.getByText('Duplicate case ID CASE-3')).toBeInTheDocument();
  });

  it('sends the admin back to step 1 when the wizard state is missing (for example after a new session)', () => {
    sessionStorage.clear();
    renderPage();
    expect(screen.getByTestId('location')).toHaveTextContent(MIGRATION_PATHS.NEW_BATCH);
  });

  it('sends the admin to the file page when there is no upload', () => {
    setWizard({ batchId: 'INP-001' });
    renderPage();
    expect(screen.getByTestId('location')).toHaveTextContent(MIGRATION_PATHS.NEW_BATCH_FILE);
  });

  it('starts the batch once, even on a double click, and shows the confirmation', async () => {
    let resolve: (value: { batchId: string; manifestKey: string }) => void = () => undefined;
    vi.mocked(startBatch).mockImplementation(() => new Promise((r) => (resolve = r)));
    renderPage();
    fireEvent.click(startButton());
    fireEvent.click(startButton());
    await waitFor(() => expect(startButton()).toBeDisabled());
    expect(startBatch).toHaveBeenCalledTimes(1);
    expect(startBatch).toHaveBeenCalledWith('INP-001', 'upload-1');
    resolve({ batchId: 'INP-001', manifestKey: 'k' });
    expect(await screen.findByTestId('location')).toHaveTextContent(MIGRATION_PATHS.NEW_BATCH_CONFIRMATION);
    expect(sessionStorage.getItem(WIZARD_STORAGE_KEY)).toBeNull();
    expect(JSON.parse(sessionStorage.getItem(LAST_STARTED_BATCH_STORAGE_KEY) || 'null')).toBe('INP-001');
  });

  it('shows a 409 in a focused error summary and lets the admin try again', async () => {
    vi.mocked(startBatch).mockRejectedValue(new MigrationApiError(409));
    renderPage();
    fireEvent.click(startButton());
    const summary = await screen.findByRole('alert');
    expect(summary).toHaveTextContent('A batch with this ID has already been started');
    await waitFor(() => expect(summary).toHaveFocus());
    expect(screen.getByTestId('page-title')).toHaveTextContent('Error: Check the batch before you start');
    expect(startButton()).not.toBeDisabled();
  });

  it('shows the generic message for a server error', async () => {
    vi.mocked(startBatch).mockRejectedValue(new MigrationApiError(500));
    renderPage();
    fireEvent.click(startButton());
    expect(await screen.findByText('Sorry, there is a problem with the service. Try again later.')).toBeInTheDocument();
  });

  it('redirects users who are not Tech Admins', () => {
    mocks.role = 'SUPERUSER';
    renderPage();
    expect(screen.getByTestId('location')).toHaveTextContent('/application-dashboard');
  });
});
