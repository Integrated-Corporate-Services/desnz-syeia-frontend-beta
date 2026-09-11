import { configService } from '../config/appConfig';

export const getApiBaseUrl = (): string => {
  // configService is dev-aware: returns '' in local dev so requests stay same-origin
  // (proxied by Vite) instead of hitting VITE_API_URL directly and violating CSP connect-src.
  return configService.getApiBaseUrl();
};

export const buildBackendUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path}`;
};

export const getAuthLoginUrl = (): string => {
  return buildBackendUrl('/auth/login');
};

export const getAuthLogoutUrl = (): string => {
  return buildBackendUrl('/auth/logout');
};

export const getApiUrl = (path: string): string => {
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  return buildBackendUrl(`/api${sanitizedPath}`);
};
