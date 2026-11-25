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
vi.mock('../services/migrationApi', () => ({ getBatch: vi.fn() }));

import BatchDetailsRoute from './BatchDetailsPage';
import { getBatch } from '../services/migrationApi';
import { MigrationApiError } from '../utils/errors';
import { renderAt } from '../testUtils';
import { MIGRATION_PATHS } from '../constants';
import type { MigrationBatchDetails } from '../types';

const details = (overrides: Partial<MigrationBatchDetails> = {}): MigrationBatchDetails => ({
  batchId: 'INP-001',
  status: 'COMPLETED',
  preflightStatus: 'WF1_STARTED',
  expectedCaseCount: 2,
  loadedCaseCount: 1,
  failedCaseCount: 1,
  createdAt: '2026-11-25T10:00:00.000Z',
  updatedAt: '2026-11-25T11:00:00.000Z',
  failureCode: null,
  failureReason: null,
  cases: [
    {
      legacyCaseId: 'CASE-1',
      desnzRef: 'NWL-2025-000123',
      applicationId: 'app-1',
      validationStatus: 'VALID',
      awsLoadStatus: 'LOADED',
      salesforceLoadStatus: 'LOADED',
      documentRecordStatus: 'PENDING',
      failureReason: null,
    },
    {
      legacyCaseId: 'CASE-2',
      desnzRef: null,
      applicationId: null,
      validationStatus: 'INVALID',
      awsLoadStatus: 'PENDING',
      salesforceLoadStatus: 'PENDING',
      documentRecordStatus: 'PENDING',
      failureReason: 'Postcode is missing',
    },
  ],
  ...overrides,
});

const renderPage = () =>
  renderAt(<BatchDetailsRoute />, MIGRATION_PATHS.BATCH_DETAILS, '/admin/migration/batches/INP-001/details');

describe('BatchDetailsPage', () => {
  beforeEach(() => {
    mocks.role = 'TECH_ADMIN';
    vi.mocked(getBatch).mockReset();
  });

  it('shows the summary and the cases table with status tags and application links', async () => {
    vi.mocked(getBatch).mockResolvedValue(details());
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Batch INP-001' })).toBeInTheDocument();
    expect(getBatch).toHaveBeenCalledWith('INP-001');
    expect(screen.getByText('Completed')).toHaveClass('govuk-tag--green');
    expect(screen.getByText('Migration started')).toBeInTheDocument();
    const table = screen.getByRole('table');
    expect(within(table).getByRole('link', { name: 'NWL-2025-000123' })).toHaveAttribute(
      'href',
      '/admin/migration/applications/NWL-2025-000123'
    );
    expect(within(table).getByText('Postcode is missing')).toBeInTheDocument();
    expect(within(table).getAllByText('Documents to add')).toHaveLength(2);
    expect(screen.queryByText('This batch has failed')).not.toBeInTheDocument();
  });

  it('shows the failure reason for a failed batch', async () => {
    vi.mocked(getBatch).mockResolvedValue(
      details({ status: 'VALIDATION_FAILED', failureCode: 'CASE_COUNT_MISMATCH', failureReason: 'Expected 2 cases but found 3', cases: [] })
    );
    renderPage();
    expect(await screen.findByText('This batch has failed')).toBeInTheDocument();
    expect(screen.getByText('Expected 2 cases but found 3')).toBeInTheDocument();
    expect(screen.getByText('Checks failed')).toHaveClass('govuk-tag--red');
    expect(screen.getByText('No cases have been recorded for this batch yet.')).toBeInTheDocument();
  });

  it('refreshes the batch', async () => {
    vi.mocked(getBatch).mockResolvedValue(details());
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Refresh' }));
    expect(getBatch).toHaveBeenCalledTimes(2);
  });

  it('shows Batch not found for a 404', async () => {
    vi.mocked(getBatch).mockRejectedValue(new MigrationApiError(404));
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Batch not found' })).toBeInTheDocument();
  });

  it('shows the service problem page for other errors', async () => {
    vi.mocked(getBatch).mockRejectedValue(new MigrationApiError(500));
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Sorry, there is a problem with the service' })).toBeInTheDocument();
  });

  it('redirects users who are not Tech Admins', () => {
    mocks.role = 'SUPERUSER';
    renderPage();
    expect(screen.getByTestId('location')).toHaveTextContent('/application-dashboard');
  });
});
