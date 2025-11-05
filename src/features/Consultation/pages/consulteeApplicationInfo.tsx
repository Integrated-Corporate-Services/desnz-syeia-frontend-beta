import React, { useEffect, useRef, useState } from "react";
import { S37_BASE_URL } from '../../../constants/s37';
import { Link, useParams, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useGetApplicationId } from "../../../hooks/useGetApplicationId";
import { useAuthUser } from "../../../hooks/useAuthUser";
import { getConsultationPack ,saveConsultationPack} from "../../../services/consultationPackService";
import { PackSection, ConsultationPack } from '../../../types/consultationPack';
import { FILE_CATEGORIES, FILE_CATEGORY_LABELS } from '../../../constants/fileCategoryConstants';
import FileUpload from '../../../components/FileUpload';
import { CONSULTATION_SECTIONS } from '../../../constants/consultationSections';
import log from '../../../logger';

const consulteeApplicationInfo: React.FC = () => {
  const params = useParams();
  const location = useLocation();
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
  // Read consultationId from path params if available, fallback to query param
  const consultationId = params.consultationId || searchParams.get("consultationId") || "";
  const consultationName = searchParams.get("consultationName") || "";
  const navigate = useNavigate();
  const tabsRef = useRef<HTMLDivElement>(null);
// Add GOV.UK tabs JS initialization to the main component
useEffect(() => {
  if (window?.GOVUKFrontend && typeof window.GOVUKFrontend.initAll === "function") {
    window.GOVUKFrontend.initAll();
  }
}, []);
  // Document checkbox handler
  function handleDocumentSelect(packDocumentId: string) {
    setPackDocuments(prevDocs => {
      const updated = prevDocs.map(doc =>
        doc.packDocumentId === packDocumentId ? { ...doc, include: !doc.include } : doc
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
        navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/send-application-to-consultee`);
      } else {
        navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save');
    }
  };

  const handleSaveForLater = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave(false);
  };

  const handleSaveAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave(true);
  };

 

  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

 

  return (
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
          <li className="govuk-breadcrumbs__list-item" aria-current="page">
            Consultation details
          </li>
        </ol>
      </nav>
      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-three-quarters">

            <h2 className="govuk-caption-l">{consultationName || "Consultation name"}</h2>
            <h2 className="govuk-heading-xl">Share application details</h2>
            <p className="govuk-body">
              Select and review the details you want to share with the consultant.
            </p>
 {errorMessage && (
  <div className="govuk-error-message" style={{ marginTop: '16px' }}>{errorMessage}</div>
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
                                id={`doc-${idx}`}
                                name={`doc-${idx}`}
                                type="checkbox"
                                checked={doc.include}
                                onChange={() => handleDocumentSelect(doc.packDocumentId)}
                              />
                              <label className="govuk-checkboxes__label govuk-!-margin-bottom-0 govuk-!-text-align-left" htmlFor={`doc-${idx}`} style={{ marginLeft: '8px', whiteSpace: 'wrap', minWidth: '220px', textAlign: 'left' }}>
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


            {/* Additional supporting documents upload */}
            <div style={{ marginTop: '32px', marginBottom: '32px' }}>
              <FileUpload
                title="Additional supporting documents"
                prefix={applicationId ? `${applicationId}/${FILE_CATEGORIES.CONSULTATION_ADDITIONAL_DOCUMENTS}` : ''}
                applicationId={applicationId}
                category={FILE_CATEGORIES.CONSULTATION_ADDITIONAL_DOCUMENTS}
                addedBy={user?.user_id}
                uploadedFiles={consultationPack?.uploadedFiles || []}
                onUploaded={(newUploadedFiles, newApplicationDocuments) => {
                  setConsultationPack((prev: any) => ({
                    ...prev,
                    uploadedFiles: [...(prev?.uploadedFiles || []), ...newUploadedFiles],
                    applicationDocuments: [...(prev?.applicationDocuments || []), ...newApplicationDocuments]
                  }));
                }}
              />
            </div>

<div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
  <button type="button" className="govuk-button govuk-button--secondary" onClick={handleSaveForLater}>
    Save for later
  </button>
  <button type="button" className="govuk-button" style={{ backgroundColor: '#00703c' }} onClick={handleSaveAndContinue}>
    Save and Continue
  </button>
</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default consulteeApplicationInfo;
// GOV.UK Tabs JS initialisation
declare const window: any;



