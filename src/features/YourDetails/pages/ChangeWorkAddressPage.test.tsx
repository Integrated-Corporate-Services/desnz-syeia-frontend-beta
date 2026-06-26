import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChangeWorkAddressPage from './ChangeWorkAddressPage';
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

describe('ChangeWorkAddressPage', () => {
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

    vi.spyOn(yourDetailsService, 'updateCurrentUserWorkAddress').mockResolvedValue();
  });

  it('shows validation errors for required work address fields', async () => {
    render(
      <MemoryRouter>
        <ChangeWorkAddressPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change your work address' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Address line 1'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Town or city'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Postcode'), { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(screen.getByText('There is a problem')).toBeInTheDocument();
    expect(
      screen.getAllByText('Enter address line 1, typically the building and street').length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('Enter a town or city').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Enter a full UK postcode').length).toBeGreaterThan(0);
    expect(yourDetailsService.updateCurrentUserWorkAddress).not.toHaveBeenCalled();
  });

  it('saves and redirects to your details with one-time banner flag', async () => {
    render(
      <MemoryRouter>
        <ChangeWorkAddressPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Address line 1')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Address line 1'), { target: { value: '1 New Street' } });
    fireEvent.change(screen.getByLabelText('Address line 2 (optional)'), {
      target: { value: 'Business Park' },
    });
    fireEvent.change(screen.getByLabelText('Town or city'), { target: { value: 'Leeds' } });
    fireEvent.change(screen.getByLabelText('County (optional)'), { target: { value: 'West Yorkshire' } });
    fireEvent.change(screen.getByLabelText('Postcode'), { target: { value: 'LS1 4AP' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    await waitFor(() => {
      expect(yourDetailsService.updateCurrentUserWorkAddress).toHaveBeenCalledWith({
        line1: '1 New Street',
        line2: 'Business Park',
        townCity: 'Leeds',
        county: 'West Yorkshire',
        postcode: 'LS1 4AP',
      });
    });

    expect(sessionStorage.getItem(SUCCESS_BANNER_KEY)).toBe('work address');
    expect(navigateMock).toHaveBeenCalledWith('/your-details');
  });
});
