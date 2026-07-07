import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { createLogger } from '../utils/logger';
import { trackJourneyEvent } from '../utils/analytics';

const logger = createLogger('StartRedirect');
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
      logger.warn('Invalid or missing invite token, redirecting to access-denied');
      window.location.replace('/access-denied');
      return;
    }

    // Track sign-in via invite link
    trackJourneyEvent('sign_in_via_invite', {
      page_path: '/start/ICS',
      org_code: orgCode || 'unknown',
      has_invite: true,
    });

    // Build RESTful URL: /backend/invites/:token?org=ENWL
    const orgParam = orgCode ? `?org=${encodeURIComponent(orgCode)}` : '';
    const path = `/backend/invites/${encodeURIComponent(invite)}${orgParam}`;

    logger.info('Forwarding to backend:', path);
    window.location.replace(path);
  }, [orgCode, searchParams]);

  // No UI - immediate redirect
  return null;
};

export default StartRedirect;
