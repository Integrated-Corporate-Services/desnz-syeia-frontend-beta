import type { DateRangePreset, StatusColour } from "./types";

export const DATE_RANGE_OPTIONS: Array<{ value: DateRangePreset; label: string }> = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "previous-7-days", label: "Previous 7 days" },
  { value: "previous-30-days", label: "Previous 30 days" },
  { value: "last-month", label: "Last month" },
  { value: "last-12-months", label: "Last 12 months" },
  { value: "available-data", label: "All available reporting data" },
  { value: "custom", label: "Between two dates" },
];

export const REPORT_SECTION_LINKS = [
  ["summary", "Summary"],
  ["applications", "Applications"],
  ["access-requests", "Access requests"],
  ["payments", "Payments"],
  ["feedback", "Feedback"],
  ["organisation-breakdown", "Organisation breakdown"],
] as const;

export const APPLICATION_STATUS_ROWS: Array<[string, StatusColour, string, string]> = [
  ["Draft", "grey", "s37_draft", "nwl_draft"],
  ["Submitted", "grey", "s37_status_submitted", "nwl_status_submitted"],
  ["Under review", "blue", "s37_under_review", "nwl_under_review"],
  ["Further information requested", "yellow", "s37_further_information_requested", "nwl_further_information_requested"],
  ["In abeyance", "grey", "s37_in_abeyance", "nwl_in_abeyance"],
  ["Decision issued", "green", "s37_decision_issued", "nwl_decision_issued"],
];

export const REPORTING_MESSAGES = {
  LOAD_FAILED: "The report could not be loaded. Try again shortly.",
  SNAPSHOTS_UNAVAILABLE: "Reporting data is not yet available for every day in this date range.",
  NO_DATA_AVAILABLE: "No data is available for the selected date range.",
  INVALID_DATE_RANGE: "End date must be on or after the start date.",
} as const;

export const OPERATIONAL_TASKS_MESSAGES = {
  REFERENCE_LABEL: "Reference",
  REFERENCE_HINT: "Please enter Application Id or DESNZ Reference",
  REFERENCE_REQUIRED: "Enter an application ID or DESNZ reference.",
  NOT_FOUND: "No application was found for that reference.",
  LOAD_FAILED: "The application could not be found. Try again shortly.",
  VERIFY_FAILED: "The payment could not be verified. Try again shortly.",
  VERIFY_SUCCESS: "Payment verification completed.",
  DOWNLOAD_BUILD_FAILED: "The download bundle could not be built. Try again shortly.",
  DOWNLOAD_CHECK_FAILED: "The download bundle status could not be checked. Try again shortly.",
} as const;

export const VERIFIABLE_APPLICATION_STATUS = "DRAFT";
export const VERIFIABLE_PAYMENT_STATUS = "created";
export const DOWNLOAD_RECOVERY_EXCLUDED_APPLICATION_STATUS = "DRAFT";