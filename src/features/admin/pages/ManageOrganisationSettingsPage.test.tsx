import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ManageOrganisationSettingsPage from './ManageOrganisationSettingsPage';

vi.mock('../../../hooks', () => ({
  useOrganisation: () => ({
    organisation: {
      organisation_id: 'organisation-123',
      organisation_name: 'SSE Networks',
      team_coordinators: ['Jane Austen', 'Leo Tolstoy', 'Bob Mortimer'],
      team_coordinator_emails: [
        'jane.austen@sse.com',
        'leo.tolstoy@sse.com',
        'bob.mortimer@sse.co.uk',
      ],
      approved_domains: ['sse.com'],
      address_line1: '1 Washington Street',
      address_line2: 'Riverside Park',
      town_city: 'Worcester',
      county: 'Worcestershire',
      postcode: 'WR1 1NL',
    },
    loading: false,
    error: '',
  }),
}));

describe('ManageOrganisationSettingsPage', () => {
  it('populates the selected organisation information', () => {
    render(
      <MemoryRouter initialEntries={['/admin/organisation/organisation-123/settings']}>
        <Routes>
          <Route
            path="/admin/organisation/:organisationId/settings"
            element={<ManageOrganisationSettingsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Manage organisation' })).toBeInTheDocument();

    const nameRow = screen.getByText('Organisation name').closest('.govuk-summary-list__row');
    expect(nameRow).toBeInstanceOf(HTMLElement);
    expect(within(nameRow as HTMLElement).getByText('SSE Networks')).toBeInTheDocument();
    expect(within(nameRow as HTMLElement).getByRole('link', { name: 'Change organisation name' })).toHaveAttribute(
      'href',
      '/admin/organisations/organisation-123/change-name'
    );

    const addressRow = screen.getByText('Organisation address').closest('.govuk-summary-list__row');
    expect(addressRow).toHaveTextContent(
      '1 Washington StreetRiverside ParkWorcesterWorcestershireWR1 1NL'
    );
    expect(within(addressRow as HTMLElement).getByRole('link', { name: 'Change organisation address' })).toHaveAttribute(
      'href',
      '/admin/organisations/organisation-123/change-address'
    );

    const coordinatorsRow = screen.getByText('Team coordinators').closest('.govuk-summary-list__row');
    expect(coordinatorsRow).toHaveTextContent(
      'jane.austen@sse.com,leo.tolstoy@sse.com,bob.mortimer@sse.co.uk'
    );
    expect(coordinatorsRow).not.toHaveTextContent('Jane Austen');

    expect(screen.queryByText('Approved domains')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/admin/user-management'
    );
    expect(screen.getByRole('link', { name: 'Return to dashboard' })).toHaveAttribute(
      'href',
      '/admin/user-management'
    );
  });
});