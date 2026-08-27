export const CASE_TYPE_OPTIONS = [
  { value: "overhead-lines", label: "Overhead Lines (S37)" },
  { value: "necessary-wayleaves", label: "Necessary Wayleaves" },
];

export const STATUS_OPTIONS = [
  { value: "SUBMITTED", label: "Application submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "PROCESSING_PAYMENT", label: "Processing payment" },
  { value: "FURTHER_INFORMATION_REQUESTED", label: "Further information requested" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DECISION_ISSUED", label: "Decision issued" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "REPRESENTATION_STAGE", label: "Representation stage" },
  { value: "IN_ABEYANCE", label: "In abeyance" },
  { value: "INVALID", label: "Invalid" },
];

export type TabType = "draft" | "active" | "completed" | "archived";

export const TAB_OPTIONS: { value: TabType; label: string; count?: number }[] =
  [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Submitted" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" },
  ];
