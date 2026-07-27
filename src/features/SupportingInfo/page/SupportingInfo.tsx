import { S37_BASE_URL } from '../../../constants/s37';
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSupportingInfo } from "../../../hooks/useSupportingInfo";
import TextArea from '../../ProjectOverview/component/TextArea';
import { Button } from "govuk-react";
import FileUpload, { FileUploadHandle, FileUploadGate, DEFAULT_FILE_UPLOAD_GATE, FILE_INFECTED_BLOCK_MESSAGE } from '../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import "../../../styles/_file_upload.scss";
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { createLogger } from '../../../utils/logger';
import { getNextPageUrl, TASK_NAMES } from '../../../utils/taskListUtils';
import { SUPPORTING_INFO_ERRORS } from '../../../constants/supportingInfoError';
import { clearKeyedErrors } from '../validations';

const logger = createLogger('SupportingInfo');

// --- Helpers ---

const SupportingInfo: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const userId = user?.user_id;
  const params = useParams();
  const applicationId = (() => {
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const idFromQuery = searchParams.get('id') || searchParams.get('applicationId');
      if (idFromQuery) return idFromQuery;
    }
    return '';
  })();
  const {
    supportingInfo,
    fetchSupportingInfo,
    saveSupportingInfo,
    loading,
  } = useSupportingInfo();

  const [wayleaves, setWayleaves] = useState<string>("");
  const [regulations, setRegulations] = useState<boolean>(false);
  const [wayleavesReason, setWayleavesReason] = useState<string>("");
  const [supportingDocs, setSupportingDocs] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const MAX_COMMENTS_LENGTH = 4000;
  const remainingCommentChars = MAX_COMMENTS_LENGTH - comments.length;
  const [errors, setErrors] = useState<{ key: string; message: string }[]>([]);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // Track previous application ID and fetch/bind flags
  const prevAppIdRef = useRef(applicationId);
  const hasFetchedRef = useRef(false);
  const hasBindDataRef = useRef(false);

  // refs for scrolling
  const wayleavesRef = useRef<HTMLInputElement>(null);
  const wayleavesReasonRef = useRef<HTMLTextAreaElement>(null);
  const regulationsRef = useRef<HTMLInputElement>(null);
  const supportingDocsRef = useRef<HTMLInputElement>(null);
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const [uploadGate, setUploadGate] = useState<FileUploadGate>(DEFAULT_FILE_UPLOAD_GATE);
  
  // Clear form only when switching to a different application
  useEffect(() => {
    if (prevAppIdRef.current !== applicationId) {
      setWayleaves("");
      setRegulations(false);
      setWayleavesReason("");
      setSupportingDocs("");
      setComments("");
      setUploadedFiles([]);
      setApplicationDocuments([]);
      prevAppIdRef.current = applicationId;
      hasFetchedRef.current = false;
      hasBindDataRef.current = false;
    }
  }, [applicationId]);

  // Fetch once per application (hasFetchedRef guards against repeated fetches)
  useEffect(() => {
    if (applicationId && !hasFetchedRef.current) {
      fetchSupportingInfo(applicationId);
      hasFetchedRef.current = true;
    }
  }, [applicationId, fetchSupportingInfo]);

  // Bind fetched data ONLY once (prevents overwriting unsaved changes)
  useEffect(() => {
    if (hasBindDataRef.current || !supportingInfo) return;
    
    if (supportingInfo && applicationId && supportingInfo.application_id === applicationId) {
      hasBindDataRef.current = true;
      const {
        wayleaves_obtained,
        esqcr_2002_compliance_confirmed,
        has_additional_supporting_documents,
        applicant_supporting_comments,
        uploaded_files,
        application_documents
      } = supportingInfo;

      setWayleaves(wayleaves_obtained ? "yes" : "no");
      setRegulations(esqcr_2002_compliance_confirmed);
      setWayleavesReason(supportingInfo.wayleaves_not_obtained_reason || "");
      setSupportingDocs(has_additional_supporting_documents ? "yes" : "no");
      setComments(applicant_supporting_comments || "");

      // If uploaded_files is already in UploadedFile[] format, set it directly (with bounds check)
      if (
        Array.isArray(uploaded_files) &&
        uploaded_files.length > 0 &&
        uploaded_files[0] &&
        uploaded_files[0].filename 
      ) {
        setUploadedFiles(uploaded_files as UploadedFile[]);
      } else {
        setUploadedFiles([]);
      }
      // If documents is already in ProjectDocument[] format, set it directly (with bounds check)
      if (
        Array.isArray(application_documents) &&
        application_documents.length > 0 &&
        application_documents[0] &&
        application_documents[0].title
      ) {
        setApplicationDocuments(application_documents as ApplicationDocument[]);
      } else {
        setApplicationDocuments([]);
      }
    }
  }, [supportingInfo, applicationId]);

  const clearError = (...keys: string[]) => {
    setErrors((prev) => clearKeyedErrors(prev, keys));
  };

  const validate = (newlyUploadedFiles: UploadedFile[] = []) => {
    const errs: { key: string; message: string }[] = [];
    
    // Wayleaves validation
    if (!wayleaves) {
      errs.push({ key: "wayleaves", message: SUPPORTING_INFO_ERRORS.WAYLEAVES_REQUIRED });
    }
    if (wayleaves === "no" && !wayleavesReason.trim()) {
      errs.push({ key: "wayleavesReason", message: SUPPORTING_INFO_ERRORS.WAYLEAVES_REASON_REQUIRED });
    }
    
    // Regulations validation
    if (!regulations) {
      errs.push({ key: "regulations", message: SUPPORTING_INFO_ERRORS.REGULATIONS_REQUIRED });
    }
    
    // Comments character limit validation
    if (comments.length > MAX_COMMENTS_LENGTH) {
      errs.push({ key: "comments", message: SUPPORTING_INFO_ERRORS.COMMENTS_MAX_LENGTH });
    }
    
    // Supporting documents validation
    if (!supportingDocs) {
      errs.push({ key: "supportingDocs", message: SUPPORTING_INFO_ERRORS.SUPPORTING_DOCS_REQUIRED });
    }
    
    // File upload validation: If 'Yes' is selected for supportingDocs, at least one file must be uploaded
    const totalFiles = uploadedFiles.length + newlyUploadedFiles.length + pendingFiles.length;
    if (supportingDocs === "yes" && totalFiles === 0) {
      errs.push({ key: "supportingDocsFiles", message: SUPPORTING_INFO_ERRORS.SUPPORTING_DOCS_FILES_REQUIRED });
    }
    
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Hard-stop Save and continue while virus scan is running or any infected
  // file remains (do not rely only on the disabled attribute).
  if (supportingDocs === "yes" && !uploadGate.canContinue) {
    if (uploadGate.hasInfectedFiles) {
      setErrors([{ key: 'fileUpload', message: FILE_INFECTED_BLOCK_MESSAGE }]);
      setFileValidationErrors([FILE_INFECTED_BLOCK_MESSAGE]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // While scanning: button is disabled — exit quietly with no scanning banner.
    return;
  }
  
  // Trigger file upload first (deferred upload pattern)
  let newlyUploadedFiles: UploadedFile[] = [];
  let newlyUploadedDocuments: ApplicationDocument[] = [];
  
  if (fileUploadRef.current && supportingDocs === "yes") {
    // Re-check gate from the upload component (authoritative) before proceeding.
    const liveGate = fileUploadRef.current.getUploadGate();
    if (!liveGate.canContinue) {
      if (liveGate.hasInfectedFiles) {
        setErrors([{ key: 'fileUpload', message: FILE_INFECTED_BLOCK_MESSAGE }]);
        setFileValidationErrors([FILE_INFECTED_BLOCK_MESSAGE]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      const result = await fileUploadRef.current.triggerUpload();
      newlyUploadedFiles = result.uploadedFiles.filter(
        (f) => f.scanResult !== 'INFECTED'
      );
      newlyUploadedDocuments = result.applicationDocuments.filter((doc) =>
        newlyUploadedFiles.some((f) => f.id === doc.fileId)
      );
      
      // Update state immediately so files remain visible even if validation fails
      if (newlyUploadedFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...newlyUploadedFiles]);
        setApplicationDocuments(prev => [...prev, ...newlyUploadedDocuments]);
      }
    } catch (err: any) {
      logger.error('File upload failed:', err);
      const message =
        err?.message === FILE_INFECTED_BLOCK_MESSAGE ||
        (typeof err?.message === 'string' && err.message.includes('virus scan'))
          ? FILE_INFECTED_BLOCK_MESSAGE
          : SUPPORTING_INFO_ERRORS.FILE_UPLOAD_FAILED;
      setErrors([{ key: 'fileUpload', message }]);
      if (message === FILE_INFECTED_BLOCK_MESSAGE) {
        setFileValidationErrors([FILE_INFECTED_BLOCK_MESSAGE]);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  }

  // Never persist infected files in the supporting-info save payload.
  const cleanUploadedFiles = [...uploadedFiles, ...newlyUploadedFiles].filter(
    (f) => f.scanResult !== 'INFECTED'
  );
  const cleanFileIds = new Set(cleanUploadedFiles.map((f) => f.id));
  const cleanApplicationDocuments = [
    ...applicationDocuments,
    ...newlyUploadedDocuments,
  ].filter((doc) => cleanFileIds.has(doc.fileId));

  if (
    supportingDocs === "yes" &&
    uploadedFiles.some((f) => f.scanResult === 'INFECTED')
  ) {
    setErrors([{ key: 'fileUpload', message: FILE_INFECTED_BLOCK_MESSAGE }]);
    setFileValidationErrors([FILE_INFECTED_BLOCK_MESSAGE]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  
  const errs = validate(newlyUploadedFiles);
  setErrors(errs);

  if (errs.length === 0) {
    const data = {
      application_id: applicationId!,
      wayleaves_obtained: wayleaves === "yes",
      wayleaves_not_obtained_reason: wayleaves === "no" ? wayleavesReason : undefined,
      esqcr_2002_compliance_confirmed: regulations,
      has_additional_supporting_documents: supportingDocs === "yes",
      applicant_supporting_comments: comments,
      uploaded_files: cleanUploadedFiles,
      application_documents: cleanApplicationDocuments,
    };
    
    try {
      const response: any = await saveSupportingInfo(data);
      const redirectId =
        response?.application_id ||
        response?.application?.application_id ||
        response?.application_overview?.application_id ||
        applicationId ||
        '';
      // Navigate to the next page in the task list sequence
      const nextPageUrl = getNextPageUrl(TASK_NAMES.SUPPORTING_QUESTIONS, redirectId);
      navigate(nextPageUrl);
    } catch (err: any) {
      logger.error('Save failed:', err);
      setErrors([{ 
        key: 'save', 
        message: err?.response?.data?.message || err?.message || SUPPORTING_INFO_ERRORS.SAVE_FAILED
      }]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } else {
      const firstError = errs[0].key;
      if (firstError === "wayleaves" && wayleavesRef.current) wayleavesRef.current.focus();
      if (firstError === "wayleavesReason" && wayleavesReasonRef.current) wayleavesReasonRef.current.focus();
      if (firstError === "regulations" && regulationsRef.current) regulationsRef.current.focus();
      if (firstError === "comments") {
        // For comments field, scroll to the element since TextArea doesn't support ref
        const commentsElement = document.getElementById('comments-inputValue');
        if (commentsElement) {
          commentsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          commentsElement.focus();
        }
      }
      if (firstError === "supportingDocs" && supportingDocsRef.current) supportingDocsRef.current.focus();
    }
  };

  const handleErrorClick = (key: string) => {
    if (key === "wayleaves" && wayleavesRef.current) wayleavesRef.current.focus();
    if (key === "wayleavesReason" && wayleavesReasonRef.current) wayleavesReasonRef.current.focus();
    if (key === "regulations" && regulationsRef.current) regulationsRef.current.focus();
    if (key === "comments") {
      // For comments field, use getElementById since TextArea doesn't support ref
      const commentsElement = document.getElementById('comments-inputValue');
      if (commentsElement) {
        commentsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        commentsElement.focus();
      }
    }
    if (key === "supportingDocs" && supportingDocsRef.current) supportingDocsRef.current.focus();
    if (key === "fileUpload" || key === "supportingDocsFiles") {
      // Focus the file upload area without opening file dialog
      const fileUploadSection = document.querySelector('#hasSupportingDocuments-hidden');
      if (fileUploadSection) {
        // First scroll to the section smoothly
        fileUploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait for scroll to complete, then focus the upload container
        setTimeout(() => {
          const uploadContainer = fileUploadSection.querySelector('.gds-upload-container');
          if (uploadContainer) {
            (uploadContainer as HTMLElement).focus();
          } else {
            // Fallback: try to focus the file input directly
            const fileInput = fileUploadSection.querySelector('#file-upload-input') as HTMLElement;
            if (fileInput) {
              fileInput.focus();
            }
          }
        }, 300);
      }
    }
  };

  const hasError = (key: string) => errors.some(e => e.key === key);

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setApplicationDocuments(prev => prev.filter(doc => doc.fileId !== fileId));
  };

  const handleFilesUploaded = (newUploadedFiles: UploadedFile[], newApplicationDocuments: ApplicationDocument[]) => {
    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
    setApplicationDocuments(prev => [...prev, ...newApplicationDocuments]);
  };

  return (
  <div className="govuk-body" style={{ maxWidth: 700, fontSize: '19px', lineHeight: '1.31579' }}>
  <nav aria-label="Breadcrumb" className="govuk-breadcrumbs" style={{ marginBottom: 24 }}>
  <ol className="govuk-breadcrumbs__list">
    <li className="govuk-breadcrumbs__list-item">
  <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
        Task list
      </Link>
    </li>
    <li className="govuk-breadcrumbs__list-item" aria-current="page">
      Supporting information
    </li>
  </ol>
</nav>

      {(errors.length > 0 || fileValidationErrors.length > 0) && (
        <div
          className="govuk-error-summary"
          role="alert"
          aria-labelledby="error-summary-title"
          tabIndex={-1}
          style={{ marginBottom: 32 }}
          data-module="govuk-error-summary"
        >
          <h2 className="govuk-error-summary__title" id="error-summary-title">
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <ul className="govuk-list govuk-error-summary__list">
              {fileValidationErrors.map((error, index) => (
                <li key={`file-${index}`}>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    handleErrorClick("fileUpload");
                  }}>
                    {error}
                  </a>
                </li>
              ))}
              {errors.map((err, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="govuk-error-summary__link"
                    onClick={e => {
                      e.preventDefault();
                      handleErrorClick(err.key);
                    }}
                  >
                    {err.message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    
  <h1 className="govuk-heading-xl" style={{ marginBottom: 32, fontSize: '2.5rem', lineHeight: '1.1' }}>Supporting information</h1>

      <div
        className={`govuk-form-group${hasError("wayleaves") ? " govuk-form-group--error" : ""}`}
        style={hasError("wayleaves") ? { borderLeft: '4px solid #d4351c', paddingLeft: 12 } : {}}
      >
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
            <h2 className="govuk-fieldset__heading">Have all wayleaves been obtained?</h2>
          </legend>
          {hasError("wayleaves") && (
            <span className="govuk-error-message" id="wayleaves-error">
              <span className="govuk-visually-hidden">Error:</span> {SUPPORTING_INFO_ERRORS.WAYLEAVES_REQUIRED}
            </span>
          )}
          <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
            <div className="govuk-radios__item">
              <input
                className="govuk-radios__input"
                id="wayleaves-yes"
                name="wayleaves"
                type="radio"
                value="yes"
                checked={wayleaves === "yes"}
                onChange={() => {
                  setWayleaves("yes");
                  clearError("wayleaves");
                }}
                ref={wayleavesRef}
                aria-describedby={hasError("wayleaves") ? "wayleaves-error" : undefined}
              />
              <label className="govuk-label govuk-radios__label" htmlFor="wayleaves-yes">
                Yes
              </label>
            </div>
            <div className="govuk-radios__item">
              <input
                className="govuk-radios__input"
                id="wayleaves-no"
                name="wayleaves"
                type="radio"
                value="no"
                checked={wayleaves === "no"}
                onChange={() => {
                  setWayleaves("no");
                  clearError("wayleaves", "wayleavesReason");
                }}
                aria-describedby={hasError("wayleaves") ? "wayleaves-error" : undefined}
              />
              <label className="govuk-label govuk-radios__label" htmlFor="wayleaves-no">
                No
              </label>
            </div>
            {wayleaves === "no" && (
              <div className="govuk-radios__conditional" id="haveAllWayleavesBeenObtained-no-hidden">
                <div className={`govuk-form-group${hasError("wayleavesReason") ? " govuk-form-group--error" : ''}` }>
                  <label className="govuk-label" htmlFor="wayleavesNotObtainedComments-inputValue">
                    Why have all wayleaves not been obtained?
                  </label>
                  {hasError("wayleavesReason") && (
                    <p id="wayleavesNotObtainedComments-inputValue-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {SUPPORTING_INFO_ERRORS.WAYLEAVES_REASON_REQUIRED}
                    </p>
                  )}
                  <textarea
                    className={`govuk-textarea${hasError("wayleavesReason") ? " govuk-textarea--error" : ''}`}
                    id="wayleavesNotObtainedComments-inputValue"
                    name="wayleavesNotObtainedComments.inputValue"
                    rows={5}
                    ref={wayleavesReasonRef}
                    value={wayleavesReason}
                    onChange={(e) => {
                      setWayleavesReason(e.target.value);
                      clearError("wayleavesReason");
                    }}
                    aria-describedby={hasError("wayleavesReason") ? "wayleavesNotObtainedComments-inputValue-error" : undefined}
                  />
                </div>
              </div>
            )}
          </div>
        </fieldset>
      </div>

      <fieldset
        className={`govuk-fieldset govuk-form-group${hasError("regulations") ? " govuk-form-group--error" : ""}`}
        style={{
          marginBottom: 32,
          paddingBottom: 8,
          borderLeft: hasError("regulations") ? '4px solid #d4351c' : undefined,
          paddingLeft: hasError("regulations") ? 12 : undefined
        }}
        aria-describedby={hasError("regulations") ? "regulations-error" : undefined}
      >
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m" style={{ fontSize: '1.1875rem', lineHeight: '1.31579' }}>
          I confirm that the works will comply with The Electricity Safety, Quality and Continuity Regulations 2002
        </legend>
        <div>
          {hasError("regulations") && (
            <span className="govuk-error-message" id="regulations-error">
              <span className="govuk-visually-hidden">Error:</span> {SUPPORTING_INFO_ERRORS.REGULATIONS_REQUIRED}
            </span>
          )}
          <div className="govuk-checkboxes">
            <div className="govuk-checkboxes__item">
              <input
                className="govuk-checkboxes__input"
                id="regulations-yes"
                name="regulations"
                type="checkbox"
                checked={regulations}
                onChange={() => {
                  setRegulations(!regulations);
                  clearError("regulations");
                }}
                ref={regulationsRef}
              />
              <label className="govuk-label govuk-checkboxes__label" htmlFor="regulations-yes">
                Yes
              </label>
            </div>
          </div>
        </div>
      </fieldset>

  <div className={`govuk-form-group govuk-character-count${hasError("comments") ? " govuk-form-group--error" : ""}`} style={{ marginBottom: 32 }}>
    <TextArea
      label="Do you have any comments to make in support of your application? (optional)"
      id="comments-inputValue"
      name="comments"
      value={comments}
      maxLength={MAX_COMMENTS_LENGTH}
      remainingChars={remainingCommentChars}
      onChange={e => setComments(e.target.value)}
      error={hasError("comments") ? SUPPORTING_INFO_ERRORS.COMMENTS_MAX_LENGTH : undefined}
    />
  </div>

  <fieldset className={`govuk-fieldset govuk-form-group${hasError("supportingDocs") ? " govuk-form-group--error" : ""}`}
    style={{
      marginBottom: 32,
      paddingBottom: 8,
      borderLeft: hasError("supportingDocs") ? '4px solid #d4351c' : undefined,
      paddingLeft: hasError("supportingDocs") ? 12 : undefined
    }}
    aria-describedby={hasError("supportingDocs") ? "supportingDocs-error" : undefined}>
  <legend className="govuk-fieldset__legend govuk-fieldset__legend--s" style={{ fontSize: '1.125rem', lineHeight: '1.31579' }}>
    <h2 className="govuk-fieldset__heading" style={{ fontSize: '1.125rem', lineHeight: '1.31579' }}>
      Do you have any further supporting documents to provide?
    </h2>
  </legend>

  {hasError("supportingDocs") && (
    <span className="govuk-error-message" id="supportingDocs-error">
      <span className="govuk-visually-hidden">Error:</span> {SUPPORTING_INFO_ERRORS.SUPPORTING_DOCS_REQUIRED}
    </span>
  )}
  <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios" style={{ marginTop: 8 }}>
    <div className="govuk-radios__item">
      <input
        className="govuk-radios__input"
        id="hasSupportingDocuments"
        name="hasSupportingDocuments"
        type="radio"
        value="true"
        aria-controls="hasSupportingDocuments-hidden"
        aria-expanded="true"
        checked={supportingDocs === "yes"}
        onChange={() => {
          setSupportingDocs("yes");
          clearError("supportingDocs");
        }}
      />
      <label className="govuk-label govuk-radios__label" htmlFor="hasSupportingDocuments">
        Yes
      </label>
    </div>

    {supportingDocs === "yes" && (
        <div
          className={`govuk-radios__conditional govuk-form-group${hasError("supportingDocsFiles") || fileValidationErrors.length > 0 ? " govuk-form-group--error" : ""}`}
          id="hasSupportingDocuments-hidden"
        >
        
          {hasError("supportingDocsFiles") && (
            <span className="govuk-error-message" id="supportingDocsFiles-error">
              <span className="govuk-visually-hidden">Error:</span> {SUPPORTING_INFO_ERRORS.SUPPORTING_DOCS_FILES_REQUIRED}
            </span>
          )}
          {fileValidationErrors.length > 0 && fileValidationErrors.map((error, index) => (
            <p key={index} id={`fileValidation-error-${index}`} className="govuk-error-message">
              <span className="govuk-visually-hidden">Error:</span> {error}
            </p>
          ))}
          
          {applicationDocuments && applicationDocuments.length > 0 && (
            <div className="govuk-!-margin-top-2">
              <h3 className="govuk-heading-s">Documents uploaded</h3>
            </div>
          )}
          
          <FileUpload
            ref={fileUploadRef}
            title="Upload a file"
            prefix={`${applicationId}/${FILE_CATEGORIES.SUPPORT_INFO}`}
            applicationId={applicationId}
            category={FILE_CATEGORIES.SUPPORT_INFO}
            addedBy={userId}
            uploadedFiles={uploadedFiles}
            applicationDocuments={applicationDocuments}
            onDeleteFile={handleDeleteFile}
            uploadImmediately={true}
            onUploaded={handleFilesUploaded}
            onValidationErrors={(errors) => {
              setFileValidationErrors(errors);
              if (errors.length === 0) {
                setErrors(prev => prev.filter(err => err.key !== 'supportingDocsFiles'));
              }
            }}
            onPendingFilesChange={setPendingFiles}
            onUploadGateChange={setUploadGate}
          />
        </div>
    )}

    <div className="govuk-radios__item">
      <input
        className="govuk-radios__input"
        id="hasSupportingDocuments-no"
        name="hasSupportingDocuments"
        type="radio"
        value="false"
        checked={supportingDocs === "no"}
        onChange={() => {
          setSupportingDocs("no");
          clearError("supportingDocs", "supportingDocsFiles");
          setFileValidationErrors([]);
          setUploadGate(DEFAULT_FILE_UPLOAD_GATE);
          // Drop infected files from local state so unmounting FileUpload cannot
          // leave them in the save payload after the gate resets.
          setUploadedFiles((prev) => prev.filter((f) => f.scanResult !== 'INFECTED'));
          setApplicationDocuments((docs) => {
            const infectedIds = new Set(
              uploadedFiles
                .filter((f) => f.scanResult === 'INFECTED')
                .map((f) => f.id)
            );
            if (infectedIds.size === 0) {
              return docs;
            }
            return docs.filter((d) => !infectedIds.has(d.fileId));
          });
        }}
        ref={supportingDocsRef}
      />
      <label className="govuk-label govuk-radios__label" htmlFor="hasSupportingDocuments-no">
        No
      </label>
    </div>
  </div>
</fieldset>

      <div style={{ marginTop: 32 }}>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || (supportingDocs === "yes" && !uploadGate.canContinue)}
          aria-disabled={loading || (supportingDocs === "yes" && !uploadGate.canContinue)}
        >
          {loading ? "Saving..." : "Save and continue"}
        </Button>
      </div>

    </div>
  );
};

export default SupportingInfo;

