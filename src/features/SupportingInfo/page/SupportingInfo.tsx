import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSupportingInfoStore } from "../../../store/useSupportingInfoStore";
import TextAreaField from "../../../components/commonFormFields/TextAreaField";
import { Button } from "govuk-react";
import FileUploadBox from '../../../components/FileUploadBox';
import { UploadedFile, ProjectDocument } from '../../../types/fileUpload';
import { FileUploadResponse } from '../../../types/FileUploadResponse';
import "../../../styles/_file_upload.scss";
import {FILE_CATEGORIES} from '../../../constants/fileCategoryConstants';
import { useAuthUser } from '../../../hooks/useAuthUser';

const errorFields = [
  { key: "wayleaves", id: "wayleaves-yes" },
  { key: "regulations", id: "regulations-yes" },
  { key: "supportingDocs", id: "supportingDocs-yes" },
];

const SupportingInfo: React.FC = () => {
  // Get logged-in user ID
  const { user } = useAuthUser();
  const userId = user?.user_id;
  console.log('Logged in userId:', userId);
   const params = useParams();
 
const getApplicationId = () => {
        if (params.applicationId) return params.applicationId;
        if (params.id) return params.id;
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const idFromQuery = searchParams.get('id') || searchParams.get('applicationId');
            if (idFromQuery) return idFromQuery;
        }
        return '';
    };
    const applicationId = getApplicationId();
  const {
    supportingInfo,
    fetchSupportingInfo,
    saveSupportingInfo,
    loading,
    error,
  } = useSupportingInfoStore();

  const [wayleaves, setWayleaves] = useState<string>("");
  const [regulations, setRegulations] = useState<boolean>(false);
  const [supportingDocs, setSupportingDocs] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [files, setFiles] = useState<{ filename: string; status: string; description: string }[]>([]);
  const [errors, setErrors] = useState<{ key: string; message: string }[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>([]);

  // refs for scrolling
  const wayleavesRef = useRef<HTMLInputElement>(null);
  const regulationsRef = useRef<HTMLInputElement>(null);
  const supportingDocsRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
  console.log('Params:', params);
  console.log('Derived applicationId:', applicationId);
    if (applicationId) {
      fetchSupportingInfo(applicationId);
    }
  }, [applicationId, fetchSupportingInfo]);

  useEffect(() => {
    if (supportingInfo) {
      const {
        wayleaves_obtained,
        esqcr_2002_compliance_confirmed,
        has_additional_supporting_documents,
        applicant_supporting_comments,
        uploaded_files,
        documents
      } = supportingInfo;

      setWayleaves(wayleaves_obtained ? "yes" : "no");
      setRegulations(esqcr_2002_compliance_confirmed);
      setSupportingDocs(has_additional_supporting_documents ? "yes" : "no");
      setComments(applicant_supporting_comments || "");

      // If uploaded_files is already in UploadedFile[] format, set it directly
      if (Array.isArray(uploaded_files) && uploaded_files.length > 0 && uploaded_files[0].filename && uploaded_files[0].file_content_type) {
        setUploadedFiles(uploaded_files as UploadedFile[]);
      } else {
        setUploadedFiles([]);
      }
      // If documents is already in ProjectDocument[] format, set it directly
      if (Array.isArray(documents) && documents.length > 0 && documents[0].title) {
        setProjectDocuments(documents as ProjectDocument[]);
      } else {
        setProjectDocuments([]);
      }
    }
  }, [supportingInfo]);

  const validate = () => {
    const errs: { key: string; message: string }[] = [];
    if (!wayleaves) errs.push({ key: "wayleaves", message: "Select yes if all wayleaves have been obtained" });
    if (!regulations) errs.push({ key: "regulations", message: "Confirm that the works will comply with regulations" });
    if (!supportingDocs) errs.push({ key: "supportingDocs", message: "Select yes if this application has supporting documents" });
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);

    // Always use the latest uploadedFiles and projectDocuments
    const latestUploadedFiles = uploadedFiles;
    const latestProjectDocuments = projectDocuments;

    if (errs.length === 0) {
      const data = {
        application_id: applicationId!,
        wayleaves_obtained: wayleaves === "yes",
        esqcr_2002_compliance_confirmed: regulations,
        has_additional_supporting_documents: supportingDocs === "yes",
        applicant_supporting_comments: comments,
        uploaded_files: latestUploadedFiles,
        documents: latestProjectDocuments,
      };
      await saveSupportingInfo(data);
    } else {
      const firstError = errs[0].key;
      if (firstError === "wayleaves" && wayleavesRef.current) wayleavesRef.current.focus();
      if (firstError === "regulations" && regulationsRef.current) regulationsRef.current.focus();
      if (firstError === "supportingDocs" && supportingDocsRef.current) supportingDocsRef.current.focus();
    }
  };

  const handleErrorClick = (key: string) => {
    if (key === "wayleaves" && wayleavesRef.current) wayleavesRef.current.focus();
    if (key === "regulations" && regulationsRef.current) regulationsRef.current.focus();
    if (key === "supportingDocs" && supportingDocsRef.current) supportingDocsRef.current.focus();
  };

  const hasError = (key: string) => errors.some(e => e.key === key);

  return (
  <div className="" style={{ maxWidth: 700}}>
  <nav aria-label="Breadcrumb" className="govuk-breadcrumbs" style={{ marginBottom: 24 }}>
  <ol className="govuk-breadcrumbs__list">
    <li className="govuk-breadcrumbs__list-item">
      <Link className="govuk-breadcrumbs__link" to={`/task-list?id=${applicationId}`}>
        Task list
      </Link>
    </li>
    <li className="govuk-breadcrumbs__list-item" aria-current="page">
      Supporting information
    </li>
  </ol>
</nav>

      {errors.length > 0 && (
        <div
          className="govuk-error-summary"
          role="alert"
          aria-labelledby="error-summary-title"
          tabIndex={-1}
          style={{ marginBottom: 32 }}
        >
          <h2 className="govuk-error-summary__title" id="error-summary-title">
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <ul className="govuk-list govuk-error-summary__list">
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

    
  <h1 className="govuk-heading-xl" style={{ marginBottom: 32 }}>Supporting information</h1>

      <fieldset
        className={`govuk-fieldset govuk-form-group${hasError("wayleaves") ? " govuk-form-group--error" : ""}`}
        style={{ marginBottom: 32, paddingBottom: 8 }}
      >
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          Have all wayleaves been obtained?
        </legend>
        <div>
          {hasError("wayleaves") && (
            <span
              className="govuk-error-message govuk-form-group--error"
            >
              <span className="govuk-visually-hidden">Error:</span> Select yes if all wayleaves have been obtained
            </span>
          )}
          <div className="govuk-radios">
            <div className="govuk-radios__item">
              <input
                className="govuk-radios__input"
                id="wayleaves-yes"
                name="wayleaves"
                type="radio"
                value="yes"
                checked={wayleaves === "yes"}
                onChange={() => setWayleaves("yes")}
                ref={wayleavesRef}
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
                onChange={() => setWayleaves("no")}
              />
              <label className="govuk-label govuk-radios__label" htmlFor="wayleaves-no">
                No
              </label>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset
        className={`govuk-fieldset govuk-form-group${hasError("regulations") ? " govuk-form-group--error" : ""}`}
        style={{ marginBottom: 32, paddingBottom: 8 }}
      >
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          I confirm that the works will comply with The Electricity Safety, Quality and Continuity Regulations 2002
        </legend>
        <div>
          {hasError("regulations") && (
            <span
              className="govuk-error-message govuk-form-group--error"
              style={{ display: "block", borderLeft: "4px solid #d4351c", paddingLeft: "10px" }}
            >
              <span className="govuk-visually-hidden">Error:</span> Confirm that the works will comply with regulations
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
                onChange={() => setRegulations(!regulations)}
                ref={regulationsRef}
              />
              <label className="govuk-label govuk-checkboxes__label" htmlFor="regulations-yes">
                Yes
              </label>
            </div>
          </div>
        </div>
      </fieldset>

  <div className="govuk-form-group" style={{ marginBottom: 32 }}>
        <TextAreaField
          label="Do you have any comments to make in support of your application? (optional)"
          value={comments}
          onChange={setComments}
          name="comments"
          className="govuk-textarea govuk-!-width-full"
        />
      </div>

  <fieldset className="govuk-fieldset govuk-form-group" style={{ marginBottom: 32, paddingBottom: 8 }}>
  <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
    <h2 className="govuk-fieldset__heading">
      Do you have any further supporting documents to provide?
    </h2>
  </legend>

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
        onChange={() => setSupportingDocs("yes")}
      />
      <label className="govuk-label govuk-radios__label" htmlFor="hasSupportingDocuments">
        Yes
      </label>
    </div>

    {supportingDocs === "yes" && (
      <div className="govuk-radios__conditional" id="hasSupportingDocuments-hidden">
        <FileUploadBox
          title="Upload supporting documents"
          prefix={`supporting-docs/${applicationId}`}
          onUploadComplete={(results: FileUploadResponse[]) => {
            console.log('Upload results:', results);
            // Use FileUploadResponse object directly for mapping
            const filesMapped: UploadedFile[] = results.map(fileResp => ({
              id: '',
              storage_provider: 's3',
              s3_key: fileResp.filename,
              bucket_name: fileResp.bucketName,
              virtual_folder: fileResp.filename,
              filename: fileResp.filename.split('/').pop() || fileResp.filename,
              file_content_type: fileResp.contentType,
              file_size_bytes: fileResp.fileSize ?? 0,
              uploaded_at_timestamp: new Date().toISOString()
            }));
            setUploadedFiles(filesMapped);

            // Example: get userId from localStorage or context
            const docsMapped: ProjectDocument[] = results.map(fileResp => ({
              document_id: '',
              application_id: applicationId,
              file_id: '',
              category: FILE_CATEGORIES.SUPPORT_INFO,
              subCategory: '',
              title: fileResp.filename.split('/').pop() || fileResp.filename,
              virtual_folder: fileResp.filename,
              added_by: userId ?? '', // Ensure added_by is always a string
              added_at: new Date().toISOString(),
              description: fileResp.description ?? '' // Ensure description is always a string
            }));
            setProjectDocuments(docsMapped);
          }}
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
        onChange={() => setSupportingDocs("no")}
      />
      <label className="govuk-label govuk-radios__label" htmlFor="hasSupportingDocuments-no">
        No
      </label>
    </div>
  </div>
</fieldset>

      <div style={{ marginTop: 32 }}>
        <Button type="submit" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save and continue"}
        </Button>
      </div>

    
    </div>
  );
};

export default SupportingInfo;
