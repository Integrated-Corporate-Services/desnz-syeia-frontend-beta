import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChangeAgencyNamePage from './ChangeAgencyNamePage';
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

describe('ChangeAgencyNamePage', () => {
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
        approved: [],
        pending: [],
      },
      workAddress: {
        line1: 'Address line 1',
        line2: 'Address line 2',
        townCity: 'Town or city',
        county: 'County',
        postcode: 'PO5T C0D3',
      },
      oneLogin: {
        email: 'alex.smith@example.com',
        phone: '07123456789',
      },
    });

    vi.spyOn(yourDetailsService, 'updateCurrentUserAgencyName').mockResolvedValue();
  });

  it('shows validation error when agency name is empty', async () => {
    render(
      <MemoryRouter>
        <ChangeAgencyNamePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change your agency name' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Agency name'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(screen.getAllByText('Enter your agency name').length).toBeGreaterThan(0);
    expect(yourDetailsService.updateCurrentUserAgencyName).not.toHaveBeenCalled();
  });

  it('saves and redirects to your details with one-time banner flag', async () => {
    render(
      <MemoryRouter>
        <ChangeAgencyNamePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Fisher German')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Agency name'), { target: { value: 'Fisher Garman' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    await waitFor(() => {
      expect(yourDetailsService.updateCurrentUserAgencyName).toHaveBeenCalledWith({
        agencyName: 'Fisher Garman',
      });
    });

    expect(sessionStorage.getItem(SUCCESS_BANNER_KEY)).toBe('agency name');
    expect(navigateMock).toHaveBeenCalledWith('/your-details');
  });
});
