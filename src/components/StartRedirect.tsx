import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createLogger } from '../utils/logger';
import { trackJourneyEvent } from '../utils/analytics';
import { useQueryParam } from '../hooks/useNavigation';
import { buildBackendUrl } from '../utils/apiConfig';

const logger = createLogger('StartRedirect');
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const StartRedirect: React.FC = () => {
  const { orgCode } = useParams<{ orgCode?: string }>();
  const invite = useQueryParam('invite');

  useEffect(() => {
    if (!invite || !UUID_RE.test(invite)) {
      logger.warn('Invalid or missing invite token, redirecting to access-denied');
      window.location.replace('/access-denied');
      return;
    }

    trackJourneyEvent('sign_in_via_invite', {
      page_path: '/start/ICS',
      org_code: orgCode || 'unknown',
      has_invite: true,
    });

    const orgParam = orgCode ? `?org=${encodeURIComponent(orgCode)}` : '';
    const path = buildBackendUrl(`/invites/${encodeURIComponent(invite)}${orgParam}`);

    logger.info('Forwarding to backend:', path);
    window.location.replace(path);
  }, [orgCode, invite]);

  return null;
};

export default StartRedirect;
