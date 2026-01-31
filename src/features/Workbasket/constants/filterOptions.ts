export const CASE_TYPE_OPTIONS = [
  { value: "overhead-lines", label: "Overhead Lines (S37)" },
  { value: "necessary-wayleaves", label: "Necessary Wayleaves" },
  { value: "tree-lopping", label: "Tree Lopping and Felling" },
];

export const STATUS_OPTIONS = [
  { value: "submitted", label: "Application submitted" },
  { value: "under-review", label: "Under review" },
  { value: "processing-payment", label: "Processing payment" },
  { value: "further-info-requested", label: "Further information requested" },
  { value: "in-progress", label: "In progress" },
  { value: "decision-issued", label: "Decision issued" },
  { value: "archived", label: "Archived" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "representation-stage", label: "Representation stage" },
  { value: "in-abeyance", label: "In abeyance" },
  { value: "invalid", label: "Invalid" },
];

export type TabType = "draft" | "active" | "completed" | "archived";

export const TAB_OPTIONS: { value: TabType; label: string; count?: number }[] =
  [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Submitted" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" },
  ];
