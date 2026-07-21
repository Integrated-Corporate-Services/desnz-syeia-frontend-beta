import { matchPath } from 'react-router-dom';
import { ALLOWED_ROUTES, ALLOWED_EXTERNAL_DOMAINS } from './routes';
import type { ValidationConfig, ValidationResult, ParsedUrl } from './types';
import { isDevelopment } from '../../config/runtimeConfig';

export class UrlValidator {
  private config: Required<ValidationConfig>;
  
  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = {
      allowedDomains: config.allowedDomains || ALLOWED_EXTERNAL_DOMAINS,
      allowedRoutes: config.allowedRoutes || ALLOWED_ROUTES,
      allowSubpaths: config.allowSubpaths ?? true,
      strictMode: config.strictMode ?? true,
      debug: config.debug ?? isDevelopment(),
    };
  }
  
  validate(url: string | null | undefined): string | null {
    if (!url) {
      this.log('URL is null or undefined');
      return null;
    }
    
    try {
      const result = this.validateWithReason(url);
      
      if (result.isValid) {
        return result.safeUrl!;
      } else {
        this.warn('URL validation failed', { url, reason: result.reason });
        return null;
      }
    } catch (error) {
      this.error('Validation error', { url, error });
      return null;
    }
  }
  
  validateWithReason(url: string): ValidationResult {
    const originalUrl = url;
    
    if (url.length > 2048) {
      return { isValid: false, reason: 'URL_TOO_LONG', originalUrl };
    }
    
    const normalized = this.normalizeUrl(url);
    
    let parsed: ParsedUrl;
    try {
      parsed = this.parseUrl(normalized);
    } catch (error) {
      return { isValid: false, reason: 'MALFORMED_URL', originalUrl };
    }
    
    if (!this.isValidProtocol(parsed.protocol)) {
      return { isValid: false, reason: 'INVALID_PROTOCOL', originalUrl };
    }
    
    if (parsed.hostname && !this.isAllowedDomain(parsed.hostname)) {
      return { isValid: false, reason: 'INVALID_DOMAIN', originalUrl };
    }
    
    const pathValidation = this.validatePath(parsed.pathname);
    if (!pathValidation.isValid) {
      return { isValid: false, reason: pathValidation.reason, originalUrl };
    }
    
    if (!this.matchesAllowedRoute(parsed.pathname)) {
      return { isValid: false, reason: 'NOT_IN_WHITELIST', originalUrl };
    }
    
    if (this.config.strictMode && parsed.search) {
      const queryValidation = this.validateQueryParams(parsed.search);
      if (!queryValidation.isValid) {
        return { isValid: false, reason: queryValidation.reason, originalUrl };
      }
    }
    
    const safeUrl = this.reconstructUrl(parsed);
    
    return { isValid: true, originalUrl, safeUrl };
  }
  
  private normalizeUrl(url: string): string {
    try {
      let decoded = url;
      let previous = '';
      let attempts = 0;
      
      while (decoded !== previous && attempts < 5) {
        previous = decoded;
        try {
          decoded = decodeURIComponent(decoded);
        } catch {
          break;
        }
        attempts++;
      }
      
      decoded = decoded.trim();
      
      if (decoded.includes(':')) {
        const colonIndex = decoded.indexOf(':');
        const protocol = decoded.substring(0, colonIndex).toLowerCase();
        decoded = protocol + decoded.substring(colonIndex);
      }
      
      return decoded;
    } catch (error) {
      this.warn('URL normalization failed', { url, error });
      return url;
    }
  }
  
  private parseUrl(url: string): ParsedUrl {
    if (url.startsWith('/')) {
      const base = typeof window !== 'undefined' 
        ? window.location.origin 
        : 'http://localhost';
      
      const parsed = new URL(url, base);
      
      return {
        protocol: '',
        hostname: '',
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
        port: '',
      };
    }
    
    const parsed = new URL(url);
    
    return {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      port: parsed.port,
    };
  }
  
  private isValidProtocol(protocol: string): boolean {
    const allowed = ['http:', 'https:', ''];
    const normalized = protocol.toLowerCase();
    
    const blocked = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:', 'blob:'];
    if (blocked.some(p => normalized.startsWith(p))) {
      return false;
    }
    
    return allowed.includes(normalized);
  }
  
  private isAllowedDomain(hostname: string): boolean {
    if (!hostname) {
      return true;
    }
    
    if (!this.config.allowedDomains || this.config.allowedDomains.length === 0) {
      return false;
    }
    
    const normalized = hostname.toLowerCase();
    
    return this.config.allowedDomains.some(domain => {
      const domainLower = domain.toLowerCase();
      return normalized === domainLower || normalized.endsWith('.' + domainLower);
    });
  }
  
  private validatePath(pathname: string): ValidationResult {
    if (!pathname.startsWith('/')) {
      return { isValid: false, reason: 'PATH_TRAVERSAL', originalUrl: pathname };
    }
    
    const resolved = this.resolvePath(pathname);
    
    if (resolved.includes('..') || pathname.includes('..')) {
      return { isValid: false, reason: 'PATH_TRAVERSAL', originalUrl: pathname };
    }
    
    if (resolved !== pathname && !pathname.endsWith('/')) {
      this.warn('Path resolution changed URL', { original: pathname, resolved });
    }
    
    if (pathname.includes('\0') || pathname.includes('%00')) {
      return { isValid: false, reason: 'PATH_TRAVERSAL', originalUrl: pathname };
    }
    
    const dangerous = ['//api/internal', '//admin/api', '//system'];
    
    const lowerPath = resolved.toLowerCase();
    for (const pattern of dangerous) {
      if (lowerPath.includes(pattern)) {
        this.warn('Dangerous path pattern detected', { path: resolved, pattern });
      }
    }
    
    return { isValid: true, originalUrl: pathname, safeUrl: resolved };
  }
  
  private resolvePath(pathname: string): string {
    const parts = pathname.split('/').filter(Boolean);
    const resolved: string[] = [];
    
    for (const part of parts) {
      if (part === '..') {
        if (resolved.length > 0) {
          resolved.pop();
        }
      } else if (part !== '.') {
        resolved.push(part);
      }
    }
    
    return '/' + resolved.join('/');
  }
  
  private matchesAllowedRoute(pathname: string): boolean {
    const normalizedPath = pathname.replace(/\/$/, '') || '/';
    
    for (const route of this.config.allowedRoutes) {
      const match = matchPath(route, normalizedPath);
      
      if (match) {
        this.log(`Route matched: ${route} -> ${normalizedPath}`);
        return true;
      }
      
      if (this.config.allowSubpaths) {
        const routePattern = route.replace(/:[\w]+/g, '[^/]+');
        if (normalizedPath.startsWith(routePattern.replace(/\[.*?\]/g, ''))) {
          this.log(`Subpath allowed: ${route} -> ${normalizedPath}`);
          return true;
        }
      }
    }
    
    this.log(`No match found for: ${normalizedPath}`);
    return false;
  }
  
  private validateQueryParams(search: string): ValidationResult {
    try {
      const params = new URLSearchParams(search);
      
      for (const [key, value] of params.entries()) {
        if (this.containsScriptInjection(value)) {
          return { isValid: false, reason: 'UNSAFE_QUERY_PARAMS', originalUrl: search };
        }
        
        if (value.length > 1000) {
          this.warn('Extremely long query parameter', { key, length: value.length });
          return { isValid: false, reason: 'UNSAFE_QUERY_PARAMS', originalUrl: search };
        }
      }
      
      return { isValid: true, originalUrl: search };
    } catch (error) {
      return { isValid: false, reason: 'MALFORMED_URL', originalUrl: search };
    }
  }
  
  private containsScriptInjection(value: string): boolean {
    const patterns = [
      /<script/i,
      /javascript:/i,
      /onerror\s*=/i,
      /onload\s*=/i,
      /document\.cookie/i,
      /alert\(/i,
      /eval\(/i,
    ];
    
    return patterns.some(pattern => pattern.test(value));
  }
  
  private reconstructUrl(parsed: ParsedUrl): string {
    let url = parsed.pathname;
    
    if (parsed.search) {
      url += parsed.search;
    }
    
    if (parsed.hash) {
      url += parsed.hash;
    }
    
    return url;
  }
  
  private log(message: string, data?: any) {
  }
  
  private warn(message: string, data?: any) {
  }
  
  private error(message: string, data?: any) {
  }
}

export const urlValidator = new UrlValidator({
  allowedRoutes: ALLOWED_ROUTES,
  allowedDomains: ALLOWED_EXTERNAL_DOMAINS,
  strictMode: true,
  debug: isDevelopment(),
});

export function validateUrl(url: string | null | undefined): string | null {
  return urlValidator.validate(url);
}
