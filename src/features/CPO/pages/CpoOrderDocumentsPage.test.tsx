import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';
import { applicationApiService } from '../../../services/applicationApiService';
import { progressApiService } from '../../../services/progressApiService';
import CpoOrderDocumentsPage from './CpoOrderDocumentsPage';
import CpoTaskListPage from './CpoTaskListPage';
import { CPO_SUBSECTIONS } from '../constants/cpoTaskListConstants';
import { cpoOrderDocumentsService } from '../services/cpoOrderDocumentsService';
import { DOCUMENT_CATEGORIES } from '../constants/orderDocumentsConstants';
import type { CpoDocument, OrderDocumentsResponse } from '../types/orderDocuments';
import type { FileUploadProps } from '../../../components/FileUpload';

const navigateMock = vi.fn();
const uploadState = vi.hoisted(() => ({ busy: false, errors: [] as string[], props: undefined as FileUploadProps | undefined }));
vi.mock('../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});
vi.mock('../../../components/FileUpload', async () => {
  const actual = await import('react');
  return { default: actual.forwardRef<unknown, FileUploadProps>((props, ref) => {
    uploadState.props = props;
    actual.useImperativeHandle(ref, () => ({ isBusy: () => uploadState.busy, triggerUpload: async () => ({ scanErrors: uploadState.errors, uploadedFiles: [], applicationDocuments: [] }) }));
    return <div><p>{props.hint}</p><input id="file-upload-input" type="file" aria-label={props.title} aria-describedby={props.inputDescribedBy} />{props.uploadedFiles?.map((file) => <div key={file.id}><span>{file.filename}</span><button type="button" onClick={() => props.onDeleteFile?.(file.id)}>Delete {file.filename}</button></div>)}</div>;
  }) };
});

const document = (category: string, filename: string): CpoDocument => ({
  id: filename, document_id: filename, application_id: 'application-id', file_id: filename, category,
  filename, s3_key: filename, bucket_name: 'test', virtual_folder: category, storage_provider: 'S3',
  file_content_type: 'application/pdf', file_size_bytes: 100, uploaded_at_timestamp: '2026-10-07T00:00:00Z',
  added_by: 'user', added_at: '2026-10-07T00:00:00Z', scan_status: 'COMPLETED', scan_result: 'CLEAN',
});
let stored: OrderDocumentsResponse;
const renderStep = (step = 'order', query = '') => render(
  <BreadcrumbProvider><MemoryRouter initialEntries={[`/cpo/application-id/order-documents/${step}${query}`]}>
    <Routes><Route path="/cpo/:applicationId/order-documents/:documentStep" element={<CpoOrderDocumentsPage />} /></Routes>
  </MemoryRouter></BreadcrumbProvider>
);
const ready = () => waitFor(() => expect(screen.getByRole('button', { name: 'Save and continue' })).toBeEnabled());

describe('CPO order documents journey', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    uploadState.busy = false;
    uploadState.errors = [];
    stored = { canEdit: true, orderDetails: { includesSpecialLand: false }, documents: [
      document(DOCUMENT_CATEGORIES.order, 'order.pdf'), document(DOCUMENT_CATEGORIES.order, 'order-copy.pdf'),
      document(DOCUMENT_CATEGORIES.maps, 'maps.pdf'), document(DOCUMENT_CATEGORIES.maps, 'maps-copy.pdf'),
      document(DOCUMENT_CATEGORIES.reasons, 'reasons.pdf'),
    ] };
    vi.spyOn(cpoOrderDocumentsService, 'get').mockImplementation(async () => stored);
    vi.spyOn(cpoOrderDocumentsService, 'save').mockImplementation(async () => stored);
  });

  it('uses Form 1 only when the saved answers exclude special land', async () => {
    renderStep();
    await ready();
    expect(screen.getByText(/Form 1 applies because/)).toBeInTheDocument();
    expect(screen.getByText(/25MB each/)).toBeInTheDocument();
  });
  it('does not guess a form number when special land is included', async () => {
    stored.orderDetails.includesSpecialLand = true;
    renderStep();
    await ready();
    expect(screen.queryByText(/Form 1/)).not.toBeInTheDocument();
    expect(screen.getByText(/Check the prescribed form and the certificate requirements/)).toBeInTheDocument();
  });
  it('does not require a common-land question omitted from the reference flow', async () => {
    stored.orderDetails = {};
    renderStep();
    await ready();
    expect(screen.queryByRole('link', { name: 'common land question' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/order-documents/reasons'));
  });
  it.each([['order', 'reasons'], ['maps', 'reasons'], ['reasons', 'additional'], ['additional', 'check']])('saves %s then opens %s', async (step, destination) => {
    renderStep(step);
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith(`/cpo/application-id/order-documents/${destination}`));
    expect(cpoOrderDocumentsService.save).toHaveBeenCalledWith('application-id', step === 'maps' ? 'order' : step, false, null);
  });
  it('shows order and map files together and supports deletion', async () => {
    renderStep();
    await ready();
    expect(screen.getByText('order.pdf')).toBeInTheDocument();
    expect(screen.getByText('maps.pdf')).toBeInTheDocument();
    expect(screen.queryByText('reasons.pdf')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete order.pdf' }));
    expect(screen.queryByText('order.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('order-copy.pdf')).toBeInTheDocument();
  });
  it('blocks navigation while scanning is busy or fails', async () => {
    uploadState.busy = true;
    renderStep();
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveFocus();
    expect(cpoOrderDocumentsService.save).not.toHaveBeenCalled();
    uploadState.busy = false;
    uploadState.errors = ['The file contains a virus'];
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('contains a virus'));
    expect(navigateMock).not.toHaveBeenCalled();
  });
  it('saves unfinished uploads for later without completing them', async () => {
    stored.documents = [];
    renderStep();
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/application-dashboard'));
    expect(cpoOrderDocumentsService.save).toHaveBeenCalledWith('application-id', 'order', true, null);
  });
  it('returns a changed document group directly to review', async () => {
    renderStep('maps', '?from=check');
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/order-documents/check'));
  });
  it('preserves the full application return path while checking changed documents', async () => {
    renderStep('maps', '?from=application-review'); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/order-documents/check?from=application-review'));
  });
  it('returns confirmed documents to the full application review', async () => {
    renderStep('check', '?from=application-review'); await ready();
    expect(screen.getByRole('link', { name: 'Change the order documents' })).toHaveAttribute('href', '/cpo/application-id/order-documents/order?from=application-review');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/check-and-submit'));
  });
  it('reviews three document groups with downloadable files and Change links', async () => {
    renderStep('check');
    await ready();
    expect(screen.getByText('reasons.pdf')).toBeInTheDocument();
    expect(screen.getByText('None uploaded')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Change the order documents' })).toHaveAttribute('href', '/cpo/application-id/order-documents/order?from=check');
    expect(screen.getByRole('link', { name: 'Change additional documents (optional)' })).toHaveAttribute('href', '/cpo/application-id/order-documents/additional?from=check');
    expect(screen.getAllByRole('term')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'maps.pdf' })).toBeInTheDocument();
  });
  it('confirms review through Save and continue and returns to the task list', async () => {
    renderStep('check');
    await ready();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/task-list'));
    expect(cpoOrderDocumentsService.save).toHaveBeenCalledWith('application-id', 'check', false, true);
  });
  it('keeps the user on the page when required files are missing', async () => {
    vi.mocked(cpoOrderDocumentsService.save).mockRejectedValue(new Error('Upload the sealed order and an unsealed copy as separate files'));
    renderStep();
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('sealed order'));
    expect(navigateMock).not.toHaveBeenCalled();
  });
  it('disables saving and focuses errors on load failure', async () => {
    vi.mocked(cpoOrderDocumentsService.get).mockRejectedValue(new Error('Unable to load'));
    renderStep();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to load'));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus());
    expect(screen.getByRole('button', { name: 'Save and continue' })).toBeDisabled();
  });
  it('does not show upload or delete controls for view-only access', async () => {
    stored.canEdit = false;
    renderStep();
    await screen.findByText('You can view these documents but cannot change them.');
    expect(screen.queryByRole('button', { name: /Delete/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save and continue' })).toBeDisabled();
  });
  it('matches the reference guidance and Back navigation', async () => {
    renderStep(); await ready();
    expect(screen.getByRole('heading', { name: 'Upload the order documents' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'compulsorypurchaseorders@energysecurity.gov.uk' })).toHaveAttribute('href', 'mailto:compulsorypurchaseorders@energysecurity.gov.uk');
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/cpo/application-id/task-list');
  });
  it.each(['order', 'reasons', 'additional'])('uploads %s immediately with the shared S37/NWL formats', async step => {
    renderStep(step); await ready();
    expect(uploadState.props?.uploadImmediately).toBe(true);
    expect(uploadState.props?.acceptedTypes).toContain('.msg');
  });
});

it('shows the reference title and real completed document progress on the task list', async () => {
  vi.spyOn(applicationApiService, 'getApplicationById').mockResolvedValue({ type: 'CPO', cpo_order_details: { orderName: 'North Ridge Grid Reinforcement CPO' }, operator_name: 'National Grid Electricity Distribution' });
  vi.spyOn(progressApiService, 'fetchApplicationProgress').mockResolvedValue([
    ...['Applicant details', 'Pre-submission meeting', 'Order details', 'Order documents'].map((subsection_name) => ({ subsection_name, status: 'Completed' })),
    { subsection_name: 'What your notices must include', status: 'Not completed' },
    { subsection_name: 'Record your notices', status: 'Not completed' },
    { subsection_name: 'Check and submit your application', status: 'Not completed' },
  ]);
  render(<MemoryRouter initialEntries={['/cpo/application-id/task-list']}><Routes><Route path="/cpo/:applicationId/task-list" element={<CpoTaskListPage />} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'Compulsory purchase order' })).toBeInTheDocument();
  expect(screen.getByText('Complete the following sections in order to create and submit your application.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Executive summary' })).toHaveAttribute('href', '/cpo/application-id/order-details/executive-summary');
  expect(screen.getByRole('link', { name: 'Executive summary' }).closest('li')).toHaveTextContent('Not completed');
  expect(screen.getByRole('link', { name: 'Order documents' }).closest('li')).toHaveTextContent('Completed');
  expect(screen.getByText('Cannot start yet')).toBeInTheDocument();
});

it('unlocks application review when all seven prerequisites are complete, ignoring legacy requirements progress', async () => {
  vi.spyOn(applicationApiService, 'getApplicationById').mockResolvedValue({ type: 'CPO', cpo_publicity: { requirements: { acknowledged: true }, check: { confirmed: true } } });
  vi.spyOn(progressApiService, 'fetchApplicationProgress').mockResolvedValue([
    ...Object.values(CPO_SUBSECTIONS).filter(subsection => subsection !== CPO_SUBSECTIONS.CHECK_AND_SUBMIT).map(subsection_name => ({ subsection_name, status: 'Completed' })),
    { subsection_name: 'What your notices must include', status: 'Not completed' },
  ]);
  render(<MemoryRouter initialEntries={['/cpo/application-id/task-list']}><Routes><Route path="/cpo/:applicationId/task-list" element={<CpoTaskListPage />} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('link', { name: 'Check and submit your application' })).toHaveAttribute('href', '/cpo/application-id/check-and-submit');
  expect(screen.queryByRole('link', { name: 'Public notice requirements' })).not.toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Record your notices' })).toHaveLength(1);
});

it('keeps legacy completed notices unfinished until requirements are acknowledged and reviewed', async () => {
  vi.spyOn(applicationApiService, 'getApplicationById').mockResolvedValue({ type: 'CPO', cpo_publicity: {} });
  vi.spyOn(progressApiService, 'fetchApplicationProgress').mockResolvedValue(Object.values(CPO_SUBSECTIONS).map(subsection_name => ({ subsection_name, status: 'Completed' })));
  render(<MemoryRouter initialEntries={['/cpo/application-id/task-list']}><Routes><Route path="/cpo/:applicationId/task-list" element={<CpoTaskListPage />} /></Routes></MemoryRouter>);
  expect((await screen.findByRole('link', { name: 'Record your notices' })).closest('li')).toHaveTextContent('Not completed');
  expect(screen.getByText('Cannot start yet')).toBeInTheDocument();
});

it('does not show misleading task statuses after a task-list load failure', async () => {
  vi.spyOn(applicationApiService, 'getApplicationById').mockRejectedValue(new Error('Failed'));
  vi.spyOn(progressApiService, 'fetchApplicationProgress').mockResolvedValue([]);
  render(<MemoryRouter initialEntries={['/cpo/application-id/task-list']}><Routes><Route path="/cpo/:applicationId/task-list" element={<CpoTaskListPage />} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load the CPO task list');
  expect(screen.queryByRole('link', { name: 'Order details' })).not.toBeInTheDocument();
});

it.each([
  ['Completed', 'Completed', 'govuk-tag--green'],
  ['Not completed', 'Not completed', 'govuk-tag--blue'],
  ['Incomplete', 'Not completed', 'govuk-tag--blue'],
  ['In progress', 'In progress', 'govuk-tag--blue'],
  ['Not started', 'Not completed', 'govuk-tag--blue'],
])('displays saved status %s using S37 status conventions', async (savedStatus, label, colour) => {
  vi.spyOn(applicationApiService, 'getApplicationById').mockResolvedValue({ type: 'CPO' });
  vi.spyOn(progressApiService, 'fetchApplicationProgress').mockResolvedValue([{ subsection_name: 'Order details', status: savedStatus }]);
  render(<MemoryRouter initialEntries={['/cpo/application-id/task-list']}><Routes><Route path="/cpo/:applicationId/task-list" element={<CpoTaskListPage />} /></Routes></MemoryRouter>);
  const link = await screen.findByRole('link', { name: 'Order details' });
  const status = link.closest('li')?.querySelector('.govuk-tag');
  expect(status).toHaveTextContent(label);
  expect(status).toHaveClass(colour);
  expect(link).toHaveAccessibleDescription(label);
  expect(screen.getByText('Cannot start yet')).toHaveClass('govuk-tag--grey');
  expect(screen.queryByRole('link', { name: 'Check and submit your application' })).not.toBeInTheDocument();
});