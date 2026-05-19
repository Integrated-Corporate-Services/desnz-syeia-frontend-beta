/**
 * Constants for Negotiations pages
 */

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  NEGOTIATIONS: "Negotiations",
} as const;

export const LABELS = {
  EXISTING_NEGOTIATIONS_TITLE: "Tell us about any existing negotiations",
  EVIDENCE_TITLE: "Evidence of negotiations",
  NO_NEGOTIATIONS_TITLE: "Tell us why there have not been any negotiations",
  CONTINUE: "Save and continue",
  SAVE_FOR_LATER: "Save for later",
} as const;

export const HINTS = {
  EXISTING_NEGOTIATIONS: "Parties are strongly encouraged to reach a negotiated settlement where possible.",
  START_DATE: "Please confirm the start date of negotiations.",
  EVIDENCE_COMMENTS: "Tell us about any negotiations with the objector to reach a voluntary solution. If possible, provide a timeline of events or copies of relevant correspondence. If no negotiations have taken place, you must explain why.",
  NO_NEGOTIATIONS: "You can enter up to 4,000 characters",
} as const;

export const FORM_ERRORS = {
  MISSING_RADIO_SELECTION: "Select an option",
  MISSING_DATE: "Enter the start date",
  INVALID_DATE: "Enter a valid date",
  INVALID_DAY: "Day must be a number between 1 and 31",
  INVALID_MONTH: "Month must be a number between 1 and 12",
  INVALID_YEAR: "Year must be a valid 4-digit year",
  MISSING_COMMENTS: "Enter details about the negotiations",
  MISSING_NO_NEGOTIATIONS_REASON: "Enter a reason why there have not been any negotiations",
  COMMENTS_TOO_LONG: "Comments must be 4000 characters or less",
} as const;

export const FORM_LABELS = {
  HAS_NEGOTIATIONS: "Tell us about any existing negotiations",
  YES: "Yes",
  NO: "No",
  DAY: "Day",
  MONTH: "Month",
  YEAR: "Year",
  ADDITIONAL_COMMENTS: "Additional comments",
  DOCUMENTS_UPLOADED: "Documents uploaded",
  UPLOAD_EVIDENCE: "Upload any evidence of negotiations (optional)",
  NO_NEGOTIATIONS_REASON: "Tell us why there have not been any negotiations",
  NO_FILE_CHOSEN: "No file chosen",
  CHOOSE_FILE: "Choose file",
  OR_DROP_FILE: "or drop file",
} as const;

export const CONTENT = {
  EXISTING_NEGOTIATIONS_INTRO: "Parties are strongly encouraged to reach a negotiated settlement where possible.",
  EVIDENCE_INTRO: "Tell us about any negotiations with the objector to reach a voluntary solution. If possible, provide a timeline of events or copies of relevant correspondence. If no negotiations have taken place, you must explain why.",
  CHARACTER_LIMIT: "You can enter up to 4,000 characters",
} as const;

export const CHARACTER_LIMITS = {
  MAX_COMMENTS: 4000,
  MAX_REASON: 4000,
} as const;

export const MESSAGES = {
  CHARACTER_REMAINING: (remaining: number) => {
    if (remaining === 0) return 'You have 0 characters remaining';
    if (remaining < 0) return `You have ${Math.abs(remaining)} characters too many`;
    if (remaining === 1) return 'You have 1 character remaining';
    return `You have ${remaining.toLocaleString()} characters remaining`;
  },
} as const;
