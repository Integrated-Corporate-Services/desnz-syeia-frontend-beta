# DESNZ SYEIA Frontend

Frontend application for the Department for Energy Security and Net Zero (DESNZ) Statutory Inquiry and Environmental Impact Assessment (SYEIA) system.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-20.x-brightgreen)](package.json)
[![React](https://img.shields.io/badge/react-18.x-blue)](package.json)

## What it does

Provides a user-friendly web interface for:
- Submitting and managing Section 37 electricity consent applications
- Managing Notice of Wayleave Leave (NWL) applications
- Tracking application status and progress
- Document upload and management
- Payment processing
- Communication with decision makers

Built with React, TypeScript, and the GOV.UK Design System for accessibility and consistency with UK government services.

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/Integrated-Corporate-Services/desnz-syeia-frontend-beta.git
cd desnz-syeia-frontend-beta

# Install dependencies
npm install

# Copy environment configuration
cp .env.local.example .env.local

# Edit .env.local with your configuration
# Update API endpoints and other settings

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/        # Reusable UI components
├── constants/         # Application constants
├── features/          # Feature-based modules
│   ├── Payments/     # Payment processing
│   ├── ProjectOverview/
│   ├── RouteMap/     # Geographic route mapping
│   ├── SupportingInfo/
│   └── ...
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── config/           # Configuration files
└── App.tsx           # Main application component
```

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Lint code
```
## Docker

### Build

```bash
docker build -t desnz-syeia-frontend .
```

### Run

```bash
docker run -p 5173:5173 desnz-syeia-frontend
```

### Docker Compose

```bash
docker-compose up
```

## Testing

```bash
npm test                 # Run tests
npm run test:coverage   # Coverage report
```
## Accessibility

This application follows:
- WCAG 2.1 AA standards
- GOV.UK Design System patterns
- Semantic HTML
- ARIA landmarks and labels
- Keyboard navigation

Test with:
- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard only navigation
- Browser zoom up to 200%

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
