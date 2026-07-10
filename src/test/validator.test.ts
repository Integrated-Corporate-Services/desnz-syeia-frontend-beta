import { describe, test, expect, beforeEach } from 'vitest';
import { UrlValidator } from '../validators/url/validator';

describe('UrlValidator - Layer 1: Protocol Attack Prevention', () => {
  let validator: UrlValidator;
  
  beforeEach(() => {
    validator = new UrlValidator({
      allowedRoutes: [
        '/',
        '/landingPage',
        '/application-dashboard',
        '/s-37/:applicationId/task-list',
        '/nwl/:applicationId/task-list',
        '/admin/user-management',
      ],
      strictMode: true,
      debug: false,
    });
  });
  
  test('blocks javascript: protocol', () => {
    expect(validator.validate('javascript:alert(1)')).toBeNull();
  });
  
  test('blocks data: URI', () => {
    expect(validator.validate('data:text/html,<script>xss</script>')).toBeNull();
  });
  
  test('blocks vbscript: protocol', () => {
    expect(validator.validate('vbscript:msgbox(1)')).toBeNull();
  });
  
  test('blocks file: protocol', () => {
    expect(validator.validate('file:///etc/passwd')).toBeNull();
  });
  
  test('blocks blob: protocol', () => {
    expect(validator.validate('blob:http://example.com/123')).toBeNull();
  });
});

describe('UrlValidator - Layer 2: Encoding Bypass Prevention', () => {
  let validator: UrlValidator;
  
  beforeEach(() => {
    validator = new UrlValidator({
      allowedRoutes: ['/landingPage', '/application-dashboard'],
      strictMode: true,
    });
  });
  
  test('blocks URL encoded javascript:', () => {
    expect(validator.validate('%6A%61%76%61%73%63%72%69%70%74:alert(1)')).toBeNull();
  });
  
  test('blocks double URL encoded javascript:', () => {
    expect(validator.validate('%256A%2561%2576%2561%2573%2563%2572%2569%2570%2574:alert')).toBeNull();
  });
  
  test('blocks uppercase protocol', () => {
    expect(validator.validate('JAVASCRIPT:alert(1)')).toBeNull();
  });
  
  test('blocks mixed case protocol', () => {
    expect(validator.validate('JaVaScRiPt:alert(1)')).toBeNull();
  });
  
  test('normalizes valid encoded URLs', () => {
    const result = validator.validate('/application%2Ddashboard');
    expect(result).toBe('/application-dashboard');
  });
});

describe('UrlValidator - Layer 3: External Redirect Prevention', () => {
  let validator: UrlValidator;
  
  beforeEach(() => {
    validator = new UrlValidator({
      allowedRoutes: ['/'],
      allowedDomains: [],
    });
  });
  
  test('blocks external domain not in whitelist', () => {
    expect(validator.validate('https://evil.com')).toBeNull();
  });
  
  test('blocks protocol-relative URL to evil domain', () => {
    expect(validator.validate('//evil.com')).toBeNull();
  });
});

describe('UrlValidator - Layer 4: Path Traversal Prevention', () => {
  let validator: UrlValidator;
  
  beforeEach(() => {
    validator = new UrlValidator({
      allowedRoutes: ['/application-dashboard', '/s-37/:applicationId/task-list'],
      strictMode: true,
    });
  });
  
  test('blocks ../ path traversal', () => {
    expect(validator.validate('/application-dashboard/../admin')).toBeNull();
  });
  
  test('blocks multiple ../', () => {
    expect(validator.validate('/dashboard/../../admin')).toBeNull();
  });
  
  test('blocks null byte injection', () => {
    expect(validator.validate('/dashboard%00/admin')).toBeNull();
  });
  
  test('blocks null byte in path', () => {
    expect(validator.validate('/dashboard\0admin')).toBeNull();
  });
  
  test('resolves safe relative paths correctly', () => {
    const result = validator.validate('/s-37/123/task-list');
    expect(result).toBe('/s-37/123/task-list');
  });
});

describe('UrlValidator - Layer 5: Route Whitelist Enforcement', () => {
  let validator: UrlValidator;
  
  beforeEach(() => {
    validator = new UrlValidator({
      allowedRoutes: ['/', '/landingPage', '/s-37/:applicationId/task-list', '/admin/user-management'],
      strictMode: true,
    });
  });
  
  test('allows exact route match', () => {
    expect(validator.validate('/landingPage')).toBe('/landingPage');
  });
  
  test('allows root route', () => {
    expect(validator.validate('/')).toBe('/');
  });
  
  test('allows parameterized route with valid ID', () => {
    expect(validator.validate('/s-37/123/task-list')).toBe('/s-37/123/task-list');
  });
  
  test('blocks route not in whitelist', () => {
    expect(validator.validate('/unauthorized-page')).toBeNull();
  });
  
  test('blocks similar but different route', () => {
    expect(validator.validate('/admin/users')).toBeNull();
  });
});

describe('UrlValidator - Layer 6: XSS in Query Parameters', () => {
  let validator: UrlValidator;
  
  beforeEach(() => {
    validator = new UrlValidator({
      allowedRoutes: ['/landingPage'],
      strictMode: true,
    });
  });
  
  test('blocks script in query params', () => {
    expect(validator.validate('/landingPage?q=<script>alert(1)</script>')).toBeNull();
  });
  
  test('blocks javascript: in query params', () => {
    expect(validator.validate('/landingPage?redirect=javascript:alert(1)')).toBeNull();
  });
  
  test('blocks onerror in query params', () => {
    expect(validator.validate('/landingPage?img=x%20onerror=alert(1)')).toBeNull();
  });
  
  test('allows safe query params', () => {
    expect(validator.validate('/landingPage?tab=users&sort=asc')).toBe('/landingPage?tab=users&sort=asc');
  });
});

describe('UrlValidator - Layer 7: Fragment/Hash Handling', () => {
  let validator: UrlValidator;
  
  beforeEach(() => {
    validator = new UrlValidator({
      allowedRoutes: ['/landingPage', '/application-dashboard'],
      strictMode: true,
    });
  });
  
  test('allows safe hash fragments', () => {
    expect(validator.validate('/landingPage#section-1')).toBe('/landingPage#section-1');
  });
  
  test('preserves hash in validated URL', () => {
    const result = validator.validate('/application-dashboard#top');
    expect(result).toBe('/application-dashboard#top');
  });
});

describe('UrlValidator - Layer 8: Edge Cases', () => {
  let validator: UrlValidator;
  
  beforeEach(() => {
    validator = new UrlValidator({
      allowedRoutes: ['/landingPage', '/application-dashboard'],
      strictMode: true,
    });
  });
  
  test('handles null input', () => {
    expect(validator.validate(null)).toBeNull();
  });
  
  test('handles undefined input', () => {
    expect(validator.validate(undefined)).toBeNull();
  });
  
  test('handles empty string', () => {
    expect(validator.validate('')).toBeNull();
  });
  
  test('handles whitespace-only string', () => {
    expect(validator.validate('   ')).toBeNull();
  });
  
  test('blocks extremely long URLs', () => {
    const longUrl = '/landingPage?' + 'a'.repeat(3000);
    expect(validator.validate(longUrl)).toBeNull();
  });
  
  test('handles trailing slash correctly', () => {
    expect(validator.validate('/landingPage/')).toBe('/landingPage/');
  });
  
  test('handles URL with both query and hash', () => {
    const result = validator.validate('/landingPage?tab=users#section');
    expect(result).toBe('/landingPage?tab=users#section');
  });
});

describe('UrlValidator - Real Attack Vectors', () => {
  let validator: UrlValidator;
  
  beforeEach(() => {
    validator = new UrlValidator({
      allowedRoutes: ['/'],
      strictMode: true,
    });
  });
  
  test('blocks all common javascript: variations', () => {
    const attacks = [
      'javascript:alert(1)',
      'JavaScript:alert(1)',
      'java\nscript:alert(1)',
      'java\tscript:alert(1)',
      'java\rscript:alert(1)',
    ];
    
    attacks.forEach(attack => {
      expect(validator.validate(attack)).toBeNull();
    });
  });
  
  test('blocks data URI XSS vectors', () => {
    const attacks = [
      'data:text/html,<script>alert(1)</script>',
      'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      'data:text/html;charset=utf-8,<script>alert(1)</script>',
    ];
    
    attacks.forEach(attack => {
      expect(validator.validate(attack)).toBeNull();
    });
  });
});

describe('UrlValidator - Production Use Cases', () => {
  let validator: UrlValidator;
  
  beforeEach(() => {
    validator = new UrlValidator({
      allowedRoutes: [
        '/landingPage',
        '/application-dashboard',
        '/s-37/:applicationId/task-list',
        '/nwl/:applicationId/task-list',
      ],
      strictMode: true,
    });
  });
  
  test('allows navigation to task list with application ID', () => {
    expect(validator.validate('/s-37/app-123/task-list')).toBe('/s-37/app-123/task-list');
  });
  
  test('allows NWL routes', () => {
    expect(validator.validate('/nwl/456/task-list')).toBe('/nwl/456/task-list');
  });
  
  test('allows landing page', () => {
    expect(validator.validate('/landingPage')).toBe('/landingPage');
  });
  
  test('blocks malicious redirect after login', () => {
    expect(validator.validate('/landingPage?next=javascript:alert(document.cookie)')).toBeNull();
  });
  
  test('allows safe post-login redirect', () => {
    const result = validator.validate('/application-dashboard');
    expect(result).toBe('/application-dashboard');
  });
});

describe('ValidationResult detailed response', () => {
  let validator: UrlValidator;
  
  beforeEach(() => {
    validator = new UrlValidator({
      allowedRoutes: ['/', '/dashboard'],
      strictMode: true,
    });
  });
  
  test('provides detailed reason for rejection', () => {
    const result = validator.validateWithReason('javascript:alert(1)');
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('INVALID_PROTOCOL');
    expect(result.originalUrl).toBe('javascript:alert(1)');
  });
  
  test('provides safe URL for valid input', () => {
    const result = validator.validateWithReason('/dashboard');
    expect(result.isValid).toBe(true);
    expect(result.safeUrl).toBe('/dashboard');
    expect(result.originalUrl).toBe('/dashboard');
  });
});
