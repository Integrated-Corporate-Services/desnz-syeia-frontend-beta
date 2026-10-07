import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmUpload, getPresignedUrls } from './s3ApiService';

vi.mock('../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => path }));
vi.mock('../utils/csrf', () => ({ getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test-token' }) }));

afterEach(() => vi.unstubAllGlobals());

describe('upload API errors', () => {
  it.each([
    [400, { error: 'Maximum 10 files allowed per batch upload' }, 'Maximum 10 files allowed per batch upload'],
    [403, { error: 'Forbidden', message: 'Invalid CSRF token' }, 'Invalid CSRF token'],
    [503, { code: 'CREDENTIALS_EXPIRED', userMessage: 'Upload service temporarily unavailable' }, 'Upload service temporarily unavailable'],
    [401, { error: 'Unauthorized' }, 'Your session has expired. Sign in again.'],
  ])('preserves the actionable upload-URL error for status %s', async (status, body, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
    await expect(getPresignedUrls([{ filename: 'app/CPO_ADDITIONAL_DOCUMENTS/test.pdf', contentType: 'application/pdf' }], 'app')).rejects.toThrow(message);
  });

  it('falls back when the upload-URL response is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Bad gateway', { status: 502 })));
    await expect(getPresignedUrls([], 'app')).rejects.toThrow('Failed to get presigned URLs');
  });

  it('preserves an upload-confirmation error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'The file upload may have failed' }), { status: 404 })));
    await expect(confirmUpload({ s3Key: 'test.pdf', fileName: 'test.pdf', contentType: 'application/pdf', fileSize: 100, applicationId: 'app', category: 'CPO_ADDITIONAL_DOCUMENTS', addedBy: 'user' })).rejects.toThrow('The file upload may have failed');
  });
});