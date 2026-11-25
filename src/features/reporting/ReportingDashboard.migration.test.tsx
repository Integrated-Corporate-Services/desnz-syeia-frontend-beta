import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ role: 'TECH_ADMIN' }));
vi.mock('../../context/AuthUserContext', () => ({ useAuthUserContext: () => ({ user: { role: mocks.role } }) }));
vi.mock('./useReportingDashboard', () => ({
  useReportingDashboard: () => ({
    report: null,
    loading: false,
    error: null,
    visibleOrganisations: [],
    availableDates: [],
    isPresetAvailable: () => true,
  }),
}));
vi.mock('./components/ReportingControls', () => ({ ReportingContents: () => null, ReportingFilters: () => null }));
vi.mock('./components/SubmittedApplicationsSummary', () => ({ default: () => null }));
vi.mock('./hooks/useApplicationStatusLookup', () => ({
  useApplicationStatusLookup: () => ({ reference: '', setReference: vi.fn(), result: null, loading: false, error: null, search: vi.fn() }),
}));

import ReportingDashboard from './ReportingDashboard';

const renderDashboard = () =>
  render(
    <MemoryRouter initialEntries={['/admin/reporting?tab=operational-tasks&subTab=migration']}>
      <ReportingDashboard />
    </MemoryRouter>
  );

describe('ReportingDashboard migration entry point', () => {
  beforeEach(() => {
    mocks.role = 'TECH_ADMIN';
  });

  it('shows the Migration sub-tab to a Tech Admin', () => {
    renderDashboard();
    expect(screen.getByRole('button', { name: 'Migration' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start a migration batch' })).toBeInTheDocument();
  });


  it('does not show operational tasks to a Superuser', () => {
    mocks.role = 'SUPERUSER';
    renderDashboard();
    expect(screen.queryByRole('button', { name: 'Migration' })).not.toBeInTheDocument();
  });
});
