import { getRuntimeEnv, getMode, parseEnvBoolean, parseEnvInt, isDevelopmentMode } from './runtimeEnv';

type Environment = 'development' | 'staging' | 'production';

interface ApiEndpoints {
  base: string;
  auth: {
    login: string;
    logout: string;
    callback: string;
  };
  csrf: string;
  api: string;
}

interface AppConfig {
  environment: Environment;
  api: ApiEndpoints;
  features: {
    sandboxRoutes: boolean;
    analytics: {
      gtm: {
        enabled: boolean;
        id: string;
      };
      ga4: {
        enabled: boolean;
        measurementId: string;
      };
    };
  };
  session: {
    timeoutSeconds: number;
    warningSeconds: number;
  };
  s3: {
    urlExpirySeconds: number;
    refreshBeforeExpirySeconds: number;
  };
}

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;
  private readonly ALLOWED_ORIGINS = [
    'localhost',
    'dev.syeia.energysecurity.gov.uk',
    'staging.syeia.energysecurity.gov.uk',
    'syeia.energysecurity.gov.uk',
  ];

  private constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfiguration(): AppConfig {
    const env = getMode();
    const isDevelopment = isDevelopmentMode();

    const baseUrl = isDevelopment ? '' : this.sanitizeUrl(getRuntimeEnv('VITE_API_BASE_URL'));

    return {
      environment: env,
      api: {
        base: baseUrl,
        auth: {
          login: `${baseUrl}/auth/login`,
          logout: `${baseUrl}/auth/logout`,
          callback: `${baseUrl}/auth/callback`,
        },
        csrf: `${baseUrl}/csrf-token`,
        api: `${baseUrl}/api`,
      },
      features: {
        sandboxRoutes: isDevelopment && parseEnvBoolean(getRuntimeEnv('VITE_SANDBOX_ROUTES_ENABLED')),
        analytics: {
          gtm: {
            enabled: parseEnvBoolean(getRuntimeEnv('VITE_ENABLE_GTM')),
            id: getRuntimeEnv('VITE_GTM_ID'),
          },
          ga4: {
            enabled: parseEnvBoolean(getRuntimeEnv('VITE_ENABLE_GA4')),
            measurementId: getRuntimeEnv('VITE_GA4_MEASUREMENT_ID'),
          },
        },
      },
      session: {
        timeoutSeconds: parseEnvInt(getRuntimeEnv('VITE_SESSION_TIMEOUT_SECONDS'), 1800),
        warningSeconds: parseEnvInt(getRuntimeEnv('VITE_SESSION_WARNING_SECONDS'), 120),
      },
      s3: {
        urlExpirySeconds: parseEnvInt(getRuntimeEnv('VITE_S3_URL_EXPIRY_SECONDS'), 1800),
        refreshBeforeExpirySeconds: parseEnvInt(getRuntimeEnv('VITE_S3_REFRESH_BEFORE_EXPIRY_SECONDS'), 120),
      },
    };
  }

  private sanitizeUrl(url: string): string {
    if (!url) return '';

    try {
      const urlObj = new URL(url);
      
      const isAllowed = this.ALLOWED_ORIGINS.some(origin => 
        urlObj.hostname === origin || urlObj.hostname.endsWith(`.${origin}`)
      );

      if (!isAllowed) {
        return '';
      }

      if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
        return '';
      }

      return urlObj.origin;
    } catch {
      return '';
    }
  }

  private validateConfiguration(): void {
    const { environment, api } = this.config;

    if (environment === 'production') {
      if (!api.base) {
        throw new Error('API base URL is required in production');
      }

      if (api.base.includes('localhost')) {
        throw new Error('Localhost URL detected in production configuration');
      }
    }
  }

  public getApiBaseUrl(): string {
    return this.config.api.base;
  }

  public getAuthLoginUrl(): string {
    return this.config.api.auth.login;
  }

  public getAuthLogoutUrl(): string {
    return this.config.api.auth.logout;
  }

  public getAuthCallbackUrl(): string {
    return this.config.api.auth.callback;
  }

  public getCsrfTokenUrl(): string {
    return this.config.api.csrf;
  }

  public getApiUrl(path: string): string {
    const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.config.api.api}${sanitizedPath}`;
  }

  public buildBackendUrl(path: string): string {
    const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.config.api.base}${sanitizedPath}`;
  }

  public getEnvironment(): Environment {
    return this.config.environment;
  }

  public isProduction(): boolean {
    return this.config.environment === 'production';
  }

  public isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  public getFeatureFlags() {
    return this.config.features;
  }

  public getSessionConfig() {
    return this.config.session;
  }

  public getS3Config() {
    return this.config.s3;
  }

  public getConfig(): Readonly<AppConfig> {
    return Object.freeze({ ...this.config });
  }
}

export const configService = ConfigService.getInstance();

export const getApiBaseUrl = () => configService.getApiBaseUrl();
export const getAuthLoginUrl = () => configService.getAuthLoginUrl();
export const getAuthLogoutUrl = () => configService.getAuthLogoutUrl();
export const buildBackendUrl = (path: string) => configService.buildBackendUrl(path);
export const getApiUrl = (path: string) => configService.getApiUrl(path);
export const isProduction = () => configService.isProduction();
export const isDevelopment = () => configService.isDevelopment();
