import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadApplicationPdf } from './pdfService';

vi.mock('../../../utils/apiConfig', () => ({
  buildBackendUrl: (path: string) => `http://backend${path}`,
}));

const APP_ID = '3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

describe('downloadApplicationPdf (SYEIA-2695)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => 'attachment; filename="S37_S3700013.pdf"' },
      blob: async () => new Blob(['%PDF'], { type: 'application/pdf' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    URL.createObjectURL = vi.fn(() => 'blob:test');
    URL.revokeObjectURL = vi.fn();
    // jsdom cannot follow the blob link the download clicks.
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    fetchMock.mockReset();
  });

  it('calls the S37 summary endpoint for an S37 application', async () => {
    await downloadApplicationPdf(APP_ID, 'S37');
    expect(fetchMock).toHaveBeenCalledWith(
      `http://backend/api/applications/${APP_ID}/download-pdf`,
      expect.objectContaining({ method: 'GET', credentials: 'include' })
    );
  });

  it('keeps the NWL endpoint by default', async () => {
    await downloadApplicationPdf(APP_ID);
    expect(fetchMock).toHaveBeenCalledWith(`http://backend/api/nwl/${APP_ID}/download-pdf`, expect.anything());
  });
});
