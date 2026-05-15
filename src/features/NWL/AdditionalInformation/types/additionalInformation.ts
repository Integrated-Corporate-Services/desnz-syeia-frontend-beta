import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';

/**
 * Additional Information Data Type
 * Contains data for related applications and other important information sections
 */
export type AdditionalInformationData = {
  // Related applications
  has_related_applications?: boolean;
  related_applications_details?: string;
  
  // Other important information
  has_other_information?: boolean;
  other_information_details?: string;
  uploaded_files?: UploadedFile[];
  application_documents?: ApplicationDocument[];
};

/**
 * Form data for radio button pages
 */
export type RadioFormData = {
  value: string;
};

/**
 * Form data for textarea pages
 */
export type TextareaFormData = {
  text: string;
};

/**
 * Form errors structure
 */
export type FormErrors = {
  [key: string]: string;
};
