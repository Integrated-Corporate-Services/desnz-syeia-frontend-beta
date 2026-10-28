import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreadcrumbProvider } from '../../../../context/BreadcrumbContext';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { applicationApiService } from '../../../../services/applicationApiService';
import { progressApiService } from '../../../../services/progressApiService';
import { cpoOrderDetailsService } from '../../OrderDetails/services/cpoOrderDetailsService';
import { EMPTY_ORDER_DETAILS } from '../../OrderDetails/constants/orderDetailsConstants';
import { cpoOrderDocumentsService } from '../../OrderDocuments/services/cpoOrderDocumentsService';
import { DOCUMENT_CATEGORIES } from '../../OrderDocuments/constants/orderDocumentsConstants';
import { cpoNoticesService } from '../../RecordNotices/services/cpoNoticesService';
import CpoApplicationSummaryPage from './CpoApplicationSummaryPage';

vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../../../../utils/s3DownloadUtil', () => ({ downloadS3FileOnSameTab: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../../../../services/applicationApiService', () => ({ applicationApiService: { getApplicationById: vi.fn(), getWithdrawalRequest: vi.fn() } }));
vi.mock('../../../../services/progressApiService', () => ({ progressApiService: { fetchApplicationProgress: vi.fn() } }));

const renderPage = () => render(<BreadcrumbProvider><MemoryRouter initialEntries={['/cpo/app/application-summary']}><Routes>
  <Route path="/cpo/:applicationId/application-summary" element={<CpoApplicationSummaryPage />} />
</Routes></MemoryRouter></BreadcrumbProvider>);

const file = (filename: string) => ({ id: filename, document_id: filename, application_id: 'app', file_id: filename, filename, s3_key: `key/${filename}`, scan_status: 'COMPLETED' as const, scan_result: 'CLEAN' as const, bucket_name: 'test', virtual_folder: '', storage_provider: 'local', file_content_type: 'application/pdf', file_size_bytes: 100, uploaded_at_timestamp: '', added_by: '', added_at: '' });
const ready = () => screen.findByRole('heading', { level: 3, name: 'Record your notices' });
const card = (title: string, level = 3) => screen.getByRole('heading', { level, name: title }).closest('.govuk-summary-card') as HTMLElement;
const application = (overrides: Record<string, unknown> = {}) => ({
  type: 'CPO', status: 'UNDER_REVIEW', desnz_ref: 'CPO000001', operator_ref: '012345678',
  permissions: { canEdit: false, canDownload: true, canWithdraw: true },
  pre_submission_meeting_answer: 'No, I don’t need this meeting', pre_submission_meeting_reason: 'Agreed with DESNZ.',
  application_party: { organisation_name: 'National Grid Electricity Distribution', contact_person_name: 'Alex Smith', contact_person_line1: '72 Guild Street', contact_person_city: 'London', contact_person_postcode: 'SE23 6FH', contact_person_email: 'alex.smith@example.co.uk', contact_person_phone: '07123 456789', additional_contact: 'ops.team@ngeld.co.uk' },
  ...overrides,
}) as any;
const notices = (finalObjectionDate: string | null = null) => ({
  reference: 'CPO000001', objectionsEmail: '', finalObjectionDate,
  record: {
    inspection: { addresses: [{ id: 'a1', line1: 'Network House', line2: '72 Guild Street', townCity: 'London', postcode: 'SE23 6FH', from: '2026-08-08' }] },
    online: { url: 'https://www.example.gov.uk/north-ridge-cpo' },
    newspapers: { evidence: [{ fileId: 'first-week.pdf', date: '2026-10-07' }] },
    site: { completionDate: '2026-10-07' }, people: { completionDate: '2026-10-07' },
  },
  documents: [{ ...file('first-week.pdf'), category: 'CPO_NEWSPAPER_NOTICES' }, { ...file('site-map.pdf'), category: 'CPO_SITE_NOTICES' }, { ...file('statement-of-service.pdf'), category: 'CPO_QUALIFYING_PERSON_NOTICES' }],
}) as any;

describe('CPO application summary', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); vi.clearAllMocks();
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue(application());
    vi.mocked(applicationApiService.getWithdrawalRequest).mockResolvedValue(null);
    vi.mocked(progressApiService.fetchApplicationProgress).mockResolvedValue([]);
    vi.spyOn(cpoOrderDetailsService, 'get').mockResolvedValue({ canEdit: false, details: { ...EMPTY_ORDER_DETAILS, orderName: 'North Ridge CPO', purpose: 'To acquire land and rights' }, documents: [file('executive-summary.docx')] });
    vi.spyOn(cpoOrderDocumentsService, 'get').mockResolvedValue({ canEdit: false, orderDetails: {}, documents: [
      { ...file('sealed-order.pdf'), category: DOCUMENT_CATEGORIES.order },
      { ...file('order-map-sheet-1.pdf'), category: DOCUMENT_CATEGORIES.maps },
      { ...file('statement-of-reasons.pdf'), category: DOCUMENT_CATEGORIES.reasons },
      { ...file('general-certificate.pdf'), category: DOCUMENT_CATEGORIES.additional },
    ] });
    vi.spyOn(cpoNoticesService, 'get').mockResolvedValue(notices());
  });

  it('shows the reference, order title, case type and a status tag', async () => {
    renderPage(); await ready();
    expect(screen.getByRole('heading', { level: 1, name: 'Application summary' })).toBeInTheDocument();
    const summary = within(card('Summary', 2));
    expect(summary.getByText('CPO000001')).toBeInTheDocument();
    expect(summary.getByText('North Ridge CPO')).toBeInTheDocument();
    expect(summary.getByText('Compulsory purchase order (CPO)')).toBeInTheDocument();
    expect(summary.getByText('Under review')).toHaveClass('govuk-tag');
  });

  it('shows the objection period only when one is recorded', async () => {
    renderPage(); await ready();
    expect(screen.queryByText('Objection period')).not.toBeInTheDocument();
  });

  it('shows the objection period end date when the notices give one', async () => {
    vi.mocked(cpoNoticesService.get).mockResolvedValue(notices('2026-11-09'));
    renderPage(); await ready();
    expect(within(card('Summary', 2)).getByText('Until 9 November 2026')).toBeInTheDocument();
  });

  it('shows the applicant, meeting, order and notice answers read-only', async () => {
    renderPage(); await ready();
    expect(within(card('Applicant details')).getByText('National Grid Electricity Distribution')).toBeInTheDocument();
    expect(within(card('Applicant details')).getByText('012345678')).toBeInTheDocument();
    expect(within(card('Pre-application meeting')).getByText('Agreed with DESNZ.')).toBeInTheDocument();
    expect(within(card('Order details')).getByText('To acquire land and rights')).toBeInTheDocument();
    expect(within(card('Record your notices')).getByText('https://www.example.gov.uk/north-ridge-cpo')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Change/ })).not.toBeInTheDocument();
  });

  it('lists every uploaded document as a download link', async () => {
    renderPage(); await ready();
    for (const name of ['executive-summary.docx', 'sealed-order.pdf', 'order-map-sheet-1.pdf', 'statement-of-reasons.pdf', 'general-certificate.pdf', 'first-week.pdf', 'site-map.pdf', 'statement-of-service.pdf']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole('link', { name: 'statement-of-reasons.pdf' }));
    expect(downloadS3FileOnSameTab).toHaveBeenCalledWith('key/statement-of-reasons.pdf', 'statement-of-reasons.pdf', 'app', 'statement-of-reasons.pdf');
  });

  it('shows document names without links when the user cannot download', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue(application({ permissions: { canDownload: false } }));
    renderPage(); await ready();
    expect(screen.getByText('sealed-order.pdf')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'sealed-order.pdf' })).not.toBeInTheDocument();
  });

  it('offers Withdraw application when the status allows it', async () => {
    renderPage(); await ready();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Withdraw application' })).toHaveAttribute('href', '/cpo/app/withdraw'));
  });

  it('hides Withdraw application without permission, as for DESNZ staff', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue(application({ permissions: { canDownload: true, canWithdraw: false } }));
    renderPage(); await ready();
    expect(screen.queryByRole('button', { name: 'Withdraw application' })).not.toBeInTheDocument();
  });

  it('shows the withdrawal banner instead of the button once withdrawal is requested', async () => {
    vi.mocked(applicationApiService.getWithdrawalRequest).mockResolvedValue({ success: true, data: { status: 'Requested' } });
    renderPage(); await ready();
    expect(await screen.findByRole('region')).toHaveTextContent('Important');
    expect(screen.queryByRole('button', { name: 'Withdraw application' })).not.toBeInTheDocument();
  });

  it('does not show View objections until objections can be viewed', async () => {
    renderPage(); await ready();
    expect(screen.queryByRole('button', { name: 'View objections' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'View objections' })).not.toBeInTheDocument();
  });

  it('shows an error summary when the application cannot be loaded', async () => {
    vi.mocked(cpoNoticesService.get).mockRejectedValue(new Error('Unable to load publicity record'));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load publicity record');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
