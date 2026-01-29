import { APPLICATION_STATUS } from "../../../constants/status";

// Workbasket status tag class mapping - colors based on wireframe
export const STATUS_TAG_CLASSES: Record<string, string> = {
  "on hold": "govuk-tag govuk-tag--red",
  declined: "govuk-tag govuk-tag--red",
  negotiated: "govuk-tag govuk-tag--blue",
  "payment pending": "govuk-tag govuk-tag--blue",
  "processing payment": "govuk-tag govuk-tag--yellow",
  submitted: "govuk-tag govuk-tag--turquoise",
  "application submitted": "govuk-tag govuk-tag--blue",
  granted: "govuk-tag govuk-tag--turquoise",
  "hearing pending": "govuk-tag govuk-tag--yellow",
  draft: "govuk-tag govuk-tag--grey",
  "under review": "govuk-tag govuk-tag--blue",
  "further information requested": "govuk-tag govuk-tag--red",
  "in progress": "govuk-tag govuk-tag--blue",
  "decision issued": "govuk-tag govuk-tag--turquoise",
  archived: "govuk-tag govuk-tag--grey",
  withdrawn: "govuk-tag govuk-tag--grey",
  "representation stage": "govuk-tag govuk-tag--purple",
  "in abeyance": "govuk-tag govuk-tag--yellow",
  invalid: "govuk-tag govuk-tag--red",
};

// Statuses that allow editing in workbasket
export const EDITABLE_STATUSES = [
  APPLICATION_STATUS.ON_HOLD,
  APPLICATION_STATUS.NEGOTIATED,
  APPLICATION_STATUS.PAYMENT_PENDING,
  APPLICATION_STATUS.HEARING_PENDING,
];

// Get status tag CSS class for workbasket display
export const getStatusTagClass = (status: string): string => {
  const normalizedStatus = status.toLowerCase();
  return STATUS_TAG_CLASSES[normalizedStatus] || "govuk-tag";
};

// Determine if Edit action should be shown for a given status
export const shouldShowEdit = (status: string): boolean => {
  return EDITABLE_STATUSES.includes(status);
};
