# Security Policy

## Reporting a vulnerability

**DO NOT** open public issues for security vulnerabilities.
 
**GitHub:** (https://github.com/Integrated-Corporate-Services/desnz-syeia-frontend-beta/)

Include:
- Vulnerability description
- Steps to reproduce
- Potential impact
- Browser and environment details
- Suggested fix (optional)

## Best practices

### For developers
- Never hardcode secrets
- Validate all user inputs
- Use GOV.UK Design System components
- Implement proper error handling
- No sensitive data in console logs
- Use secure HTTP-only cookies

## Dependencies

```bash
npm audit          # Check vulnerabilities
npm audit fix      # Auto-fix (safe)
npm update         # Update packages
```

Run `npm audit` regularly and address vulnerabilities promptly.

## Compliance

- GDS Service Standard
- OWASP Top 10
- WCAG 2.1 AA
- GDPR Article 32