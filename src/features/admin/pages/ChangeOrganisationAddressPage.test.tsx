import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChangeOrganisationAddressPage from './ChangeOrganisationAddressPage';
import organisationService from '../../../services/organisationService';

const { organisation } = vi.hoisted(() => ({
  organisation: {
    organisation_id: 'organisation-123',
    address_line1: '1 Washington Street',
    address_line2: 'Riverside Park',
    town_city: 'Worcester',
    county: 'Worcestershire',
    postcode: 'WR1 1NL',
  },
}));

vi.mock('../../../hooks', () => ({
  useOrganisation: () => ({
    organisation,
    loading: false,
    error: '',
  }),
}));
vi.mock('../../../services/organisationService', () => ({
  default: { updateOrganisationAddress: vi.fn() },
}));

const NavigationResult = () => {
  const location = useLocation();
  return <div>{`${location.pathname}:${location.state?.updatedSection}`}</div>;
};

const renderPage = () => render(
  <MemoryRouter initialEntries={['/admin/organisations/organisation-123/change-address']}>
    <Routes>
      <Route
        path="/admin/organisations/:organisationId/change-address"
        element={<ChangeOrganisationAddressPage />}
      />
      <Route
        path="/admin/organisation/:organisationId/settings"
        element={<NavigationResult />}
      />
    </Routes>
  </MemoryRouter>
);

describe('ChangeOrganisationAddressPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('pre-populates every existing address field', () => {
    renderPage();

    expect(screen.getByLabelText('Address line 1')).toHaveValue('1 Washington Street');
    expect(screen.getByLabelText('Address line 2 (optional)')).toHaveValue('Riverside Park');
    expect(screen.getByLabelText('Town or city')).toHaveValue('Worcester');
    expect(screen.getByLabelText('County (optional)')).toHaveValue('Worcestershire');
    expect(screen.getByLabelText('Postcode')).toHaveValue('WR1 1NL');
  });

  it('shows all client-side validation errors without submitting', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('Address line 1'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Town or city'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Postcode'), { target: { value: 'invalid' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(
      await screen.findAllByText('Enter address line 1, typically the building and street')
    ).toHaveLength(2);
    expect(screen.getAllByText('Enter a town or city')).toHaveLength(2);
    expect(screen.getAllByText('Enter a full UK postcode')).toHaveLength(2);
    expect(organisationService.updateOrganisationAddress).not.toHaveBeenCalled();
  });

  it('shows field validation errors returned by the API', async () => {
    vi.mocked(organisationService.updateOrganisationAddress).mockResolvedValue({
      success: false,
      validationErrors: { postcode: 'Enter a full UK postcode' },
    });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(await screen.findAllByText('Enter a full UK postcode')).toHaveLength(2);
  });

  it('submits normalised values and returns to manage organisation on success', async () => {
    vi.mocked(organisationService.updateOrganisationAddress).mockResolvedValue({ success: true });
    renderPage();
    fireEvent.change(screen.getByLabelText('Address line 1'), {
      target: { value: ' 10 Downing Street ' },
    });
    fireEvent.change(screen.getByLabelText('Address line 2 (optional)'), {
      target: { value: ' ' },
    });
    fireEvent.change(screen.getByLabelText('Town or city'), { target: { value: ' London ' } });
    fireEvent.change(screen.getByLabelText('County (optional)'), {
      target: { value: ' Greater London ' },
    });
    fireEvent.change(screen.getByLabelText('Postcode'), { target: { value: ' sw1a 1aa ' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    await waitFor(() => {
      expect(organisationService.updateOrganisationAddress).toHaveBeenCalledWith(
        'organisation-123',
        {
          line1: '10 Downing Street',
          line2: '',
          townCity: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
        }
      );
    });
    expect(
      await screen.findByText('/admin/organisation/organisation-123/settings:address')
    ).toBeInTheDocument();
  });
});