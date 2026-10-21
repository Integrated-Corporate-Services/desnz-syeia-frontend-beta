import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ApplicationSummary from './ApplicationSummary';
import { applicationApiService } from '../../../services/applicationApiService';
import { downloadS3FileOnSameTab } from '../../../utils/s3DownloadUtil';

vi.mock('../../../services/applicationApiService', () => ({
  applicationApiService: {
    getApplicationReview: vi.fn(),
    getWithdrawalRequest: vi.fn().mockResolvedValue(null),
    confirmDeclaration: vi.fn(),
  },
}));
vi.mock('../../../utils/s3DownloadUtil', () => ({ downloadS3FileOnSameTab: vi.fn() }));
vi.mock('../../../hooks', () => ({
  useInvoiceStatus: () => ({ loading: false, error: null, data: null }),
  buildInvoiceDownloadUrl: () => '',
}));
vi.mock('../hooks/useDeclarationSubmit', () => ({
  useDeclarationSubmit: () => ({ declarationConfirmed: false, error: null, handleDeclarationChange: vi.fn() }),
}));
vi.mock('../../../context/BreadcrumbContext', () => ({ useBreadcrumb: vi.fn() }));
vi.mock('../../ApplicationReassignment/hooks/useAssignmentHistory', () => ({
  useAssignmentHistory: () => ({ loading: false, error: null, details: null }),
}));
vi.mock('../../ApplicationReassignment/components/ApplicationReassignmentLinks', () => ({ ApplicationReassignmentLinks: () => null }));
vi.mock('../../ApplicationReassignment/components/ReassignmentSuccessBanner', () => ({ ReassignmentSuccessBanner: () => null }));
vi.mock('../../FIR/components/FirSummaryCard', () => ({ FirSummaryCard: () => null }));
vi.mock('../../../components/SensitiveAreaCheckMap', () => ({ default: () => null }));
vi.mock('../component/S37SummaryPdfDownloadLink', () => ({ S37SummaryPdfDownloadLink: () => null }));

const APP_ID = '8b6d9149-4cdf-4ba8-99a5-281d2411db13';
const LPA_FORM = {
  name: 'LPA Consultation Form',
  url: 'consultations/lpa-form.docx',
  file_id: 'file-1',
  document_id: 'doc-1',
};

const consultation = (overrides: Record<string, unknown>) => ({
  status: 'Closed',
  sentAt: '2025-11-11T00:00:00.000Z',
  consultationRequestDocs: [],
  responseDocuments: [],
  ...overrides,
});

const renderPage = async (consultations: unknown[]) => {
  vi.mocked(applicationApiService.getApplicationReview).mockResolvedValue({
    applicationId: APP_ID,
    desnzRef: 'S3700001',
    formType: 'S37',
    status: 'SUBMITTED',
    sections: { consultations, parishes: [], location: { route: [] } },
    permissions: { canView: true, canEdit: false, canDelete: false, canSubmit: false, canDownload: true, canWithdraw: true },
  } as never);
  render(
    <MemoryRouter initialEntries={[`/s-37/${APP_ID}/application-summary`]}>
      <Routes>
        <Route path="/s-37/:applicationId/application-summary" element={<ApplicationSummary />} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(applicationApiService.getApplicationReview).toHaveBeenCalled());
};

const card = async (title: string) => {
  const heading = await screen.findByRole('heading', { name: title });
  return heading.closest('.govuk-summary-card') as HTMLElement;
};

describe('S37 Application summary: LPA consultation request document', () => {
  beforeEach(() => {
    vi.mocked(downloadS3FileOnSameTab).mockReset();
  });

  it('shows the LPA consultation form link between Status and Date of consultation request, and downloads it', async () => {
    await renderPage([
      consultation({ id: 'c1', consultationType: 'LPA', consulteeOrganisationName: 'Cumberland Council', lpaConsultationForm: [LPA_FORM] }),
    ]);
    const c = await card('Cumberland Council');
    const keys = Array.from(c.querySelectorAll('.govuk-summary-list__key')).map((k) => k.textContent);
    const i = keys.indexOf('Consultation request document');
    expect(i).toBe(keys.indexOf('Status') + 1);
    expect(keys[i + 1]).toBe('Date of consultation request');

    fireEvent.click(within(c).getByRole('link', { name: 'LPA Consultation Form' }));
    await waitFor(() =>
      expect(downloadS3FileOnSameTab).toHaveBeenCalledWith(LPA_FORM.url, LPA_FORM.file_id, APP_ID, LPA_FORM.document_id)
    );
  });

  it('shows "-" for an OTHER-LPA consultation with no generated form', async () => {
    await renderPage([consultation({ id: 'c2', consultationType: 'OTHER-LPA', consulteeOrganisationName: 'Test Valley Borough Council', lpaConsultationForm: [] })]);
    const c = await card('Test Valley Borough Council');
    const row = Array.from(c.querySelectorAll('.govuk-summary-list__row')).find(
      (r) => r.querySelector('.govuk-summary-list__key')?.textContent === 'Consultation request document'
    );
    expect(row?.querySelector('.govuk-summary-list__value')?.textContent).toBe('-');
  });

  it('does not show the row for non-LPA consultations', async () => {
    await renderPage([consultation({ id: 'c3', consultationType: 'SANCTUARY', consulteeOrganisationName: 'Historic England' })]);
    const c = await card('Historic England');
    expect(within(c).queryByText('Consultation request document')).not.toBeInTheDocument();
  });
});
