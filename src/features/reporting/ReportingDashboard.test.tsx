import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReportingDashboard from './ReportingDashboard';
import type { AdminReport, OrganisationReportRow } from './types';

let role = 'SUPERUSER';
let dashboard: Record<string, unknown>;

vi.mock('../../context/AuthUserContext', () => ({ useAuthUserContext: () => ({ user: { role } }) }));
vi.mock('./useReportingDashboard', () => ({ useReportingDashboard: () => dashboard }));

const organisation = (organisationName: string, counts: Partial<OrganisationReportRow> = {}): OrganisationReportRow => ({
  organisationName,
  s37Draft: 0,
  s37Submitted: 0,
  nwlDraft: 0,
  nwlSubmitted: 0,
  accessRequests: 0,
  pendingRequests: 0,
  applicantRequests: 0,
  agentRequests: 0,
  applicantPendingRequests: 0,
  agentPendingRequests: 0,
  ...counts,
});

const liveReport = (metrics: Record<string, number>, organisations: OrganisationReportRow[]): AdminReport => ({
  startDate: '2026-09-01',
  endDate: '2026-09-01',
  timezone: 'Europe/London',
  generatedAt: '2026-09-23T12:00:00.000Z',
  source: 'live',
  metrics: Object.entries(metrics).map(([key, value]) => ({ key, label: key, value })),
  organisations,
});

const showReport = (report: AdminReport, overrides: Record<string, unknown> = {}) => {
  dashboard = {
    preset: 'custom',
    startDate: report.startDate,
    endDate: report.endDate,
    report,
    organisationFilter: '',
    visibleOrganisations: report.organisations,
    loading: false,
    error: null,
    loadReport: vi.fn(),
    updatePreset: vi.fn(),
    updateStartDate: vi.fn(),
    updateEndDate: vi.fn(),
    setOrganisationFilter: vi.fn(),
    downloadCsv: vi.fn(),
    availableDates: [],
    availabilityLoaded: false,
    availableDateRange: null,
    isPresetAvailable: () => true,
    ...overrides,
  };
  return render(
    <MemoryRouter>
      <ReportingDashboard />
    </MemoryRouter>
  );
};

describe('ReportingDashboard', () => {
  beforeEach(() => {
    role = 'SUPERUSER';
  });

  it('offers Download CSV to TECH_ADMIN only, not to SUPERUSER', () => {
    const report = liveReport({ access_requests: 1 }, [organisation('SP Manweb', { accessRequests: 1 })]);

    showReport(report);
    expect(screen.queryByRole('button', { name: 'Download CSV' })).not.toBeInTheDocument();

    role = 'TECH_ADMIN';
    showReport(report);
    expect(screen.getByRole('button', { name: 'Download CSV' })).toBeInTheDocument();
  });

  it('lists every organisation under "By role and organisation", including those with no requests', () => {
    showReport(liveReport({ applicant_requests: 1 }, [
      organisation('Northern Powergrid', { applicantRequests: 1 }),
      organisation('SP Manweb'),
    ]));

    const table = screen.getByRole('region', { name: /^Access requests by role and organisation table/ });
    expect(within(table).getByText('Northern Powergrid')).toBeInTheDocument();
    const quietRow = within(table).getByText('SP Manweb').closest('tr') as HTMLElement;
    expect(within(quietRow).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['0', '0', '0', '0']);
  });

  it('shows archived applications as their own status, in the status table and the chart', () => {
    showReport(liveReport({ total_applications: 3, s37_archived: 2, nwl_archived: 1 }, [organisation('SP Manweb')]));

    const table = screen.getByRole('region', { name: /^Application status table/ });
    const archivedRow = within(table).getByText('Archived').closest('tr') as HTMLElement;
    expect(within(archivedRow).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['2', '1', '3']);

    const chart = screen.getByRole('figure', { name: 'Applications by category' });
    expect(within(chart).getByText('Archived').parentElement).toHaveTextContent('Archived3');
  });

  it('shows a status row for every application state, so the status table adds up to Applications started', () => {
    showReport(liveReport({
      total_applications: 6, s37_draft: 1, s37_in_progress: 2, nwl_representation_stage: 3,
    }, [organisation('SP Manweb')]));

    const table = screen.getByRole('region', { name: /^Application status table/ });
    const cells = (status: string) =>
      within(within(table).getByText(status).closest('tr') as HTMLElement).getAllByRole('cell').map((cell) => cell.textContent);
    expect(cells('In progress')).toEqual(['2', '0', '2']);
    expect(cells('Representation stage')).toEqual(['0', '3', '3']);
    const totals = within(table).getAllByRole('row').slice(1).map((row) => Number(within(row).getAllByRole('cell')[2].textContent));
    expect(totals.reduce((sum, value) => sum + value, 0)).toBe(6);
  });

  it('labels the Applications section figures "Started" and "Submitted"', () => {
    showReport(liveReport({ total_applications: 22, total_submitted: 2 }, [organisation('SP Manweb')]));

    const section = screen.getByRole('heading', { level: 2, name: 'Applications' }).closest('section') as HTMLElement;
    const figures = within(section).getAllByRole('term').map((term) => [term.textContent, term.nextElementSibling?.textContent]);
    expect(figures).toEqual([['Started', '22'], ['Submitted', '2']]);
  });

  it('uses the same heading size as the Organisation page and shows no "Live figures" line in the Summary', () => {
    showReport(liveReport({ access_requests: 1 }, [organisation('SP Manweb', { accessRequests: 1 })]));

    const heading = screen.getByRole('heading', { level: 1, name: 'Reporting dashboard' });
    expect(heading).toHaveClass('govuk-heading-l');
    expect(heading).not.toHaveClass('govuk-heading-xl');
    expect(screen.queryByText(/^Live figures from the application database/)).not.toBeInTheDocument();
  });

  it('does not show the explanatory hint lines on the live report', () => {
    showReport(liveReport({ total_applications: 1, s37_draft: 1, s37_created: 1 }, [organisation('SP Manweb', { s37Draft: 1 })]));

    for (const hint of [
      'Applications started or submitted in the selected period.',
      'In draft: created in this period and still in draft today. Submitted: submitted in this period. Total: the two added together.',
      'The chart and status table below show applications started in the selected period, by their status today.',
      'Registrations requested in the selected period, by their status today.',
      'Drafts: applications started in the selected period and still in draft.',
    ]) {
      expect(screen.queryByText(hint)).not.toBeInTheDocument();
    }
  });

  it('shows the Registrations Total column last, after Applicant and Agent', () => {
    showReport(liveReport({ registrations_approved: 5, registrations_approved_applicant: 4, registrations_approved_agent: 1 }, [organisation('SP Manweb')]));

    const table = screen.getByRole('region', { name: /^Registrations by status table/ });
    expect(within(table).getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['Status', 'Applicant', 'Agent', 'Total']);
    const approved = within(table).getByText('Approved').closest('tr') as HTMLElement;
    expect(within(approved).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['4', '1', '5']);
  });

  it('does not show the "Reporting data is available from ... to ..." line under the date filters', () => {
    showReport(liveReport({}, [organisation('SP Manweb')]), {
      availabilityLoaded: true,
      availableDates: ['2026-07-27', '2026-09-23'],
      availableDateRange: { startDate: '2026-07-27', endDate: '2026-09-23' },
    });

    expect(screen.queryByText(/Reporting data is available from/)).not.toBeInTheDocument();
  });

  it('shows the access request tables under h3 headings inside Access requests, with no Contents links of their own, and groups the organisation columns by role', () => {
    showReport(liveReport({ applicant_requests: 2, agent_requests: 1 }, [organisation('SP Manweb', { applicantRequests: 2, agentRequests: 1 })]));

    expect(screen.queryByRole('heading', { name: /^By role/ })).not.toBeInTheDocument();
    const accessSection = screen.getByRole('heading', { level: 2, name: 'Access requests' }).closest('section') as HTMLElement;
    for (const title of ['Access requests by role', 'Access requests by role and organisation']) {
      const heading = screen.getByRole('heading', { level: 3, name: title });
      expect(heading).toHaveClass('govuk-heading-m');
      expect(accessSection).toContainElement(heading);
      expect(screen.queryByRole('link', { name: title })).not.toBeInTheDocument();
      expect(screen.getByRole('table', { name: title })).toBeInTheDocument();
    }
    const byOrganisation = screen.getByRole('table', { name: 'Access requests by role and organisation' });
    for (const group of ['Applicant', 'Agent']) {
      const header = within(byOrganisation).getByRole('columnheader', { name: group });
      expect(header).toHaveAttribute('scope', 'colgroup');
      expect(header).toHaveAttribute('colspan', '2');
    }
    expect(within(byOrganisation).getAllByRole('columnheader', { name: 'Received' })).toHaveLength(2);
    expect(within(byOrganisation).getAllByRole('columnheader', { name: 'Pending' })).toHaveLength(2);
  });

  it('shows the live dashboard with zeros for a range with no activity, not the "no data" message', () => {
    showReport(liveReport({ total_applications: 0, access_requests: 0 }, []));

    expect(screen.getByRole('heading', { name: 'Summary' })).toBeInTheDocument();
    expect(screen.queryByText('No data is available for the selected date range.')).not.toBeInTheDocument();
  });
});
