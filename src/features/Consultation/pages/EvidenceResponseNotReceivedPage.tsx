import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation} from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import FileUpload from '../../../components/FileUpload';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { fetchConsultationDetails } from '../../../services/consultationService';
import { useAuthUser } from '../../../hooks/useAuthUser';
interface EvidenceData {
  uploadedFiles: File[];
  declarationAccepted: boolean;
}

const EvidenceResponseNotReceivedPage: React.FC = () => {
  const navigate = useNavigate();
  const applicationId = useGetApplicationId();
  const { consultationId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const consultationName = searchParams.get('consultationName') || 'Consultee';
//   const [consultationName, setConsultationName] = useState<string>('');
    const { user } = useAuthUser();

  const [formData, setFormData] = useState<EvidenceData>({
    uploadedFiles: [],
    declarationAccepted: false,
  });

  const [uploadedFileObjs, setUploadedFileObjs] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Fetch existing evidence if available
    const fetchEvidenceData = async () => {
      try {
        // TODO: Implement API call to fetch existing evidence
        // const response = await fetch(`/api/applications/${applicationId}/consultation/${consultationId}/evidence-response-not-received`);
      } catch (error) {
        console.error('Error fetching evidence data:', error);
      }
    };

    if (applicationId && consultationId) {
      fetchEvidenceData();
    }
  }, [applicationId, consultationId]);

  useEffect(() => {
        async function fetchData() {
            if (consultationId) {
                try {
                    const data = await getConsultationResponse(consultationId, applicationId);
                    setComments(data.response_comments || '');
                    setResponseId(data.response_id || '');
                    // Fetch all consultations to get the organization name
                    const consultations = await fetchConsultationDetails(applicationId!, user?.user_id!);

                    // Check if consultations is an array or single object
                    const consultationsList = Array.isArray(consultations) ? consultations : [consultations];
                    const currentConsultation = consultationsList.find((c: any) => c.id === consultationId);

                    if (currentConsultation) {
                        const orgName = currentConsultation.consulteeOrganisationName || currentConsultation.otherConsultee || 'Consultation';
                        setConsultationName(orgName);
                    }
                } catch (err) {
                    console.error('Error fetching consultation response:', err);
                }
            }
        }
        fetchData();
    }, [consultationId, applicationId, user?.user_id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (uploadedFileObjs.length === 0) {
      newErrors.files = 'You must upload at least one document showing follow-up emails';
    }

    if (!formData.declarationAccepted) {
      newErrors.declaration = 'You must confirm you have provided all relevant information';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: files
    }));

    // Create file objects for display
    const fileObjects = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      file,
      uploadedAt: new Date().toISOString()
    }));

    setUploadedFileObjs(prev => [...prev, ...fileObjects]);

    // Clear file error
    if (errors.files) {
      setErrors(prev => ({
        ...prev,
        files: ''
      }));
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setUploadedFileObjs(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDeclarationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      declarationAccepted: e.target.checked
    }));

    // Clear declaration error
    if (errors.declaration) {
      setErrors(prev => ({
        ...prev,
        declaration: ''
      }));
    }
  };

  const handleCloseConsultation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to save evidence and close consultation
      // const formDataToSend = new FormData();
      // formDataToSend.append('declarationAccepted', String(formData.declarationAccepted));
      // uploadedFileObjs.forEach((fileObj, index) => {
      //   formDataToSend.append(`files`, fileObj.file);
      // });

      // const response = await fetch(`/api/applications/${applicationId}/consultation/${consultationId}/evidence-response-not-received`, {
      //   method: 'POST',
      //   body: formDataToSend
      // });

      // Navigate to consultation details or next step
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (error) {
      console.error('Error saving evidence:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save evidence. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForLater = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // TODO: Implement API call to save evidence for later
      // Navigate back to consultation details
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (error) {
      console.error('Error saving evidence:', error);
    } finally {
      setLoading(false);
    }
  };

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
              Provide evidence of response not received
            </li>
          </ol>
        </nav>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
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

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {/* Organization Name */}
            <p className="govuk-body govuk-!-margin-bottom-7">
              <strong>{consultationName}</strong>
            </p>

            {/* Page Heading */}
            <h1 className="govuk-heading-l">
              Provide evidence of response not received
            </h1>

            {/* Info Box */}
            <p className="govuk-body">
               If the consultee has not responded within 2 months after you sent the request, you may be able to complete your application without uploading their response.
            </p>

            {/* Description */}
            <p className="govuk-body">
              You must provide copies of any follow-up or emails you sent to the consultee. You will be able to complete your application after you have uploaded this evidence.
            </p>

            {/* Form */}
            <form onSubmit={handleCloseConsultation}>
              {/* Documents Uploaded Section */}
              <div className="govuk-form-group">
                <h2 className="govuk-heading-m">Documents uploaded</h2>
                
                {uploadedFileObjs.length > 0 ? (
                  <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
                    {uploadedFileObjs.map((fileObj) => (
                      <li key={fileObj.id} className="govuk-!-margin-bottom-3">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <a href="#" className="govuk-link">
                            {fileObj.name}
                          </a>
                          <a 
                            href="#"
                            className="govuk-link govuk-link--no-visited-state"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteFile(fileObj.id);
                            }}
                          >
                            Delete
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {/* File Upload */}
              <div className={`govuk-form-group ${errors.files ? 'govuk-form-group--error' : ''}`}>
                <label htmlFor="fileUpload" className="govuk-label govuk-label--m">
                  Upload a document that shows follow-up emails
                </label>
                <p className="govuk-body govuk-!-margin-bottom-4">
                  You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, and .xlsx files of up to 25MB each. Files cannot be password protected.
                </p>

                {errors.files && (
                  <p id="fileUpload-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.files}
                  </p>
                )}

                <div className="govuk-form-group">
                  <FileUpload
                    onFilesUploaded={handleFileUpload}
                    acceptedFormats=".pdf,.jpg,.jpeg,.png,.msg,.doc,.docx,.xls,.xlsx"
                    maxFileSize={25 * 1024 * 1024} // 25MB
                    allowMultiple={true}
                  />
                </div>
              </div>

              {/* Declaration */}
              <div className={`govuk-form-group ${errors.declaration ? 'govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset">
                  <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                    <div className="govuk-checkboxes__item">
                      <input
                        className="govuk-checkboxes__input"
                        id="declaration"
                        name="declaration"
                        type="checkbox"
                        checked={formData.declarationAccepted}
                        onChange={handleDeclarationChange}
                        aria-describedby={errors.declaration ? 'declaration-error' : undefined}
                      />
                      <label className="govuk-label govuk-checkboxes__label" htmlFor="declaration">
                        Confirm you have provided all relevant information, uploaded all supporting documents and want to close this consultation. You cannot undo this action.
                      </label>
                    </div>
                  </div>
                  {errors.declaration && (
                    <p id="declaration-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {errors.declaration}
                    </p>
                  )}
                </fieldset>
              </div>

              {/* Buttons */}
              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button govuk-button--primary"
                  disabled={loading}
                >
                  {loading ? 'Closing consultation...' : 'Close consultation'}
                </button>
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
                  disabled={loading}
                >
                  Save for later
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EvidenceResponseNotReceivedPage;