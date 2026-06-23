export interface NetworkOperatorDetails {
	operator_ref?: string;
	organisation_name?: string;
	person_name?: string;
	line1?: string;
	line2?: string;
	town_city?: string;
	county?: string;
	postcode?: string;
	email?: string;
	phone?: string;
	organisation_contact_name?: string;
    additional_contact?: string;
}

export interface Parish {
    parish_code: string;
    parish_name: string;
    lpa_code: string;
    country: string;
}

export interface AssetInformation {
	asset_id?: string;
	standard_specification_reference_number?: string;
	type_of_line?: string;
	tori_noi_code?: string;
	line_voltage?: string;
	line_length?: string;
}

export interface ProjectDetails {
	project_name?: string;
	project_description?: string;
	projectDescription?: string;
	plan_reference?: string;
	earliest_work_start_date_month?: string;
	earliest_work_start_date_year?: string;
	latest_work_start_date_month?: string;
	latest_work_start_date_year?: string;
	max_structure_height_m?: string;
	updated_at?: string;
	has_related_applications?: string;
	related_applications_details?: string;
	has_related_cpo?: string;
	related_cpo_details?: string;
	assetInformation?: AssetInformation[];
	consultations?: Consultation[];
}

export interface PlanDocument {
	document_id: string;
	title: string;
	description?: string;
	file_id?: string;
    s3_key?: string;
    filename?: string;
    file_size_bytes?: number;
    file_content_type?: string;
    bucket_name?: string;
    storage_provider?: string;
    uploaded_at_timestamp?: string;
}

export interface GridPoint {
	point_id?: string;
	easting: string;
	northing: string;
}

export interface Route {
	route_id?: string;
	routeName?: string;
	gridPoints?: GridPoint[];
	disconnected_route_justification?: string;
}

export interface SupportingQuestions {
	wayleaves_obtained?: boolean;
	wayleaves_not_obtained_reason?: string;
	esqcr_2002_compliance_confirmed?: boolean;
	has_additional_supporting_documents?: boolean;
	applicant_supporting_comments?: string;
}

export interface SupportingDocument {
	document_id: string;
	title: string;
	description?: string;
	file_id?: string;
    s3_key?: string;
    filename?: string;
    file_size_bytes?: number;
    file_content_type?: string;
    bucket_name?: string;
    storage_provider?: string;
    uploaded_at_timestamp?: string;
}

export interface EIAFees {
	is_eia_development?: boolean;
	screening_only?: boolean;
}

export interface WorksOverviewDocument {
	documentId?: string;
	document_id?: string;
	fileId?: string;
	file_id?: string;
	title?: string;
	category?: string;
	s3_key?: string;
	s3Key?: string;
	filename?: string;
}

export interface WorksOverview {
	addingOrReplacingPoles?: boolean;
	poleMaterial?: string;
	chemicalTreatments?: string;
	polesAdded?: number;
	polesReplaced?: number;
	tallestNewPoleHeight?: number | null;
	poleComments?: string;
	addingOrReplacingLines?: boolean;
	overheadLineDescription?: string;
	estimatedDuration?: string;
	vehiclesRequired?: string;
	roadClosuresRequired?: boolean;
	roadClosuresDetails?: string;
	excavationRequired?: boolean;
	excavationDetails?: string;
	vegetationClearanceRequired?: boolean;
	vegetationClearanceDetails?: string;
	usingExistingAccessRoutes?: boolean;
	accessRoutesDetails?: string;
	removingExistingEquipment?: boolean;
	removalDescription?: string;
	generalComments?: string;
	applicationDocuments?: WorksOverviewDocument[];
}

export interface ResponseDocument {
	name?: string;
	url: string;
}

export interface Consultation {
    id?: string;
    applicationId?: string;
    consultationType?: string;
    consulteeOrganisationId?: string;
    consulteeOrganisationName?: string;
    status?: string;
    sentAt?: string | null;
    createdAt?: string;
    closedAt?: string | null;
    dateClosed?: string | null;
    objectionRaised?: boolean | null;
    responseDocuments?: ResponseDocument[];
    consulteeEmailAddress?: string | null;
    requestEvidenceDocuments?: ResponseDocument[];
	lpaConsultationForm?: ResponseDocument[];
    evidenceResponseNotReceivedDocs?: ResponseDocument[];
    consulteeContactName?: string;
    closeComments?: string;
    consultationRequestDocs?: { name: string; url: string; key?: string; filename?: string }[];
    respondingConsulteeName?: string;
    respondingConsulteeEmail?: string;
    notRequiredReason?: string;
    notRequiredDocs?: { name: string; url: string; key?: string; filename?: string }[];
	// PUBLIC consultation specific fields
    firstDatePublished?: string | null;
    secondDatePublished?: string | null;
    evidenceOfPublicationDocs?: ResponseDocument[];
    publicResponseDocuments?: ResponseDocument[];
}

export interface PostConsultationOutcome {
  lpa_conditions_imposed?: boolean | null;
  lpa_conditions_accepted?: boolean | null;
  lpa_conditions_not_accepted_reason?: string | null;
  consultees_recommendations_made?: boolean | null;
  consultees_recommendations_accepted?: boolean | null;
  consultees_recommendations_not_accepted_reason?: string | null;
}

export interface SensitiveAreaReviewDocument {
  document_id?: string;
  title?: string;
  file_id?: string;
  s3_key?: string;
  filename?: string;
}

export interface ApplicationMetadata {
  desnzRef?: string;
  formType?: string;
  status?: string;
}

export interface PaymentDetails {
  payment_id?: string;
  reference?: string;
  transaction_number?: string | null;
  provider?: string;
  amount?: number;
  total_amount?: string;
  status?: string;
  is_successful?: boolean;
  is_complete?: boolean;
  created_at?: string;
}