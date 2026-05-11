/**
 * Types for NWL Check Your Answers page
 * Following GDS Design System patterns for summary lists
 */

/**
 * Individual row in a summary list
 */
export type SummaryRow = {
  key: string;
  value: string | React.ReactNode;
  changeLink?: string;
  changeLinkText?: string;
  keyClasses?: string;
  valueClasses?: string;
  actionClasses?: string;
};

/**
 * Section containing multiple summary rows
 */
export type SummarySection = {
  heading: string;
  rows: SummaryRow[];
  headingLevel?: 'h2' | 'h3';
  changeLink?: string;
  changeLinkText?: string;
};

/**
 * Complete summary data for Check Your Answers page
 */
export type CheckYourAnswersSummary = {
  sections: SummarySection[];
};

/**
 * Formatted person details for display
 */
export type FormattedPerson = {
  title?: string;
  fullName?: string;
  organisation?: string;
  email?: string;
  phone?: string;
};

/**
 * Formatted address for display
 */
export type FormattedAddress = {
  line1?: string;
  line2?: string;
  town?: string;
  county?: string;
  postcode?: string;
};
