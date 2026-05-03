import React, { useEffect } from 'react';
import { useCookiePreferencesStore } from '../../store/useCookiePreferencesStore';
import CookieBannerMessage from './CookieBannerMessage';
import CookieBannerAccepted from './CookieBannerAccepted';
import CookieBannerRejected from './CookieBannerRejected';

const CookieBanner: React.FC = () => {
  const {
    bannerVisible,
    hasConsent,
    loadPreferences
  } = useCookiePreferencesStore();

  const [bannerState, setBannerState] = React.useState<'message' | 'accepted' | 'rejected' | 'hidden'>('message');

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  useEffect(() => {
    if (!bannerVisible) {
      setBannerState('hidden');
    }
  }, [bannerVisible]);

  if (!bannerVisible || hasConsent) {
    return null;
  }

  if (bannerState === 'accepted') {
    return <CookieBannerAccepted onHide={() => setBannerState('hidden')} />;
  }

  if (bannerState === 'rejected') {
    return <CookieBannerRejected onHide={() => setBannerState('hidden')} />;
  }

  return (
    <CookieBannerMessage
      onAccept={() => setBannerState('accepted')}
      onReject={() => setBannerState('rejected')}
    />
  );
};

export default CookieBanner;
