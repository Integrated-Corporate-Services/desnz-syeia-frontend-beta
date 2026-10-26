# SYEIA-2364 local verification - 26 October 2026

## Result

Partial verification, not full acceptance or live integration sign-off.
Browser: localhost:5173 with the real local backend on port 3000, local simulator
on 3333, and local PostgreSQL appdb. Authenticated as the existing test DNO team
coordinator. Notify remained disabled. No provider payment or email was sent.

With user approval, applied V1.41 directly in a transaction and inserted two new
synthetic submitted applications, each with four independent payment requests.
Existing records were not reset or updated. This manual local setup is not proof
that the deployed Flyway pipeline applies the migration successfully.

| Fixture | Application ID |
| --- | --- |
| S3792364 | 3c3dcd54-0c41-40c8-866c-0e8731eb5512 |
| NWL92364 | e07c530e-94df-4ee1-9e05-75793a189762 |

Each request is GBP 125000 pence with a PINS hearing assessment item. PAID,
PROCESSING and WITHDRAWN states were seeded, not reached through actual finance
or Salesforce events. These fixtures have no generated invoice and incomplete
underlying application sections; they are for payment UI checks only.

## Acceptance evidence

| Ticket / behaviour | Result and evidence |
| --- | --- |
| 2457: independent S37/NWL summary requests | Real API lists four requests per application; both summaries show four after the S37 integration fix. |
| 2457: amounts, dates and payment action | GBP 1,250.00, 8 September 2026 and request descriptions render; exactly one payment action for the unpaid request. |
| 2457: payment-required screen | NWL displays GBP 1,250.00, matching item/total, Generate invoice and return-to-summary action. |
| 2457: invoice generation/download | PASSED on the NWL fixture after configuring the existing dev clean bucket locally. Generated INV01/NWL92364; authenticated download returned 200, application/pdf, 1258 bytes and a valid %PDF- header. Initial attempt returned 502 before configuration. |
| 2457: card checkout, success/failure/cancellation and retry | Not completed in browser; blocked behind invoice generation. Existing automated provider/lifecycle tests are not live sandbox evidence. |
| 2457: BACS choice, proof upload and confirmation | Not completed end to end; storage/scanner setup and invoice are required. Automated optional-evidence and lifecycle checks exist. |
| 2457: paid/processing receipts | Seeded S37 paid and NWL processing requests render the expected amount, status and next-step text. Invoice shows Not available because fixtures lack one. Not proof of reconciliation or card success. |
| 2682: withdrawn summary/direct route | Both case types show Request withdrawn and no payment action; direct request pages explain that no payment is needed. |
| 2682: withdrawn invoice protection | Real GET for withdrawn invoice returns 409. Incoming Salesforce withdrawal and associated bells/emails were not exercised live. |
| Request isolation | Real request lookup under a different application returns 404. |
| Main application status | Both remain SUBMITTED after the checks and failed invoice generation; request states unchanged. |
| 2456: requested email | Local Notify template exists; delivery and actual ingestion trigger not tested. Notify intentionally disabled. |
| 2687: case-team receipt email | Not tested live; requires verified UKSBS reconciliation and explicit Salesforce acknowledgement. Case-team delivery stays mocked. |

## Browser-discovered fix

S37 ApplicationSummary did not mount AdditionalPaymentSummary at all, although
the API returned the requests. Added the shared component independently of initial
payment details and a regression covering its application ID and S37 route base.
Retested in the real browser: four cards and one payment action.

## Design and automated checks

- Checked summary/request/receipt content against supplied SYEIA-2457 screenshots.
- S37 summary has no horizontal document overflow at 390px; NWL desktop summary
  had none at the inspected viewport. Not a comprehensive responsive sign-off.
- Existing local GOV.UK font files fail decoding. Visual typography cannot be
  signed off against the screenshots until that existing asset issue is resolved.
- Breadcrumb uses Application summary rather than the reference shown in designs;
  exact design parity remains pending.
- After the fix, 25 tests passed across the S37 summary, payment page, payment
  summary, API client and shared file-upload suites; TypeScript check passed.
- Earlier rebased backend run: 81 additional-payment tests passed, including
  SQL-backed PGlite lifecycle and mocked external notification/provider checks.

## Remaining gates

The local launcher now sets CLEAN_BUCKET to the existing development clean bucket;
the existing development SSO role successfully uploaded and downloaded the invoice.
No bucket or IAM policy was created or changed. Notify and automatic migrations
remained disabled during restart. After generation the application remained
SUBMITTED and the request NOT_PAID. The seeded receipt fixtures still lack invoices.

Repeat card/BACS flows using the generated invoice. Evidence needs the real upload and clean
scan pipeline. Confirm the Pay key is the intended sandbox credential before
checkout. Test assigned approved-agent and unauthorized sessions. Exercise request
creation/withdrawal, bells, Notify delivery to an approved test mailbox, finance
reconciliation, outbox delivery and Salesforce acknowledgement in a controlled
integration environment. Do not enable real case-team email dispatch for fixtures.