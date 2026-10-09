import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationApiService } from '../../../../services/applicationApiService';
import ApplicantDetails from './NetworkOperatorDetails';
import CheckContactDetails from './NetworkOperatorContactDetails';

const navigate = vi.fn();
const options = [{ organisation_id: 'org', person_id: 'person', person_name: 'Alex Smith', organisation_name: 'Grid Operator' }];
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../hooks/useRoleBasedNetworkOperators', () => ({ useRoleBasedNetworkOperators: () => ({ coordinators: [] }) }));
vi.mock('../hooks/useCoordinatorOptions', () => ({ useCoordinatorOptions: () => options }));
vi.mock('../hooks/useRoleBasedLogic', () => ({ useRoleBasedLogic: () => ({ filteredOptions: options }) }));
vi.mock('react-router-dom', async () => ({ ...await vi.importActual<typeof import('react-router-dom')>('react-router-dom'), useNavigate: () => navigate }));

const renderPage = (check = false) => render(<MemoryRouter initialEntries={[`/cpo/app/${check ? 'network-operator-contact-details' : 'applicant-details'}`]}><Routes>
  <Route path="/cpo/:applicationId/applicant-details" element={<ApplicantDetails />} />
  <Route path="/cpo/:applicationId/network-operator-contact-details" element={<CheckContactDetails />} />
</Routes></MemoryRouter>);
const ready = () => waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled());

describe('CPO applicant onboarding pages', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); vi.clearAllMocks();
    vi.spyOn(applicationApiService, 'getApplicationById').mockResolvedValue({ application_id: 'app', type: 'CPO', status: 'DRAFT', operator_ref: 'REF', application_party: {
      organisation_id: 'org', organisation_name: 'Grid Operator', contact_person_id: 'person', contact_person_name: 'Alex Smith', contact_person_email: 'alex@example.gov.uk', contact_person_phone: '0123456789', contact_person_line1: '1 Street', contact_person_postcode: 'SW1A 1AA', additional_contact: 'old@example.gov.uk',
    } });
    vi.spyOn(applicationApiService, 'saveNetworkOperator').mockResolvedValue({});
    vi.spyOn(applicationApiService, 'createApplication');
  });
  it('restores the saved values and reuses the same draft', async () => {
    renderPage(); await ready();
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent('Alex Smith'));
    expect(screen.getByLabelText("Applicant's reference (optional)")).toHaveValue('REF');
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/cpo/who-is-applying?applicationId=app');
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/cpo/app/network-operator-contact-details'));
    expect(applicationApiService.createApplication).not.toHaveBeenCalled();
  });
  it('includes an email still in the input when Continue is clicked', async () => {
    renderPage(); await ready();
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent('Alex Smith'));
    fireEvent.change(screen.getByLabelText('Email address (optional)'), { target: { value: 'new@example.gov.uk' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(applicationApiService.saveNetworkOperator).toHaveBeenCalledWith(expect.objectContaining({ additional_contact: 'old@example.gov.uk,new@example.gov.uk', contact_isconfirmed: null, type: 'CPO' })));
  });
  it('rejects an invalid pending email without navigating', async () => {
    renderPage(); await ready();
    fireEvent.change(screen.getByLabelText('Email address (optional)'), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(applicationApiService.saveNetworkOperator).not.toHaveBeenCalled();
  });
  it('shows a save failure rather than navigating', async () => {
    vi.mocked(applicationApiService.saveNetworkOperator).mockRejectedValue(new Error('Failed'));
    renderPage(); await ready();
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent('Alex Smith'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save');
    expect(navigate).not.toHaveBeenCalled();
  });
  it.each([false, true])('blocks Continue after a load failure (contact check: %s)', async check => {
    vi.mocked(applicationApiService.getApplicationById).mockRejectedValue(new Error('Failed'));
    renderPage(check);
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load');
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(applicationApiService.createApplication).not.toHaveBeenCalled();
  });
  it('shows additional contacts, the reference and accessible CPO Change links', async () => {
    renderPage(true); await ready();
    expect(screen.getByText('old@example.gov.uk')).toBeInTheDocument();
    expect(screen.getByText('REF')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Change additional contacts' })).toHaveAttribute('href', '/cpo/app/applicant-details#emailAddress');
    expect(screen.getByRole('link', { name: "Change applicant's reference" })).toHaveAttribute('href', '/cpo/app/applicant-details#networkOperatorRef');
    fireEvent.click(screen.getByLabelText('Yes'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/cpo/app/task-list'));
  });
});