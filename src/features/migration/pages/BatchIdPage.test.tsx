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
vi.mock('../services/migrationApi', () => ({ checkBatchId: vi.fn() }));

import BatchIdRoute from './BatchIdPage';
import { checkBatchId } from '../services/migrationApi';
import { MigrationApiError } from '../utils/errors';
import { renderAt } from '../testUtils';
import { MIGRATION_ERRORS, MIGRATION_PATHS, WIZARD_STORAGE_KEY } from '../constants';

const renderPage = () => renderAt(<BatchIdRoute />, MIGRATION_PATHS.NEW_BATCH, MIGRATION_PATHS.NEW_BATCH);

describe('BatchIdPage', () => {
  beforeEach(() => {
    mocks.role = 'TECH_ADMIN';
    vi.mocked(checkBatchId).mockReset();
  });

  it('renders the question with label, hint and back link', () => {
    renderPage();
    expect(screen.getByLabelText('What is the batch ID?')).toBeInTheDocument();
    expect(screen.getByText(/Use letters, numbers, hyphens and underscores only/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', expect.stringContaining('/admin/reporting'));
    expect(screen.getByTestId('page-title')).toHaveTextContent('What is the batch ID?');
  });

  it('shows a focused error summary and prefixes the title when empty', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    const summary = await screen.findByRole('alert');
    expect(summary).toHaveTextContent('There is a problem');
    expect(screen.getByRole('link', { name: 'Enter a batch ID' })).toHaveAttribute('href', '#batch-id');
    await waitFor(() => expect(summary).toHaveFocus());
    expect(screen.getByTestId('page-title')).toHaveTextContent('Error: What is the batch ID?');
    expect(checkBatchId).not.toHaveBeenCalled();
  });

  it('rejects characters outside the pattern', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('What is the batch ID?'), { target: { value: 'INP 001' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findAllByText('Batch ID can only include letters, numbers, hyphens and underscores')).toHaveLength(2);
  });

  it('shows a 409 from the server against the field', async () => {
    vi.mocked(checkBatchId).mockRejectedValue(new MigrationApiError(409, { code: 'BATCH_EXISTS' }));
    renderPage();
    fireEvent.change(screen.getByLabelText('What is the batch ID?'), { target: { value: 'INP-001' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(
      await screen.findByRole('link', { name: 'A batch with this ID already exists. Enter a different batch ID' })
    ).toBeInTheDocument();
  });

  it('shows the generic message for a network error', async () => {
    vi.mocked(checkBatchId).mockRejectedValue(new MigrationApiError(0));
    renderPage();
    fireEvent.change(screen.getByLabelText('What is the batch ID?'), { target: { value: 'INP-001' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Sorry, there is a problem with the service. Try again later.')).toBeInTheDocument();
  });

  it('shows an error and stays on the page when the batch ID is not available', async () => {
    vi.mocked(checkBatchId).mockResolvedValue({ available: false });
    renderPage();
    fireEvent.change(screen.getByLabelText('What is the batch ID?'), { target: { value: 'INP-001' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('link', { name: MIGRATION_ERRORS.BATCH_ID_TAKEN })).toBeInTheDocument();
    expect(sessionStorage.getItem(WIZARD_STORAGE_KEY)).toBeNull();
  });

  it('saves the batch ID and goes to the file page', async () => {
    vi.mocked(checkBatchId).mockResolvedValue({ available: true });
    renderPage();
    fireEvent.change(screen.getByLabelText('What is the batch ID?'), { target: { value: ' INP-001 ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByTestId('location')).toHaveTextContent(MIGRATION_PATHS.NEW_BATCH_FILE);
    expect(checkBatchId).toHaveBeenCalledWith('INP-001');
    expect(JSON.parse(sessionStorage.getItem(WIZARD_STORAGE_KEY) || '{}')).toEqual({ batchId: 'INP-001' });
  });

  it('redirects users who are not Tech Admins', () => {
    mocks.role = 'SUPERUSER';
    renderPage();
    expect(screen.getByTestId('location')).toHaveTextContent('/application-dashboard');
  });

});
