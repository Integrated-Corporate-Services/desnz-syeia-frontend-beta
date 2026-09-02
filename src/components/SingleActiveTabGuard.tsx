import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUserContext } from '../context/AuthUserContext';
import { buildBackendUrl, getApiBaseUrl } from '../utils/apiConfig';
import { getCsrfHeaders } from '../utils/csrf';
import { createLogger } from '../utils/logger';
import { getOrCreateTabId, installTabIdFetchInterceptor } from '../constants/tabSession';

const logger = createLogger('SingleActiveTabGuard');
const HEARTBEAT_INTERVAL_MS = 15_000;

async function sendHeartbeat(tabId: string): Promise<boolean> {
  const response = await fetch(buildBackendUrl('/session/tab/heartbeat'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Tab-Id': tabId,
      ...getCsrfHeaders(),
    },
    body: JSON.stringify({ tabId }),
  });

  if (response.status === 409) return false;
  if (!response.ok) {
    throw new Error(`Tab heartbeat failed: ${response.status}`);
  }
  return true;
}

function releaseTab(tabId: string): void {
  void fetch(buildBackendUrl('/session/tab/release'), {
    method: 'POST',
    credentials: 'include',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      'X-Tab-Id': tabId,
      ...getCsrfHeaders(),
    },
    body: JSON.stringify({ tabId }),
  }).catch(() => undefined);
}

const SingleActiveTabGuard = () => {
  const { authenticated, loading } = useAuthUserContext();
  const navigate = useNavigate();
  const tabIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading || !authenticated) return undefined;

    installTabIdFetchInterceptor(getApiBaseUrl());
    const tabId = getOrCreateTabId();
    tabIdRef.current = tabId;
    let stopped = false;
    let intervalId: number | undefined;

    const handlePageHide = () => releaseTab(tabId);

    const checkTab = async () => {
      try {
        const allowed = await sendHeartbeat(tabId);
        if (!allowed && !stopped) {
          stopped = true;
          if (intervalId !== undefined) window.clearInterval(intervalId);
          window.removeEventListener('pagehide', handlePageHide);
          navigate('/tab-conflict', { replace: true });
        }
      } catch (error) {
        logger.warn('Unable to verify active tab', error);
      }
    };

    void checkTab();
  intervalId = window.setInterval(() => void checkTab(), HEARTBEAT_INTERVAL_MS);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
      window.removeEventListener('pagehide', handlePageHide);
      if (tabIdRef.current === tabId) releaseTab(tabId);
    };
  }, [authenticated, loading, navigate]);

  return null;
};

export default SingleActiveTabGuard;