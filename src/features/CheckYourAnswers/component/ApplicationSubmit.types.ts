export interface NetworkOperatorDetails {
	operator_ref?: string;
	organisation_name?: string;
	person_name?: string;
	line1?: string;
	line2?: string;
	town_city?: string;
	country?: string;
	postcode?: string;
	email?: string;
	phone?: string;
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
	assetInformation?: AssetInformation[];
	consultations?: Consultation[];
}

export interface PlanDocument {
	document_id: string;
	title: string;
	description?: string;
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
}

export interface EIAFees {
	requires_full_eia?: boolean;
	screening_only?: boolean;
}

export interface WorksOverview {
	addingOrReplacingPoles?: boolean;
	poleMaterial?: string;
	chemicalTreatments?: string;
	polesAdded?: number;
	polesReplaced?: number;
	poleComments?: string;
	addingOrReplacingLines?: boolean;
	overheadLineDescription?: string;
	estimatedDuration?: string;
	vehiclesRequired?: string;
	roadClosuresRequired?: boolean;
	excavationRequired?: boolean;
	excavationDetails?: string;
	vegetationClearanceRequired?: boolean;
	vegetationClearanceDetails?: string;
	usingExistingAccessRoutes?: boolean;
	accessRoutesDetails?: string;
	removingExistingEquipment?: boolean;
	removalDescription?: string;
	generalComments?: string;
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
}
