import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreadcrumbProvider } from '../../context/BreadcrumbContext';
import { deleteDocument } from '../../services/s3ApiService';
import CpoNoticesPage from './CpoNoticesPage';
import { cpoNoticesService } from './cpoNoticesService';
import type { NoticesResponse } from './cpoNoticesService';

const navigate = vi.fn();
const upload = vi.hoisted(() => ({ pending: false, busy: false, scanErrors: [] as string[] }));
vi.mock('../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../../services/s3ApiService', () => ({ deleteDocument: vi.fn().mockResolvedValue({}) }));
vi.mock('react-router-dom', async () => ({ ...await vi.importActual<typeof import('react-router-dom')>('react-router-dom'), useNavigate: () => navigate }));
vi.mock('../../components/FileUpload', async () => {
  const react = await import('react');
  return { default: react.forwardRef((props: { title: string }, ref) => {
    react.useImperativeHandle(ref, () => ({ getPendingFiles: () => upload.pending ? [{}] : [], isBusy: () => upload.busy, triggerUpload: async () => ({ scanErrors: upload.scanErrors, uploadedFiles: upload.scanErrors.length ? [] : [{ id: 'new-file' }], applicationDocuments: [] }) }));
    return <input id="file-upload-input" type="file" aria-label={props.title} />;
  }) };
});
let stored: NoticesResponse;
const renderStep = (step: string, query = '') => render(<BreadcrumbProvider><MemoryRouter initialEntries={[step === 'requirements' ? '/cpo/app/notice-requirements' : `/cpo/app/record-notices/${step}${query}`]}><Routes>
  <Route path="/cpo/:applicationId/notice-requirements" element={<CpoNoticesPage />} />
  <Route path="/cpo/:applicationId/record-notices/:noticeStep" element={<CpoNoticesPage />} />
</Routes></MemoryRouter></BreadcrumbProvider>);
const ready = () => waitFor(() => expect(screen.getByRole('button', { name: 'Save and continue' })).toBeEnabled());
const setDate = (id: string, day = '7', month = '10', year = '2026') => {
  for (const [part, value] of [['day', day], ['month', month], ['year', year]]) fireEvent.change(document.getElementById(`${id}-${part}`)!, { target: { value } });
};
describe('CPO notices journey', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); vi.clearAllMocks(); upload.pending = false; upload.busy = false; upload.scanErrors = [];
    stored = { canEdit: true, reference: 'CPO00001', objectionsEmail: '', finalObjectionDate: '2026-11-09', documents: [], record: {
      inspection: { address: 'Network House', from: '2026-10-07', until: '2026-11-09' },
      online: { url: 'https://example.gov.uk/order', from: '2026-10-07', until: '2026-11-09' },
      website: { url: 'https://example.gov.uk/notice', liveDate: '2026-10-07' },
      site: { completionDate: '2026-10-07', evidence: [] }, people: { completionDate: '2026-10-19', evidence: [] }, newspapers: { evidence: [] },
    } };
    vi.spyOn(cpoNoticesService, 'get').mockImplementation(async () => stored);
    vi.spyOn(cpoNoticesService, 'save').mockImplementation(async () => stored);
  });
  it('uses the real reference and does not invent the objections mailbox', async () => {
    renderStep('requirements'); await ready();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('What your public notices must include');
    expect(screen.getByText(/CPO00001/)).toBeInTheDocument();
    expect(screen.getByText(/ask DESNZ to confirm/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'requirements', { acknowledged: true }, false));
    expect(navigate).toHaveBeenCalledWith('/cpo/app/record-notices');
  });
  it.each([['inspection', 'online'], ['online', 'newspapers'], ['newspapers', 'website'], ['website', 'site'], ['site', 'people'], ['people', 'check']])('saves %s and moves to %s', async (step, next) => {
    renderStep(step); await ready(); fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(`/cpo/app/record-notices/${next}`));
  });
  it('shows the inspection dispensation guidance in a native details control', async () => {
    renderStep('inspection'); await ready();
    expect(screen.getByText('If you cannot provide a place for inspection').closest('details')).toBeInTheDocument();
  });
  it('links incomplete date errors to the date input and focuses the summary', async () => {
    stored.record.inspection = { address: 'Network House', from: '', until: '' };
    renderStep('inspection'); await ready(); fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveFocus();
    expect(screen.getByRole('link', { name: 'Enter a valid available from date' })).toHaveAttribute('href', '#from-day');
    expect(cpoNoticesService.save).not.toHaveBeenCalled();
  });
  it('preserves separate day, month and year values in ISO dates', async () => {
    renderStep('website'); await ready(); setDate('liveDate', '14');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'website', expect.objectContaining({ liveDate: '2026-10-14' }), false));
  });
  it('saves partial forms for later without completing the section', async () => {
    stored.record.inspection = { address: '', from: '', until: '' };
    renderStep('inspection'); await ready(); fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/application-dashboard'));
    expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'inspection', stored.record.inspection, true);
  });
  it('requires a date before uploading pending evidence', async () => {
    upload.pending = true; renderStep('newspapers'); await ready(); fireEvent.click(screen.getByRole('button', { name: 'Upload document' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid document date');
    expect(cpoNoticesService.save).not.toHaveBeenCalled();
  });
  it('associates the upload date with the confirmed file ID', async () => {
    upload.pending = true; renderStep('newspapers'); await ready(); setDate('document-date');
    fireEvent.click(screen.getByRole('button', { name: 'Upload document' }));
    await waitFor(() => expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'newspapers', { evidence: [{ fileId: 'new-file', date: '2026-10-07' }] }, true));
    expect(navigate).not.toHaveBeenCalled();
  });
  it('does not save or navigate when an upload fails', async () => {
    upload.pending = true; upload.scanErrors = ['Upload service unavailable'];
    renderStep('newspapers'); await ready(); setDate('document-date'); fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Upload service unavailable'));
    expect(cpoNoticesService.save).not.toHaveBeenCalled(); expect(navigate).not.toHaveBeenCalled();
  });
  it('returns changed answers to the review page', async () => {
    renderStep('website', '?from=check'); await ready(); fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/cpo/app/record-notices/check'));
  });
  it('requires affirmative review and then returns to the task list', async () => {
    renderStep('check'); await ready(); fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Select yes');
    expect(screen.getByRole('link', { name: 'Change website notice' })).toHaveAttribute('href', '/cpo/app/record-notices/website?from=check');
    fireEvent.click(screen.getByLabelText('Yes')); fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/cpo/app/task-list'));
  });
  it('does not offer save or upload controls in view-only mode', async () => {
    stored.canEdit = false; renderStep('newspapers');
    await screen.findByText('You can view this publicity record but cannot change it.');
    expect(screen.queryByRole('button', { name: 'Save and continue' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Upload document' })).not.toBeInTheDocument();
  });
  it('disables saves and focuses the summary when loading fails', async () => {
    vi.mocked(cpoNoticesService.get).mockRejectedValue(new Error('Unable to load publicity'));
    renderStep('inspection'); await screen.findByRole('alert');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus());
    expect(screen.getByRole('button', { name: 'Save and continue' })).toBeDisabled();
  });
  it('removes the document through the existing API and saves the updated evidence list', async () => {
    stored.documents = [{ document_id: 'doc', file_id: 'file', category: 'CPO_NEWSPAPER_NOTICES', filename: 'notice.pdf' } as NoticesResponse['documents'][number]];
    stored.record.newspapers = { evidence: [{ fileId: 'file', date: '2026-10-07' }] };
    renderStep('newspapers'); await ready(); fireEvent.click(screen.getByRole('button', { name: 'Delete notice.pdf' }));
    await waitFor(() => expect(deleteDocument).toHaveBeenCalledWith('doc'));
    expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'newspapers', { evidence: [] }, true);
  });
});