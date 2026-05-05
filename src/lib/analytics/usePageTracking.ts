import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { track } from './track';
import { stripPii } from './strip-pii';
import { AnalyticsEvent } from './events';
import { recordRumPageView } from '../../modules/cookie-consent/telemetry';

export function usePageTracking(): void {
  const location = useLocation();

  useEffect(() => {
    const path = stripPii(location.pathname + location.search);
    track(AnalyticsEvent.PageView, { path });
    recordRumPageView(path);
  }, [location]);
}
