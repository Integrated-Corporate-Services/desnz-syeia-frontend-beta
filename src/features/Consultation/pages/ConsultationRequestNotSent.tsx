import React, { useEffect, useRef, useState } from "react";
import { S37_BASE_URL } from '../../../constants/s37';
import { Link, useParams, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useGetApplicationId } from "../../../hooks/useGetApplicationId";
import { useAuthUser } from "../../../hooks/useAuthUser";
import { getConsultationPack, saveConsultationPack } from "../../../services/consultationPackService";
import { PackSection, ConsultationPack } from '../../../types/consultationPack';
import { FILE_CATEGORIES, FILE_CATEGORY_LABELS } from '../../../constants/fileCategoryConstants';
import FileUpload from '../../../components/FileUpload';
import { CONSULTATION_SECTIONS } from '../../../constants/consultationSections';

const ConsultationRequestNotSent: React.FC = () => {
  const params = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  const consultationId = params.consultationId || searchParams.get("consultationId") || "";
  const consultationName = searchParams.get("consultationName") || "Consultation";
  
  const navigate = useNavigate();
  const tabsRef = useRef<HTMLDivElement>(null);

  const [consultationPack, setConsultationPack] = useState<any>(null);
  const [packSections, setPackSections] = useState<PackSection[]>([]);
  const [packDocuments, setPackDocuments] = useState<any[]>([]);
  const [selectAllSections, setSelectAllSections] = useState(false);
  const [selectAllDocuments, setSelectAllDocuments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch consultation pack on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!consultationId || !applicationId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getConsultationPack(consultationId, applicationId);
        setConsultationPack(data);
        
        if (data?.pack?.packSections) {
          setPackSections(data.pack.packSections);
        }
        if (data?.pack?.packDocuments) {
          setPackDocuments(data.pack.packDocuments);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load consultation pack');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [consultationId, applicationId]);

  const handleSave = async (validate: boolean) => {
    try {
      const packObj = {
        consultation: consultationPack?.consultation || { 
          id: consultationId, 
          applicationId 
        },
        pack: consultationPack?.pack || { 
          packId: '', 
          consultationId, 
          createdAt: '', 
          createdBy: user?.user_id || '', 
          lastUpdatedAt: '', 
          lastUpdatedBy: user?.user_id || '' 
        },
        packSections,
        packDocuments,
        uploadedFiles: consultationPack?.uploadedFiles || [],
        applicationDocuments: consultationPack?.applicationDocuments || [],
        appDocs: []
      };

      await saveConsultationPack(packObj);

      if (validate) {
        const consulteeid = consultationPack?.consultation?.default_email || "";
        const orgname = consultationPack?.consultation?.org_name || "";
        const queryParams = `?consulteeid=${encodeURIComponent(consulteeid)}&orgname=${encodeURIComponent(orgname)}`;
        navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/email-consultee${queryParams}`);
      } else {
        navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save');
    }
  };

  const handleSaveForLater = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave(false);
  };

// Find the handleSaveAndContinue function and update it:
const handleSaveAndContinue = () => {
    // Navigate directly to LPA Details page
    navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/lpa-details?consultationName=${encodeURIComponent(consultationName)}`);
};

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link to={`${S37_BASE_URL}/${applicationId}/task-list`} className="govuk-breadcrumbs__link">
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <Link to={`${S37_BASE_URL}/${applicationId}/consultation-details`} className="govuk-breadcrumbs__link">
              Manage consultation
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">
            Consultation request
          </li>
        </ol>
      </nav>

      <main id="main-content">
        <h2 className="govuk-caption-xl">
        {consultationPack?.consultation?.org_name || 'LPA'}
        </h2>
        <h1 className="govuk-heading-xl">
          Consultation form for electric overhead lines – Part 1
        </h1>

        {errorMessage && (
          <div className="govuk-error-summary">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                <li>{errorMessage}</li>
              </ul>
            </div>
          </div>
        )}

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-body">
              You must complete all the information on the following pages for an application to be made to the Secretary of State for Energy Security and Net Zero for:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>consent under section 37 of the Electricity Act 1989 to install or keep installed an electric line above ground</li>
              <li>a direction under section 90(2) of the Town and Country Planning Act 1990 that planning permission for the proposed development be deemed to be granted</li>
            </ul>

            <div className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Applicant organisation name</dt>
                <dd className="govuk-summary-list__value">
                  {consultationPack?.consultation?.applicant_organisation_name || '-'}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Applicant contact name</dt>
                <dd className="govuk-summary-list__value">
                  {consultationPack?.consultation?.applicant_contact_name || '-'}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Applicant reference</dt>
                <dd className="govuk-summary-list__value">
                  {consultationPack?.consultation?.applicant_reference || '-'}
                </dd>
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className="govuk-button" 
                onClick={handleSaveAndContinue}
              >
                Save and Continue
              </button>
              <button 
                type="button" 
                className="govuk-button govuk-button--secondary" 
                onClick={handleSaveForLater}
              >
                Save for later
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsultationRequestNotSent;