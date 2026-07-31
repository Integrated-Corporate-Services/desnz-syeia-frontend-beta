// ConsultationDetails.ts
// TypeScript type for consultation details as sent from the backend

export interface ConsultationDetails {
  id: string;
  applicationId: string;
  consultationType: string;
  consulteeOrganisationId: string | null;
  consulteeOrganisationName: string | null;
  otherConsultee?: string | null;
  status: string;
  offline?: boolean | null;
  deliveryChannel?: string | null;
  roundNumber?: number;
  roundLabel?: string | null;
  allDocumentsUploaded?: boolean;
  sentBy?: string | null;
  sentAt?: string | null;
  secondDate?: string | null;
  closedBy?: string | null;
  closedAt?: string | null;
  createdAt?: string;
  createdBy?: string | null;
  lastUpdatedAt?: string | null;
  lastUpdatedBy?: string | null;
  // Closed status details for summary card
  dateClosed?: string;
  objectionRaised?: boolean;
  closeComments?: string;
  responseDocuments?: { name: string; url: string; file_id?: string }[];
  respondingConsulteeName?: string;
  respondingConsulteeEmail?: string;
  consulteeEmailMessage?: string;
  consulteeEmailAddress?: string;
  // Additional details for 'Consultation Not Required' status
  notRequiredReason ?: string;
  notRequiredDocs ?: { name: string; url: string; key?: string; filename?: string; file_id?: string }[];
  uploadedFiles ?: { name: string; url: string; file_id?: string }[];
  applicationDocuments ?: { name: string; url: string; file_id?: string }[];
  // LPA Consultation Form (generated document)
  lpaConsultationForm?: { name: string; url: string; key?: string; filename?: string; file_id?: string }[];
  // Consultation request documents (evidence of request)
  consultationRequestDocs ?: { name: string; url: string; key?: string; filename?: string; file_id?: string }[];
  dateRequestCreated?: string;
  evidenceResponseNotReceivedDocs?: { url: string; name: string; key?: string; filename?: string; file_id?: string }[];

  // Public consultation specific fields
  firstDatePublished?: string | null;
  secondDatePublished?: string | null;
  evidenceOfPublicationDocs?: { name: string; url: string; file_id?: string }[];
  publicResponseDocuments?: { name: string; url: string; file_id?: string }[];
}
