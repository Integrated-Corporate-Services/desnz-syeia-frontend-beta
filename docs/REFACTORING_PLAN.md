# Frontend Folder Structure Refactoring Plan

## Current Analysis

### Current Issues
1. **src/lib/analytics/** - Flat structure with no organization
   - All files at root level
   - No barrel exports (index.ts)
   - Missing proper categorization

2. **src/modules/cookie-consent/** - Mixed organization
   - Components, services, and utils mixed at root
   - No proper folder categorization
   - Partial barrel exports

3. **src/modules/privacy-policy/** - Better but incomplete
   - Has some structure (components/, pages/, utils/, config/)
   - Missing hooks/ and services/ directories
   - Can be improved

### Target Structure (Based on features/NWL/ObjectorDetails/)

Following GDS standards and frontend best practices:

```
module-name/
├── components/       # Presentational & container components
│   ├── ComponentName.tsx
│   └── index.ts     # Barrel export
├── hooks/           # Custom React hooks
│   ├── useHookName.ts
│   └── index.ts
├── services/        # API calls, external integrations
│   ├── serviceName.ts
│   └── index.ts
├── utils/           # Pure utility functions (no React dependencies)
│   ├── utilName.ts
│   └── index.ts
├── types/           # TypeScript type definitions
│   ├── typeName.ts
│   └── index.ts
├── constants/       # Constants, enums, configs
│   ├── constantName.ts
│   └── index.ts
├── pages/           # Page-level components (optional)
│   ├── PageName.tsx
│   └── index.ts
└── index.ts         # Main barrel export for the module
```

## Refactoring Plan

### Phase 1: Restructure src/lib/analytics/

**New Structure:**
```
src/lib/analytics/
├── hooks/
│   ├── usePageTracking.ts
│   └── index.ts
├── services/
│   ├── track.ts
│   └── index.ts
├── utils/
│   ├── strip-pii.ts
│   └── index.ts
├── types/
│   ├── events.ts
│   └── index.ts
└── index.ts
```

**Migration Steps:**
1. Create subdirectories: hooks/, services/, utils/, types/
2. Move usePageTracking.ts → hooks/
3. Move track.ts → services/
4. Move strip-pii.ts → utils/
5. Move events.ts → types/
6. Create index.ts files for each subdirectory
7. Create main index.ts with consolidated exports
8. Update all import statements across the codebase

### Phase 2: Restructure src/modules/cookie-consent/

**New Structure:**
```
src/modules/cookie-consent/
├── components/
│   ├── CookieBanner.tsx
│   ├── CookieConsentProvider.tsx
│   └── index.ts
├── pages/
│   ├── CookiesSettingsPage.tsx
│   └── index.ts
├── services/
│   ├── consent-api.ts
│   ├── telemetry/
│   │   ├── ga4.ts
│   │   ├── rum.ts
│   │   └── index.ts
│   └── index.ts
├── utils/
│   ├── cookie-utils.ts
│   └── index.ts
├── types/
│   ├── consent.types.ts
│   └── index.ts
└── index.ts
```

**Migration Steps:**
1. Create subdirectories: components/, pages/, services/, utils/, types/
2. Move components to components/
3. Move CookiesSettingsPage.tsx → pages/
4. Move consent-api.ts and telemetry/ → services/
5. Move cookie-utils.ts → utils/
6. Rename and move types.ts → types/consent.types.ts
7. Create index.ts files for each subdirectory
8. Update main index.ts with consolidated exports
9. Update all import statements across the codebase

### Phase 3: Improve src/modules/privacy-policy/

**Current Structure is mostly good, needs minor adjustments:**
```
src/modules/privacy-policy/
├── components/
│   ├── ContactInfo.tsx
│   ├── PageFeedback.tsx
│   ├── RelatedContent.tsx
│   └── index.ts
├── config/
│   ├── privacy.config.ts
│   └── index.ts (ADD)
├── pages/
│   ├── AccessibilityStatementPage.tsx
│   ├── ContactPage.tsx
│   ├── HelpPage.tsx
│   ├── PrivacyNoticePage.tsx
│   ├── TermsAndConditionsPage.tsx
│   └── index.ts
├── utils/
│   ├── renderContent.tsx
│   └── index.ts (ADD)
├── types/
│   ├── privacy.types.ts (RENAME from types.ts)
│   └── index.ts (ADD)
└── index.ts
```

**Migration Steps:**
1. Rename types.ts → types/privacy.types.ts
2. Create index.ts in config/
3. Create index.ts in utils/
4. Create index.ts in types/
5. Update main index.ts imports
6. Update all import statements across the codebase

## Benefits

### 1. **Improved Code Organization**
   - Clear separation of concerns (components, hooks, services, utils, types)
   - Easier to locate specific functionality
   - Follows feature-first architecture

### 2. **Better Maintainability**
   - Each folder has a single responsibility
   - Easier to add new features
   - Simpler testing strategy (test utils separately from components)

### 3. **Enhanced Developer Experience**
   - Barrel exports (index.ts) provide cleaner imports
   - Consistent structure across all modules
   - Follows industry best practices (Feature-Sliced Design, Atomic Design principles)

### 4. **Scalability**
   - Easy to add new modules following the same pattern
   - Clear guidelines for where new code belongs
   - Reduces cognitive load for new developers

### 5. **GOV.UK Design System Compliance**
   - Separates presentational components (components/) from business logic (services/)
   - Maintains accessibility standards
   - Follows React best practices recommended by GDS

### 6. **TypeScript Benefits**
   - Centralized type definitions in types/ folders
   - Better type inference with barrel exports
   - Easier to share types across modules

## Implementation Principles

1. **Single Responsibility**: Each file/folder has one clear purpose
2. **Separation of Concerns**: Components don't contain business logic
3. **Dependency Rule**: Higher-level modules depend on lower-level ones
4. **Barrel Exports**: Use index.ts for cleaner imports
5. **Co-location**: Keep related files together
6. **Naming Conventions**: 
   - PascalCase for components
   - camelCase for functions/hooks
   - kebab-case for folders
   - Descriptive names that indicate purpose

## Testing Strategy

After refactoring, update test structure to mirror source structure:
```
tests/
├── lib/
│   └── analytics/
│       ├── hooks/
│       ├── services/
│       └── utils/
└── modules/
    ├── cookie-consent/
    └── privacy-policy/
```

## Rollback Plan

If issues arise:
1. Git provides full history
2. Can revert commit-by-commit
3. Import statements are the main concern - use VS Code global search/replace
4. Run TypeScript compiler to catch any missed imports

## Success Criteria

✅ All existing functionality works without breaking
✅ All tests pass
✅ TypeScript compiles with no errors
✅ Improved code organization and readability
✅ Consistent structure across lib/ and modules/
✅ Clear barrel exports for all modules
✅ Updated imports throughout codebase
