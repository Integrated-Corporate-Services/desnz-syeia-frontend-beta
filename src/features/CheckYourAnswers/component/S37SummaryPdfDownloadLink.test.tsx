import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { S37SummaryPdfDownloadLink } from './S37SummaryPdfDownloadLink';
import { downloadApplicationPdf } from '../../ApplicationSummary/services/pdfService';

vi.mock('../../ApplicationSummary/services/pdfService', () => ({
  downloadApplicationPdf: vi.fn(),
  downloadApplicationPackage: vi.fn(),
}));

const LINK_TEXT = 'Download the application summary only (PDF)';
const APP_ID = '3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

describe('S37SummaryPdfDownloadLink (SYEIA-2695)', () => {
  beforeEach(() => {
    vi.mocked(downloadApplicationPdf).mockReset();
  });

  it.each(['SUBMITTED', 'Submitted', 'IN_PROGRESS', 'FURTHER_INFORMATION_REQUESTED', 'DECISION_ISSUED'])(
    'shows the link for a submitted application (%s)',
    (status) => {
      render(<S37SummaryPdfDownloadLink applicationId={APP_ID} status={status} />);
      expect(screen.getByRole('link', { name: LINK_TEXT })).toBeInTheDocument();
    }
  );

  it.each([['DRAFT'], [undefined], [null], ['']])('hides the link before submission (%s)', (status) => {
    render(<S37SummaryPdfDownloadLink applicationId={APP_ID} status={status as string | null | undefined} />);
    expect(screen.queryByText(LINK_TEXT)).not.toBeInTheDocument();
  });

  it('downloads the S37 summary PDF and is disabled while downloading', async () => {
    let finish: () => void = () => undefined;
    vi.mocked(downloadApplicationPdf).mockImplementation(
      () => new Promise<void>((resolve) => { finish = resolve; })
    );
    render(<S37SummaryPdfDownloadLink applicationId={APP_ID} status="SUBMITTED" />);

    fireEvent.click(screen.getByRole('link', { name: LINK_TEXT }));

    expect(downloadApplicationPdf).toHaveBeenCalledWith(APP_ID, 'S37');
    const busy = await screen.findByText('Downloading...');
    expect(busy).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(busy);
    expect(downloadApplicationPdf).toHaveBeenCalledTimes(1);

    await act(async () => finish());
    await waitFor(() => expect(screen.getByRole('link', { name: LINK_TEXT })).toHaveAttribute('aria-disabled', 'false'));
  });

  it('shows an error summary when the download fails', async () => {
    vi.mocked(downloadApplicationPdf).mockRejectedValue(new Error('Application has not been submitted'));
    render(<S37SummaryPdfDownloadLink applicationId={APP_ID} status="SUBMITTED" />);

    fireEvent.click(screen.getByRole('link', { name: LINK_TEXT }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Application has not been submitted');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
