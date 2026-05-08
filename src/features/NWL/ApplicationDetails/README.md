# ApplicationDetails Module

This module handles all the application details pages in the NWL (Necessary Wayleave) flow.

## Structure

The module follows a structured organization pattern:

### 📁 components/
Reusable UI components used across ApplicationDetails pages:
- `ApplicationDetailsBreadcrumbs` - Standardized breadcrumb navigation
- `FormActions` - Save and continue / Save for later buttons
- `DateInput` - GOV.UK compliant date input component
- `ErrorSummary` - Error summary component for form validation

### 📁 constants/
Page-specific constants (labels, options, error messages):
- Each page has its own constants file following the naming pattern `*Constants.ts`
- Contains BREADCRUMBS, LABELS, FORM_ERRORS, and OPTIONS

### 📁 hooks/
Custom React hooks for shared logic:
- `useApplicationDetailsData` - Fetch and manage application data
- `useApplicationNavigation` - Handle navigation within the flow
- `useFormValidation` - Form validation logic with GOV.UK patterns

### 📁 pages/
Individual page components for the application details flow:

**New Lines Flow:**
- `TypeOfUse` - Select new lines or existing lines
- `WayleaveOffer` - Date of wayleave offer

**Existing Lines Flow - Path 1: Wayleave Expired**
- `GroundsForApplication` - Select grounds (expired/terminated/no wayleave)
- `WayleaveType` - Type of wayleave (implied/written)
- `WayleaveExpiryDate` - Confirm expiry date
- `NoticeToRemove` - Date and upload

**Existing Lines Flow - Path 2: Wayleave Terminated**
- `WayleaveType` - Type of wayleave
- `UploadWrittenWayleave` - Upload written wayleave evidence
- `UploadImpliedWayleave` - Upload implied wayleave evidence
- `NoticeToTerminate` - Date and documents
- `TerminationPeriodExpired` - Has period expired?
- `CannotContinueApplication` - Dead-end page

**Common Pages:**
- `NoticeToRemoveClear` - Is notice clear?
- `NoticeToRemoveUnclear` - Explanation if unclear
- `ApplicationWithinThreeMonths` - Within 3 months?
- `ApplicationOutsideTimeframe` - Explanation if outside
- `StandardTerm` - Standard 15-year term?

### 📁 services/
API service layer:
- `applicationDetailsService` - API calls for saving/fetching data
- Date validation and formatting utilities

### 📁 types/
TypeScript type definitions:
- `NWLApplicationDetails` - Main type for all NWL application data
- `RadioFormData`, `DateFormData`, `TextareaFormData` - Form-specific types
- `FormErrors` - Error structure

## Usage

### Importing Components
```typescript
import {
  TypeOfUse,
  WayleaveOffer,
  GroundsForApplication
} from '../features/NWL/ApplicationDetails';
```

### Importing Hooks
```typescript
import {
  useApplicationDetailsData,
  useApplicationNavigation,
  useFormValidation
} from '../features/NWL/ApplicationDetails';
```

### Importing Types
```typescript
import type {
  NWLApplicationDetails,
  FormErrors
} from '../features/NWL/ApplicationDetails';
```

### Using Components
```typescript
import { ApplicationDetailsBreadcrumbs, FormActions } from '../features/NWL/ApplicationDetails';

// In your component
<ApplicationDetailsBreadcrumbs appId={appId} />
<FormActions onSaveForLater={handleSaveForLater} />
```

### Using Hooks
```typescript
import { useApplicationDetailsData, useApplicationNavigation } from '../features/NWL/ApplicationDetails';

const MyComponent = () => {
  const appId = useGetApplicationId();
  const { application, refetch } = useApplicationDetailsData(appId);
  const { navigateToTaskList, navigateToPage } = useApplicationNavigation(appId);
  
  // Use the hooks...
};
```

## Navigation Flow

```
TypeOfUse
├── New Lines → WayleaveOffer → Task List
└── Existing Lines → GroundsForApplication
    ├── Wayleave Expired → WayleaveType → WayleaveExpiryDate → NoticeToRemove...
    ├── Wayleave Terminated → WayleaveType → Upload Pages → NoticeToTerminate...
    └── No Wayleave → NoticeToRemove → NoticeToRemoveClear...
```

## Design Patterns

- **GOV.UK Design System** - All components follow GOV.UK patterns
- **No validation on save** - Per requirements, save and continue goes directly without validation
- **Reusable components** - Shared UI elements are extracted to components/
- **Centralized navigation** - Navigation logic in hooks for consistency
- **Type safety** - Full TypeScript coverage with proper types
- **Service layer separation** - API calls isolated in services/

## Constants Pattern

Each page has a constants file with this structure:
```typescript
export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  APPLICATION_DETAILS: "Application details",
} as const;

export const LABELS = {
  PAGE_TITLE: "...",
  HELPER_TEXT: "...",
} as const;

export const FORM_ERRORS = {
  MISSING_FIELD: "...",
} as const;

export const OPTIONS = [...] as const;
```

## Testing

When testing pages:
- Mock `useApplicationDetailsData` hook
- Mock `useApplicationNavigation` hook
- Test form submissions without validation
- Test navigation paths based on selections
