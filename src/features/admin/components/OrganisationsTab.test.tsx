import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { OrganisationsTab } from './OrganisationsTab';

const organisation = {
  organisation_id: 'organisation-123',
  organisation_name: 'SSE Networks',
  team_coordinators: ['Jane Austen', 'Leo Tolstoy', 'Bob Mortimer'],
  approved_domains: [],
  address_line1: '1 Washington Street',
  address_line2: 'Riverside Park',
  town_city: 'Worcester',
  county: 'Worcestershire',
  postcode: 'WR1 1NL',
};

describe('OrganisationsTab', () => {
  it('shows the organisation details and manage destination', () => {
    render(
      <MemoryRouter>
        <OrganisationsTab organisations={[organisation]} loading={false} error="" />
      </MemoryRouter>
    );

    expect(screen.getByText('1 result')).toBeInTheDocument();
    expect(screen.getByText('SSE Networks')).toBeInTheDocument();
    expect(screen.getByText('Jane Austen, Leo Tolstoy, Bob Mortimer')).toBeInTheDocument();
    expect(
      screen.getByText('1 Washington Street, Riverside Park, Worcester, Worcestershire, WR1 1NL')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Manage' })).toHaveAttribute(
      'href',
      '/admin/organisation/organisation-123/settings'
    );
  });

  it('shows an empty state when no organisation is returned', () => {
    render(
      <MemoryRouter>
        <OrganisationsTab organisations={[]} loading={false} error="" />
      </MemoryRouter>
    );

    expect(screen.getByText('0 results')).toBeInTheDocument();
    expect(screen.getByText('No organisations found.')).toBeInTheDocument();
  });
});