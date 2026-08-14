import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import YourDetailsPage from './YourDetailsPage';
import { SUCCESS_BANNER_KEY } from '../constants/yourDetails';
import * as yourDetailsService from '../services/yourDetailsService';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('YourDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    vi.spyOn(yourDetailsService, 'getCurrentUserDetails').mockResolvedValue({
      title: 'Ms',
      firstName: 'Alex',
      lastName: 'Smith',
      fullName: 'Alex Smith',
      organisationName: 'SSE Networks',
      agencyName: 'Fisher German',
      organisations: {
        approved: [
          {
            organisationId: 'org-1',
            organisationName: 'Electricity North West',
          },
        ],
        pending: [],
      },
      workAddress: {
        line1: 'Address line 1',
        line2: 'Address line 2',
        townCity: 'Town or city',
        county: 'Country',
        postcode: 'POST COD3',
      },
      oneLogin: {
        email: 'alex.smith@example.com',
        phone: '07123456789',
      },
    });
  });

  it('renders user details with uniquely named change links', async () => {
    render(
      <MemoryRouter>
        <YourDetailsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Your details' })).toBeInTheDocument();
    });

    expect(screen.getByText('Ms Alex Smith')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Change full name/i })).toHaveAttribute(
      'href',
      '/your-details/change-full-name'
    );
    expect(screen.getByRole('link', { name: /Change work address/i })).toHaveAttribute(
      'href',
      '/your-details/change-work-address'
    );
    expect(screen.queryByRole('link', { name: /Change agency name/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Change organisations/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Fisher German')).not.toBeInTheDocument();
    expect(screen.getByText('Electricity North West')).toBeInTheDocument();
    expect(screen.getByText('alex.smith@example.com')).toBeInTheDocument();
  });

  it('shows success banner once and clears session storage flag', async () => {
    sessionStorage.setItem(SUCCESS_BANNER_KEY, 'full name');

    render(
      <MemoryRouter>
        <YourDetailsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('You have successfully updated your full name.')).toBeInTheDocument();
    });

    expect(sessionStorage.getItem(SUCCESS_BANNER_KEY)).toBeNull();
  });
});
