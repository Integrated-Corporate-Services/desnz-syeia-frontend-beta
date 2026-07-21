import { configService } from '../config/appConfig';
import { getRuntimeEnv } from '../config/runtimeConfig';

export const getApiBaseUrl = (): string => {
  return getRuntimeEnv('VITE_API_URL', configService.getApiBaseUrl() || '');
};

export const buildBackendUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  console.log('Building backend URL:', { baseUrl, path });
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
