import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateFeedbackUrl } from '../modules/feedback/utils/url-validation.util';

describe('validateFeedbackUrl', () => {
  const ORIGINAL_ENV = import.meta.env.MODE;

  afterEach(() => {
    import.meta.env.MODE = ORIGINAL_ENV;
  });

  describe('Valid URLs', () => {
    it('should accept valid Microsoft Forms HTTPS URL', () => {
      const result = validateFeedbackUrl(
        'https://forms.office.com/pages/responsepage.aspx?id=123'
      );
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe(
        'https://forms.office.com/pages/responsepage.aspx?id=123'
      );
      expect(result.reason).toBeUndefined();
    });

    it('should accept URLs with query parameters', () => {
      const result = validateFeedbackUrl(
        'https://forms.office.com/pages/test?id=123&param=value'
      );
      expect(result.isValid).toBe(true);
    });

    it('should accept URLs with fragments', () => {
      const result = validateFeedbackUrl(
        'https://forms.office.com/pages/test#section'
      );
      expect(result.isValid).toBe(true);
    });

    it('should accept URLs with both query params and fragments', () => {
      const result = validateFeedbackUrl(
        'https://forms.office.com/pages/test?id=123#section'
      );
      expect(result.isValid).toBe(true);
    });

    it('should trim whitespace from URLs', () => {
      const result = validateFeedbackUrl(
        '  https://forms.office.com/pages/test  '
      );
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe('https://forms.office.com/pages/test');
    });
  });

  describe('Invalid URLs - Null/Empty', () => {
    it('should reject null and return fallback', () => {
      const result = validateFeedbackUrl(null);
      expect(result.isValid).toBe(false);
      expect(result.sanitizedUrl).toContain('forms.office.com');
      expect(result.reason).toBe('URL is null or undefined');
    });

    it('should reject undefined and return fallback', () => {
      const result = validateFeedbackUrl(undefined);
      expect(result.isValid).toBe(false);
      expect(result.sanitizedUrl).toContain('forms.office.com');
      expect(result.reason).toBe('URL is null or undefined');
    });

    it('should reject empty string and return fallback', () => {
      const result = validateFeedbackUrl('');
      expect(result.isValid).toBe(false);
      expect(result.sanitizedUrl).toContain('forms.office.com');
      expect(result.reason).toBe('URL is empty');
    });

    it('should reject whitespace-only string', () => {
      const result = validateFeedbackUrl('   ');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('URL is empty');
    });
  });

  describe('Invalid URLs - Malformed', () => {
    it('should reject malformed URLs', () => {
      const result = validateFeedbackUrl('not-a-valid-url');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Invalid URL format');
    });

    it('should reject URLs without protocol', () => {
      const result = validateFeedbackUrl('forms.office.com/pages/test');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Invalid URL format');
    });
  });

  describe('Invalid URLs - Dangerous Protocols', () => {
    it('should reject javascript: protocol', () => {
      const result = validateFeedbackUrl('javascript:alert(1)');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Dangerous protocol detected');
    });

    it('should reject data: protocol', () => {
      const result = validateFeedbackUrl(
        'data:text/html,<script>alert(1)</script>'
      );
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Dangerous protocol detected');
    });

    it('should reject vbscript: protocol', () => {
      const result = validateFeedbackUrl('vbscript:msgbox(1)');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Dangerous protocol detected');
    });

    it('should reject file: protocol', () => {
      const result = validateFeedbackUrl('file:///etc/passwd');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Dangerous protocol detected');
    });

    it('should reject blob: protocol', () => {
      const result = validateFeedbackUrl('blob:https://example.com/test');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Dangerous protocol detected');
    });
  });

  describe('Invalid URLs - Wrong Protocol', () => {
    it('should reject HTTP in production mode', () => {
      import.meta.env.MODE = 'production';
      const result = validateFeedbackUrl('http://forms.office.com/pages/test');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Insecure protocol');
    });

    it('should reject FTP protocol', () => {
      const result = validateFeedbackUrl('ftp://forms.office.com/pages/test');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Insecure protocol');
    });
  });

  describe('Invalid URLs - Wrong Domain', () => {
    it('should reject different domains', () => {
      const result = validateFeedbackUrl('https://evil.com');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Domain not allowed');
      expect(result.reason).toContain('evil.com');
    });

    it('should reject smartsurvey.co.uk', () => {
      const result = validateFeedbackUrl('https://www.smartsurvey.co.uk');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Domain not allowed');
    });

    it('should reject surveymonkey.com', () => {
      const result = validateFeedbackUrl('https://surveymonkey.com');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Domain not allowed');
    });

    it('should reject subdomain of forms.office.com', () => {
      const result = validateFeedbackUrl('https://subdomain.forms.office.com');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Domain not allowed');
    });

    it('should reject similar-looking domain', () => {
      const result = validateFeedbackUrl('https://forms-office.com');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Domain not allowed');
    });

    it('should reject IP addresses', () => {
      const result = validateFeedbackUrl('https://192.168.1.1');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Domain not allowed');
    });
  });

  describe('Security Edge Cases', () => {
    it('should reject URLs with user credentials', () => {
      const result = validateFeedbackUrl(
        'https://user:pass@forms.office.com'
      );
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('User credentials not allowed');
    });

    it('should reject URLs with @ symbol', () => {
      const result = validateFeedbackUrl(
        'https://attacker.com@forms.office.com'
      );
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('User credentials not allowed');
    });

    it('should reject URLs with non-ASCII characters', () => {
      const result = validateFeedbackUrl('https://fоrms.office.com');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Non-ASCII characters in hostname');
    });

    it('should reject protocol-relative URLs', () => {
      const result = validateFeedbackUrl('//forms.office.com/pages/test');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Invalid URL format');
    });
  });

  describe('Environment-Specific Behavior', () => {
    beforeEach(() => {
      import.meta.env.MODE = 'development';
    });

    it('should allow HTTP in development mode', () => {
      const result = validateFeedbackUrl('http://forms.office.com/pages/test');
      expect(result.isValid).toBe(true);
    });

    it('should allow localhost in development mode', () => {
      const result = validateFeedbackUrl('http://localhost:3001/feedback');
      expect(result.isValid).toBe(true);
    });

    it('should allow localhost with HTTPS in development', () => {
      const result = validateFeedbackUrl('https://localhost:3001/feedback');
      expect(result.isValid).toBe(true);
    });

    it('should reject localhost in production mode', () => {
      import.meta.env.MODE = 'production';
      const result = validateFeedbackUrl('https://localhost:3001/feedback');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Domain not allowed');
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle actual Microsoft Forms URL from constants', () => {
      const realUrl =
        'https://forms.office.com/pages/responsepage.aspx?id=BXCsy8EC60O0l-ZJLRst2DF6lfpFkBBJrVy4SKDHmtFUREozR081TVBZQzVEUkZaMlpPS0RSNlpGOC4u&route=shorturl';
      const result = validateFeedbackUrl(realUrl);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe(realUrl);
    });

    it('should handle URL from environment variable', () => {
      const envUrl = 'https://forms.office.com/pages/test';
      const result = validateFeedbackUrl(envUrl);
      expect(result.isValid).toBe(true);
    });

    it('should handle placeholder from Dockerfile default', () => {
      const result = validateFeedbackUrl('#');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Invalid URL format');
    });
  });
});
