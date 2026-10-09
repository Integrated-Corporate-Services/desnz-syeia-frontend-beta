import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreadcrumbProvider } from '../../../../context/BreadcrumbContext';
import { applicationApiService } from '../../../../services/applicationApiService';
import { progressApiService } from '../../../../services/progressApiService';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { cpoOrderDetailsService } from '../../AboutTheOrder/services/cpoOrderDetailsService';
import { EMPTY_ORDER_DETAILS } from '../../AboutTheOrder/constants/orderDetailsConstants';
import { cpoOrderDocumentsService } from '../../AboutTheOrder/services/cpoOrderDocumentsService';
import { DOCUMENT_CATEGORIES } from '../../AboutTheOrder/constants/orderDocumentsConstants';
import { cpoNoticesService } from '../../PublicNotices/services/cpoNoticesService';
import { CPO_SUBSECTIONS } from '../../TaskList/constants/cpoTaskListConstants';
import CpoCheckYourAnswersPage from './CpoCheckYourAnswersPage';

vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../../../../utils/s3DownloadUtil', () => ({ downloadS3FileOnSameTab: vi.fn().mockResolvedValue(undefined) }));
const renderPage = () => render(<BreadcrumbProvider><MemoryRouter initialEntries={['/cpo/app/check-and-submit']}><Routes><Route path="/cpo/:applicationId/check-and-submit" element={<CpoCheckYourAnswersPage />} /></Routes></MemoryRouter></BreadcrumbProvider>);
const file = (filename: string) => ({ id: filename, document_id: filename, application_id: 'app', file_id: filename, filename, s3_key: `key/${filename}`, scan_status: 'COMPLETED' as const, scan_result: 'CLEAN' as const, bucket_name: 'test', virtual_folder: '', storage_provider: 'S3', file_content_type: 'application/pdf', file_size_bytes: 100, uploaded_at_timestamp: '', added_by: '', added_at: '' });
const ready = () => screen.findByRole('heading', { level: 2, name: 'Order documents' });
describe('CPO check your answers', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); vi.clearAllMocks();
    vi.spyOn(applicationApiService, 'getApplicationById').mockResolvedValue({ type: 'CPO', status: 'DRAFT', permissions: { canEdit: true, canDownload: true }, pre_submission_meeting_requested: true, application_party: { organisation_name: 'Grid Operator', contact_person_name: 'Alex Smith', contact_person_line1: '72 Guild Street', contact_person_city: 'London', contact_person_postcode: 'SE23 6FH', contact_person_email: 'alex@example.gov.uk', contact_person_phone: '07123456789', additional_contact: 'ops@example.gov.uk' } });
    vi.spyOn(cpoOrderDetailsService, 'get').mockResolvedValue({ canEdit: true, details: { ...EMPTY_ORDER_DETAILS, orderName: 'North Ridge CPO', purpose: 'Acquire land and rights', includesSpecialLand: false, hasRelatedApplications: false }, documents: [file('executive-summary.docx')] });
    vi.spyOn(cpoOrderDocumentsService, 'get').mockResolvedValue({ canEdit: true, orderDetails: {}, documents: [{ ...file('order.pdf'), category: DOCUMENT_CATEGORIES.order }] });
    vi.spyOn(cpoNoticesService, 'get').mockResolvedValue({ canEdit: true, reference: 'CPO00001', objectionsEmail: '', finalObjectionDate: '2026-11-09', record: { newspapers: { evidence: [{ fileId: 'notice.pdf', date: '2026-10-14' }] }, site: { completionDate: '2026-10-07' }, people: { completionDate: '2026-10-19' } }, documents: [{ ...file('notice.pdf'), category: 'CPO_NEWSPAPER_NOTICES' }] });
    vi.spyOn(progressApiService, 'fetchApplicationProgress').mockResolvedValue(Object.values(CPO_SUBSECTIONS).map((subsection_name) => ({ subsection_name, status: 'Completed' })));
  });
  it('renders four sections with actual answers, filenames and dates', async () => {
    renderPage(); await ready();
    for (const heading of ['Applicant details', 'Order details', 'Public notices', 'Order documents']) expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
    expect(screen.getByText('Grid Operator')).toBeInTheDocument(); expect(screen.getByText('North Ridge CPO')).toBeInTheDocument();
    expect(screen.getByText('notice.pdf: 14 October 2026')).toBeInTheDocument(); expect(screen.getByText('9 November 2026')).toBeInTheDocument();
    expect(screen.getByText('None uploaded')).toBeInTheDocument();
  });
  it('provides full accessible Change labels and CPO edit routes', async () => {
    renderPage(); await ready();
    expect(screen.getByRole('link', { name: 'Change name of the order' })).toHaveAttribute('href', '/cpo/app/order-details/name?from=application-review');
    expect(screen.getByRole('link', { name: 'Change newspaper notice' })).toHaveAttribute('href', '/cpo/app/record-notices/newspapers?from=application-review');
    expect(screen.getByRole('link', { name: 'Change the order documents' })).toHaveAttribute('href', '/cpo/app/order-documents/order?from=application-review');
  });
  it('shows the saved pre-application meeting answer and reason', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'CPO', status: 'DRAFT', pre_submission_meeting_answer: 'not-needed', pre_submission_meeting_requested: false, pre_submission_meeting_reason: 'Discussed with the case officer.' });
    renderPage(); await ready();
    expect(screen.getByText("No, I don't need this meeting")).toBeInTheDocument();
    expect(screen.getByText('Discussed with the case officer.')).toBeInTheDocument();
  });
  it('pairs newspaper dates by file ID rather than API array order', async () => {
    vi.mocked(cpoNoticesService.get).mockResolvedValue({ canEdit: true, reference: 'CPO00001', objectionsEmail: '', finalObjectionDate: null,
      record: { newspapers: { evidence: [{ fileId: 'second.pdf', date: '2026-10-14' }, { fileId: 'first.pdf', date: '2026-10-07' }] } },
      documents: [{ ...file('first.pdf'), category: 'CPO_NEWSPAPER_NOTICES' }, { ...file('second.pdf'), category: 'CPO_NEWSPAPER_NOTICES' }] });
    renderPage(); await ready();
    expect(screen.getByText('first.pdf: 7 October 2026')).toBeInTheDocument();
    expect(screen.getByText('second.pdf: 14 October 2026')).toBeInTheDocument();
  });
  it('fails closed when application permissions are absent', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'CPO', status: 'DRAFT' });
    renderPage(); await ready();
    expect(screen.queryByRole('link', { name: /^Change / })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'order.pdf' })).not.toBeInTheDocument();
  });
  it('downloads clean documents with file and application IDs', async () => {
    renderPage(); await ready(); fireEvent.click(screen.getByRole('link', { name: 'order.pdf' }));
    expect(downloadS3FileOnSameTab).toHaveBeenCalledWith('key/order.pdf', 'order.pdf', 'app', 'order.pdf');
  });
  it('hides Change and download links without explicit permissions', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'CPO', status: 'DRAFT', permissions: { canEdit: false, canDownload: false } });
    renderPage(); await ready(); expect(screen.queryByRole('link', { name: /^Change / })).not.toBeInTheDocument(); expect(screen.queryByRole('link', { name: 'order.pdf' })).not.toBeInTheDocument();
  });
  it('does not allow edits on a submitted application', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'CPO', status: 'SUBMITTED', permissions: { canEdit: true, canDownload: true } });
    renderPage(); await ready(); expect(screen.queryByRole('link', { name: /^Change / })).not.toBeInTheDocument();
  });
  it('does not offer download links for pending virus checks', async () => {
    vi.mocked(cpoOrderDocumentsService.get).mockResolvedValue({ orderDetails: {}, documents: [{ ...file('order.pdf'), category: DOCUMENT_CATEGORIES.order, scan_status: 'PENDING' }] });
    renderPage(); await ready(); expect(screen.queryByRole('link', { name: 'order.pdf' })).not.toBeInTheDocument(); expect(screen.getByText(/Virus check not complete/)).toBeInTheDocument();
  });
  it('shows incomplete prerequisite tasks without updating completion or submitting', async () => {
    vi.mocked(progressApiService.fetchApplicationProgress).mockResolvedValue([]);
    const update = vi.spyOn(progressApiService, 'updateApplicationProgress'); const submit = vi.spyOn(applicationApiService, 'submitApplication');
    renderPage(); await ready(); expect(screen.getByRole('heading', { name: 'Complete these sections before submitting' })).toBeInTheDocument(); expect(update).not.toHaveBeenCalled(); expect(submit).not.toHaveBeenCalled();
  });
  it('focuses an error summary rather than showing partial data when any API fails', async () => {
    vi.mocked(cpoNoticesService.get).mockRejectedValue(new Error('Unable to load publicity record'));
    renderPage(); await screen.findByRole('alert'); await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus());
    expect(screen.queryByRole('heading', { name: 'Order details' })).not.toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
  it('rejects another application type instead of rendering CPO answers', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'NWL', status: 'DRAFT' });
    renderPage(); await screen.findByRole('alert'); expect(screen.getByRole('alert')).toHaveTextContent('Compulsory purchase order application not found');
  });
  it('shows download failures in the focused error summary', async () => {
    vi.mocked(downloadS3FileOnSameTab).mockRejectedValueOnce(new Error('Download failed'));
    renderPage(); await ready(); fireEvent.click(screen.getByRole('link', { name: 'order.pdf' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to download')); expect(screen.getByRole('alert')).toHaveFocus();
  });
});