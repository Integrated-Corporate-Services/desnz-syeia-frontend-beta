import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ role: 'TECH_ADMIN' }));
vi.mock('../../../context/AuthUserContext', () => ({
  useAuthUserContext: () => ({ user: { role: mocks.role, user_id: 'u1' }, loading: false }),
}));
vi.mock('../../../components/PageTitle', () => ({
  default: ({ title }: { title: string }) => <span data-testid="page-title">{title}</span>,
}));
vi.mock('../services/migrationApi', () => ({
  getMigratedApplication: vi.fn(),
  markDocumentsComplete: vi.fn(),
  removeDocument: vi.fn(),
}));

import MigratedApplicationRoute from './MigratedApplicationPage';
import { getMigratedApplication, markDocumentsComplete, removeDocument } from '../services/migrationApi';
import { MigrationApiError } from '../utils/errors';
import { renderAt, sampleApplication } from '../testUtils';
import { MIGRATION_PATHS } from '../constants';

const APP_ID = '11111111-1111-1111-1111-111111111111';
const renderPage = (state?: unknown) =>
  renderAt(<MigratedApplicationRoute />, MIGRATION_PATHS.APPLICATION, '/admin/migration/applications/NWL-2025-000123', state);

describe('MigratedApplicationPage', () => {
  beforeEach(() => {
    mocks.role = 'TECH_ADMIN';
    vi.mocked(getMigratedApplication).mockReset().mockResolvedValue(sampleApplication());
    vi.mocked(markDocumentsComplete).mockReset();
    vi.mocked(removeDocument).mockReset();
  });

  it('shows the migration summary, documents grouped by type and read-only application data', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { level: 1, name: 'Migrated application NWL-2025-000123' })).toBeInTheDocument();
    expect(getMigratedApplication).toHaveBeenCalledWith('NWL-2025-000123');
    expect(screen.getByRole('link', { name: 'INP-25-NOV-001' })).toHaveAttribute('href', '/admin/migration/batches/INP-25-NOV-001');
    expect(screen.getAllByText(APP_ID, { selector: 'dd' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Application plan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Wayleave offer' })).toBeInTheDocument();
    expect(screen.getByText('No viruses found')).toHaveClass('govuk-tag--green');
    expect(screen.getByText('Checking for viruses')).toBeInTheDocument();
    // Remove only for documents the API marks removable
    expect(screen.getByRole('link', { name: 'Remove plan.pdf' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Remove migrated.pdf' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add a document' })).toHaveAttribute(
      'href',
      '/admin/migration/applications/NWL-2025-000123/documents/new'
    );
    expect(screen.getByRole('heading', { name: 'Application data' })).toBeInTheDocument();
    expect(screen.getByText('Line use type')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Assets 1' })).toBeInTheDocument();
  });

  it('shows a success banner passed in router state', async () => {
    renderPage({ success: 'The document has been added and checked for viruses' });
    expect(await screen.findByText('The document has been added and checked for viruses')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Success' })).toBeInTheDocument();
  });

  it('marks documents as complete and shows a success banner', async () => {
    vi.mocked(markDocumentsComplete).mockResolvedValue({});
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Mark documents as complete' }));
    expect(await screen.findByText('The documents have been marked as complete')).toBeInTheDocument();
    expect(markDocumentsComplete).toHaveBeenCalledWith(APP_ID);
    expect(getMigratedApplication).toHaveBeenCalledTimes(2);
  });

  it('hides the complete button once documents are complete', async () => {
    const data = sampleApplication();
    data.migration.statuses.documentRecord = 'WRITTEN';
    vi.mocked(getMigratedApplication).mockResolvedValue(data);
    renderPage();
    expect(await screen.findByText('The documents for this application have been marked as complete.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark documents as complete' })).not.toBeInTheDocument();
  });

  it('asks for confirmation before removing a document', async () => {
    vi.mocked(removeDocument).mockResolvedValue({});
    renderPage();
    fireEvent.click(await screen.findByRole('link', { name: 'Remove plan.pdf' }));
    const confirm = screen.getByRole('region', { name: 'Are you sure you want to remove plan.pdf?' });
    await waitFor(() => expect(within(confirm).getByRole('heading')).toHaveFocus());

    fireEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(removeDocument).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('link', { name: 'Remove plan.pdf' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, remove document' }));
    expect(await screen.findByText('The document has been removed')).toBeInTheDocument();
    expect(removeDocument).toHaveBeenCalledWith(APP_ID, 'doc-1');
  });

  it('shows a 409 from an action in a focused error summary', async () => {
    vi.mocked(markDocumentsComplete).mockRejectedValue(
      new MigrationApiError(409, { serverMessage: 'Documents are already complete' })
    );
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Mark documents as complete' }));
    const summary = await screen.findByRole('alert');
    expect(summary).toHaveTextContent('Documents are already complete');
    await waitFor(() => expect(summary).toHaveFocus());
    expect(screen.getByTestId('page-title')).toHaveTextContent(/^Error: /);
  });

  it('shows "Application not found or not migrated" for a 404', async () => {
    vi.mocked(getMigratedApplication).mockRejectedValue(new MigrationApiError(404));
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Application not found or not migrated' })).toBeInTheDocument();
  });

  it('shows the service problem page for a network error', async () => {
    vi.mocked(getMigratedApplication).mockRejectedValue(new MigrationApiError(0));
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Sorry, there is a problem with the service' })).toBeInTheDocument();
  });

  it('redirects users who are not Tech Admins', () => {
    mocks.role = 'SUPERUSER';
    renderPage();
    expect(screen.getByTestId('location')).toHaveTextContent('/application-dashboard');
    expect(getMigratedApplication).not.toHaveBeenCalled();
  });
});
