import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChangeOrganisationNamePage from './ChangeOrganisationNamePage';
import organisationService from '../../../services/organisationService';

const { organisation } = vi.hoisted(() => ({
  organisation: { organisation_id: 'organisation-123', organisation_name: 'SSE Networks' },
}));

vi.mock('../../../hooks', () => ({
  useOrganisation: () => ({
    organisation,
    loading: false,
    error: '',
  }),
}));
vi.mock('../../../services/organisationService', () => ({
  default: { updateOrganisationName: vi.fn() },
}));

const NavigationResult = () => {
  const location = useLocation();
  return <div>{`${location.pathname}:${location.state?.updatedSection}`}</div>;
};

const renderPage = () => render(
  <MemoryRouter initialEntries={['/admin/organisations/organisation-123/change-name']}>
    <Routes>
      <Route
        path="/admin/organisations/:organisationId/change-name"
        element={<ChangeOrganisationNamePage />}
      />
      <Route
        path="/admin/organisation/:organisationId/settings"
        element={<NavigationResult />}
      />
    </Routes>
  </MemoryRouter>
);

describe('ChangeOrganisationNamePage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('pre-populates the current name and links back to manage organisation', () => {
    renderPage();

    expect(screen.getByLabelText('Organisation name')).toHaveValue('SSE Networks');
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/admin/organisation/organisation-123/settings'
    );
  });

  it.each([
    ['', 'Enter an organisation name'],
    ['a'.repeat(256), 'Organisation name must be 255 characters or fewer'],
  ])('shows client-side validation and does not submit invalid input', async (value, message) => {
    renderPage();
    fireEvent.change(screen.getByLabelText('Organisation name'), { target: { value } });

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(await screen.findAllByText(message)).toHaveLength(2);
    expect(organisationService.updateOrganisationName).not.toHaveBeenCalled();
  });

  it('shows a duplicate-name validation error returned by the API', async () => {
    vi.mocked(organisationService.updateOrganisationName).mockResolvedValue({
      success: false,
      validationErrors: { organisationName: 'An organisation with this name already exists' },
    });
    renderPage();
    fireEvent.change(screen.getByLabelText('Organisation name'), {
      target: { value: 'Existing Network' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    expect(
      await screen.findAllByText('An organisation with this name already exists')
    ).toHaveLength(2);
  });

  it('submits a trimmed name and returns to manage organisation on success', async () => {
    vi.mocked(organisationService.updateOrganisationName).mockResolvedValue({ success: true });
    renderPage();
    fireEvent.change(screen.getByLabelText('Organisation name'), {
      target: { value: '  National Grid  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    await waitFor(() => {
      expect(organisationService.updateOrganisationName).toHaveBeenCalledWith(
        'organisation-123',
        'National Grid'
      );
    });
    expect(
      await screen.findByText('/admin/organisation/organisation-123/settings:name')
    ).toBeInTheDocument();
  });
});