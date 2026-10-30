import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreadcrumbProvider } from '../../../../context/BreadcrumbContext';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { applicationApiService, SubmitApplicationError } from '../../../../services/applicationApiService';
import { progressApiService } from '../../../../services/progressApiService';
import { cpoOrderDetailsService } from '../../OrderDetails/services/cpoOrderDetailsService';
import { EMPTY_ORDER_DETAILS } from '../../OrderDetails/constants/orderDetailsConstants';
import { cpoOrderDocumentsService } from '../../OrderDocuments/services/cpoOrderDocumentsService';
import { DOCUMENT_CATEGORIES } from '../../OrderDocuments/constants/orderDocumentsConstants';
import { cpoNoticesService } from '../../RecordNotices/services/cpoNoticesService';
import { CPO_SUBSECTIONS } from '../../TaskList/constants/cpoTaskListConstants';
import CpoCheckYourAnswersPage from './CpoCheckYourAnswersPage';

vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../../../../utils/s3DownloadUtil', () => ({ downloadS3FileOnSameTab: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../../../../services/applicationApiService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../services/applicationApiService')>();
  return { ...actual, applicationApiService: { getApplicationById: vi.fn(), submitApplication: vi.fn() } };
});
vi.mock('../../../../services/progressApiService', () => ({ progressApiService: { fetchApplicationProgress: vi.fn() } }));

const renderPage = () => render(<BreadcrumbProvider><MemoryRouter initialEntries={['/cpo/app/check-and-submit']}><Routes>
  <Route path="/cpo/:applicationId/check-and-submit" element={<CpoCheckYourAnswersPage />} />
  <Route path="/cpo/:applicationId/application-submitted" element={<h1>Submitted page</h1>} />
</Routes></MemoryRouter></BreadcrumbProvider>);

const file = (filename: string) => ({ id: filename, document_id: filename, application_id: 'app', file_id: filename, filename, s3_key: `key/${filename}`, scan_status: 'COMPLETED' as const, scan_result: 'CLEAN' as const, bucket_name: 'test', virtual_folder: '', storage_provider: 'local', file_content_type: 'application/pdf', file_size_bytes: 100, uploaded_at_timestamp: '', added_by: '', added_at: '' });
const ready = () => screen.findByRole('heading', { level: 3, name: 'Record your notices' });
const card = (title: string) => screen.getByRole('heading', { level: 3, name: title }).closest('.govuk-summary-card') as HTMLElement;
const application = (overrides: Record<string, unknown> = {}) => ({
  type: 'CPO', status: 'DRAFT', desnz_ref: 'CPO000001', operator_ref: '012345678',
  permissions: { canEdit: true, canDownload: true, canSubmit: true },
  pre_submission_meeting_answer: 'Yes, I’ve had this meeting',
  application_party: { organisation_name: 'National Grid Electricity Distribution', contact_person_name: 'Alex Smith', contact_person_line1: '72 Guild Street', contact_person_city: 'London', contact_person_postcode: 'SE23 6FH', contact_person_email: 'alex.smith@example.co.uk', contact_person_phone: '07123 456789', additional_contact: 'ops.team@ngeld.co.uk' },
  ...overrides,
}) as any;
const mockApplication = (value: unknown) => vi.mocked(applicationApiService.getApplicationById).mockResolvedValue(value);
const completedProgress = Object.values(CPO_SUBSECTIONS).map((subsection_name) => ({ subsection_name, status: 'Completed' }));
const notices = (overrides: Record<string, unknown> = {}) => ({
  reference: 'CPO000001', objectionsEmail: '', finalObjectionDate: null,
  record: {
    requirements: { acknowledged: true }, check: { confirmed: true },
    inspection: { addresses: [{ id: 'a1', line1: 'Network House', line2: '72 Guild Street', townCity: 'London', postcode: 'SE23 6FH', from: '2026-08-08' }] },
    online: { url: 'https://www.example.gov.uk/north-ridge-cpo' },
    newspapers: { evidence: [{ fileId: 'first-week.pdf', date: '2026-10-07' }] },
    site: { completionDate: '2026-10-07' },
    people: { completionDate: '2026-10-07' },
  },
  documents: [{ ...file('first-week.pdf'), category: 'CPO_NEWSPAPER_NOTICES' }, { ...file('site-map.pdf'), category: 'CPO_SITE_NOTICES' }, { ...file('statement-of-service.pdf'), category: 'CPO_QUALIFYING_PERSON_NOTICES' }],
  ...overrides,
}) as any;

describe('CPO check your answers', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); vi.clearAllMocks();
    mockApplication(application());
    vi.mocked(progressApiService.fetchApplicationProgress).mockResolvedValue(completedProgress);
    vi.spyOn(cpoOrderDetailsService, 'get').mockResolvedValue({ canEdit: true, details: { ...EMPTY_ORDER_DETAILS, orderName: 'Compulsory purchase order', purpose: 'To acquire land and rights' }, documents: [file('executive-summary.docx')] });
    vi.spyOn(cpoOrderDocumentsService, 'get').mockResolvedValue({ canEdit: true, orderDetails: {}, documents: [{ ...file('order.pdf'), category: DOCUMENT_CATEGORIES.order }, { ...file('reasons.pdf'), category: DOCUMENT_CATEGORIES.reasons }] });
    vi.spyOn(cpoNoticesService, 'get').mockResolvedValue(notices());
  });

  it('shows the caption, heading and each section of the design', async () => {
    renderPage(); await ready();
    expect(screen.getByText('Check and submit')).toHaveClass('govuk-caption-l');
    expect(screen.getByRole('heading', { level: 1, name: 'Check your answers before sending your application' })).toBeInTheDocument();
    for (const heading of ['Applicant details', 'Project information', 'Public notices']) expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
    for (const title of ['Applicant details', 'Pre-application meeting', 'Executive summary', 'Order details', 'Order documents', 'Record your notices']) expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument();
  });

  it('shows the saved applicant details, references and order answers', async () => {
    renderPage(); await ready();
    const applicant = within(card('Applicant details'));
    expect(applicant.getByText('National Grid Electricity Distribution')).toBeInTheDocument();
    expect(applicant.getByText('ops.team@ngeld.co.uk')).toBeInTheDocument();
    expect(applicant.getByText('012345678')).toBeInTheDocument();
    expect(within(card('Pre-application meeting')).getByText('CPO000001')).toBeInTheDocument();
    expect(within(card('Order details')).getByText('Compulsory purchase order')).toBeInTheDocument();
    expect(within(card('Order details')).getByText('To acquire land and rights')).toBeInTheDocument();
  });

  it('shows Yes for a meeting that took place, without a reason row', async () => {
    renderPage(); await ready();
    const meeting = within(card('Pre-application meeting'));
    expect(meeting.getByText('Yes')).toBeInTheDocument();
    expect(meeting.queryByText('Tell us why you don’t need this meeting')).not.toBeInTheDocument();
  });

  it('shows No and the reason when a meeting is not needed', async () => {
    mockApplication(application({ pre_submission_meeting_answer: 'No, I don’t need this meeting', pre_submission_meeting_reason: 'Discussed with the case officer.' }));
    renderPage(); await ready();
    const meeting = within(card('Pre-application meeting'));
    expect(meeting.getByText('No')).toBeInTheDocument();
    expect(meeting.getByText('Tell us why you don’t need this meeting')).toBeInTheDocument();
    expect(meeting.getByText('Discussed with the case officer.')).toBeInTheDocument();
  });

  it('has no Change link on applicant details or the pre-application meeting', async () => {
    renderPage(); await ready();
    expect(within(card('Applicant details')).queryByRole('link', { name: /Change/ })).not.toBeInTheDocument();
    expect(within(card('Pre-application meeting')).queryByRole('link', { name: /Change/ })).not.toBeInTheDocument();
  });

  it('links each editable card to its check page and back to this review', async () => {
    renderPage(); await ready();
    expect(screen.getByRole('link', { name: 'Change executive summary' })).toHaveAttribute('href', '/cpo/app/order-details/executive-summary?from=application-review');
    expect(screen.getByRole('link', { name: 'Change order details' })).toHaveAttribute('href', '/cpo/app/order-details/check?from=application-review');
    expect(screen.getByRole('link', { name: 'Change order documents' })).toHaveAttribute('href', '/cpo/app/order-documents/check?from=application-review');
    expect(screen.getByRole('link', { name: 'Change record your notices' })).toHaveAttribute('href', '/cpo/app/record-notices/check?from=application-review');
  });

  it('lists uploaded document names with their notice dates', async () => {
    renderPage(); await ready();
    expect(screen.getByRole('link', { name: 'executive-summary.docx' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'order.pdf' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'reasons.pdf' })).toBeInTheDocument();
    expect(within(card('Order documents')).getByText('None uploaded')).toBeInTheDocument();
    const record = within(card('Record your notices'));
    expect(record.getByText('Inspection address 1')).toBeInTheDocument();
    expect(record.getByText(/Available from 8 August 2026/)).toBeInTheDocument();
    expect(record.getByText('https://www.example.gov.uk/north-ridge-cpo')).toBeInTheDocument();
    expect(record.getByText('Published 7 October 2026')).toBeInTheDocument();
    expect(record.getByText('Displayed 7 October 2026')).toBeInTheDocument();
    expect(record.getByText('Last notice served 7 October 2026')).toBeInTheDocument();
  });

  it('downloads a clean document with its file and application IDs', async () => {
    renderPage(); await ready(); fireEvent.click(screen.getByRole('link', { name: 'order.pdf' }));
    expect(downloadS3FileOnSameTab).toHaveBeenCalledWith('key/order.pdf', 'order.pdf', 'app', 'order.pdf');
  });

  it('does not offer a download while a virus check is running', async () => {
    vi.mocked(cpoOrderDocumentsService.get).mockResolvedValue({ orderDetails: {}, documents: [{ ...file('order.pdf'), category: DOCUMENT_CATEGORIES.order, scan_status: 'PENDING' }] });
    renderPage(); await ready();
    expect(screen.queryByRole('link', { name: 'order.pdf' })).not.toBeInTheDocument();
    expect(screen.getByText(/Virus check not complete/)).toBeInTheDocument();
  });

  it('hides Change, download and Submit without permissions', async () => {
    mockApplication(application({ permissions: undefined }));
    renderPage(); await ready();
    expect(screen.queryByRole('link', { name: /^Change / })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'order.pdf' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit application' })).not.toBeInTheDocument();
  });

  it('does not allow changes or a second submit once submitted', async () => {
    mockApplication(application({ status: 'SUBMITTED' }));
    renderPage(); await ready();
    expect(screen.queryByRole('link', { name: /^Change / })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit application' })).not.toBeInTheDocument();
  });

  it('submits a complete application and shows the confirmation page', async () => {
    vi.mocked(applicationApiService.submitApplication).mockResolvedValue({ message: 'ok' });
    renderPage(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));
    expect(await screen.findByRole('heading', { name: 'Submitted page' })).toBeInTheDocument();
    expect(applicationApiService.submitApplication).toHaveBeenCalledWith('app');
  });

  it('names each incomplete section and does not submit', async () => {
    vi.mocked(progressApiService.fetchApplicationProgress).mockResolvedValue(completedProgress.filter((item) => item.subsection_name !== CPO_SUBSECTIONS.ORDER_DOCUMENTS));
    renderPage(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));
    const summary = await screen.findByRole('alert');
    expect(within(summary).getByRole('link', { name: 'Complete the order documents section' })).toHaveAttribute('href', '/cpo/app/order-documents');
    await waitFor(() => expect(summary).toHaveFocus());
    expect(applicationApiService.submitApplication).not.toHaveBeenCalled();
  });

  it('treats unconfirmed notices as incomplete', async () => {
    vi.mocked(cpoNoticesService.get).mockResolvedValue(notices({ record: { ...notices().record, check: { confirmed: false } } }));
    renderPage(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));
    expect(await screen.findByRole('link', { name: 'Complete the record your notices section' })).toHaveAttribute('href', '/cpo/app/record-notices');
  });

  it('shows the sections the server reports as incomplete', async () => {
    vi.mocked(applicationApiService.submitApplication).mockRejectedValue(new SubmitApplicationError(400, [{ key: 'order-details/executive-summary', label: CPO_SUBSECTIONS.EXECUTIVE_SUMMARY }]));
    renderPage(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));
    expect(await screen.findByRole('link', { name: 'Complete the executive summary section' })).toHaveAttribute('href', '/cpo/app/order-details/executive-summary');
    expect(screen.getByRole('button', { name: 'Submit application' })).toBeEnabled();
  });

  it('asks the user to try again when submit fails for another reason', async () => {
    vi.mocked(applicationApiService.submitApplication).mockRejectedValue(new Error('network'));
    renderPage(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Your application could not be submitted. Try again.');
  });

  it('shows an error summary rather than partial data when any read fails', async () => {
    vi.mocked(cpoNoticesService.get).mockRejectedValue(new Error('Unable to load publicity record'));
    renderPage(); await screen.findByRole('alert'); await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus());
    expect(screen.queryByRole('heading', { name: 'Order details' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('rejects another application type', async () => {
    mockApplication({ type: 'NWL', status: 'DRAFT' });
    renderPage(); await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent('Compulsory purchase order application not found');
  });

  it('shows download failures in the error summary', async () => {
    vi.mocked(downloadS3FileOnSameTab).mockRejectedValueOnce(new Error('Download failed'));
    renderPage(); await ready(); fireEvent.click(screen.getByRole('link', { name: 'order.pdf' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to download'));
    expect(screen.getByRole('alert')).toHaveFocus();
  });
});
