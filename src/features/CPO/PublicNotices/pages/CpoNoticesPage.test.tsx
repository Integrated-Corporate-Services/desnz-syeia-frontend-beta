import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreadcrumbProvider } from '../../../../context/BreadcrumbContext';
import { deleteDocument } from '../../../../services/s3ApiService';
import CpoNoticesPage from './CpoNoticesPage';
import { cpoNoticesService } from '../services/cpoNoticesService';
import type { NoticesResponse } from '../types/notices';
import type { FileUploadProps } from '../../../../components/FileUpload';

const navigate = vi.fn();
const upload = vi.hoisted(() => ({ pending: false, busy: false, scanErrors: [] as string[], files: ['new-file'], props: undefined as FileUploadProps | undefined }));
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../../../../services/s3ApiService', () => ({ deleteDocument: vi.fn().mockResolvedValue({}) }));
vi.mock('react-router-dom', async () => ({ ...await vi.importActual<typeof import('react-router-dom')>('react-router-dom'), useNavigate: () => navigate }));
vi.mock('../../../../components/FileUpload', async () => {
  const react = await import('react');
  return { default: react.forwardRef<unknown, FileUploadProps>((props, ref) => {
    upload.props = props;
    react.useImperativeHandle(ref, () => ({ getPendingFiles: () => upload.pending ? [{}] : [], isBusy: () => upload.busy, triggerUpload: async () => ({ scanErrors: upload.scanErrors, uploadedFiles: upload.scanErrors.length ? [] : upload.files.map(id => ({ id })), applicationDocuments: [] }) }));
    return <input id="file-upload-input" type="file" aria-label={props.title} />;
  }) };
});
let stored: NoticesResponse;
const renderStep = (step: string, query = '') => render(<BreadcrumbProvider><MemoryRouter initialEntries={[step === 'legacy' ? `/cpo/app/notice-requirements${query}` : `/cpo/app/record-notices${step ? `/${step}` : ''}${query}`]}><Routes>
  <Route path="/cpo/:applicationId/notice-requirements" element={<CpoNoticesPage />} />
  <Route path="/cpo/:applicationId/record-notices" element={<CpoNoticesPage />} />
  <Route path="/cpo/:applicationId/record-notices/:noticeStep" element={<CpoNoticesPage />} />
</Routes></MemoryRouter></BreadcrumbProvider>);
const ready = () => waitFor(() => expect(screen.getByRole('button', { name: 'Save and continue' })).toBeEnabled());
const setDate = (id: string, day = '7', month = '10', year = '2026') => {
  for (const [part, value] of [['day', day], ['month', month], ['year', year]]) fireEvent.change(document.getElementById(`${id}-${part}`)!, { target: { value } });
};
describe('CPO notices journey', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); vi.clearAllMocks(); upload.pending = false; upload.busy = false; upload.scanErrors = []; upload.files = ['new-file'];
    stored = { canEdit: true, reference: 'CPO00001', objectionsEmail: '', finalObjectionDate: '2026-11-09', documents: [], record: {
      requirements: { acknowledged: true },
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
    expect(screen.getByRole('link', { name: 'compulsorypurchaseorders@energysecurity.gov.uk' })).toHaveAttribute('href', 'mailto:compulsorypurchaseorders@energysecurity.gov.uk');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'requirements', { format: 'reference', acknowledged: true }, false));
    expect(navigate).toHaveBeenCalledWith('/cpo/app/record-notices/inspection');
  });
  it('opens the single task at notice requirements', async () => {
    renderStep(''); await ready();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('What your public notices must include');
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/cpo/app/task-list');
  });
  it('redirects a legacy requirements URL into the combined journey', async () => {
    renderStep('legacy', '?from=application-review'); await ready();
    expect(navigate).toHaveBeenCalledWith('/cpo/app/record-notices/requirements?from=application-review', { replace: true });
  });
  it('preserves requirements acknowledgement when saving for later', async () => {
    renderStep('requirements'); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    await waitFor(() => expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'requirements', { format: 'reference', acknowledged: true }, true));
  });
  it('returns a changed requirement acknowledgement to combined review', async () => {
    renderStep('requirements', '?from=check'); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/cpo/app/record-notices/check'));
  });
  it.each([['inspection', 'online'], ['online', 'newspapers'], ['newspapers', 'site'], ['site', 'people'], ['people', 'check']])('saves %s and moves to %s', async (step, next) => {
    if (step === 'newspapers') stored.record.newspapers = { firstDate: '2026-10-07', secondDate: '2026-10-14' };
    renderStep(step); await ready(); fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(`/cpo/app/record-notices/${next}`));
  });
  it('preserves the saved legacy inspection address and provides Change links', async () => {
    renderStep('inspection'); await ready();
    expect(screen.getByText('Network House')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Change inspection address 1' })).toHaveAttribute('href', expect.stringContaining('/inspection-address?id='));
  });
  it('links incomplete date errors to the date input and focuses the summary', async () => {
    stored.record.inspection = { address: 'Network House', from: '', until: '' };
    renderStep('inspection'); await ready(); fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveFocus();
    expect(screen.getByRole('link', { name: 'Enter an availability date for every inspection address' })).toHaveAttribute('href', '#inspection-heading');
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
    expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'inspection', expect.objectContaining({ format: 'reference', addresses: [] }), true);
  });
  it('uses immediate uploads without a separate Upload document action', async () => {
    renderStep('newspapers'); await ready();
    expect(upload.props?.uploadImmediately).toBe(true);
    expect(screen.queryByRole('button', { name: 'Upload document' })).not.toBeInTheDocument();
  });
  it('associates the upload date with the confirmed file ID', async () => {
    upload.pending = true; upload.files = ['first-file', 'second-file']; renderStep('newspapers'); await ready(); setDate('firstDate'); setDate('secondDate', '14');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'newspapers', expect.objectContaining({ evidence: [{ fileId: 'first-file', date: '2026-10-07' }, { fileId: 'second-file', date: '2026-10-14' }] }), false));
  });
  it('does not save or navigate when an upload fails', async () => {
    upload.pending = true; upload.scanErrors = ['Upload service unavailable'];
    renderStep('newspapers'); await ready(); setDate('firstDate'); setDate('secondDate', '14'); fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Upload service unavailable'));
    expect(cpoNoticesService.save).not.toHaveBeenCalled(); expect(navigate).not.toHaveBeenCalled();
  });
  it('returns changed answers to the review page', async () => {
    renderStep('website', '?from=check'); await ready(); fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/cpo/app/record-notices/check'));
  });
  it('preserves the application review return path through publicity rechecking', async () => {
    renderStep('website', '?from=application-review'); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/cpo/app/record-notices/check?from=application-review'));
  });
  it('returns a confirmed publicity review to the whole application', async () => {
    renderStep('check', '?from=application-review'); await ready();
    expect(screen.getByRole('link', { name: 'Change enter the website address' })).toHaveAttribute('href', '/cpo/app/record-notices/online?from=application-review');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/cpo/app/check-and-submit'));
  });
  it('confirms review through Save and continue and returns to the task list', async () => {
    renderStep('check'); await ready();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Change enter the website address' })).toHaveAttribute('href', '/cpo/app/record-notices/online?from=check');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
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
    expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'newspapers', expect.objectContaining({ evidence: [] }), true);
  });
  it('saves a structured address before entering its availability date', async () => {
    stored.record.inspection = {};
    renderStep('inspection-address');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled());
    fireEvent.change(screen.getByLabelText('Address line 1'), { target: { value: '72 Guild Street' } });
    fireEvent.change(screen.getByLabelText('Town or city'), { target: { value: 'London' } });
    fireEvent.change(screen.getByLabelText('Postcode'), { target: { value: 'SE23 6FH' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'inspection', expect.objectContaining({ format: 'reference', addresses: [expect.objectContaining({ line1: '72 Guild Street', townCity: 'London', postcode: 'SE23 6FH' })] }), true));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/inspection-date?id='));
  });
  it('requires an inspection address before continuing from an empty list', async () => {
    stored.record.inspection = {};
    renderStep('inspection'); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Add at least one inspection address');
    expect(screen.getByRole('link', { name: 'Add an address' })).toBeInTheDocument();
  });
  it('allows service evidence and its completion date to be omitted', async () => {
    stored.record.people = {};
    renderStep('people'); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'people', expect.objectContaining({ format: 'reference' }), false));
    expect(navigate).toHaveBeenCalledWith('/cpo/app/record-notices/check');
  });
  it('preserves newspaper file/date associations when saved entries are out of order', async () => {
    stored.record.newspapers = { evidence: [{ fileId: 'second-file', date: '2026-10-14' }, { fileId: 'first-file', date: '2026-10-07' }] };
    renderStep('newspapers'); await ready();
    setDate('firstDate', '8'); setDate('secondDate', '15');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'newspapers', expect.objectContaining({ evidence: [{ fileId: 'second-file', date: '2026-10-15' }, { fileId: 'first-file', date: '2026-10-08' }] }), false));
  });
  it('saves an edited availability date and returns to the inspection list', async () => {
    renderStep('inspection-date', '?id=00000000-0000-4000-8000-000000000001');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled());
    setDate('inspection-date', '8');
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'inspection', expect.objectContaining({ addresses: [expect.objectContaining({ from: '2026-10-08' })] }), true));
    expect(navigate).toHaveBeenCalledWith('/cpo/app/record-notices/inspection');
  });
  it('recovers registered newspaper files that have no saved evidence entries', async () => {
    stored.record.newspapers = { firstDate: '2026-10-07', secondDate: '2026-10-14' };
    stored.documents = ['first-file', 'second-file'].map(file_id => ({ file_id, document_id: file_id, filename: `${file_id}.pdf`, category: 'CPO_NEWSPAPER_NOTICES' } as NoticesResponse['documents'][number]));
    renderStep('newspapers'); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'newspapers', expect.objectContaining({ evidence: [{ fileId: 'first-file', date: '2026-10-07' }, { fileId: 'second-file', date: '2026-10-14' }] }), false));
  });
  it.each(['newspapers', 'site', 'people'])('immediately uploads %s using the shared uploader', async step => {
    renderStep(step); await ready();
    expect(upload.props?.uploadImmediately).toBe(true);
    expect(upload.props?.acceptedTypes).toContain('.msg');
    expect(screen.queryByRole('button', { name: 'Upload document' })).not.toBeInTheDocument();
  });
  it('refreshes immediately uploaded notice files without losing unsaved publication dates', async () => {
    renderStep('newspapers'); await ready();
    setDate('firstDate', '8'); setDate('secondDate', '15');
    stored.documents = ['first-file', 'second-file'].map(file_id => ({ file_id, document_id: file_id, filename: `${file_id}.pdf`, category: 'CPO_NEWSPAPER_NOTICES' } as NoticesResponse['documents'][number]));
    act(() => { upload.props?.onUploaded?.([], []); });
    await screen.findByRole('link', { name: 'first-file.pdf' });
    expect(document.getElementById('firstDate-day')).toHaveValue('8');
    expect(document.getElementById('secondDate-day')).toHaveValue('15');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(cpoNoticesService.save).toHaveBeenCalledWith('app', 'newspapers', expect.objectContaining({ evidence: [{ fileId: 'first-file', date: '2026-10-08' }, { fileId: 'second-file', date: '2026-10-15' }] }), false));
  });
});