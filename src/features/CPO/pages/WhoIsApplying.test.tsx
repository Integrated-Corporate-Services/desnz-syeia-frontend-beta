import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationApiService } from '../../../services/applicationApiService';
import { networkOperatorApiService } from '../../../services/networkOperatorApiService';
import WhoIsApplying from './WhoIsApplying';
import ChooseApplicationType from '../../SignIn/ChooseApplicationTypePage';
import * as csrf from '../../../utils/csrf';

const navigate = vi.fn();
vi.mock('../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../../../utils/analytics', () => ({ trackButtonClick: vi.fn() }));
vi.mock('../../../context/AuthUserContext', () => ({ useAuthUserContext: () => ({ user: { user_id: 'user-id' } }) }));
vi.mock('react-router-dom', async () => ({
  ...await vi.importActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => navigate,
}));

const renderPage = (url = '/cpo/who-is-applying') => render(<MemoryRouter initialEntries={[url]}><WhoIsApplying /></MemoryRouter>);
const selectOrganisation = async () => {
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled());
  fireEvent.click(screen.getByRole('combobox', { name: 'Organisation' }));
  expect(screen.getAllByRole('option', { name: 'National Grid' })).toHaveLength(1);
  fireEvent.click(screen.getByRole('option', { name: 'National Grid' }));
};

describe('CPO Who is applying', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.spyOn(networkOperatorApiService, 'getNetworkOperators').mockResolvedValue([
      { organisation_id: 'org-id', organisation_name: 'National Grid', address_line1: 'First street' },
      { organisation_id: 'org-id', organisation_name: 'National Grid', address_line1: 'Second street' },
    ]);
    vi.spyOn(applicationApiService, 'createApplication').mockImplementation(async data => {
      if (!data.status) throw new Error('Application status is required');
      return { application_id: 'app-id', type: 'CPO', status: data.status } as any;
    });
    vi.spyOn(applicationApiService, 'updateOrganisation').mockResolvedValue({});
    vi.spyOn(applicationApiService, 'getApplicationById').mockResolvedValue({ type: 'CPO', status: 'DRAFT', application_party: { organisation_id: 'org-id' } });
  });

  it('creates a CPO draft, saves the organisation and opens applicant details', async () => {
    renderPage();
    await selectOrganisation();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/cpo/app-id/applicant-details'));
    expect(applicationApiService.createApplication).toHaveBeenCalledWith({ type: 'CPO', status: 'DRAFT', operator_ref: '', created_by: 'user-id' });
    expect(applicationApiService.updateOrganisation).toHaveBeenCalledWith('app-id', 'org-id', 'National Grid', 'First street');
  });

  it('requires a network operator before creating an application', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Select an organisation');
    expect(applicationApiService.createApplication).not.toHaveBeenCalled();
    await selectOrganisation();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('stays on the page if saving fails and retries the same draft', async () => {
    vi.mocked(applicationApiService.updateOrganisation).mockRejectedValueOnce(new Error('Save failed'));
    renderPage();
    await selectOrganisation();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to save'));
    expect(navigate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/cpo/app-id/applicant-details'));
    expect(applicationApiService.createApplication).toHaveBeenCalledTimes(1);
  });

  it('restores and reuses the draft when returning from applicant details', async () => {
    renderPage('/cpo/who-is-applying?applicationId=existing-app');
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Organisation' })).toHaveTextContent('National Grid'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/cpo/existing-app/applicant-details'));
    expect(applicationApiService.createApplication).not.toHaveBeenCalled();
  });

  it('does not create a replacement draft after an existing application fails to load', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockRejectedValue(new Error('Failed'));
    renderPage('/cpo/who-is-applying?applicationId=existing-app');
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(applicationApiService.createApplication).not.toHaveBeenCalled();
  });

  it('retains the same CPO draft through the application-type Back journey', async () => {
    render(<MemoryRouter initialEntries={[{ pathname: '/choose-application', state: { applicationType: 'cpo', applicationId: 'existing-app' } }]}><ChooseApplicationType /></MemoryRouter>);
    expect(screen.getByRole('radio', { name: 'Compulsory purchase order' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(navigate).toHaveBeenCalledWith('/cpo/who-is-applying?applicationId=existing-app');
  });
});

describe('CPO onboarding API save failures', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(csrf, 'getCsrfHeaders').mockReturnValue({ 'X-CSRF-Token': 'test-token' });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Internal error' }), { status: 500 }));
  });
  it('rejects an application creation HTTP error', async () => {
    await expect(applicationApiService.createApplication({ type: 'CPO', status: 'DRAFT' })).rejects.toThrow('Unable to create');
  });
  it('rejects an organisation update HTTP error', async () => {
    await expect(applicationApiService.updateOrganisation('app', 'org', 'Grid')).rejects.toThrow('Unable to save the organisation');
  });
  it('rejects an applicant save HTTP error', async () => {
    await expect(applicationApiService.saveNetworkOperator({ type: 'CPO' })).rejects.toThrow('Unable to save the applicant details');
  });
});