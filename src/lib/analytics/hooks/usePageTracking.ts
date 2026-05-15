import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { track } from '../services';
import { stripPii } from '../utils';
import { AnalyticsEvent } from '../types';
import { recordRumPageView } from '../../../modules/cookie-consent/services/telemetry';

export function usePageTracking(): void {
  const location = useLocation();

  useEffect(() => {
    const path = stripPii(location.pathname + location.search);
    track(AnalyticsEvent.PageView, { path });
    recordRumPageView(path);
  }, [location]);
}
