import { configService } from '../config/appConfig';

export const getApiBaseUrl = (): string => {
  return configService.getApiBaseUrl();
};

export const buildBackendUrl = (path: string): string => {
  return configService.buildBackendUrl(path);
};

export const getAuthLoginUrl = (): string => {
  return configService.getAuthLoginUrl();
};

export const getAuthLogoutUrl = (): string => {
  return configService.getAuthLogoutUrl();
};

export const getApiUrl = (path: string): string => {
  return configService.getApiUrl(path);
};
