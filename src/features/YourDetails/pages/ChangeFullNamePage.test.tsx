import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChangeFullNamePage from './ChangeFullNamePage';
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

describe('ChangeFullNamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    vi.spyOn(yourDetailsService, 'getCurrentUserDetails').mockResolvedValue({
      title: 'Ms',
      firstName: 'Alex',
      lastName: 'Smith',
      fullName: 'Alex Smith',
      organisationName: 'SSE Networks',
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

    vi.spyOn(yourDetailsService, 'updateCurrentUserFullName').mockResolvedValue();
  });

  it('shows validation errors when names are missing', async () => {
    render(
      <MemoryRouter>
        <ChangeFullNamePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change your full name' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('First name'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(screen.getByText('There is a problem')).toBeInTheDocument();
    expect(screen.getByText('First name is not valid')).toBeInTheDocument();
    expect(screen.getByText('Last name is not valid')).toBeInTheDocument();
    expect(yourDetailsService.updateCurrentUserFullName).not.toHaveBeenCalled();
  });

  it('saves and redirects to your details with one-time banner flag', async () => {
    render(
      <MemoryRouter>
        <ChangeFullNamePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Alex')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Alexa' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Smith' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    await waitFor(() => {
      expect(yourDetailsService.updateCurrentUserFullName).toHaveBeenCalledWith({
        title: 'Ms',
        firstName: 'Alexa',
        lastName: 'Smith',
      });
    });

    expect(sessionStorage.getItem(SUCCESS_BANNER_KEY)).toBe('full name');
    expect(navigateMock).toHaveBeenCalledWith('/your-details');
  });
});
