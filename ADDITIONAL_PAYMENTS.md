# Additional payments (SYEIA-2364)

Implements Common-AWS SYEIA-2456, SYEIA-2457, SYEIA-2682 and SYEIA-2687
with the companion backend change. Salesforce-owned screens and automation are
outside this repository's scope.

## Deployment

Deploy the companion backend and its V1.40 migration first. Existing session,
CSRF, API-origin and upload/scanner configuration applies. There is no new
frontend feature flag. The backend must return an empty request list for
applications without additional payments. Its integration guide documents the
Salesforce request, outbox, reconciliation and acknowledgement contracts and
the three required Notify templates.

Both S37 and NWL summaries display independent additional-payment requests.
Routes are beneath
`/:formType/:applicationId/additional-payments/:requestId` with `invoice`,
`payment-method`, `bank-transfer`, `proof`, `processing` and `result` steps.
These routes never invoke application submission. Invoice references and
amounts come from the backend, not initial-fee calculation or router state.

An unpaid provider result does not establish failure. The result screen permits
retry only when backend verification returns `card_outcome: FAILED`. Pending
or unavailable verification offers a status check instead. Request withdrawal
removes payment actions, with server-side checks authoritative for stale tabs.

Evidence is optional. Uploads use request-scoped presign/confirm endpoints and
the existing file scanner. Include the confirmed clean file IDs with BACS
confirmation; do not call initial-application bank-transfer submission.

## Verification

Focused checks from this repository:

```powershell
npm test -- src/features/Payments/pages/AdditionalPaymentPage.test.tsx src/features/Payments/AdditionalPaymentSummary.test.tsx src/services/additionalPaymentsService.test.ts src/components/FileUpload.test.tsx
node node_modules/typescript/bin/tsc --noEmit
```

All 13 design attachments on SYEIA-2457 were visually reviewed. Request,
invoice, method selection, BACS instructions, proof, paid/processing, confirmed
failure, pending verification and invoice-generation screens were captured
with synthetic browser responses at 1440px and 390px. Captured screens had no
horizontal document overflow. Desktop actions align inline and stack on mobile.
Local font decoding and cookie-backend errors limit visual sign-off; this is
not live provider, upload, email or Salesforce integration verification.

Before release, verify both case types with real authorised applicant/agent
sessions, generated PDF downloads, supported evidence files and scan results,
GOV.UK Pay success/failure/cancellation, BACS reconciliation, withdrawals,
multiple requests and unchanged main application statuses.