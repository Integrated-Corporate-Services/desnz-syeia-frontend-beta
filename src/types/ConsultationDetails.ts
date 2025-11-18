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
  responseDocuments?: { name: string; url: string }[];
  respondingConsulteeName?: string;
  respondingConsulteeEmail?: string;
  consulteeEmailMessage?: string;
  // Additional details for 'Consultation Not Required' status
  notRequiredReason ?: string;
  notRequiredDocs ?: { name: string; url: string }[];
}
