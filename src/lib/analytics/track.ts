import { readCookie } from '../../modules/cookie-consent/cookie-utils';
import { AnalyticsEvent, type ParamsForEvent } from './events';

function analyticsAccepted(): boolean {
  const raw = readCookie('consent_preference');
  if (!raw) return false;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    return parsed.analytics === 'accepted';
  } catch {
    return false;
  }
}

const ENABLE_GA4 = import.meta.env.VITE_ENABLE_GA4 === 'true';

function sendToGa4(event: string, params: Record<string, unknown>): void {
  if (!ENABLE_GA4) return;
  const win = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof win.gtag === 'function') {
    win.gtag('event', event, params);
  }
}

export function track<E extends AnalyticsEvent>(
  event: E,
  params: ParamsForEvent<E>,
): void {
  if (!analyticsAccepted()) return;
  sendToGa4(event, params as unknown as Record<string, unknown>);
}
