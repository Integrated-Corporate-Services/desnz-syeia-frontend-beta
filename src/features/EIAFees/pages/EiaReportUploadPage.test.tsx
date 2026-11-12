import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EiaReportUploadPage from './EiaReportUploadPage';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';

const updateEiaFees = vi.fn();
const triggerUpload = vi.fn();
let savedFees: Record<string, unknown> | null = null;

vi.mock('../../../context/AuthUserContext', () => ({ useAuthUserContext: () => ({ user: { user_id: 'user-1' } }) }));
vi.mock('../../../hooks/useEiaFees', () => ({
  useEiaFees: () => ({ eiaFees: savedFees, loading: false, error: null, fetchEiaFees: vi.fn(), updateEiaFees }),
}));
vi.mock('../../../components/FileUpload', () => ({
  default: React.forwardRef((_props, ref) => {
    React.useImperativeHandle(ref, () => ({ triggerUpload, isBusy: () => false, getPendingFiles: () => [] }));
    return <div data-testid="file-upload" />;
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

  it('sends the applicant back to the question when the answer is not a full EIA', async () => {
    savedFees = { eiaFeeId: 'e-1', applicationId: APP, isEiaDevelopment: true, screeningOnly: false };
    renderPage();
    expect(await screen.findByRole('heading', { name: 'EIA question page' })).toBeInTheDocument();
  });
});
