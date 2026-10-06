import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreadcrumbProvider } from '../../context/BreadcrumbContext';
import CpoOrderDetailsPage from './CpoOrderDetailsPage';
import { cpoOrderDetailsService, EMPTY_ORDER_DETAILS } from './cpoOrderDetailsService';
import type { OrderDetails, RelatedApplication } from './cpoOrderDetailsService';

const navigateMock = vi.fn();
const uploadState = vi.hoisted(() => ({ errors: [] as string[] }));
vi.mock('../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});
vi.mock('../../components/FileUpload', async () => {
  const actual = await import('react');
  return { default: actual.forwardRef((_props, ref) => {
    actual.useImperativeHandle(ref, () => ({
      isBusy: () => false,
      triggerUpload: async () => ({ scanErrors: uploadState.errors, uploadedFiles: [], applicationDocuments: [] }),
    }));
    return <input id="file-upload-input" type="file" aria-label="Upload your executive summary" />;
  }) };
});

const entry: RelatedApplication = {
  id: '11111111-1111-4111-8111-111111111111', type: 'DCO', otherType: '',
  reference: 'EN010145', siteAddress: 'Peartree Hill', relationship: 'Same project',
};
let stored: OrderDetails;
const renderStep = (step = 'name', query = '') => render(
  <BreadcrumbProvider><MemoryRouter initialEntries={[`/cpo/application-id/order-details/${step}${query}`]}>
    <Routes><Route path="/cpo/:applicationId/order-details/:orderStep" element={<CpoOrderDetailsPage />} /></Routes>
  </MemoryRouter></BreadcrumbProvider>
);
const ready = () => waitFor(() => expect(screen.getByRole('button', { name: 'Save and continue' })).toBeEnabled());

describe('CPO order details journey', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    uploadState.errors = [];
    stored = { ...EMPTY_ORDER_DETAILS, relatedApplications: [] };
    vi.spyOn(cpoOrderDetailsService, 'get').mockImplementation(async () => ({ details: stored, documents: [] }));
    vi.spyOn(cpoOrderDetailsService, 'save').mockImplementation(async (_id, _step, changes) => {
      stored = { ...stored, ...changes };
      return { details: stored, documents: [] };
    });
  });

  it('requires an order name and focuses the linked error summary', async () => {
    renderStep();
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveFocus();
    expect(screen.getByRole('alert')).toHaveTextContent('Enter the name of the order');
    expect(cpoOrderDetailsService.save).not.toHaveBeenCalled();
  });

  it('saves a name and continues to the purpose question', async () => {
    renderStep();
    await ready();
    fireEvent.change(screen.getByLabelText('What is the name of the order?'), { target: { value: 'North Ridge CPO' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/order-details/purpose'));
    expect(cpoOrderDetailsService.save).toHaveBeenCalledWith('application-id', 'name', { orderName: 'North Ridge CPO' }, false);
  });

  it('saves an unfinished name for later', async () => {
    renderStep();
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/application-dashboard'));
    expect(cpoOrderDetailsService.save).toHaveBeenCalledWith('application-id', 'name', { orderName: '' }, true);
  });

  it('restores a saved purpose and rejects more than 4000 characters', async () => {
    stored.purpose = 'Grid reinforcement';
    renderStep('purpose');
    await ready();
    const input = screen.getByLabelText('What is the order for?');
    expect(input).toHaveValue('Grid reinforcement');
    fireEvent.change(input, { target: { value: 'a'.repeat(4001) } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveTextContent('4,000 characters or fewer');
  });

  it.each([['Yes', 'exchange-land'], ['No', 'executive-summary']])('routes common-land %s to %s', async (answer, destination) => {
    renderStep('special-land');
    await ready();
    fireEvent.click(screen.getByLabelText(answer));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith(`/cpo/application-id/order-details/${destination}`));
  });

  it('requires an exchange-land answer', async () => {
    stored.includesSpecialLand = true;
    renderStep('exchange-land');
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Select yes or no for exchange land');
  });

  it('keeps keyboard focus on the selected radio', async () => {
    renderStep('special-land');
    await ready();
    const radio = screen.getByLabelText('Yes');
    radio.focus();
    fireEvent.click(radio);
    expect(radio).toHaveFocus();
  });

  it('does not continue when the executive-summary scan fails', async () => {
    uploadState.errors = ['The file could not be checked for viruses'];
    renderStep('executive-summary');
    await ready();
    expect(screen.getByRole('link', { name: 'Download executive summary template' })).toHaveAttribute('href', expect.stringContaining('/order-details/executive-summary-template'));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('could not be checked'));
    expect(cpoOrderDetailsService.save).not.toHaveBeenCalled();
  });

  it.each([['Yes', 'add-related-application'], ['No', 'check']])('routes related-applications %s to %s', async (answer, destination) => {
    renderStep('related-applications');
    await ready();
    fireEvent.click(screen.getByLabelText(answer));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith(`/cpo/application-id/order-details/${destination}`));
  });

  it('reveals Other and validates its description and relationship', async () => {
    renderStep('add-related-application');
    await ready();
    fireEvent.click(screen.getByLabelText('Other'));
    expect(screen.getByLabelText('Type of application')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter the type of application');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter how it is related');
  });

  it('adds a related application with optional reference and address left blank', async () => {
    stored.hasRelatedApplications = true;
    renderStep('add-related-application');
    await ready();
    fireEvent.click(screen.getByLabelText('Development consent order (DCO)'));
    fireEvent.change(screen.getByLabelText('How is it related to this order?'), { target: { value: 'Same project' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/order-details/related-applications-list'));
    expect(cpoOrderDetailsService.save).toHaveBeenCalledWith('application-id', 'related-applications-list', {
      relatedApplications: [expect.objectContaining({ type: 'DCO', reference: '', siteAddress: '', relationship: 'Same project' })],
    }, false);
  });

  it('edits an existing related application without duplicating it', async () => {
    stored.relatedApplications = [entry];
    renderStep('add-related-application', `?edit=${entry.id}`);
    await ready();
    expect(screen.getByLabelText('Reference number (optional)')).toHaveValue('EN010145');
    fireEvent.change(screen.getByLabelText('How is it related to this order?'), { target: { value: 'Depends on this order' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(stored.relatedApplications).toHaveLength(1));
    await waitFor(() => expect(stored.relatedApplications[0].relationship).toBe('Depends on this order'));
  });

  it('preserves an unfinished related application when saving for later', async () => {
    renderStep('add-related-application');
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/application-dashboard'));
    expect(stored.relatedApplications[0]).toMatchObject({ type: '', relationship: '' });
  });

  it('shows only Change actions for related applications', async () => {
    const secondEntry = { ...entry, id: '22222222-2222-4222-8222-222222222222', reference: 'EN010146' };
    stored.relatedApplications = [entry, secondEntry];
    stored.hasRelatedApplications = true;
    renderStep('related-applications-list');
    await ready();
    expect(screen.getAllByRole('link', { name: /^Change related application/ })).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Change related application EN010145' })).toHaveAttribute('href', `/cpo/application-id/order-details/add-related-application?edit=${entry.id}`);
    expect(screen.queryByRole('button', { name: /^Remove/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Remove/ })).not.toBeInTheDocument();
  });

  it.each([['Yes', 'add-related-application'], ['No', 'check']])('handles adding another application: %s', async (answer, destination) => {
    stored.relatedApplications = [entry];
    stored.hasRelatedApplications = true;
    renderStep('related-applications-list');
    await ready();
    expect(screen.getByRole('heading', { name: 'You have added 1 related application' })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(answer));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith(`/cpo/application-id/order-details/${destination}`));
  });

  it('provides review change links and requires affirmative confirmation', async () => {
    stored.orderName = 'North Ridge CPO';
    renderStep('check');
    await ready();
    expect(screen.getByRole('link', { name: 'Change name of the order' })).toHaveAttribute('href', '/cpo/application-id/order-details/name?from=check');
    fireEvent.click(screen.getByLabelText('No'));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Use the Change links');
    expect(cpoOrderDetailsService.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText('Yes'));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/task-list'));
    expect(cpoOrderDetailsService.save).toHaveBeenCalledWith('application-id', 'check', {}, false);
  });

  it('can add an application after the last related application was removed', async () => {
    stored.hasRelatedApplications = true;
    renderStep('related-applications-list');
    await ready();
    fireEvent.click(screen.getByLabelText('Yes'));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/order-details/add-related-application'));
    expect(cpoOrderDetailsService.save).toHaveBeenCalledWith('application-id', 'related-applications', { hasRelatedApplications: true }, false);
  });

  it('disables editing when the backend grants only view permission', async () => {
    vi.mocked(cpoOrderDetailsService.get).mockResolvedValue({ details: stored, documents: [], canEdit: false });
    renderStep();
    await screen.findByText('You can view these order details but cannot change them.');
    expect(screen.getByRole('button', { name: 'Save and continue' })).toBeDisabled();
  });

  it('returns a changed purpose directly to review', async () => {
    stored.purpose = 'Existing purpose';
    renderStep('purpose', '?from=check');
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/order-details/check'));
  });

  it('keeps the user on the page when saving fails', async () => {
    stored.orderName = 'Order';
    vi.mocked(cpoOrderDetailsService.save).mockRejectedValue(new Error('Unable to save'));
    renderStep();
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to save'));
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('prevents saving when loading fails', async () => {
    vi.mocked(cpoOrderDetailsService.get).mockRejectedValue(new Error('Unable to load'));
    renderStep();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to load'));
    expect(screen.getByRole('alert')).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Save and continue' })).toBeDisabled();
  });
});