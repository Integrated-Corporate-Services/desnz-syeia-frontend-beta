import type { AdditionalInformationData } from '../../AdditionalInformation/types/additionalInformation';
import type { NegotiationsData } from '../../Negotiations/types/negotiations';

/**
 * Types for NWL Application Details
 * Contains all data captured in the ApplicationDetails flow
 */

export type NWLApplicationDetails = {
  // Additional information data
  additional_information_data?: AdditionalInformationData;
  
  // Negotiations data
  negotiations_data?: NegotiationsData;
  // Type of use (new lines vs existing lines)
  type_of_use?: string;
  
  // New lines flow
  wayleave_offer_date?: string;
  
  // Existing lines flow - common fields
  grounds_for_application?: string;
  wayleave_type?: string;
  
  // Wayleave expired path
  wayleave_expiry_date?: string;
  
  // Wayleave terminated path
  notice_to_terminate_date?: string;
  termination_period_expired?: boolean;
  
  // No wayleave exists / Common path
  notice_to_remove_date?: string;
  is_notice_to_remove_clear?: boolean;
  notice_to_remove_unclear_explanation?: string;
  
  // Application timing
  is_within_three_months?: boolean;
  application_outside_timeframe_explanation?: string;
  
  // Standard term
  is_standard_term?: boolean;
  standard_term_explanation?: string;
};

/**
 * Form data for radio button pages
 */
export type RadioFormData = {
  value: string;
};

/**
 * Form data for date input pages
 */
export type DateFormData = {
  day: string;
  month: string;
  year: string;
};

/**
 * Form data for textarea pages
 */
export type TextareaFormData = {
  text: string;
};

/**
 * Form data for conditional radio with textarea
 */
export type ConditionalRadioFormData = {
  radioValue: string;
  conditionalText?: string;
};

/**
 * Form errors structure
 */
export type FormErrors = {
  [key: string]: string;
};
