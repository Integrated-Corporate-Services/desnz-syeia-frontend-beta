import React from 'react';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ role: 'TECH_ADMIN' }));
vi.mock('../../../context/AuthUserContext', () => ({
  useAuthUserContext: () => ({ user: { role: mocks.role, user_id: 'u1' }, loading: false }),
}));
vi.mock('../../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <span data-testid="page-title">{title}</span>,
}));

import BatchConfirmationRoute from './BatchConfirmationPage';
import { renderAt } from '../testUtils';
import { LAST_STARTED_BATCH_STORAGE_KEY, MIGRATION_PATHS } from '../constants';

const path = MIGRATION_PATHS.NEW_BATCH_CONFIRMATION;

describe('BatchConfirmationPage', () => {
  beforeEach(() => {
    mocks.role = 'TECH_ADMIN';
  });

  it('shows the panel with the batch ID from router state and what happens next', () => {
    renderAt(<BatchConfirmationRoute />, path, path, { batchId: 'INP-001' });
    expect(screen.getByRole('heading', { name: 'Migration started' })).toBeInTheDocument();
    expect(screen.getByText('Batch INP-001 has been sent for migration')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What happens next' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View this batch' })).toHaveAttribute('href', '/admin/migration/batches/INP-001');
  });

  it('keeps the panel after a refresh using sessionStorage', () => {
    sessionStorage.setItem(LAST_STARTED_BATCH_STORAGE_KEY, JSON.stringify('INP-002'));
    renderAt(<BatchConfirmationRoute />, path, path);
    expect(screen.getByText('Batch INP-002 has been sent for migration')).toBeInTheDocument();
  });

  it('goes to the batches list when there is no batch to confirm', () => {
    renderAt(<BatchConfirmationRoute />, path, path);
    expect(screen.getByTestId('location')).toHaveTextContent(MIGRATION_PATHS.BATCHES);
  });

  it('redirects users who are not Tech Admins', () => {
    mocks.role = 'SUPERUSER';
    renderAt(<BatchConfirmationRoute />, path, path, { batchId: 'INP-001' });
    expect(screen.getByTestId('location')).toHaveTextContent('/application-dashboard');
  });
});
