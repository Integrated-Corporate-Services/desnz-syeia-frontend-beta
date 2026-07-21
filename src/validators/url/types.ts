export interface ValidationConfig {
  allowedDomains?: string[];
  allowedRoutes: string[];
  allowSubpaths?: boolean;
  strictMode?: boolean;
  debug?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  safeUrl?: string;
  reason?: string;
  originalUrl: string;
}

export interface ParsedUrl {
  protocol: string;
  hostname: string;
  pathname: string;
  search: string;
  hash: string;
  port: string;
}

export type ValidationError = 
  | 'INVALID_PROTOCOL'
  | 'INVALID_DOMAIN'
  | 'PATH_TRAVERSAL'
  | 'NOT_IN_WHITELIST'
  | 'MALFORMED_URL'
  | 'UNSAFE_QUERY_PARAMS'
  | 'URL_TOO_LONG';
