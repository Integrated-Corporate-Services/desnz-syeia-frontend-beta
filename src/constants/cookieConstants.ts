import { CookieInfo } from '../types/cookies.types';

export const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

export const COOKIE_CONSENT_EXPIRY = 31536000;

export const COOKIE_LIST: CookieInfo[] = [
  {
    name: 'session_cookie',
    purpose: 'Used to keep you signed in securely',
    expiry: '30 minutes (extends on activity)',
    category: 'essential'
  },
  {
    name: '_csrf',
    purpose: 'Protects against cross-site request forgery attacks',
    expiry: 'Session (deleted when browser closes)',
    category: 'essential'
  },
  {
    name: COOKIE_PREFERENCES_KEY,
    purpose: 'Saves your cookie consent settings',
    expiry: '1 year',
    category: 'essential'
  }
];

export const COOKIE_DESCRIPTIONS = {
  essential: 'Essential cookies keep your information secure while you use this service. We do not need to ask permission to use them.',
  analytics: 'We use Google Analytics cookies to measure how you use this service and make improvements. These cookies collect information about how you use the service, including which pages you visit.',
  functional: 'Functional cookies help us provide additional features to improve your experience, such as remembering your preferences.',
  marketing: 'Marketing cookies help us understand the effectiveness of our communications.'
};

export const DEFAULT_COOKIE_PREFERENCES = {
  essential: true,
  analytics: false,
  functional: false,
  marketing: false
};
