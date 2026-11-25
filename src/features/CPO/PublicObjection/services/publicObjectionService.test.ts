import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ObjectionFieldErrors, ObjectionJourneyMissing, publicObjectionService } from './publicObjectionService';

vi.mock('../../../../utils/csrf', () => ({
  fetchCsrfToken: vi.fn(),
  getCsrfHeaders: () => ({ 'X-CSRF-Token': 'token' }),
}));

const respond = (status: number, body: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('publicObjectionService', () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('sends the answer with the CSRF token and session cookie', async () => {
    const fetchSpy = respond(200, { reference: 'CPO00001' });
    await publicObjectionService.saveFullName('Priya Shah');

    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('/api/cpo/public-objection/journey/full-name');
    expect(init).toMatchObject({ method: 'PUT', credentials: 'include', body: JSON.stringify({ fullName: 'Priya Shah' }) });
    expect((init?.headers as Record<string, string>)['X-CSRF-Token']).toBe('token');
  });

  it('sends a document as the request body with its name in a header', async () => {
    const fetchSpy = respond(200, { reference: 'CPO00001' });
    const file = new File(['%PDF'], 'ridge lane photos.pdf', { type: 'application/pdf' });
    await publicObjectionService.uploadDocument(file);

    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('/api/cpo/public-objection/journey/documents/upload');
    expect(init?.body).toBe(file);
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/pdf',
      'X-File-Name': 'ridge%20lane%20photos.pdf',
      'X-CSRF-Token': 'token',
    });
  });

  it('turns a 400 into field errors', async () => {
    respond(400, { errors: [{ field: 'fullName', message: 'Enter your full name' }] });
    const failure = await publicObjectionService.saveFullName('').catch((error) => error);
    expect(failure).toBeInstanceOf(ObjectionFieldErrors);
    expect(failure.errors).toEqual([{ field: 'fullName', message: 'Enter your full name' }]);
  });

  it('turns a 404 into a missing journey', async () => {
    respond(404, { message: 'gone' });
    await expect(publicObjectionService.get()).rejects.toBeInstanceOf(ObjectionJourneyMissing);
  });

  it('explains rate limiting and hides other server errors', async () => {
    respond(429, {});
    await expect(publicObjectionService.resendSecurityCode()).rejects.toThrow('You have made too many requests. Try again in 15 minutes.');
    respond(500, { message: 'stack trace' });
    await expect(publicObjectionService.get()).rejects.toThrow('Sorry, there is a problem with the service. Try again later.');
  });
});
