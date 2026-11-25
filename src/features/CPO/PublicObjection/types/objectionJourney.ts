export type ObjectionAction = 'submit' | 'withdraw';

export type ObjectionDocumentStatus = 'checking' | 'ready' | 'rejected';

export interface ObjectionDocument {
  fileId: string;
  fileName: string;
  status: ObjectionDocumentStatus;
}

export type ObjectorType = 'myself' | 'organisation' | 'representative';

export type AddressSearchStatus = 'found' | 'none' | 'unavailable';

export interface ObjectionAddress {
  line1: string;
  line2: string;
  town: string;
  county: string;
  postcode: string;
}

export interface ObjectionJourney {
  reference: string;
  title: string;
  organisation: string;
  action: ObjectionAction | null;
  fullName: string;
  email: string;
  emailVerified: boolean;
  securityCodeExpiryMinutes: number;
  addressSearch: { postcode: string; property: string; status: AddressSearchStatus | null; results: { id: string; label: string }[] };
  address: ObjectionAddress | null;
  objectorType: ObjectorType | null;
  objectionDetails: string;
  documents: ObjectionDocument[];
  objectorNames: string[];
}

export interface ObjectionFieldError {
  field: string;
  message: string;
}

export interface SubmittedObjection {
  objectorName: string;
  objectionReference: string;
}

/** What the confirmation page shows once the objection has been submitted (SYEIA-2942 / SYEIA-2934). */
export interface ObjectionSubmission {
  reference: string;
  /** Only after a withdrawal: who is told about it (SYEIA-2946). */
  organisation?: string;
  objections: SubmittedObjection[];
}

/** An objection the verified email address can withdraw (SYEIA-2943 / SYEIA-2946). */
export interface WithdrawableObjection {
  objectionId: string;
  objectionReference: string;
  objectorName: string;
  objectionDetails: string;
  documentNames: string[];
}
