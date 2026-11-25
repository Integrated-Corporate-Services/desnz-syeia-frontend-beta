import React from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ role: 'TECH_ADMIN' }));
vi.mock('../../../context/AuthUserContext', () => ({
  useAuthUserContext: () => ({ user: { role: mocks.role, user_id: 'u1' }, loading: false }),
}));
vi.mock('../../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <span data-testid="page-title">{title}</span>,
}));
vi.mock('../services/migrationApi', () => ({ listBatches: vi.fn() }));

import BatchesRoute from './BatchesPage';
import { listBatches } from '../services/migrationApi';
import { MigrationApiError } from '../utils/errors';
import { renderAt } from '../testUtils';
import { MIGRATION_PATHS } from '../constants';
import type { MigrationBatchSummary } from '../types';

const batch = (batchId: string, status: string | null): MigrationBatchSummary => ({
  batchId,
  status,
  preflightStatus: 'WF1_STARTED',
  expectedCaseCount: 10,
  loadedCaseCount: 8,
  failedCaseCount: 2,
  createdAt: '2026-11-25T10:00:00.000Z',
  updatedAt: '2026-11-25T11:00:00.000Z',
});

const renderPage = (url: string = MIGRATION_PATHS.BATCHES) => renderAt(<BatchesRoute />, MIGRATION_PATHS.BATCHES, url);

describe('BatchesPage', () => {
  beforeEach(() => {
    mocks.role = 'TECH_ADMIN';
    vi.mocked(listBatches).mockReset();
  });

  it('shows batches in a table with plain-English status tags and links', async () => {
    vi.mocked(listBatches).mockResolvedValue({
      batches: [batch('INP-001', 'READY_FOR_APPROVAL'), batch('INP-002', 'SALESFORCE_LOAD_FAILED')],
      page: 1,
      pageSize: 20,
      total: 2,
    });
    renderPage();
    const table = await screen.findByRole('table');
    expect(within(table).getByRole('link', { name: 'INP-001' })).toHaveAttribute('href', '/admin/migration/batches/INP-001');
    expect(within(table).getByText('Waiting for approval')).toHaveClass('govuk-tag', 'govuk-tag--yellow');
    expect(within(table).getByText('Sending to Salesforce failed')).toHaveClass('govuk-tag--red');
    expect(within(table).getAllByText('25 November 2026 at 10:00am')).toHaveLength(2);
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
  });

  it('shows an empty state', async () => {
    vi.mocked(listBatches).mockResolvedValue({ batches: [], page: 1, pageSize: 20, total: 0 });
    renderPage();
    expect(await screen.findByText('No migration batches have been started yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start a migration batch' })).toHaveAttribute('href', MIGRATION_PATHS.NEW_BATCH);
  });

  it('paginates using the page query parameter', async () => {
    vi.mocked(listBatches).mockResolvedValue({ batches: [batch('INP-021', 'COMPLETED')], page: 2, pageSize: 20, total: 41 });
    renderPage(`${MIGRATION_PATHS.BATCHES}?page=2`);
    expect(await screen.findByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(listBatches).toHaveBeenCalledWith(2, 20);
    fireEvent.click(screen.getByRole('link', { name: 'Page 3' }));
    await screen.findByRole('table');
    expect(listBatches).toHaveBeenLastCalledWith(3, 20);
  });

  it('shows the service problem message when loading fails', async () => {
    vi.mocked(listBatches).mockRejectedValue(new MigrationApiError(0));
    renderPage();
    expect(await screen.findByText('Sorry, there is a problem with the service. Try again later.')).toBeInTheDocument();
  });

  it('redirects users who are not Tech Admins', () => {
    mocks.role = 'SUPERUSER';
    renderPage();
    expect(screen.getByTestId('location')).toHaveTextContent('/application-dashboard');
    expect(listBatches).not.toHaveBeenCalled();
  });
});
