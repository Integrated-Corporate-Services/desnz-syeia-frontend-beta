import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EiaReportUploadPage from './EiaReportUploadPage';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';

const updateEiaFees = vi.fn();
const triggerUpload = vi.fn();
let savedFees: Record<string, unknown> | null = null;
let hookError: string | null = null;
const retryConsultations = vi.fn();
type ConsultationState = { consultationsStarted: boolean; loading: boolean; checked: boolean; error: string | null; retry: () => void };
let consultations: ConsultationState = { consultationsStarted: false, loading: false, checked: true, error: null, retry: retryConsultations };

vi.mock('../../../context/AuthUserContext', () => ({ useAuthUserContext: () => ({ user: { user_id: 'user-1' } }) }));
vi.mock('../../../hooks/useConsultationsStarted', () => ({ useConsultationsStarted: () => consultations }));
let draftCheck = 'locked';
vi.mock('../hooks/useEditableDraft', () => ({ useEditableDraft: (_id: string, enabled: boolean) => (enabled ? draftCheck : 'idle') }));
vi.mock('../../../hooks/useEiaFees', () => ({
  useEiaFees: () => ({ eiaFees: savedFees, loading: false, error: hookError, fetchEiaFees: vi.fn(), updateEiaFees }),
}));
vi.mock('../../../components/FileUpload', () => ({
  default: React.forwardRef((props: { onValidationErrors?: (errors: string[]) => void; uploadedFiles?: { filename: string }[] }, ref) => {
    React.useImperativeHandle(ref, () => ({ triggerUpload, isBusy: () => false, getPendingFiles: () => [] }));
    return (
      <div data-testid="file-upload">
        <ul aria-label="Uploaded files">{(props.uploadedFiles ?? []).map((f) => <li key={f.filename}>{f.filename}</li>)}</ul>
        <input id="file-upload-input" type="file" aria-label="Upload a file" />
        <button type="button" onClick={() => props.onValidationErrors?.(['The selected file must be smaller than 50MB'])}>Pick a large file</button>
      </div>
    );
  }),
}));

const APP = 'app-1';
const FULL_EIA = { eiaFeeId: 'e-1', applicationId: APP, isEiaDevelopment: true, screeningOnly: true };
const renderPage = () =>
  render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={[`/s-37/${APP}/eia-fees/upload-eia-report`]}>
        <Routes>
          <Route path="/s-37/:applicationId/eia-fees/upload-eia-report" element={<EiaReportUploadPage />} />
          <Route path="/s-37/:applicationId/eia-fees" element={<h1>EIA question page</h1>} />
          <Route path="/s-37/:applicationId/task-list" element={<h1>Task list page</h1>} />
        </Routes>
      </MemoryRouter>
    </BreadcrumbProvider>
  );

describe('Upload your EIA report (SYEIA-1485)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    savedFees = { ...FULL_EIA, uploadedFiles: [], applicationDocuments: [] };
    hookError = null;
    draftCheck = 'locked';
    consultations = { consultationsStarted: false, loading: false, checked: true, error: null, retry: retryConsultations };
    triggerUpload.mockResolvedValue({ uploadedFiles: [], applicationDocuments: [], scanErrors: [] });
    updateEiaFees.mockResolvedValue({});
  });

  it('asks for a file before continuing', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Upload your EIA report' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(await screen.findByRole('link', { name: 'Select a file to upload' })).toHaveAttribute('href', '#file-upload-input');
    expect(updateEiaFees).not.toHaveBeenCalled();
  });

  it('saves the answer again once a report is uploaded, so the section completes', async () => {
    triggerUpload.mockResolvedValue({ uploadedFiles: [{ id: 'f-1', filename: 'eia.pdf' }], applicationDocuments: [{ documentId: 'd-1', fileId: 'f-1' }], scanErrors: [] });
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(updateEiaFees).toHaveBeenCalledWith(expect.objectContaining({ eiaFeeId: 'e-1', isEiaDevelopment: true, screeningOnly: true })));
    expect(await screen.findByRole('heading', { name: 'Task list page' })).toBeInTheDocument();
  });

  it('keeps a report uploaded just before a failed save, so Save and continue can be retried', async () => {
    triggerUpload.mockResolvedValueOnce({ uploadedFiles: [{ id: 'f-1', filename: 'eia.pdf' }], applicationDocuments: [{ documentId: 'd-1', fileId: 'f-1' }], scanErrors: [] });
    updateEiaFees.mockImplementationOnce(async () => { hookError = 'Failed to update EIA Fee'; throw new Error('Failed to update EIA Fee'); });
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(await screen.findByText('Failed to submit EIA Fees. Please try again.', { selector: 'span' })).toBeInTheDocument();
    // Let the effects that run on the hook's new error value settle before checking the list.
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
    expect(within(screen.getByRole('list', { name: 'Uploaded files' })).getByText('eia.pdf')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(updateEiaFees).toHaveBeenCalledTimes(2));
    expect(screen.queryByText('Select a file to upload')).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Task list page' })).toBeInTheDocument();
  });

  it('puts file validation errors in the error summary, linked to the file input, and focuses it', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Pick a large file' }));
    const link = await screen.findByRole('link', { name: 'The selected file must be smaller than 50MB' });
    expect(link).toHaveAttribute('href', '#file-upload-input');
    expect(screen.getByRole('alert')).toHaveFocus();
  });

  it('does not show the upload once consultations have started and goes to the read-only EIA page', async () => {
    consultations = { ...consultations, consultationsStarted: true };
    renderPage();
    expect(await screen.findByRole('heading', { name: 'EIA question page' })).toBeInTheDocument();
    expect(screen.queryByTestId('file-upload')).not.toBeInTheDocument();
  });

  it.each([
    ['while it is loading', { loading: true, checked: false }],
    ['before it has started', { loading: false, checked: false }],
  ])('waits for the consultation check before showing the upload (%s)', (_label, state) => {
    consultations = { ...consultations, ...state };
    renderPage();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('file-upload')).not.toBeInTheDocument();
  });

  it('shows an error and Try again, with no upload or save, when the consultation check fails', () => {
    consultations = { ...consultations, checked: false, error: 'Failed to fetch consultation details' };
    renderPage();
    expect(screen.getByText('We could not check whether consultations have started for this application. Try again.')).toBeInTheDocument();
    expect(screen.queryByTestId('file-upload')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save and continue' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save for later' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retryConsultations).toHaveBeenCalledTimes(1);
    expect(updateEiaFees).not.toHaveBeenCalled();
  });

  it('lets a draft full EIA with no report upload it after consultations have started (recovery)', async () => {
    consultations = { ...consultations, consultationsStarted: true };
    draftCheck = 'editable';
    renderPage();
    expect(await screen.findByTestId('file-upload')).toBeInTheDocument();
    expect(screen.getByText(/You chose a full EIA but have not uploaded your EIA report/)).toBeInTheDocument();
    triggerUpload.mockResolvedValueOnce({ uploadedFiles: [{ id: 'f-1', filename: 'eia.pdf' }], applicationDocuments: [{ documentId: 'd-1', fileId: 'f-1' }], scanErrors: [] });
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(updateEiaFees).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('heading', { name: 'Task list page' })).toBeInTheDocument();
  });

  it('keeps the page read-only after consultations start when the application is not an editable draft', async () => {
    consultations = { ...consultations, consultationsStarted: true };
    draftCheck = 'locked';
    renderPage();
    expect(await screen.findByRole('heading', { name: 'EIA question page' })).toBeInTheDocument();
    expect(screen.queryByTestId('file-upload')).not.toBeInTheDocument();
  });

  it('keeps the page read-only after consultations start when the report is already uploaded', async () => {
    consultations = { ...consultations, consultationsStarted: true };
    draftCheck = 'editable';
    savedFees = { ...FULL_EIA, uploadedFiles: [{ id: 'f-1', filename: 'eia.pdf' }], applicationDocuments: [{ documentId: 'd-1', fileId: 'f-1', title: 'eia.pdf' }] };
    renderPage();
    expect(await screen.findByRole('heading', { name: 'EIA question page' })).toBeInTheDocument();
    expect(screen.queryByTestId('file-upload')).not.toBeInTheDocument();
  });

  it('sends the applicant back to the question when the answer is not a full EIA', async () => {
    savedFees = { eiaFeeId: 'e-1', applicationId: APP, isEiaDevelopment: true, screeningOnly: false };
    renderPage();
    expect(await screen.findByRole('heading', { name: 'EIA question page' })).toBeInTheDocument();
  });
});
