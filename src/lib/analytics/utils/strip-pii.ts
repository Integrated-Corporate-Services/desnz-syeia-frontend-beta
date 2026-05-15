const PII_PARAM_BLOCKLIST = [
  'email', 'name', 'dob', 'ni', 'nino', 'postcode',
  'phone', 'reference', 'ref',
];

export function stripPii(url: string): string {
  try {
    const base = url.startsWith('http') ? url : `https://x${url}`;
    const parsed = new URL(base);
    PII_PARAM_BLOCKLIST.forEach((p) => parsed.searchParams.delete(p));
    const result = parsed.pathname + (parsed.search || '');
    return url.startsWith('http') ? parsed.toString() : result;
  } catch {
    return url;
  }
}

const EMAIL_RE    = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const NINO_RE     = /[A-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]/gi;
const POSTCODE_RE = /[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/gi;

export function stripPiiFromQuery(query: string): string {
  return query
    .replace(EMAIL_RE,    '[redacted]')
    .replace(NINO_RE,     '[redacted]')
    .replace(POSTCODE_RE, '[redacted]');
}
