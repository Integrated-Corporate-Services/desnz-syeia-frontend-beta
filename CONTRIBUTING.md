# Contributing

Thank you for contributing to this project.

## Reporting bugs

[Open an issue](https://github.com/Integrated-Corporate-Services/desnz-syeia-frontend-beta/) with:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if UI issue
- Console errors (redact sensitive data)

## Suggesting features

Open an issue describing:
- The problem it solves
- Proposed solution
- Alternatives considered
- Impact on existing users

## Submitting changes

### Setup

```bash
git clone https://github.com/YOUR-USERNAME/desnz-syeia-frontend-beta.git
cd desnz-syeia-frontend-beta
npm install
npm run dev
```

### Development

```bash
git checkout -b feature/my-change
# Make changes
npm run type-check
npm run lint
npm run build
git commit -m "feat: description"
git push origin feature/my-change
```

**Commit format:** `type: description`
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring
- `style:` UI/CSS changes

### Code standards

- TypeScript strict mode
- React functional components with hooks
- GDS Design System components
- Accessible ARIA labels
- Responsive design
- ESLint compliance

### Testing

```bash
npm test                 # Run tests
npm run test:coverage    # Coverage report
```

### Accessibility

- Test with keyboard navigation
- Check ARIA landmarks
- Verify screen reader compatibility
- Use semantic HTML
- Follow WCAG 2.1 AA standards

### Security

Never commit:
- API keys or tokens
- Backend URLs or endpoints
- User credentials
- Environment variables

## Pull Request Process

1. Update README.md if changing functionality
2. Ensure all tests pass
3. Request review from maintainers
4. Address feedback
5. Squash commits if requested

## License

By contributing, you agree your contributions are licensed under [MIT License](LICENSE).
