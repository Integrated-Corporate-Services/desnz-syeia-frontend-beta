import { configService } from '../config/appConfig';

export const getApiBaseUrl = (): string => {
  return configService.getApiBaseUrl() || '';
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
