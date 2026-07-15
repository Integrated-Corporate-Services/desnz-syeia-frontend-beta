import React, { useEffect, useRef, useState } from "react";
import { S37_BASE_URL } from '../../../constants/s37';
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useGetApplicationId } from "../../../hooks/useGetApplicationId";
import { useAuthUser } from "../../../hooks/useAuthUser";
import { getConsultationPack, saveConsultationPack } from "../../../services/consultationPackService";
import { PackSection } from '../../../types/consultationPack';
import { updateFormMetadata, getFormMetadata} from "../../../services/consultationFormMetadataService";
import SkipLink from '../../../components/SkipLink'; 

const ConsultationRequestNotSent: React.FC = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  const consultationId = params.consultationId || searchParams.get("consultationId") || "";
  const consultationName = searchParams.get("consultationName") || "Consultation";
  
  const navigate = useNavigate();

  const [consultationPack, setConsultationPack] = useState<any>(null);
  const [packSections, setPackSections] = useState<PackSection[]>([]);
  const [packDocuments, setPackDocuments] = useState<any[]>([]);
  const [selectAllSections, setSelectAllSections] = useState(false);
  const [selectAllDocuments, setSelectAllDocuments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // ADD THIS STATE (same as LPADetailsPage)
  const [lpaName, setLpaName] = useState('');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ADD THIS useEffect 
  useEffect(() => {
    const fetchLPAName = async () => {
      try {
        if (!consultationId || !applicationId) return;
        
        const data = await getConsultationPack(consultationId, applicationId);
        
        // Set LPA name from consultation pack
        const name = data?.consultation?.org_name || consultationName || 'LPA';
        setLpaName(name);
     
      } catch (error) {
        console.error('Error fetching LPA name:', error);
      }
    };

    if (applicationId && consultationId) {
      fetchLPAName();
    }
  }, [applicationId, consultationId, consultationName]);

  // Fetch consultation pack on mount (KEEP YOUR EXISTING useEffect)
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

  // const handleSaveForLater = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   handleSave(false);
  // };
// NEW: Load existing Part 1 data on mount
useEffect(() => {
    const loadExistingData = async () => {
      try {
        if (!consultationId || !applicationId) return;
        
        const existingData = await getFormMetadata(applicationId, consultationId);
        
        // The applicant details are already populated from consultationPack
        // This is just for verification/future use
        
      } catch (error) {
        console.error('Error loading form metadata:', error);
      }
    };

    if (applicationId && consultationId) {
      loadExistingData();
    }
  }, [applicationId, consultationId]);

// Find the handleSaveAndContinue function and update it:
const handleSaveAndContinue = async () => {
  try {
    // Add validation to ensure we have applicant details
    const orgName = consultationPack?.consultation?.applicant_organisation_name;
    const contactName = consultationPack?.consultation?.applicant_contact_name;
    const reference = consultationPack?.consultation?.applicant_reference;
    
    // Fall back to application operator_ref if applicant_reference is null/empty
    const applicantReference = (reference && reference.trim()) 
      ? reference 
      : consultationPack?.application?.operator_ref || '';
    
    if (!orgName || !contactName) {
      console.error('Missing applicant details:', { orgName, contactName, reference, applicantReference });
      setErrorMessage('Applicant details are not available. Please refresh the page and try again.');
      return;
    }
    
    // Save Part 1 applicant details
    await updateFormMetadata(applicationId!, consultationId, {
      applicantOrganisationName: orgName,
      applicantContactName: contactName,
      applicantReference: applicantReference
    });
    
   
    
    // Navigate to proposed development Details page
    navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/proposed-development?consultationName=${encodeURIComponent(lpaName)}`);
  } catch (error) {
    console.error('Error saving form metadata:', error);
    setErrorMessage('Failed to save. Please try again.');
  }
};

  if (loading) return <div className="govuk-body">Loading...</div>;
  if (error) return <div className="govuk-error-message">Error: {error}</div>;

  return (
    <>
      <SkipLink />
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

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <h2 className="govuk-caption-xl govuk-!-margin-top-0">
        {lpaName}
        </h2>
        <h1 className="govuk-heading-l">
          Consultation form for electric overhead lines – Part 1
        </h1>

        {errorMessage && (
          <div className="govuk-error-summary govuk-!-width-two-thirds">
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

            <dl className="govuk-summary-list">
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
            </dl>

            <div className="govuk-button-group govuk-!-margin-top-6">
              <button 
                type="button" 
                className="govuk-button" 
                onClick={handleSaveAndContinue}
              >
                Save and Continue
              </button>
              {/* <button 
                type="button" 
                className="govuk-button govuk-button--secondary" 
                onClick={handleSaveForLater}
              >
                Save for later
              </button> */}
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default ConsultationRequestNotSent;