import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { S37_BASE_URL } from "../../../constants/s37";
import { downloadS3FileOnSameTab } from "../../../utils/s3DownloadUtil";
import { useDeclarationSubmit } from "../hooks/useDeclarationSubmit";
import { useApplicationFormatters } from "../hooks/useApplicationFormatters";
import { applicationApiService } from "../../../services/applicationApiService";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import {
  NetworkOperatorDetails,
  AssetInformation,
  ProjectDetails,
  PlanDocument,
  Route,
  GridPoint,
  SupportingQuestions,
  SupportingDocument,
  EIAFees,
  WorksOverview,
  Consultation,
  Parish,
  PostConsultationOutcome,
  SensitiveAreaReviewDocument,
  ApplicationMetadata,
  PaymentDetails
} from "../component/ApplicationSubmit.types";
import SensitiveAreaCheckMap from "../../../components/SensitiveAreaCheckMap";
import { createLogger } from "../../../utils/logger";

import {
  PAGE_LABELS,
  SECTION_HEADINGS,
  FIELD_LABELS,
  VALIDATION_MESSAGES,
  BUTTON_LABELS,
  EMPTY_VALUE,
  POST_CONSULTATION_QUESTIONS,
  WORKS_OVERVIEW_QUESTIONS,
  SUPPORTING_INFO_QUESTIONS,
  EIA_QUESTIONS,
  COMMON_TEXT
} from '../constants/applicationSummaryLabels';

import { REQUIRED_SECTIONS } from '../constants/applicationSummaryConstants';

const ApplicationSummary: React.FC = () => {
  const logger = useMemo(() => createLogger("ApplicationSummary"), []);
  const navigate = useNavigate();
  const params = useParams();
  const getApplicationId = () => {
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const idFromQuery =
        searchParams.get("id") || searchParams.get("applicationId");
      if (idFromQuery) return idFromQuery;
    }
    return "";
  };
  const applicationId = getApplicationId();
  const [validationError, setValidationError] = useState<string>("");

  const {
    declarationConfirmed,
    error: declarationError,
    handleDeclarationChange,
  } = useDeclarationSubmit(applicationId);

  // Get formatting utility functions
  const { formatCaseType, formatStatus } = useApplicationFormatters();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!declarationConfirmed) {
      // setValidationError(
      //   "You must confirm you have read and understood the information",
      // );
      setValidationError(VALIDATION_MESSAGES.DECLARATION_REQUIRED);
      window.scrollTo({ top: 0 });
      return;
    }

    setValidationError("");

    // Save declaration to database before navigating
    try {
      logger.debug("Saving declaration confirmation", {
        applicationId,
        declarationConfirmed: true,
      });
      await applicationApiService.confirmDeclaration(applicationId, true);
      logger.debug("Declaration saved successfully", { applicationId });

      // Navigate to pay and submit page
      navigate(`${S37_BASE_URL}/${applicationId}/pay-and-submit`);
    } catch (err) {
      logger.error("Failed to save declaration", err);
      // setValidationError("Failed to save declaration. Please try again.");
      setValidationError(VALIDATION_MESSAGES.SAVE_DECLARATION_FAILED);
      window.scrollTo({ top: 0 });
    }
  };

  // State for project details, plan documents, layers, and routes
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(
    null,
  );
  const [networkOperatorDetails, setNetworkOperatorDetails] =
    useState<NetworkOperatorDetails | null>(null);
  const [planDocuments, setPlanDocuments] = useState<PlanDocument[]>([]);
  const [layers, setLayers] = useState<string[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [sensitiveAreaChecks, setSensitiveAreaChecks] = useState<{
    tolerance_required?: boolean;
    tolerance_value?: number;
  } | null>(null);

  const [sensitiveAreaReview, setSensitiveAreaReview] = useState<{
    other_sensitive_areas_note?: string;
    asset_presence_option_id?: number;
    application_documents?: SensitiveAreaReviewDocument[];
    manual?: {
      selected?: { layerName: string }[];
      customAdded?: { layerName: string }[];
    };
  } | null>(null);

  // Add state for supporting info
  const [supportingQuestions, setSupportingQuestions] =
    useState<SupportingQuestions | null>(null);
  const [supportingDocuments, setSupportingDocuments] = useState<
    SupportingDocument[]
  >([]);
  const [eiaFees, setEiaFees] = useState<EIAFees | null>(null);
  const [worksOverview, setWorksOverview] = useState<WorksOverview | null>(
    null,
  );
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [postConsultationOutcome, setPostConsultationOutcome] = useState<PostConsultationOutcome | null>(null);

  const [allSectionsCompleted, setAllSectionsCompleted] = useState(false);

  const [permissions, setPermissions] = useState<{
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canSubmit: boolean;
    canDownload: boolean;
    canWithdraw: boolean;
  } | null>(null);

  const [parishes, setParishes] = useState<Parish[]>([]);

  const [applicationMetadata, setApplicationMetadata] = useState<ApplicationMetadata | null>(null);

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);

  // Memoize transformed routes to avoid recalculating on every render
  const transformedRoutes = useMemo(() => {
    return routes
      .filter((r) => Array.isArray(r.gridPoints) && r.gridPoints.length > 0)
      .map((r) => ({
        points: (r.gridPoints || []).map((pt: GridPoint) => ({
          easting: String(pt.easting || ""),
          northing: String(pt.northing || ""),
        })),
        routeName: r.routeName || "Route",
      }));
  }, [routes]);

  // Helper function to render address fields with line breaks
  const renderAddress = (fields: (string | null | undefined)[]) => {
    const filteredFields = fields.filter((field) => field);
    if (filteredFields.length === 0) return "-";
    return filteredFields.map((field, index) => (
      <React.Fragment key={index}>
        {field}
        {index < filteredFields.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Helper function to map asset presence option ID to text
  const getAssetPresenceText = (optionId?: number) => {
    switch (optionId) {
      case 1:
        return FIELD_LABELS.POLES_WITHIN_SENSITIVE_AREAS;
      case 2:
        return FIELD_LABELS.POLES_OUTSIDE_SENSITIVE_AREAS;
      case 3:
        return FIELD_LABELS.NO_POLES_SENSITIVE_AREAS;
      default:
        return "-";
    }
  };

  useEffect(() => {
    if (!applicationId) return;

    applicationApiService
      .getApplicationReview(applicationId)
      .then((data) => {
        // Log the entire response to see structure
        logger.debug("Full API response", { data });
        logger.debug(
          "Network operator section",
          { networkOperator: data.sections?.networkOperator }
        );

        setApplicationMetadata({
          desnzRef: data.desnzRef || data.applicationId,
          formType: formatCaseType(data.formType),
          status: formatStatus(data.status)
        });

        // payment details
        if (data.sections?.payment) {
          const payment = data.sections.payment;
          setPaymentDetails(payment);

          if (data.desnzRef) {
            setInvoiceNumber(`INV01/${data.desnzRef}.pdf`);
          }
        }
        // List of required sections
        const requiredSections = REQUIRED_SECTIONS;

        // Helper to get nested value by path
        const getByPath = (obj: any, pathArr: readonly string[]): any =>
          pathArr.reduce((acc: any, key: string) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

        // All sections are considered "started" if they exist and are not null/empty
        const allStarted = requiredSections.every(section => {
          const value = getByPath(data, section.path);
          if (Array.isArray(value)) return value.length > 0;
          return value !== undefined && value !== null && value !== "";
        });

        setAllSectionsCompleted(allStarted);

        // Set network operator details - flatten application_party fields
        const networkOpDetails = data.sections?.networkOperator?.details;
        logger.debug("Network operator details:", { networkOpDetails });

        if (networkOpDetails) {
          const party = networkOpDetails.application_party;
          logger.debug("Application party:", { party });
          logger.debug(
            "Additional contact BEFORE setting state:",
            { additional_contact: networkOpDetails.additional_contact }
          );

          setNetworkOperatorDetails({
            operator_ref: networkOpDetails.operator_ref,
            organisation_name: party?.organisation_name,
            organisation_contact_name: party?.contact_person_name,
            // Map contact person fields to display fields
            line1: party?.contact_person_line1,
            line2: party?.contact_person_line2,
            town_city: party?.contact_person_city,
            county: party?.contact_person_county,
            postcode: party?.contact_person_postcode,
            email: party?.contact_person_email,
            phone: party?.contact_person_phone,
            additional_contact: party?.additional_contact,
          });

          logger.debug(
            "Additional contacts from API:",
            { additional_contact: party?.additional_contact }
          );
          logger.debug(
            "Additional contacts type:",
            { type: typeof party?.additional_contact }
          );
          logger.debug(
            "Additional contacts length:",
            { length: party?.additional_contact?.length }
          );
        } else {
          setNetworkOperatorDetails(null);
        }

        const overview = data.sections?.projectDetails?.overview;
        let details = null;
        // Prefer application_project_overview
        if (overview?.application_project_overview) {
          details = { ...overview.application_project_overview };
          if (
            !details.project_description &&
            overview?.project_details?.project_description
          ) {
            details.project_description =
              overview.project_details.project_description;
          }
          if (
            !details.projectDescription &&
            overview?.project_details?.projectDescription
          ) {
            details.projectDescription =
              overview.project_details.projectDescription;
          }
          if (
            !details.project_name &&
            overview?.project_details?.project_name
          ) {
            details.project_name = overview.project_details.project_name;
          }
        } else if (overview?.project_details) {
          details = { ...overview.project_details };
        }
        if (
          details &&
          !details.project_name &&
          Array.isArray(overview?.application_relations) &&
          overview.application_relations.length > 0
        ) {
          details.project_name = overview.application_relations[0].project_name;
        }
        // Attach assetInformation from the correct location
        details = {
          ...details,
          assetInformation:
            data.sections?.projectDetails?.assetInformation || [],
        };
        setProjectDetails(details);
        setPlanDocuments(overview?.planDocuments || []);
        // Set layers data for sensitive areas from sensitiveAreaChecks
        const sensitiveChecks = data.sections?.sensitiveAreaChecks;
        const sensitiveLayers = sensitiveChecks?.layers;
        if (Array.isArray(sensitiveLayers)) {
          setLayers(sensitiveLayers);
        } else {
          setLayers([]);
        }
        setSensitiveAreaChecks(
          sensitiveChecks
            ? {
              tolerance_required: sensitiveChecks.tolerance_required,
              tolerance_value: sensitiveChecks.tolerance_value,
            }
            : null,
        );

        // Set sensitive area review data
        const sensitiveReview = data.sections?.sensitiveAreaReview;
        setSensitiveAreaReview(
          sensitiveReview
            ? {
              other_sensitive_areas_note: sensitiveReview.other_sensitive_areas_note,
              asset_presence_option_id: sensitiveReview.asset_presence_option_id,
              application_documents: sensitiveReview.application_documents,
              manual: {
                selected: sensitiveReview.manual?.selected || [],
                customAdded: sensitiveReview.manual?.customAdded || [],
              },
            }
            : null,
        );
        // Set routes data from location.route
        const routeArr = data.sections?.location?.route;
        if (Array.isArray(routeArr)) {
          setRoutes(routeArr);
        } else {
          setRoutes([]);
        }
        // Set supporting info questions and documents
        setSupportingQuestions(
          data.sections?.supportingInformation?.supportingQuestions || null,
        );
        setSupportingDocuments(
          data.sections?.supportingInformation?.supportingDocuments || [],
        );
        setEiaFees(data.sections?.supportingInformation?.eiaFees || null);
        // Set consultations data
        setConsultations(
          Array.isArray(data.sections?.consultations)
            ? data.sections.consultations.map((c: Consultation) => ({
              ...c,
              requestEvidenceDocuments: c.consultationRequestDocs || c.requestEvidenceDocuments,
              consulteeContactName: c.respondingConsulteeName || c.consulteeContactName,
              consulteeEmailAddress: c.respondingConsulteeEmail || c.consulteeEmailAddress,
              closedAt: c.dateClosed || c.closedAt,
            }))
            : []
        );
        setWorksOverview(data.sections?.worksOverview || null);
        setParishes(data.sections?.parishes || null);
        // Set permissions from API response
        setPermissions(data.permissions || null);
        setPostConsultationOutcome(data.sections?.postConsultationOutcome || null);
      })
      .catch((err) => {
        logger.error("Failed to fetch application review", err);
        setProjectDetails(null);
        setPlanDocuments([]);
        setPermissions(null);
      });
  }, [applicationId, logger]);

  return (
    <div className="govuk-width-container">
      {!permissions?.canEdit && (
        <Link to="/workbasket" className="govuk-back-link">
          Back
        </Link>
      )}
      <main className="govuk-main-wrapper" id="main-content">
        {validationError && (
          <div
            className="govuk-error-summary"
            aria-labelledby="error-summary-title"
            role="alert"
            data-module="govuk-error-summary"
          >
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              {VALIDATION_MESSAGES.ERROR_SUMMARY_TITLE}
            </h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                <li>
                  <a href="#organisation">{validationError}</a>
                </li>
              </ul>
            </div>
          </div>
        )}
        {permissions?.canEdit && (
          <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
              <li className="govuk-breadcrumbs__list-item" aria-current="false">
                <Link
                  className="govuk-breadcrumbs__link"
                  to={`${S37_BASE_URL}/${applicationId}/task-list`}
                >
                  Task list
                </Link>
              </li>
              <li className="govuk-breadcrumbs__list-item" aria-current="true">
                Submit Section 37 application
              </li>
            </ol>
          </nav>
        )}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-three-quarters">
            <h1 className="govuk-heading-xl">
              {PAGE_LABELS.TITLE}
            </h1>

            {/* ===== Summary Section ===== */}
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">{SECTION_HEADINGS.SUMMARY}</h2>
              </div>
              <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{FIELD_LABELS.DESNZ_REF}</dt>
                    <dd className="govuk-summary-list__value">
                      {applicationMetadata?.desnzRef || EMPTY_VALUE}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{FIELD_LABELS.CASE_TYPE}</dt>
                    <dd className="govuk-summary-list__value">
                      {formatCaseType(applicationMetadata?.formType)}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{FIELD_LABELS.STATUS}</dt>
                    <dd className="govuk-summary-list__value">
                      <StatusBadge 
                        status={applicationMetadata?.status || ''} 
                      />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* ===== Payment Details Section ===== */}
            {paymentDetails && (
              <div className="govuk-summary-card">
                <div className="govuk-summary-card__title-wrapper">
                  <h2 className="govuk-summary-card__title">{SECTION_HEADINGS.PAYMENT_DETAILS}</h2>
                </div>
                <div className="govuk-summary-card__content">
                  <dl className="govuk-summary-list">
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">{FIELD_LABELS.PAYMENT_REFERENCE}</dt>
                      <dd className="govuk-summary-list__value">
                        {paymentDetails.reference || paymentDetails.payment_id ||
                          '[System-generated UNIQUE NUMBER]'}
                      </dd>
                    </div>
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">{FIELD_LABELS.INVOICE}</dt>
                      <dd className="govuk-summary-list__value">
                        {invoiceNumber ? (
                          <a
                            href="#"
                            className="govuk-link"
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                // Calculate S3 key from invoice number
                                // invoiceNumber format: INV01/S3700004.pdf
                                const desnzRef = invoiceNumber.replace('.pdf', '').split('/')[1];
                                const s3Key = `Section-37/${applicationId}/invoice/INV01/${desnzRef}.pdf`;

                                await downloadS3FileOnSameTab(s3Key);
                              } catch (error) {
                                logger.error('Failed to download invoice:', error);
                              }
                            }}
                          >
                            {invoiceNumber}
                          </a>
                        ) : (
                          '-'
                        )}
                      </dd>
                    </div>
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">{FIELD_LABELS.TOTAL_AMOUNT}</dt>
                      <dd className="govuk-summary-list__value">
                        {paymentDetails.total_amount ||
                          (paymentDetails.amount
                            ? `£${(paymentDetails.amount / 100).toFixed(2)}`
                            : '£462.50')}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Withdraw application button - only show if user has withdraw permission */}
            {permissions?.canWithdraw && !permissions?.canEdit && (
              <div className="govuk-button-group">
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  data-module="govuk-button"
                  onClick={() => {
                    // Navigate to withdraw application page
                    // navigate(`${S37_BASE_URL}/${applicationId}/withdraw`);
                  }}
                >
                  {BUTTON_LABELS.WITHDRAW_APPLICATION}
                </button>
              </div>
            )}

            {/* Horizontal separator */}
            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
            {/* Applicant details summary card */}
            <h2 className="govuk-heading-m">{SECTION_HEADINGS.APPLICANT_DETAILS}</h2>
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">
                  {SECTION_HEADINGS.NETWORK_OPERATOR}
                </h2>

              </div>
              <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{FIELD_LABELS.APPLICANT_NAME}</dt>
                    <dd className="govuk-summary-list__value">
                      {networkOperatorDetails?.organisation_name || EMPTY_VALUE}
                    </dd>
                  </div>

                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {FIELD_LABELS.APPLICANT_CONTACT_NAME}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {networkOperatorDetails?.organisation_contact_name || EMPTY_VALUE}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{FIELD_LABELS.ADDRESS}</dt>
                    <dd className="govuk-summary-list__value">
                      {renderAddress([
                        networkOperatorDetails?.line1,
                        networkOperatorDetails?.line2,
                        networkOperatorDetails?.town_city,
                        networkOperatorDetails?.county,
                        networkOperatorDetails?.postcode,
                      ])}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{FIELD_LABELS.EMAIL}</dt>
                    <dd className="govuk-summary-list__value">
                      {networkOperatorDetails?.email ? (
                        <a
                          className="govuk-link"
                          href={`mailto:${networkOperatorDetails.email}`}
                        >
                          {networkOperatorDetails.email}
                        </a>
                      ) : (
                        EMPTY_VALUE
                      )}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{FIELD_LABELS.PHONE}</dt>
                    <dd className="govuk-summary-list__value">
                      {networkOperatorDetails?.phone || EMPTY_VALUE}
                    </dd>
                  </div>
                  {networkOperatorDetails?.additional_contact &&
                    networkOperatorDetails.additional_contact.trim().length >
                    0 && (
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {FIELD_LABELS.ADDITIONAL_CONTACTS}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          <ul className="govuk-list">
                            {networkOperatorDetails.additional_contact
                              .split(",")
                              .map((email) => email.trim())
                              .filter((email) => email.length > 0)
                              .map((email, idx) => (
                                <li key={idx}>
                                  <a
                                    className="govuk-link"
                                    href={`mailto:${email}`}
                                  >
                                    {email}
                                  </a>
                                </li>
                              ))}
                          </ul>
                        </dd>
                      </div>
                    )}

                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {FIELD_LABELS.OPERATOR_REF}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {networkOperatorDetails?.operator_ref || EMPTY_VALUE}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Project details summary card */}
            <h2 className="govuk-heading-m">{SECTION_HEADINGS.PROJECT_DETAILS}</h2>
            {/* Project overview summary card */}
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">{SECTION_HEADINGS.PROJECT_OVERVIEW}</h2>

              </div>
              <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{FIELD_LABELS.PROJECT_NAME}</dt>
                    <dd className="govuk-summary-list__value">
                      {projectDetails?.project_name || "-"}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{FIELD_LABELS.PROJECT_DESCRIPTION}</dt>
                    <dd className="govuk-summary-list__value">
                      {projectDetails?.project_description ||
                        projectDetails?.projectDescription ||
                        "-"}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{FIELD_LABELS.PLAN_REFERENCE}</dt>
                    <dd className="govuk-summary-list__value">
                      {projectDetails?.plan_reference || EMPTY_VALUE}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{FIELD_LABELS.EARLIEST_WORK_START}</dt>
                    <dd className="govuk-summary-list__value">
                      {projectDetails &&
                        projectDetails.earliest_work_start_date_month &&
                        projectDetails.earliest_work_start_date_year
                        ? `${projectDetails.earliest_work_start_date_month}/${projectDetails.earliest_work_start_date_year}`
                        : "-"}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{FIELD_LABELS.LATEST_WORK_START}</dt>
                    <dd className="govuk-summary-list__value">
                      {projectDetails &&
                        projectDetails.latest_work_start_date_month &&
                        projectDetails.latest_work_start_date_year
                        ? `${projectDetails.latest_work_start_date_month}/${projectDetails.latest_work_start_date_year}`
                        : "-"}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{FIELD_LABELS.MAX_STRUCTURE_HEIGHT}</dt>
                    <dd className="govuk-summary-list__value">
                      {projectDetails?.max_structure_height_m || "-"}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Last updated</dt>
                    <dd className="govuk-summary-list__value">
                      {projectDetails?.updated_at
                        ? new Date(
                          projectDetails.updated_at,
                        ).toLocaleDateString()
                        : "-"}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                    <dt className="govuk-summary-list__key">
                      {FIELD_LABELS.PLAN_INFO_DOCS}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      <ul className="govuk-list">
                        {planDocuments.length > 0 ? (
                          planDocuments.map((doc) => (
                            <li key={doc.document_id}>
                              <a
                                href="#"
                                className="govuk-link"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  // Use s3_key if available, otherwise file_id
                                  const key = doc.s3_key || doc.file_id;
                                  if (key) {
                                    try {
                                      await downloadS3FileOnSameTab(key);
                                    } catch (error) {
                                      logger.error('Failed to download file:', { error });
                                    }
                                  }
                                }}
                              >
                                {doc.title}
                              </a>
                              {doc.description && <> - {doc.description}</>}
                            </li>
                          ))
                        ) : (
                          <li>-</li>
                        )}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            {/* Assets summary card */}
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">{FIELD_LABELS.ASSET_INFORMATION}</h2>

              </div>
              <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                  {(projectDetails?.assetInformation &&
                    projectDetails.assetInformation.length > 0
                    ? projectDetails.assetInformation
                    : ([{}] as AssetInformation[])
                  ).map((asset, idx) => (
                    <React.Fragment key={asset.asset_id || idx}>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {FIELD_LABELS.STANDARD_SPEC_REF}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {asset.standard_specification_reference_number || "-"}
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {FIELD_LABELS.TYPE_OF_LINE}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {asset.type_of_line
                            ? asset.type_of_line.charAt(0).toUpperCase() +
                            asset.type_of_line.slice(1)
                            : "-"}
                        </dd>
                      </div>
                      {asset.type_of_line?.toLowerCase() === "transmission" && (
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">
                            {FIELD_LABELS.TORI_NOI_CODE}
                          </dt>
                          <dd className="govuk-summary-list__value">
                            {asset.tori_noi_code || "-"}
                          </dd>
                        </div>
                      )}
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {FIELD_LABELS.LINE_VOLTAGE}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {asset.line_voltage || "-"}
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">{FIELD_LABELS.LINE_LENGTH}</dt>
                        <dd className="govuk-summary-list__value">
                          {asset.line_length || "-"}
                        </dd>
                      </div>
                    </React.Fragment>
                  ))}
                </dl>
              </div>
            </div>

            {/* Works overview summary card - dynamic mapping and conditional questions */}
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">{SECTION_HEADINGS.WORKS_OVERVIEW}</h2>

              </div>
              <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                  {/* Adding or replacing poles */}
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {WORKS_OVERVIEW_QUESTIONS.ADDING_REPLACING_POLES}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {typeof worksOverview?.addingOrReplacingPoles ===
                        "boolean"
                        ? worksOverview.addingOrReplacingPoles
                          ? "Yes"
                          : "No"
                        : "-"}
                    </dd>
                  </div>
                  {worksOverview?.addingOrReplacingPoles && (
                    <>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {WORKS_OVERVIEW_QUESTIONS.POLE_MATERIAL}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {worksOverview?.poleMaterial || "-"}
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {WORKS_OVERVIEW_QUESTIONS.CHEMICAL_TREATMENTS}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {worksOverview?.chemicalTreatments || "-"}
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {WORKS_OVERVIEW_QUESTIONS.POLES_ADDED}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {typeof worksOverview?.polesAdded === "number"
                            ? worksOverview.polesAdded
                            : "-"}
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {WORKS_OVERVIEW_QUESTIONS.POLES_REPLACED}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {typeof worksOverview?.polesReplaced === "number"
                            ? worksOverview.polesReplaced
                            : "-"}
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {WORKS_OVERVIEW_QUESTIONS.POLE_COMMENTS}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {worksOverview?.poleComments || "-"}
                        </dd>
                      </div>
                    </>
                  )}
                  {/* Adding or replacing overhead lines */}
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {WORKS_OVERVIEW_QUESTIONS.ADDING_REPLACING_LINES}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {typeof worksOverview?.addingOrReplacingLines ===
                        "boolean"
                        ? worksOverview.addingOrReplacingLines
                          ? "Yes"
                          : "No"
                        : "-"}
                    </dd>
                  </div>
                  {worksOverview?.addingOrReplacingLines && (
                    <>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {WORKS_OVERVIEW_QUESTIONS.OVERHEAD_LINE_DESC}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {worksOverview?.overheadLineDescription || "-"}
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {WORKS_OVERVIEW_QUESTIONS.ESTIMATED_DURATION}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {worksOverview?.estimatedDuration || "-"}
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {WORKS_OVERVIEW_QUESTIONS.VEHICLES_REQUIRED}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {worksOverview?.vehiclesRequired || "-"}
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {WORKS_OVERVIEW_QUESTIONS.ROAD_CLOSURES}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {typeof worksOverview?.roadClosuresRequired ===
                            "boolean"
                            ? worksOverview.roadClosuresRequired
                              ? "Yes"
                              : "No"
                            : "-"}
                        </dd>
                      </div>
                    </>
                  )}
                  {/* Excavation works */}
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {WORKS_OVERVIEW_QUESTIONS.EXCAVATION_REQUIRED}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {typeof worksOverview?.excavationRequired === "boolean"
                        ? worksOverview.excavationRequired
                          ? "Yes"
                          : "No"
                        : "-"}
                    </dd>
                  </div>
                  {worksOverview?.excavationRequired && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">
                        {WORKS_OVERVIEW_QUESTIONS.EXCAVATION_DETAILS}
                      </dt>
                      <dd className="govuk-summary-list__value">
                        {worksOverview?.excavationDetails || "-"}
                      </dd>
                    </div>
                  )}
                  {/* Vegetation clearance */}
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {WORKS_OVERVIEW_QUESTIONS.VEGETATION_CLEARANCE}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {typeof worksOverview?.vegetationClearanceRequired ===
                        "boolean"
                        ? worksOverview.vegetationClearanceRequired
                          ? "Yes"
                          : "No"
                        : "-"}
                    </dd>
                  </div>
                  {worksOverview?.vegetationClearanceRequired && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">
                        {WORKS_OVERVIEW_QUESTIONS.VEGETATION_DETAILS}
                      </dt>
                      <dd className="govuk-summary-list__value">
                        {worksOverview?.vegetationClearanceDetails || "-"}
                      </dd>
                    </div>
                  )}
                  {/* Pre-existing access routes */}
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {WORKS_OVERVIEW_QUESTIONS.EXISTING_ACCESS_ROUTES}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {typeof worksOverview?.usingExistingAccessRoutes ===
                        "boolean"
                        ? worksOverview.usingExistingAccessRoutes
                          ? "Yes"
                          : "No"
                        : "-"}
                    </dd>
                  </div>
                  {worksOverview?.usingExistingAccessRoutes && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">
                        {WORKS_OVERVIEW_QUESTIONS.ACCESS_ROUTES_DETAILS}
                      </dt>
                      <dd className="govuk-summary-list__value">
                        {worksOverview?.accessRoutesDetails || "-"}
                      </dd>
                    </div>
                  )}
                  {/* Removing existing equipment */}
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {WORKS_OVERVIEW_QUESTIONS.REMOVING_EQUIPMENT}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {typeof worksOverview?.removingExistingEquipment ===
                        "boolean"
                        ? worksOverview.removingExistingEquipment
                          ? "Yes"
                          : "No"
                        : "-"}
                    </dd>
                  </div>
                  {worksOverview?.removingExistingEquipment && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">
                        {WORKS_OVERVIEW_QUESTIONS.REMOVAL_DESCRIPTION}
                      </dt>
                      <dd className="govuk-summary-list__value">
                        {worksOverview?.removalDescription || "-"}
                      </dd>
                    </div>
                  )}
                  {/* General comments */}
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {WORKS_OVERVIEW_QUESTIONS.GENERAL_COMMENTS}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {worksOverview?.generalComments || "-"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <h2 className="govuk-heading-m">{SECTION_HEADINGS.ROUTES}</h2>
            {/* Route map summary card*/}
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">{SECTION_HEADINGS.ROUTE_MAP}</h2>
              </div>
              <div className="govuk-summary-card__content">
                <div className="map-container">
                  <SensitiveAreaCheckMap
                    routes={transformedRoutes}
                    mode="overview"
                  />
                </div>
              </div>
            </div>
            {/* Route summary cards */}
            {routes.length > 0 ? (
              <>
                {routes.map((route, idx) => (
                  <div
                    className="govuk-summary-card"
                    key={route.route_id || idx}
                  >
                    <div className="govuk-summary-card__title-wrapper">
                      <h2 className="govuk-summary-card__title">{`Route ${String.fromCharCode(
                        65 + idx,
                      )}`}</h2>
                    </div>
                    <div className="govuk-summary-card__content">
                      <table className="govuk-table govuk-!-margin-bottom-6">
                        <thead className="govuk-table__head">
                          <tr className="govuk-table__row">
                            <th className="govuk-table__header">{FIELD_LABELS.EASTING}</th>
                            <th className="govuk-table__header">{FIELD_LABELS.NORTHING}</th>
                          </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                          {Array.isArray(route.gridPoints) &&
                            route.gridPoints.length > 0 ? (
                            route.gridPoints.map((point, pidx) => (
                              <tr
                                className="govuk-table__row"
                                key={point.point_id || pidx}
                              >
                                <td className="govuk-table__cell">
                                  {point.easting}
                                </td>
                                <td className="govuk-table__cell">
                                  {point.northing}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="govuk-table__row">
                              <td className="govuk-table__cell">-</td>
                              <td className="govuk-table__cell">-</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {route.disconnected_route_justification && (
                        <div className="govuk-inset-text">
                          <strong>{FIELD_LABELS.DISCONNECTED_JUSTIFICATION}:</strong>{" "}
                          {route.disconnected_route_justification}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="govuk-summary-card">
                <div className="govuk-summary-card__title-wrapper">
                  <h2 className="govuk-summary-card__title">{SECTION_HEADINGS.ROUTE}</h2>
                </div>
                <div className="govuk-summary-card__content">
                  <table className="govuk-table govuk-!-margin-bottom-6">
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th className="govuk-table__header">{FIELD_LABELS.EASTING}</th>
                        <th className="govuk-table__header">{FIELD_LABELS.NORTHING}</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      <tr className="govuk-table__row">
                        <td className="govuk-table__cell">-</td>
                        <td className="govuk-table__cell">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sensitive area check summary card */}
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">
                  {SECTION_HEADINGS.SENSITIVE_AREA_CHECK}
                </h2>
              </div>
              <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {FIELD_LABELS.TOLERANCE_REQUIRED}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {typeof sensitiveAreaChecks?.tolerance_required ===
                        "boolean"
                        ? sensitiveAreaChecks.tolerance_required
                          ? "Yes"
                          : "No"
                        : "-"}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Tolerance</dt>
                    <dd className="govuk-summary-list__value">
                      {typeof sensitiveAreaChecks?.tolerance_value === "number"
                        ? `${sensitiveAreaChecks.tolerance_value}m`
                        : "-"}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {FIELD_LABELS.SENSITIVE_AREAS}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      <ul className="govuk-list govuk-list--bullet">
                        {layers.length > 0 ? (
                          layers.map((layer, idx) => <li key={idx}>{layer}</li>)
                        ) : (
                          <li>-</li>
                        )}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            {/* Sensitive area review summary card */}
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">
                  {SECTION_HEADINGS.SENSITIVE_AREA_REVIEW}
                </h2>

              </div>
              <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {FIELD_LABELS.OTHER_AREAS}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {(() => {
                        const selectedLayers = sensitiveAreaReview?.manual?.selected || [];
                        const customAddedLayers = sensitiveAreaReview?.manual?.customAdded || [];
                        const allManualLayers = [...selectedLayers, ...customAddedLayers];

                        if (allManualLayers.length === 0) {
                          return "-";
                        }

                        // Get unique layer names
                        const uniqueLayerNames = Array.from(
                          new Set(allManualLayers.map(layer => layer.layerName).filter(Boolean))
                        );

                        return (
                          <ul className="govuk-list govuk-list--bullet">
                            {uniqueLayerNames.map((layerName, index) => (
                              <li key={index}>{layerName}</li>
                            ))}
                          </ul>
                        );
                      })()}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {FIELD_LABELS.ENV_ARCH_DOCS}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      <ul className="govuk-list">
                        {sensitiveAreaReview?.application_documents &&
                          sensitiveAreaReview.application_documents.length > 0 ? (
                          sensitiveAreaReview.application_documents.map((doc) => (
                            <li key={doc.document_id}>
                              <a
                                href="#"
                                className="govuk-link"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  // Use s3_key if available, otherwise file_id
                                  const key = doc.s3_key || doc.file_id;
                                  if (key) {
                                    try {
                                      await downloadS3FileOnSameTab(key);
                                    } catch (error) {
                                      logger.error('Failed to download file:', { error });
                                    }
                                  }
                                }}
                              >
                                {doc.title}
                              </a>
                            </li>
                          ))
                        ) : (
                          <li>-</li>
                        )}
                      </ul>
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {FIELD_LABELS.POLES_LINES_SENSITIVE}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {getAssetPresenceText(
                        sensitiveAreaReview?.asset_presence_option_id,
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Parishes summary card */}
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">{FIELD_LABELS.PARISHES}</h2>

              </div>
              <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                  {parishes.length > 0 ? (
                    parishes.map((parish, idx) => (
                      <div className="govuk-summary-list__row" key={parish.parish_code || idx}>
                        <dt className="govuk-summary-list__key">{FIELD_LABELS.PARISH}</dt>
                        <dd className="govuk-summary-list__value">{parish.parish_name}</dd>
                      </div>
                    ))
                  ) : (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">{FIELD_LABELS.PARISHES}</dt>
                      <dd className="govuk-summary-list__value">-</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>


            <h2 className="govuk-heading-m">{SECTION_HEADINGS.SUPPORTING_INFORMATION}</h2>
            {/* Supporting information summary card - fixed to use state variables and map correct questions/answers */}
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">
                  {SECTION_HEADINGS.SUPPORTING_INFORMATION}
                </h2>

              </div>
              <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {SUPPORTING_INFO_QUESTIONS.WAYLEAVES_OBTAINED}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {supportingQuestions &&
                        typeof supportingQuestions.wayleaves_obtained ===
                        "boolean"
                        ? supportingQuestions.wayleaves_obtained
                          ? "Yes"
                          : "No"
                        : "-"}
                    </dd>
                  </div>
                  {supportingQuestions &&
                    supportingQuestions.wayleaves_obtained === false && (
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {SUPPORTING_INFO_QUESTIONS.WAYLEAVES_REASON}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {supportingQuestions.wayleaves_not_obtained_reason ||
                            "-"}
                        </dd>
                      </div>
                    )}
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      I confirm that the works will comply with The Electricity
                      Safety, Quality and Continuity Regulations 2002
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {supportingQuestions &&
                        typeof supportingQuestions.esqcr_2002_compliance_confirmed ===
                        "boolean"
                        ? supportingQuestions.esqcr_2002_compliance_confirmed
                          ? "Yes"
                          : "No"
                        : "-"}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {SUPPORTING_INFO_QUESTIONS.ADDITIONAL_DOCS}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {supportingQuestions &&
                        typeof supportingQuestions.has_additional_supporting_documents ===
                        "boolean"
                        ? supportingQuestions.has_additional_supporting_documents
                          ? "Yes"
                          : "No"
                        : "-"}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {SUPPORTING_INFO_QUESTIONS.APPLICANT_COMMENTS}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {supportingQuestions?.applicant_supporting_comments ||
                        "-"}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
                    <dt className="govuk-summary-list__key">
                      {FIELD_LABELS.SUPPORTING_DOCS}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      <ul className="govuk-list">
                        {supportingDocuments.length > 0 ? (
                          supportingDocuments.map((doc) => (
                            <li key={doc.document_id}>
                              <a
                                href="#"
                                className="govuk-link"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  // Use s3_key if available, otherwise file_id
                                  const key = doc.s3_key || doc.file_id;
                                  if (key) {
                                    try {
                                      await downloadS3FileOnSameTab(key);
                                    } catch (error) {
                                      logger.error('Failed to download file:', { error });
                                    }
                                  }
                                }}
                              >
                                {doc.title}
                              </a>
                              {doc.description && <> - {doc.description}</>}
                            </li>
                          ))
                        ) : (
                          <li>-</li>
                        )}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            {/* EIA fees summary card - updated to use eiaFees from state */}
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">{SECTION_HEADINGS.EIA_FEES}</h2>

              </div>
              <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {EIA_QUESTIONS.REQUIRES_FULL_EIA}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {eiaFees &&
                        typeof eiaFees.is_eia_development !== "undefined"
                        ? eiaFees.is_eia_development
                          ? "Yes"
                          : "No"
                        : "-"}
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {EIA_QUESTIONS.SCREENING_ONLY}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {eiaFees &&
                        typeof eiaFees.is_eia_development !== "undefined" &&
                        !eiaFees.is_eia_development
                        ? "No"
                        : eiaFees &&
                          typeof eiaFees.screening_only !== "undefined"
                          ? eiaFees.screening_only
                            ? "Yes"
                            : "No"
                          : "-"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <h2 className="govuk-heading-m">{SECTION_HEADINGS.CONSULTATION}</h2>
            {consultations
              .filter(c => c.status === "Not required")
              .map((consultation, idx) => (
                <div className="govuk-summary-card" key={consultation.id || idx}>
                  <div className="govuk-summary-card__title-wrapper">
                    <h2 className="govuk-summary-card__title">
                      {consultation.consulteeOrganisationName || SECTION_HEADINGS.CONSULTATION}
                    </h2>
                  </div>
                  <div className="govuk-summary-card__content">
                    <dl className="govuk-summary-list">
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">{FIELD_LABELS.STATUS}</dt>
                        <dd className="govuk-summary-list__value">
                          <StatusBadge status={COMMON_TEXT.CLOSED} isConsultation={true} />
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">{FIELD_LABELS.DATE_CLOSED}</dt>
                        <dd className="govuk-summary-list__value">
                          {consultation.dateClosed
                            ? new Date(consultation.dateClosed).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
                            : "-"}
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {FIELD_LABELS.WHY_NOT_REQUIRED}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {consultation.notRequiredReason || "-"}
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">{FIELD_LABELS.SUPPORTING_DOCS}</dt>
                        <dd className="govuk-summary-list__value">
                          {consultation.notRequiredDocs && consultation.notRequiredDocs.length > 0 ? (
                            <ul className="govuk-list">
                              {consultation.notRequiredDocs.map((doc, i) => (
                                <li key={i}>
                                  <a
                                    href="#"
                                    className="govuk-link"
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      const key = doc.key || doc.url;
                                      try {
                                        await downloadS3FileOnSameTab(key);
                                      } catch (error) {
                                        // Optionally show error to user
                                        logger.error('Failed to download file:', { error });
                                      }
                                    }}
                                  >
                                    {doc.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : "-"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
            {/* Consultation cards - render one card per consultee organisation */}
            {(consultations.length > 0 ? consultations : [{}])
              .filter(c => c.status !== "Not required")
              .map((consultation, idx) => {
                // Determine if response was received
                const responseReceived = !!(
                  consultation.responseDocuments && consultation.responseDocuments.length > 0
                );
                const isPublicConsultation = consultation.consultationType === "PUBLIC";

                return (
                  <div className="govuk-summary-card" key={consultation.id || idx}>
                    <div className="govuk-summary-card__title-wrapper">
                      <h2 className="govuk-summary-card__title">
                        {consultation.consulteeOrganisationName || "Consultation"}
                      </h2>
                    </div>
                    <div className="govuk-summary-card__content">
                      <dl className="govuk-summary-list">
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">{FIELD_LABELS.CONSULTEE_STATUS}</dt>
                          <dd className="govuk-summary-list__value">
                            <StatusBadge 
                              status={consultation.status || ''} 
                              isConsultation={true}
                            />
                          </dd>
                        </div>

                        {/* PUBLIC consultation fields */}
                        {isPublicConsultation ? (
                          <>
                            {/* First date published */}
                            <div className="govuk-summary-list__row">
                              <dt className="govuk-summary-list__key">{FIELD_LABELS.FIRST_DATE_PUBLISHED}</dt>
                              <dd className="govuk-summary-list__value">
                                {consultation.firstDatePublished
                                  ? new Date(consultation.firstDatePublished).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric"
                                  })
                                  : "-"}
                              </dd>
                            </div>

                            {/* Second date published */}
                            <div className="govuk-summary-list__row">
                              <dt className="govuk-summary-list__key">{FIELD_LABELS.SECOND_DATE_PUBLISHED}</dt>
                              <dd className="govuk-summary-list__value">
                                {consultation.secondDatePublished
                                  ? new Date(consultation.secondDatePublished).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric"
                                  })
                                  : "-"}
                              </dd>
                            </div>

                            {/* Evidence of publication */}
                            <div className="govuk-summary-list__row">
                              <dt className="govuk-summary-list__key">{FIELD_LABELS.EVIDENCE_OF_PUBLICATION}</dt>
                              <dd className="govuk-summary-list__value">
                                {consultation.evidenceOfPublicationDocs &&
                                  consultation.evidenceOfPublicationDocs.length > 0 ? (
                                  <ul className="govuk-list">
                                    {consultation.evidenceOfPublicationDocs.map((doc, i) => (
                                      <li key={i}>
                                        <a
                                          href="#"
                                          className="govuk-link"
                                          onClick={async (e) => {
                                            e.preventDefault();
                                            const key = doc.url;
                                            try {
                                              await downloadS3FileOnSameTab(key);
                                            } catch (error) {
                                              logger.error('Failed to download file:', { error });
                                            }
                                          }}
                                        >
                                          {doc.name}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                ) : "-"}
                              </dd>
                            </div>

                            {/* Objection raised */}
                            <div className="govuk-summary-list__row">
                              <dt className="govuk-summary-list__key">{FIELD_LABELS.OBJECTION_RAISED}</dt>
                              <dd className="govuk-summary-list__value">
                                {typeof consultation.objectionRaised === "boolean"
                                  ? consultation.objectionRaised ? "Yes" : "No"
                                  : "-"}
                              </dd>
                            </div>

                            {/* Public response documents - only show if objection was raised */}
                            {consultation.objectionRaised && (
                            <div className="govuk-summary-list__row">
                              <dt className="govuk-summary-list__key">{FIELD_LABELS.PUBLIC_RESPONSE_DOCS}</dt>
                              <dd className="govuk-summary-list__value">
                                {consultation.publicResponseDocuments &&
                                  consultation.publicResponseDocuments.length > 0 ? (
                                  <ul className="govuk-list">
                                    {consultation.publicResponseDocuments.map((doc, i) => (
                                      <li key={i}>
                                        <a
                                          href="#"
                                          className="govuk-link"
                                          onClick={async (e) => {
                                            e.preventDefault();
                                            const key = doc.url;
                                            try {
                                              await downloadS3FileOnSameTab(key);
                                            } catch (error) {
                                              logger.error('Failed to download file:', { error });
                                            }
                                          }}
                                        >
                                          {doc.name}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                ) : "-"}
                              </dd>
                            </div>
                            )}

                            {/* Comments */}
                            <div className="govuk-summary-list__row">
                              <dt className="govuk-summary-list__key">{FIELD_LABELS.COMMENTS}</dt>
                              <dd className="govuk-summary-list__value">
                                {consultation.closeComments || "-"}
                              </dd>
                            </div>
                          </>
                        ) : (
                          /* Non-PUBLIC consultation fields - existing code */
                          <>
                            <div className="govuk-summary-list__row">
                              <dt className="govuk-summary-list__key">{FIELD_LABELS.DATE_CONSULTATION_REQUEST}</dt>
                              <dd className="govuk-summary-list__value">
                                {consultation.sentAt
                                  ? new Date(consultation.sentAt).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric"
                                  })
                                  : "-"}
                              </dd>
                            </div>

                            <div className="govuk-summary-list__row">
                              <dt className="govuk-summary-list__key">{FIELD_LABELS.EVIDENCE_REQUEST}</dt>
                              <dd className="govuk-summary-list__value">
                                {consultation.requestEvidenceDocuments &&
                                  consultation.requestEvidenceDocuments.length > 0 ? (
                                  <ul className="govuk-list">
                                    {consultation.requestEvidenceDocuments.map((doc, i) => (
                                      <li key={i}>
                                        <a
                                          href="#"
                                          className="govuk-link"
                                          onClick={async (e) => {
                                            e.preventDefault();
                                            const key = doc.url;
                                            try {
                                              await downloadS3FileOnSameTab(key);
                                            } catch (error) {
                                              logger.error('Failed to download file:', { error });
                                            }
                                          }}
                                        >
                                          {doc.name}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                ) : "-"}
                              </dd>
                            </div>

                            {responseReceived ? (
                              <>
                                <div className="govuk-summary-list__row">
                                  <dt className="govuk-summary-list__key">{FIELD_LABELS.CONSULTEE_CONTACT_NAME}</dt>
                                  <dd className="govuk-summary-list__value">
                                    {consultation.consulteeContactName || "-"}
                                  </dd>
                                </div>

                                <div className="govuk-summary-list__row">
                                  <dt className="govuk-summary-list__key">{FIELD_LABELS.CONSULTEE_CONTACT_EMAIL}</dt>
                                  <dd className="govuk-summary-list__value">
                                    {consultation.consulteeEmailAddress ? (
                                      <a href={`mailto:${consultation.consulteeEmailAddress}`}>
                                        {consultation.consulteeEmailAddress}
                                      </a>
                                    ) : "-"}
                                  </dd>
                                </div>

                                <div className="govuk-summary-list__row">
                                  <dt className="govuk-summary-list__key">{FIELD_LABELS.OBJECTION_RAISED}</dt>
                                  <dd className="govuk-summary-list__value">
                                    {typeof consultation.objectionRaised === "boolean"
                                      ? consultation.objectionRaised ? "Yes" : "No"
                                      : "-"}
                                  </dd>
                                </div>

                                <div className="govuk-summary-list__row">
                                  <dt className="govuk-summary-list__key">{FIELD_LABELS.DATE_CLOSED}</dt>
                                  <dd className="govuk-summary-list__value">
                                    {["Closed", "Completed"].includes(consultation.status ?? "") &&
                                      consultation.dateClosed
                                      ? new Date(consultation.dateClosed).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric"
                                      })
                                      : "-"}
                                  </dd>
                                </div>

                                <div className="govuk-summary-list__row">
                                  <dt className="govuk-summary-list__key">{FIELD_LABELS.RESPONSE_DOCS}</dt>
                                  <dd className="govuk-summary-list__value">
                                    {consultation.responseDocuments &&
                                      consultation.responseDocuments.length > 0 ? (
                                      <ul className="govuk-list">
                                        {consultation.responseDocuments.map((doc, i) => (
                                          <li key={i}>
                                            <a
                                              href="#"
                                              className="govuk-link"
                                              onClick={async (e) => {
                                                e.preventDefault();
                                                const key = doc.url;
                                                try {
                                                  await downloadS3FileOnSameTab(key);
                                                } catch (error) {
                                                  logger.error('Failed to download file:', error);
                                                }
                                              }}
                                            >
                                              {doc.name}
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : "-"}
                                  </dd>
                                </div>

                                <div className="govuk-summary-list__row">
                                  <dt className="govuk-summary-list__key">{FIELD_LABELS.CLOSE_COMMENTS}</dt>
                                  <dd className="govuk-summary-list__value">
                                    {consultation.closeComments || "-"}
                                  </dd>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="govuk-summary-list__row">
                                  <dt className="govuk-summary-list__key">{FIELD_LABELS.DATE_CLOSED}</dt>
                                  <dd className="govuk-summary-list__value">
                                    {["Closed", "Completed"].includes(consultation.status ?? "") &&
                                      consultation.dateClosed
                                      ? new Date(consultation.dateClosed).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric"
                                      })
                                      : "-"}
                                  </dd>
                                </div>

                                <div className="govuk-summary-list__row">
                                  <dt className="govuk-summary-list__key">{FIELD_LABELS.EVIDENCE_NOT_RECEIVED}</dt>
                                  <dd className="govuk-summary-list__value">
                                    {consultation.evidenceResponseNotReceivedDocs &&
                                      consultation.evidenceResponseNotReceivedDocs.length > 0 ? (
                                      <ul className="govuk-list">
                                        {consultation.evidenceResponseNotReceivedDocs.map((doc, i) => (
                                          <li key={i}>
                                            <a
                                              href="#"
                                              className="govuk-link"
                                              onClick={async (e) => {
                                                e.preventDefault();
                                                const key = doc.url;
                                                try {
                                                  await downloadS3FileOnSameTab(key);
                                                } catch (error) {
                                                  logger.error('Failed to download file:', { error });
                                                }
                                              }}
                                            >
                                              {doc.name}
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : "-"}
                                  </dd>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </dl>
                    </div>
                  </div>
                );
              })
            }
            <h2 className="govuk-heading-m">{SECTION_HEADINGS.POST_CONSULTATION}</h2>
            <div className="govuk-summary-card">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">{SECTION_HEADINGS.POST_CONSULTATION}</h2>

              </div>
              <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      {POST_CONSULTATION_QUESTIONS.LPA_CONDITIONS_IMPOSED}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {postConsultationOutcome?.lpa_conditions_imposed === true
                        ? "Yes"
                        : postConsultationOutcome?.lpa_conditions_imposed === false
                          ? "No"
                          : "-"}
                    </dd>
                  </div>
                  {postConsultationOutcome?.lpa_conditions_imposed === true && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">
                        {POST_CONSULTATION_QUESTIONS.LPA_CONDITIONS_ACCEPTED}
                      </dt>
                      <dd className="govuk-summary-list__value">
                        {postConsultationOutcome?.lpa_conditions_accepted === true
                          ? "Yes"
                          : postConsultationOutcome?.lpa_conditions_accepted === false
                            ? "No"
                            : "-"}
                      </dd>
                    </div>
                  )}

                  {postConsultationOutcome?.lpa_conditions_accepted === false && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">
                        {POST_CONSULTATION_QUESTIONS.LPA_CONDITIONS_REASON}
                      </dt>
                      <dd className="govuk-summary-list__value">
                        {postConsultationOutcome?.lpa_conditions_not_accepted_reason || "-"}
                      </dd>
                    </div>
                  )}

                  {/* ADD: lpa_conditions_accepted !== true */}
                  {postConsultationOutcome?.lpa_conditions_imposed !== false &&
                    postConsultationOutcome?.lpa_conditions_accepted !== true &&
                    postConsultationOutcome?.consultees_recommendations_made !== undefined &&
                    postConsultationOutcome?.consultees_recommendations_made !== null && (
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {POST_CONSULTATION_QUESTIONS.CONSULTEES_RECOMMENDATIONS}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {postConsultationOutcome?.consultees_recommendations_made === true
                            ? "Yes"
                            : postConsultationOutcome?.consultees_recommendations_made === false
                              ? "No"
                              : "-"}
                        </dd>
                      </div>
                    )}

                  {/* ADD: lpa_conditions_accepted !== true */}
                  {postConsultationOutcome?.lpa_conditions_imposed !== false &&
                    postConsultationOutcome?.lpa_conditions_accepted !== true &&
                    postConsultationOutcome?.consultees_recommendations_made === true && (
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {POST_CONSULTATION_QUESTIONS.CONSULTEES_ACCEPTED}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {postConsultationOutcome?.consultees_recommendations_accepted === true
                            ? "Yes"
                            : postConsultationOutcome?.consultees_recommendations_accepted === false
                              ? "No"
                              : "-"}
                        </dd>
                      </div>
                    )}

                  {/* ADD: lpa_conditions_accepted !== true */}
                  {postConsultationOutcome?.lpa_conditions_imposed !== false &&
                    postConsultationOutcome?.lpa_conditions_accepted !== true &&
                    postConsultationOutcome?.consultees_recommendations_accepted === false && (
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                          {POST_CONSULTATION_QUESTIONS.CONSULTEES_REASON}
                        </dt>
                        <dd className="govuk-summary-list__value">
                          {postConsultationOutcome?.consultees_recommendations_not_accepted_reason || "-"}
                        </dd>
                      </div>
                    )}
                </dl>
              </div>
            </div>

            {/* Submit application form */}
            {permissions?.canEdit && (
              <div
                className={`govuk-form-group${validationError ? " govuk-form-group--error" : ""}`}
              >
                <form onSubmit={handleSubmit} noValidate>
                  <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                      Submit application
                    </legend>
                    {validationError && (
                      <p
                        id="organisation-error"
                        className="govuk-error-message"
                      >
                        <span className="govuk-visually-hidden">Error:</span>{" "}
                        {validationError}
                      </p>
                    )}
                    {declarationError && (
                      <p id="declaration-error" className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error:</span>{" "}
                        {declarationError}
                      </p>
                    )}
                    <div
                      className="govuk-checkboxes govuk-checkboxes--small"
                      data-module="govuk-checkboxes"
                      data-govuk-checkboxes-init=""
                    >
                      <div className="govuk-checkboxes__item">
                        <input
                          className="govuk-checkboxes__input"
                          id="organisation"
                          name="organisation"
                          type="checkbox"
                          checked={declarationConfirmed}
                          onChange={(e) =>
                            handleDeclarationChange(e.target.checked)
                          }
                          aria-describedby={
                            validationError || declarationError
                              ? "organisation-error declaration-error"
                              : undefined
                          }
                        />
                        <label
                          className="govuk-label govuk-checkboxes__label"
                          htmlFor="organisation"
                        >
                          I confirm I’ve read and understood the information
                          I’ve provided, and that it’s accurate to the best of
                          my knowledge.
                        </label>
                      </div>
                    </div>
                  </fieldset>
                  <div>
                    <button
                      type="submit"
                      className="govuk-button"
                      data-module="govuk-button"
                      data-govuk-button-init
                      disabled={!allSectionsCompleted || !declarationConfirmed}
                    >
                      Pay and submit application
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicationSummary;