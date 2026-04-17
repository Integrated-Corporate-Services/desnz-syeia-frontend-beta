import { APPLICATION_STATUS } from "../../../constants/status";

// Custom display labels for statuses (user-friendly format)
export const STATUS_DISPLAY_LABELS: Record<string, string> = {
  // Application statuses
  submitted: "Application submitted",
  "under review": "Under review",
  "in progress": "In progress",
  "processing payment": "Processing payment",
  "further information requested": "Further information requested",
  "representation stage": "Representation stage",
  "in abeyance": "In abeyance",
  "decision issued": "Decision issued",
  completed: "Completed",
  archived: "Archived",
  withdrawn: "Withdrawn",
  invalid: "Invalid",
  draft: "Draft",
  granted: "Granted",
  declined: "Declined",
  // Legacy statuses
  "on hold": "On hold",
  negotiated: "Negotiated",
  "payment pending": "Payment pending",
  "hearing pending": "Hearing pending",
  // Consultation-specific statuses
  "not started yet": "Not started yet",
  "request incomplete": "Request incomplete",
  "request sent": "Request sent",
  sent: "Sent",
  closed: "Closed",
  "not required": "Not required",
  "upload response": "Upload response",
  "public notices published": "Public notices published",
};

// Workbasket status tag class mapping - colors based on wireframe
// Uses GOV.UK Design System color modifiers (blue, yellow, turquoise, red, grey, green)
export const STATUS_TAG_CLASSES: Record<string, string> = {
  // Application statuses
  "on hold": "govuk-tag govuk-tag--red",
  declined: "govuk-tag govuk-tag--red",
  negotiated: "govuk-tag govuk-tag--blue",
  "payment pending": "govuk-tag govuk-tag--blue",
  "processing payment": "govuk-tag govuk-tag--yellow",
  submitted: "govuk-tag govuk-tag--blue",
  "application submitted": "govuk-tag govuk-tag--blue",
  granted: "govuk-tag govuk-tag--turquoise",
  "hearing pending": "govuk-tag govuk-tag--yellow",
  draft: "govuk-tag govuk-tag--grey",
  "under review": "govuk-tag govuk-tag--blue",
  "further information requested": "govuk-tag govuk-tag--red",
  "in progress": "govuk-tag govuk-tag--blue",
  "decision issued": "govuk-tag govuk-tag--blue",
  archived: "govuk-tag govuk-tag--grey",
  withdrawn: "govuk-tag govuk-tag--grey",
  "representation stage": "govuk-tag govuk-tag--blue",
  "in abeyance": "govuk-tag govuk-tag--yellow",
  invalid: "govuk-tag govuk-tag--red",
  // Consultation-specific statuses
  "not started yet": "govuk-tag govuk-tag--grey",
  "request incomplete": "govuk-tag govuk-tag--yellow",
  "request sent": "govuk-tag govuk-tag--blue",
  sent: "govuk-tag govuk-tag--blue",
  closed: "govuk-tag govuk-tag--green",
  "not required": "govuk-tag govuk-tag--green",
  "upload response": "govuk-tag govuk-tag--blue",
  "public notices published": "govuk-tag govuk-tag--blue",
};

// Statuses that allow editing in workbasket
export const EDITABLE_STATUSES = [
  APPLICATION_STATUS.ON_HOLD,
  APPLICATION_STATUS.NEGOTIATED,
  APPLICATION_STATUS.PAYMENT_PENDING,
  APPLICATION_STATUS.HEARING_PENDING,
];

// Helper function to format status text (fallback if no custom label)
export const formatStatusText = (status: string): string => {
  if (!status || typeof status !== "string") {
    return "Unknown";
  }
  return status
    .toLowerCase()
    .trim()
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Get status display label and color class
export const getStatusDisplay = (status: string) => {
  const normalizedStatus = status.toLowerCase().replace(/[-_]/g, " ").trim();
  const label =
    STATUS_DISPLAY_LABELS[normalizedStatus] || formatStatusText(status);
  const className = STATUS_TAG_CLASSES[normalizedStatus] || "govuk-tag";

  return { label, className };
};

// Get status tag CSS class for workbasket display (legacy function)
export const getStatusTagClass = (status: string): string => {
  const normalizedStatus = status.toLowerCase();
  return STATUS_TAG_CLASSES[normalizedStatus] || "govuk-tag";
};

// Determine if Edit action should be shown for a given status
export const shouldShowEdit = (status: string): boolean => {
  return EDITABLE_STATUSES.includes(status);
};
