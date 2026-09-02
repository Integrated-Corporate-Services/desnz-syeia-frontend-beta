import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUserContext } from '../context/AuthUserContext';
import { buildBackendUrl } from '../utils/apiConfig';
import { getCsrfHeaders } from '../utils/csrf';
import { createLogger } from '../utils/logger';

const logger = createLogger('SingleActiveTabGuard');
const TAB_ID_STORAGE_KEY = 'syeia.active-tab-id';
const HEARTBEAT_INTERVAL_MS = 15_000;

function getTabId(): string {
  const existingTabId = sessionStorage.getItem(TAB_ID_STORAGE_KEY);
  if (existingTabId) return existingTabId;

  const tabId = crypto.randomUUID();
  sessionStorage.setItem(TAB_ID_STORAGE_KEY, tabId);
  return tabId;
}

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

  return response.status !== 409;
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

    const tabId = getTabId();
    tabIdRef.current = tabId;
    let stopped = false;

    const checkTab = async () => {
      try {
        const allowed = await sendHeartbeat(tabId);
        if (!allowed && !stopped) {
          navigate('/tab-conflict', { replace: true });
        }
      } catch (error) {
        logger.warn('Unable to verify active tab', error);
      }
    };

    void checkTab();
    const intervalId = window.setInterval(() => void checkTab(), HEARTBEAT_INTERVAL_MS);
    const handlePageHide = () => releaseTab(tabId);
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