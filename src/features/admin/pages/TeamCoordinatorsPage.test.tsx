import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TeamCoordinatorsPage from './TeamCoordinatorsPage';
import { BreadcrumbProvider, useBreadcrumbContext } from '../../../context/BreadcrumbContext';

let coordinatorsState: { coordinators: unknown[]; loading: boolean; error: string };

vi.mock('../../../hooks', () => ({
  useOrganisation: () => ({
    organisation: { organisation_id: 'org-1', organisation_name: 'SSE Networks' },
    loading: false,
    error: '',
  }),
  useTeamCoordinators: () => coordinatorsState,
}));

const BreadcrumbOutlet = () => {
  const { breadcrumb } = useBreadcrumbContext();
  return <>{breadcrumb}</>;
};

const coordinator = (user_id: string, first_name: string, last_name: string, email: string) => ({
  user_id, first_name, last_name, email,
});

const renderPage = () =>
  render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={['/admin/organisations/org-1/team-coordinators']}>
        <BreadcrumbOutlet />
        <Routes>
          <Route path="/admin/organisations/:organisationId/team-coordinators" element={<TeamCoordinatorsPage />} />
        </Routes>
      </MemoryRouter>
    </BreadcrumbProvider>
  );

describe('TeamCoordinatorsPage (SYEIA-2745)', () => {
  beforeEach(() => {
    coordinatorsState = {
      coordinators: [
        coordinator('u3', 'Leo', 'Tolstoy', 'leo@sse.com'),
        coordinator('u1', 'Bob', 'Mortimer', 'bob@sse.com'),
        coordinator('u2', 'Jane', 'Austen', 'jane@sse.com'),
      ],
      loading: false,
      error: '',
    };
  });

  it('shows the organisation caption, heading with count and intro', () => {
    renderPage();
    expect(screen.getByText('SSE Networks')).toHaveClass('govuk-caption-xl');
    expect(screen.getByRole('heading', { level: 1, name: 'Manage team coordinators (3)' })).toBeInTheDocument();
    expect(
      screen.getByText('Manage the team coordinators who review access requests and manage users for this organisation.')
    ).toBeInTheDocument();
  });

  it('lists coordinators sorted A to Z by full name with Full name, Email address and Action columns', () => {
    renderPage();
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Full name', 'Email address', 'Action']);
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows.map((r) => within(r).getAllByRole('cell')[0].textContent)).toEqual([
      'Bob Mortimer',
      'Jane Austen',
      'Leo Tolstoy',
    ]);
    expect(within(rows[0]).getByText('bob@sse.com')).toBeInTheDocument();
  });

  it('links each Manage action to the Manage user page', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Manage Jane Austen' })).toHaveAttribute('href', '/admin/manage-user/u2');
    expect(screen.getAllByRole('link', { name: /^Manage / })).toHaveLength(3);
  });

  it('has a Back link to Manage organisation', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/admin/organisation/org-1/settings');
  });

  it('does not show the old placeholder columns or buttons', () => {
    renderPage();
    expect(screen.queryByText('Location')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save and continue' })).not.toBeInTheDocument();
  });

  it('shows an empty message when there are no coordinators', () => {
    coordinatorsState = { coordinators: [], loading: false, error: '' };
    renderPage();
    expect(screen.getByText('No team coordinators found')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Manage team coordinators (0)' })).toBeInTheDocument();
  });

  it('shows the error summary when loading fails', () => {
    coordinatorsState = { coordinators: [], loading: false, error: 'Boom' };
    renderPage();
    expect(screen.getByText('Boom')).toBeInTheDocument();
  });
});