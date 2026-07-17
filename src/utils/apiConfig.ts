import { configService } from '../config/appConfig';

export const getApiBaseUrl = (): string => {
  return import.meta.env.API_URL || configService.getApiBaseUrl() || '';
};

const useLegacyBackendPrefix = (): boolean => {
  return import.meta.env.VITE_USE_LEGACY_BACKEND_PREFIX === 'true';
};

const normalizeBackendPath = (path: string): string => {
  if (!path) {
    return path;
  }

  if (useLegacyBackendPrefix()) {
    return path;
  }

  if (path === '/backend') {
    return '/';
  }

  if (path.startsWith('/backend/')) {
    return path.replace('/backend', '');
  }

  return path;
};

export const buildBackendUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = normalizeBackendPath(path);
  return `${baseUrl}${normalizedPath}`;
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
