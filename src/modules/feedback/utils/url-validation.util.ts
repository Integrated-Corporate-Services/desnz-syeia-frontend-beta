import { DETAILED_SURVEY_URL } from '../constants/feedback.constants';

interface ValidationResult {
  isValid: boolean;
  sanitizedUrl: string;
  reason?: string;
}

const ALLOWED_DOMAIN = 'forms.office.com';

export function validateFeedbackUrl(
  url: string | null | undefined
): ValidationResult {
  if (url === null || url === undefined) {
    return {
      isValid: false,
      sanitizedUrl: DETAILED_SURVEY_URL,
      reason: 'URL is null or undefined',
    };
  }

  const sanitized = url.trim();

  if (!sanitized) {
    return {
      isValid: false,
      sanitizedUrl: DETAILED_SURVEY_URL,
      reason: 'URL is empty',
    };
  }

  let urlObj: URL;
  try {
    urlObj = new URL(sanitized);
  } catch (error) {
    return {
      isValid: false,
      sanitizedUrl: DETAILED_SURVEY_URL,
      reason: 'Invalid URL format',
    };
  }

  const DANGEROUS_PROTOCOLS = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'blob:',
  ];

  if (DANGEROUS_PROTOCOLS.some((proto) => urlObj.protocol.startsWith(proto))) {
    return {
      isValid: false,
      sanitizedUrl: DETAILED_SURVEY_URL,
      reason: 'Dangerous protocol detected',
    };
  }

  const isDevelopment = import.meta.env.MODE === 'development';
  const allowedProtocols = isDevelopment ? ['http:', 'https:'] : ['https:'];

  if (!allowedProtocols.includes(urlObj.protocol)) {
    return {
      isValid: false,
      sanitizedUrl: DETAILED_SURVEY_URL,
      reason: `Insecure protocol: ${urlObj.protocol}`,
    };
  }

  if (!/^[\x00-\x7F]*$/.test(sanitized)) {
    return {
      isValid: false,
      sanitizedUrl: DETAILED_SURVEY_URL,
      reason: 'Non-ASCII characters in hostname',
    };
  }

  if (urlObj.hostname !== ALLOWED_DOMAIN) {
    if (isDevelopment && urlObj.hostname === 'localhost') {
      return {
        isValid: true,
        sanitizedUrl: urlObj.href,
      };
    }

    return {
      isValid: false,
      sanitizedUrl: DETAILED_SURVEY_URL,
      reason: `Domain not allowed: ${urlObj.hostname}`,
    };
  }

  if (urlObj.username || urlObj.password) {
    return {
      isValid: false,
      sanitizedUrl: DETAILED_SURVEY_URL,
      reason: 'User credentials not allowed',
    };
  }

  return {
    isValid: true,
    sanitizedUrl: urlObj.href,
  };
}
