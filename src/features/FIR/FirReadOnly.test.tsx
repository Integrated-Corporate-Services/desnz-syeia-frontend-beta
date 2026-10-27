import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FirSummaryCard } from './components/FirSummaryCard';
import { FurtherInformationRequestsPage } from './pages/FurtherInformationRequestsPage';
import { getFurtherInformationRequest, getFurtherInformationRequests } from './services';
import type { FurtherInformationRequest } from './types';
import { downloadDocument } from '../../utils/s3DownloadUtil';
import { ROLES } from '../../constants/roles';

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock('../../context/AuthUserContext', () => ({ useAuthUserContext: auth }));
vi.mock('../../context/BreadcrumbContext', () => ({ useBreadcrumb: vi.fn() }));
vi.mock('../../utils/s3DownloadUtil', () => ({ downloadDocument: vi.fn() }));
vi.mock('./services', () => ({
  getFurtherInformationRequests: vi.fn(),
  getFurtherInformationRequest: vi.fn(),
}));

const openRequest: FurtherInformationRequest = {
  furtherInformationRequestId: 'request-open',
  applicationId: 'app-1',
  recipientType: 'APPLICANT',
  requestText: 'Please provide the revised plan.',
  createdAt: '2026-10-01T10:00:00Z',
  deadlineAt: '2026-11-01T10:00:00Z',
  status: 'OPEN',
  requestedDocumentCategories: ['OTHER'],
  desnzRef: 'S3700001',
};
const completedRequest: FurtherInformationRequest = {
  ...openRequest,
  furtherInformationRequestId: 'request-completed',
  requestText: 'Please provide the supporting report.',
  status: 'RESPONDED',
  response: {
    furtherInformationResponseId: 'response-1',
    responseText: 'The supporting report is attached.',
    submittedAt: '2026-10-02T10:00:00Z',
    documentCategories: ['OTHER'],
    documents: [{ documentId: 'document-1', documentCategory: 'OTHER', filename: 'supporting-report.pdf' }],
  },
};

function renderFir(type: string, surface: 'summary' | 'listing') {
  const basePath = `/${type}/app-1/further-information-requests`;
  render(
    <MemoryRouter initialEntries={[basePath]}>
      <Routes>
        <Route path={`/${type}/:applicationId/further-information-requests`} element={
          surface === 'summary'
            ? <FirSummaryCard applicationId="app-1" basePath={basePath} />
            : <FurtherInformationRequestsPage />
        } />
      </Routes>
    </MemoryRouter>,
  );
  return basePath;
}

describe.each(['s-37', 'nwl'])('%s further-information permissions', type => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockReturnValue({ user: { role: ROLES.SUPERUSER } });
    vi.mocked(getFurtherInformationRequests).mockResolvedValue([openRequest, completedRequest]);
    vi.mocked(getFurtherInformationRequest).mockResolvedValue(completedRequest);
  });

  it('keeps the open request and history link on the Superuser summary without a response action', async () => {
    const basePath = renderFir(type, 'summary');
    expect(await screen.findByText(openRequest.requestText)).toBeInTheDocument();
    expect(screen.getByText('Not completed')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all information requests' })).toHaveAttribute('href', basePath);
    expect(screen.queryByRole('link', { name: 'Provide information' })).not.toBeInTheDocument();
  });

  it('keeps completed history reachable when no request is open', async () => {
    vi.mocked(getFurtherInformationRequests).mockResolvedValue([completedRequest]);
    const basePath = renderFir(type, 'summary');
    expect(await screen.findByRole('link', { name: 'View all information requests' })).toHaveAttribute('href', basePath);
    expect(screen.queryByRole('link', { name: 'Provide information' })).not.toBeInTheDocument();
  });

  it('retains the Superuser listing, completed response and working document download', async () => {
    renderFir(type, 'listing');
    expect(await screen.findByText(openRequest.requestText)).toBeInTheDocument();
    expect(screen.getByText('Not completed')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Completed requests' })).toBeInTheDocument();
    expect(screen.getByText('The supporting report is attached.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Provide information' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'supporting-report.pdf' }));
    expect(downloadDocument).toHaveBeenCalledWith('document-1');
    expect(getFurtherInformationRequest).toHaveBeenCalledExactlyOnceWith('app-1', 'request-completed');
  });

  describe.each([ROLES.APPLICANT_USER, ROLES.APPLICANT_TEAM_COORDINATOR, ROLES.APPLICANT_AGENT])('%s', role => {
    it.each(['summary', 'listing'] as const)('retains the open response action on the %s', async surface => {
      auth.mockReturnValue({ user: { role } });
      const basePath = renderFir(type, surface);
      expect(await screen.findByRole('link', { name: 'Provide information' })).toHaveAttribute('href', `${basePath}/request-open/respond`);
    });
  });
});