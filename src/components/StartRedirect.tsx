import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * StartRedirect Component
 * 
 * Redirects /start navigation to RESTful /invites/:token endpoint.
 * 
 * Flow: User clicks email link → /start?invite=xxx → /backend/invites/:token
 * Maintains backward compatibility with /start URLs in emails.
 */
const StartRedirect: React.FC = () => {
  const { orgCode } = useParams<{ orgCode?: string }>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const invite = searchParams.get('invite');

    // Validate token format (UUID)
    if (!invite || !UUID_RE.test(invite)) {
      console.warn('[StartRedirect] Invalid or missing invite token, redirecting to access-denied');
      window.location.replace('/access-denied');
      return;
    }

    // Build RESTful URL: /backend/invites/:token?org=ENWL
    const orgParam = orgCode ? `?org=${encodeURIComponent(orgCode)}` : '';
    const path = `/backend/invites/${encodeURIComponent(invite)}${orgParam}`;

    console.log('[StartRedirect] Forwarding to backend:', path);
    window.location.replace(path);
  }, [orgCode, searchParams]);

  // No UI - immediate redirect
  return null;
};

export default StartRedirect;
