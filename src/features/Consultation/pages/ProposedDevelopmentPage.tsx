import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { buildBackendUrl } from '../../../utils/apiConfig';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { getConsultationPack } from '../../../services/consultationPackService';
import { getProposedDevelopment, saveProposedDevelopment } from '../../../services/consultationProposedDevelopmentService';
import { markConsultationAsRequestSent } from '../../../services/consultationService';
import { CONSULTATION_VALIDATION_MESSAGES } from '../../../constants/consultationValidationMessages';
import { isWithinCharacterLimit } from '../../../utils/validation';
import { createLogger } from '../../../utils/logger';

const log = createLogger('ProposedDevelopmentPage');

interface ProposedDevelopmentData {
  projectDescription: string;
  representationsObjections: string;
  complianceDetails: string;
}

const ProposedDevelopmentPage: React.FC = () => {
  const navigate = useNavigate();
  const applicationId = useGetApplicationId();
  const { consultationId } = useParams();
  const { user } = useAuthUser();

  const [searchParams] = useSearchParams();
  const consultationName = searchParams.get('consultationName') || '';
  
  const [formData, setFormData] = useState<ProposedDevelopmentData>({
    projectDescription: '',
    representationsObjections: '',
    complianceDetails: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lpaName, setLpaName] = useState('');

  useEffect(() => {
    const fetchProposedDevelopment = async () => {
      try {
        if (!consultationId || !applicationId) return;
        
        const data = await getConsultationPack(consultationId, applicationId);
        const name = data?.consultation?.org_name || consultationName || 'LPA';
        setLpaName(name);
        
        // Fetch existing proposed development data
        const existingData = await getProposedDevelopment(applicationId, consultationId);
        if (existingData) {
          setFormData(existingData);
        } else {
          // If no saved data, pre-populate from project overview
          try {
            const projectResponse = await fetch(buildBackendUrl(`/backend/api/project/${applicationId}`), {
              credentials: 'include'
            });
            if (projectResponse.ok) {
              const projectData = await projectResponse.json();
              const projectDescription = projectData?.projectDescription || projectData?.project_description || '';
              
              if (projectDescription) {
                setFormData(prev => ({
                  ...prev,
                  projectDescription: projectDescription
                }));
              }
            }
          } catch (projectError) {
            log.error('Error fetching project overview:', projectError);
          }
        }
        
        log.debug('=== PROPOSED DEVELOPMENT PAGE ===');
        log.debug('LPA Name:', name);
        log.debug('Existing Data:', existingData);
        log.debug('=================================');
        
      } catch (error) {
        log.error('Error fetching proposed development:', error);
      }
    };

    if (applicationId && consultationId) {
      fetchProposedDevelopment();
    }
  }, [applicationId, consultationId, consultationName]);

  useEffect(() => {
    setErrors({});
    setSubmitError('');
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = CONSULTATION_VALIDATION_MESSAGES.projectDescription.empty;
    } else if (!isWithinCharacterLimit(formData.projectDescription, 4000)) {
      newErrors.projectDescription = CONSULTATION_VALIDATION_MESSAGES.projectDescription.characterLimit;
    }

    if (!formData.representationsObjections.trim()) {
      newErrors.representationsObjections = CONSULTATION_VALIDATION_MESSAGES.representationsObjections.empty;
    } else if (!isWithinCharacterLimit(formData.representationsObjections, 4000)) {
      newErrors.representationsObjections = CONSULTATION_VALIDATION_MESSAGES.representationsObjections.characterLimit;
    }

    if (!formData.complianceDetails.trim()) {
      newErrors.complianceDetails = CONSULTATION_VALIDATION_MESSAGES.complianceDetails.empty;
    } else if (!isWithinCharacterLimit(formData.complianceDetails, 4000)) {
      newErrors.complianceDetails = CONSULTATION_VALIDATION_MESSAGES.complianceDetails.characterLimit;
    }

    setErrors(newErrors);
    setSubmitError('');
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
  if (errors[name]) {
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  }
  setSubmitted(false); 
};

const handleSaveAndContinue = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitted(true);

  if (!validateForm()) {
    return;
  }

  setLoading(true);
  setSubmitError('');
  try {
    await saveProposedDevelopment(applicationId!, consultationId!, formData);
   // await markConsultationAsRequestSent(consultationId!);

    setErrors({});
    setSubmitError('');
    setSubmitted(false); // Reset after successful submit
    navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/download-form?consultationName=${encodeURIComponent(lpaName)}`);
  } catch (error) {
    log.error('Error saving proposed development:', error);
    setErrors({});
    setSubmitError('Failed to save proposed development details. Please try again.');
  } finally {
    setLoading(false);
  }
};
  // const handleSaveForLater = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   setLoading(true);
  //   try {
  //     // NEW: Save proposed development to database
  //     if (formData.projectDescription || formData.representationsObjections || formData.complianceDetails) {
  //       await saveProposedDevelopment(applicationId!, consultationId!, formData);
  //     }
      
  //     navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
  //   } catch (error) {
  //     log.error('Error saving proposed development:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        {/* Breadcrumbs */}
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item">
              <Link 
                className="govuk-breadcrumbs__link" 
                to={`${S37_BASE_URL}/${applicationId}/task-list`}
              >
                Task list
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item">
              <Link 
                className="govuk-breadcrumbs__link" 
                to={`${S37_BASE_URL}/${applicationId}/consultation-details`}
              >
                Manage consultation
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="page">
              Proposed development
            </li>
          </ol>
        </nav>

        {/* Error Summary for field errors */}
        {submitted && Object.values(errors).some(Boolean) && (
          <div
            className="govuk-error-summary"
            role="alert"
            aria-labelledby="error-summary-title"
            tabIndex={-1}
          >
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key}>
                    <a href={`#${key}`}>{message}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Submit/Backend error */}
        {submitError && Object.keys(errors).length === 0 && (
          <div className="govuk-error-summary" role="alert" tabIndex={-1}>
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p>{submitError}</p>
            </div>
          </div>
        )}

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-caption-xl">
              <strong>{lpaName}</strong>
            </h2>

            <h1 className="govuk-heading-l">
              Proposed development
            </h1>

            <form onSubmit={handleSaveAndContinue}>
              <div className={`govuk-form-group ${errors.projectDescription ? 'govuk-form-group--error' : ''}`}>
                <label htmlFor="projectDescription" className="govuk-label govuk-label--m">
                  Describe the proposed development
                </label>
                <p className="govuk-body govuk-!-margin-bottom-4">
                  You will be able to choose which sections of the application to include in this request on the next page.
                </p>
                {errors.projectDescription && (
                  <p id="projectDescription-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.projectDescription}
                  </p>
                )}
                <textarea
                  className={`govuk-textarea ${errors.projectDescription ? 'govuk-textarea--error' : ''}`}
                  id="projectDescription"
                  name="projectDescription"
                  rows={8}
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  aria-describedby={errors.projectDescription ? 'projectDescription-error' : undefined}
                  placeholder="Pre-populated of description of the project (editable)"
                />
              </div>

              <div className={`govuk-form-group ${errors.representationsObjections ? 'govuk-form-group--error' : ''}`}>
                <label htmlFor="representationsObjections" className="govuk-label govuk-label--m">
                  Describe any representations or objections received prior to this application submission
                </label>
                <p className="govuk-body govuk-!-margin-bottom-4">
                  You can upload supporting documents on the next pages.
                </p>
                {errors.representationsObjections && (
                  <p id="representationsObjections-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.representationsObjections}
                  </p>
                )}
                <textarea
                  className={`govuk-textarea ${errors.representationsObjections ? 'govuk-textarea--error' : ''}`}
                  id="representationsObjections"
                  name="representationsObjections"
                  rows={8}
                  value={formData.representationsObjections}
                  onChange={handleInputChange}
                  aria-describedby={errors.representationsObjections ? 'representationsObjections-error' : undefined}
                />
              </div>

              <div className={`govuk-form-group ${errors.complianceDetails ? 'govuk-form-group--error' : ''}`}>
                <label htmlFor="complianceDetails" className="govuk-label govuk-label--m">
                  Provide details of the applicant's compliance with their duty as specified under{' '}
                  <a 
                    href="https://www.legislation.gov.uk/ukpga/1989/27/schedule/9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="govuk-link"
                  >
                    paragraph 1 of Schedule 9 to the Electricity Act 1989
                  </a>
                </label>
                <p className="govuk-body govuk-!-margin-bottom-4">
                  You must list the sections or documents within this application that include the measures to comply with this requirement.
                </p>
                {errors.complianceDetails && (
                  <p id="complianceDetails-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.complianceDetails}
                  </p>
                )}
                <textarea
                  className={`govuk-textarea ${errors.complianceDetails ? 'govuk-textarea--error' : ''}`}
                  id="complianceDetails"
                  name="complianceDetails"
                  rows={8}
                  value={formData.complianceDetails}
                  onChange={handleInputChange}
                  aria-describedby={errors.complianceDetails ? 'complianceDetails-error' : undefined}
                />
              </div>

              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save and continue'}
                </button>
                {/* <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
                  disabled={loading}
                >
                  Save for later
                </button> */}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProposedDevelopmentPage;