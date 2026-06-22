import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChangeOrganisationsPage from './ChangeOrganisationsPage';
import * as yourDetailsService from '../services/yourDetailsService';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('ChangeOrganisationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(yourDetailsService, 'getCurrentUserOrganisationSelection').mockResolvedValue({
      approvedOrganisations: [
        {
          organisationId: 'approved-1',
          organisationName: 'Electricity North West',
        },
      ],
      pendingOrganisations: [
        {
          organisationId: 'pending-1',
          organisationName: 'SP Energy Networks',
        },
      ],
      availableOrganisations: [
        {
          organisationId: 'org-1',
          organisationName: 'National Grid Electricity Distribution',
        },
        {
          organisationId: 'org-2',
          organisationName: 'Northern Powergrid',
        },
      ],
    });

    vi.spyOn(yourDetailsService, 'submitCurrentUserOrganisationRequest').mockResolvedValue();
  });

  it('shows validation error when no organisations are selected', async () => {
    render(
      <MemoryRouter>
        <ChangeOrganisationsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Select all the new organisations you will submit applications for',
        })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(screen.getAllByText('Select at least one organisation').length).toBeGreaterThan(0);
    expect(yourDetailsService.submitCurrentUserOrganisationRequest).not.toHaveBeenCalled();
  });

  it('submits selected organisations and navigates to confirmation', async () => {
    render(
      <MemoryRouter>
        <ChangeOrganisationsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('National Grid Electricity Distribution')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('National Grid Electricity Distribution'));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    await waitFor(() => {
      expect(yourDetailsService.submitCurrentUserOrganisationRequest).toHaveBeenCalledWith({
        organisationIds: ['org-1'],
      });
    });

    expect(navigateMock).toHaveBeenCalledWith('/your-details/change-organisations/confirmation');
  });
});
