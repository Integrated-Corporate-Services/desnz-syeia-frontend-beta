import React, { useEffect, useRef, useState } from "react";
import { S37_BASE_URL } from '../../../constants/s37';
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useGetApplicationId } from "../../../hooks/useGetApplicationId";
import { useAuthUser } from "../../../hooks/useAuthUser";
import { getConsultationPack ,saveConsultationPack} from "../../../services/consultationPackService";
import { PackSection, ConsultationPack } from '../../../types/consultationPack';
import { FILE_CATEGORIES, FILE_CATEGORY_LABELS } from '../../../constants/fileCategoryConstants';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import { CONSULTATION_SECTIONS } from '../../../constants/consultationSections';
import log from '../../../logger';
import SkipLink from '../../../components/SkipLink';

const consulteeApplicationInfo: React.FC = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  const [consultationPack, setConsultationPack] = useState<any>(null);
  const [packSections, setPackSections] = useState<PackSection[]>([]);
  const [packDocuments, setPackDocuments] = useState<any[]>([]);
  const [selectAllSections, setSelectAllSections] = useState(false);
  const [selectAllDocuments, setSelectAllDocuments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  // Read consultationId from path params if available, fallback to query param
  const consultationId = params.consultationId || searchParams.get("consultationId") || "";
  const consultationName = searchParams.get("consultationName") || "";
  const navigate = useNavigate();
  const tabsRef = useRef<HTMLDivElement>(null);
  const fileUploadRef = useRef<FileUploadHandle>(null);

// Scroll to top on mount
useEffect(() => {
  window.scrollTo(0, 0);
}, []);

// Add GOV.UK tabs JS initialization to the main component
useEffect(() => {
  if (window?.GOVUKFrontend && typeof window.GOVUKFrontend.initAll === "function") {
    window.GOVUKFrontend.initAll();
  }
}, []);
  // Document checkbox handler
  function handleDocumentSelect(documentId: string) {
    setPackDocuments(prevDocs => {
      const updated = prevDocs.map(doc =>
        doc.documentId === documentId ? { ...doc, include: !doc.include } : doc
      );
      setSelectAllDocuments(updated.length > 0 && updated.every(d => d.include));
      return updated;
    });
  }

  useEffect(() => {
    log.debug('consultationId:', consultationId, 'applicationId:', applicationId);
    // Fetch consultation pack details only when both IDs are present
    const fetchPack = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getConsultationPack(consultationId, applicationId);
        setConsultationPack(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    if (consultationId && applicationId) fetchPack();
  }, [consultationId, applicationId]);

  useEffect(() => {
    if (!loading && consultationPack) {
      // --- Preserve user selection for packSections ---
      let initialSections: PackSection[] = [];
      if (!consultationPack.packSections || consultationPack.packSections.length === 0) {
        initialSections = CONSULTATION_SECTIONS.map((sectionKey: string, idx: number) => ({
          packSectionId: '',
          packId: consultationPack.pack?.packId || '',
          sectionKey,
          include: false,
          mandatory: false,
          sortOrder: idx + 1,
          createdAt: '',
          createdBy: user?.user_id || '',
          lastUpdatedAt: '',
          lastUpdatedBy: user?.user_id || '',
        }));
      } else {
        initialSections = consultationPack.packSections;
      }
      // Merge with previous packSections to preserve user selection
      setPackSections(prevSections =>
        initialSections.map(section => {
          const prev = prevSections.find(s => s.sectionKey === section.sectionKey);
          return prev ? { ...section, include: prev.include, mandatory: prev.mandatory } : section;
        })
      );

      // --- Preserve user selection for packDocuments ---
      let combinedPackDocuments: any[] = [];
      if (
        consultationPack.appDocs &&
        consultationPack.appDocs.length > 0
      ) {
        const newPackDocuments = consultationPack.appDocs.map((doc: any) => ({
          packDocumentId: '',
          packId: consultationPack.pack?.packId || '',
          documentId: doc.document_id || doc.documentId,
          documentTitle: doc.title || '',
          documentCategory: doc.category || '',
          include: false,
          sortOrder: 1,
          createdAt: '',
          createdBy: user?.user_id || '',
          lastUpdatedAt: '',
          lastUpdatedBy: user?.user_id || '',
          uploadedFile: null,
          applicationDocument: null,
        }));
        combinedPackDocuments = [...newPackDocuments];
      }
      if (consultationPack.packDocuments && consultationPack.packDocuments.length > 0) {
        combinedPackDocuments = [
          ...combinedPackDocuments,
          ...consultationPack.packDocuments
        ];
      }
      // Merge with previous packDocuments to preserve user selection
      setPackDocuments(prevDocs =>
        combinedPackDocuments.map(doc => {
          const prev = prevDocs.find(d => d.documentId === doc.documentId);
          return prev ? { ...doc, include: prev.include } : doc;
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, consultationPack, user]);

  const handleSectionCheckboxChange = (idx: number) => {
    setPackSections((prev) => {
      const updated = prev.map((section, i) =>
        i === idx
          ? { ...section, include: !section.include, mandatory: !section.include ? true : false }
          : section
      );
      setSelectAllSections(updated.every(s => s.include));
      return updated;
    });
  };

  const handleSelectAllSections = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAllSections(checked);
    setPackSections(prev => prev.map(section => ({ ...section, include: checked, mandatory: checked ? true : section.mandatory })));
  };

  const handleSelectAllDocuments = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAllDocuments(checked);
    setPackDocuments(prev => prev.map(doc => ({ ...doc, include: checked })));
  };

  const handleSave = async (validate: boolean) => {
    if (fileUploadRef.current?.isBusy()) {
      const scanInProgressMessage = 'File scan is in progress. Wait for the scan to finish before continuing.';
      setErrorMessage(scanInProgressMessage);
      setTimeout(() => {
        setErrorMessage(prev => (prev === scanInProgressMessage) ? null : prev);
      }, 6000);
      return;
    }
    if (validate && !packSections.some(section => section.include)) {
      setErrorMessage('You must select at least one section to continue.');
      return;
    }
    setErrorMessage(null);
    // Sort packSections by CONSULTATION_SECTIONS order before saving
    const sortedPackSections = [...packSections].sort((a, b) =>
      CONSULTATION_SECTIONS.indexOf(a.sectionKey) - CONSULTATION_SECTIONS.indexOf(b.sectionKey)
    ).map((section, idx) => ({ ...section, sortOrder: idx + 1 }));
    const packObj: ConsultationPack = {
      consultation: consultationPack?.consultation || { id: consultationId, applicationId },
      pack: consultationPack?.pack || { packId: '', consultationId, createdAt: '', createdBy: user?.user_id || '', lastUpdatedAt: '', lastUpdatedBy: user?.user_id || '' },
      packSections: sortedPackSections,
      packDocuments,
      uploadedFiles: consultationPack?.uploadedFiles || [],
      applicationDocuments: consultationPack?.applicationDocuments || [],
      appDocs:  []
    };
    try {
      await saveConsultationPack(packObj);
      if (validate) {
        // Only pass the email address and org name as query params
        const consulteeid = consultationPack?.consultation?.default_email || "";
        const orgname = consultationPack?.consultation?.org_name || "";
        const queryParams = `?consulteeid=${encodeURIComponent(consulteeid)}&orgname=${encodeURIComponent(orgname)}`;
        navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/email-consultee${queryParams}`);
      } else {
        navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save');
    }
  };

  const handleSaveAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave(true);
  };

  // File validation handlers
  const handleFileValidationErrors = (errors: string[]) => {
    setFileValidationErrors(errors);
  };

  // Handle file deletion
  const handleDeleteFile = (fileId: string) => {
    setConsultationPack((prev: any) => ({
      ...prev,
      uploadedFiles: prev?.uploadedFiles?.filter((file: any) => file.id !== fileId) || [],
      applicationDocuments: prev?.applicationDocuments?.filter((doc: any) => doc.fileId !== fileId) || []
    }));
  };

  const handleErrorClick = (event: React.MouseEvent, errorType: string) => {
    event.preventDefault();
    if (errorType.includes('file')) {
      // Focus on file upload section using its ID
      const fileUploadElement = document.getElementById('file-upload');
      if (fileUploadElement) {
        fileUploadElement.focus();
        fileUploadElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

 

  
  if (loading) return <div className="govuk-body" role="status" aria-live="polite">Loading...</div>;
  if (error) return <div>Error: {error}</div>;

 

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link
              to={`${S37_BASE_URL}/${applicationId}/task-list`}
              className="govuk-breadcrumbs__link"
            >
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <Link
              to={`${S37_BASE_URL}/${applicationId}/consultation-details`}
              className="govuk-breadcrumbs__link"
            >
              Manage consultation
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">
            Application details
          </li>
        </ol>
      </nav>
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-three-quarters">

            <h2 className="govuk-caption-l">{consultationName || "Consultation name"}</h2>
            <h2 className="govuk-heading-xl">Share application details</h2>
            <p className="govuk-body">
              Select and review the details you want to share with the consultant.
            </p>
            
            {/* Error Summary */}
            {(errorMessage || fileValidationErrors.length > 0) && (
              <div className="govuk-error-summary govuk-!-width-two-thirds" aria-labelledby="error-summary-title" role="alert" aria-live="assertive" aria-atomic="true" data-module="govuk-error-summary">
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    {errorMessage && (
                      <li>
                        <span>{errorMessage}</span>
                      </li>
                    )}
                    {fileValidationErrors.map((error, index) => (
                      <li key={index}>
                        <a href="#file-upload" onClick={(e) => handleErrorClick(e, 'file')}>
                          {error}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="govuk-tabs" data-module="govuk-tabs" ref={tabsRef}>
              <h2 className="govuk-tabs__title">Contents</h2>
              <ul className="govuk-tabs__list">
                <li className="govuk-tabs__list-item govuk-tabs__list-item--selected">
                  <a
                    className="govuk-tabs__tab"
                    href="#details"
                    id="tab-details"
                  >
                    Details
                  </a>
                </li>
                <li className="govuk-tabs__list-item">
                  <a
                    className="govuk-tabs__tab"
                    href="#documents"
                    id="tab-documents"
                  >
                    Documents
                  </a>
                </li>
              </ul>
              <div
                className="govuk-tabs__panel"
                id="details"
                aria-labelledby="tab-details"
              >
                <h2 className="govuk-heading-l">Application detail overview</h2>
                <div className="govuk-card">
                  <div className="govuk-card__content">
                    <div className="govuk-fieldset">
                      <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                        Field details only
                      </legend>
                      <p className="govuk-body">
                        Choose the information and documents you want to share with
                        the consultant.
                      </p>
                      <table className="govuk-table">
                        <thead>
                         <tr >
                              <th className="govuk-table__cell" style={{ textAlign: 'center', padding: '2px 4px' }}>
                                <div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                  <div className="govuk-checkboxes__item" style={{ display: 'flex', alignItems: 'center', gap: '100px', margin: 0 }}>
                                <input
                                    className="govuk-checkboxes__input"
                                    id="select-all-sections"
                                    name="select-all-sections"
                                    type="checkbox"
                                    checked={selectAllSections}
                                    onChange={handleSelectAllSections}
                                  />
                                    <label className="govuk-checkboxes__label govuk-!-margin-bottom-0 govuk-!-text-align-left" htmlFor="select-all-sections" style={{ marginLeft: '8px', whiteSpace: 'nowrap', minWidth: '220px', textAlign: 'left' }}>
                                    Sections
                                  </label>
                                </div>
                              </div>
                            </th>
                            
                          </tr>
                          
                        </thead>
                        <tbody>
                          {packSections.map((section, idx) => (
                            <tr key={section.sortOrder} className="govuk-table__row" style={{ height: '28px' }}>
                              <td className="govuk-table__cell" style={{ textAlign: 'center', padding: '2px 4px' }}>
                                <div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                  <div className="govuk-checkboxes__item" style={{ display: 'flex', alignItems: 'center', gap: '100px', margin: 0 }}>
                                    <input
                                      className="govuk-checkboxes__input"
                                      id={`section-${idx}`}
                                      name={`section-${idx}`}
                                      type="checkbox"
                                      checked={section.include}
                                      onChange={() => handleSectionCheckboxChange(idx)}
                                    />
                                    <label className="govuk-checkboxes__label govuk-!-margin-bottom-0 govuk-!-text-align-left" htmlFor={`section-${idx}`} style={{ marginLeft: '8px', whiteSpace: 'nowrap', minWidth: '220px', textAlign: 'left' }}>
                                      {section.sectionKey}
                                    </label>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="govuk-tabs__panel govuk-tabs__panel--hidden"
                id="documents"
                aria-labelledby="tab-documents"
              >
                <h2 className="govuk-heading-l">Documents by section</h2>
                   <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                        Field details only
                      </legend>
                <p className="govuk-body">
                  Choose the information and documents you want to share with the consultant.
                </p>
                <table className="govuk-table">
                  <thead>
                    <tr>
                    <th className="govuk-table__header" style={{ textAlign: 'center', padding: '2px 4px' }}>
                          <div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <div className="govuk-checkboxes__item" >
                                <input
                              className="govuk-checkboxes__input"
                              id="select-all-documents"
                              name="select-all-documents"
                              type="checkbox"
                              checked={selectAllDocuments}
                              onChange={handleSelectAllDocuments}
                            />
                            <label className="govuk-checkboxes__label govuk-!-margin-bottom-0 govuk-!-font-weight-bold govuk-!-text-align-left" htmlFor="select-all-documents" style={{ marginLeft: '8px', whiteSpace: 'nowrap', minWidth: '220px', textAlign: 'left' }}>
                              Section
                            </label>
                          </div>
                        </div>
                      </th>
                      <th className="govuk-table__header">Document name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packDocuments.map((doc, idx) => (
                      <tr key={doc.documentId} className="govuk-table__row" style={{ height: '28px' }}>
                        <td className="govuk-table__cell" style={{ textAlign: 'center', padding: '2px 4px' }}>
                          <div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <div className="govuk-checkboxes__item" >
                              <input
                                className="govuk-checkboxes__input"
                                id={`doc-${doc.documentId}`}
                                name={`doc-${doc.documentId}`}
                                type="checkbox"
                                checked={doc.include}
                                onChange={() => handleDocumentSelect(doc.documentId)}
                              />
                              <label className="govuk-checkboxes__label govuk-!-margin-bottom-0 govuk-!-text-align-left" htmlFor={`doc-${doc.documentId}`} style={{ marginLeft: '8px', whiteSpace: 'wrap', minWidth: '220px', textAlign: 'left' }}>
                                {FILE_CATEGORY_LABELS[doc.documentCategory] || doc.documentCategory || 'document'}
                              </label>
                            </div>
                          </div>
                        </td>
                        <td className="govuk-table__cell">{doc.documentTitle || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


            <div id="file-upload" style={{ marginTop: '32px', marginBottom: '32px' }} tabIndex={-1}>
              
              {consultationPack?.applicationDocuments && consultationPack.applicationDocuments.length > 0 && (
                <div className="govuk-!-margin-top-2">
                  <h3 className="govuk-heading-s">Documents uploaded</h3>
                </div>
              )}
              
              <FileUpload
                ref={fileUploadRef}
                title="Additional supporting documents"
                prefix={applicationId ? `${applicationId}/${FILE_CATEGORIES.CONSULTATION_ADDITIONAL_DOCUMENTS}` : ''}
                applicationId={applicationId}
                category={FILE_CATEGORIES.CONSULTATION_ADDITIONAL_DOCUMENTS}
                addedBy={user?.user_id}
                uploadedFiles={consultationPack?.uploadedFiles || []}
                applicationDocuments={consultationPack?.applicationDocuments || []}
                uploadImmediately={true}
                onValidationErrors={handleFileValidationErrors}
                onDeleteFile={handleDeleteFile}
                onUploaded={(newUploadedFiles, newApplicationDocuments) => {
                  setConsultationPack((prev: any) => ({
                    ...prev,
                    uploadedFiles: [...(prev?.uploadedFiles || []), ...newUploadedFiles],
                    applicationDocuments: [...(prev?.applicationDocuments || []), ...newApplicationDocuments]
                  }));
                }}
                consultationId={consultationId}
              />
            </div>

<div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
  {/* <button type="button" className="govuk-button govuk-button--secondary" onClick={handleSaveForLater}>
    Save for later
  </button> */}
  <button type="button" className="govuk-button" style={{ backgroundColor: '#00703c' }} onClick={handleSaveAndContinue}>
    Save and Continue
  </button>
</div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default consulteeApplicationInfo;
// GOV.UK Tabs JS initialisation
declare const window: any;



