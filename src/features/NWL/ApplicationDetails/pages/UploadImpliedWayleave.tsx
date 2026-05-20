import React, { useState, useEffect } from "react";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useAuthUser } from "../../../../hooks/useAuthUser";
import { useApplicationNavigation, useApplicationDetailsData } from "../hooks";
import { NWL_FILE_CATEGORIES } from "../../../../constants/fileCategoryConstants";
import FileUpload from "../../../../components/FileUpload";
import { UploadedFile, ApplicationDocument } from "../../../../types/fileUpload";
import {
  BREADCRUMBS,
  LABELS,
} from "../constants/uploadImpliedWayleaveConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";

/**
 * Upload Implied Wayleave Page
 * Upload evidence of the implied wayleave
 */
const UploadImpliedWayleave: React.FC = () => {
  const appId = useGetApplicationId();
  const { navigateToNoticeToTerminate, navigateToTaskList } = useApplicationNavigation(appId || "");
  const { user } = useAuthUser();
  const userId = user?.user_id;
  const { applicationDetails, updateFields, isLoading } = useApplicationDetailsData(appId);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Load uploaded documents
    if (applicationDetails?.implied_wayleave_documents) {
      const docs = applicationDetails.implied_wayleave_documents.map((doc) => ({
        documentId: doc.document_id,
        applicationId: appId || '',
        fileId: doc.document_id,
        category: 'implied_wayleave',
        filename: doc.filename,
        addedBy: '',
        addedAt: doc.uploaded_at,
      }));
      setApplicationDocuments(docs as unknown as ApplicationDocument[]);
    }
  }, [applicationDetails, appId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const documentIds = applicationDocuments.map(doc => doc.documentId);
      
      // This page is only for existing_lines flow
      // Pass page ID constant for page-specific validation
      await updateFields({
        type_of_use: 'existing_lines',
        implied_wayleave_document_ids: documentIds,
      }, APPLICATION_DETAILS_PAGE_IDS.UPLOAD_IMPLIED_WAYLEAVE);

      navigateToNoticeToTerminate();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to save');
    }
  };

  // const handleSaveForLater = () => {
  //   navigateToTaskList();
  // };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <a
              className="govuk-breadcrumbs__link"
              href="#"
              onClick={(e) => { e.preventDefault(); navigateToTaskList(); }}
            >
              {BREADCRUMBS.TASK_LIST}
            </a>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">
            {BREADCRUMBS.APPLICATION_DETAILS}
          </li>
        </ol>
      </nav>

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{LABELS.PAGE_TITLE}</h1>

            <p className="govuk-body">{LABELS.HELPER_TEXT}</p>

            <form onSubmit={handleSubmit} noValidate>
              {applicationDocuments.length > 0 && (
                <div className="govuk-form-group">
                  <p className="govuk-body govuk-!-font-weight-bold">
                    {LABELS.DOCUMENTS_UPLOADED}
                  </p>
                </div>
              )}

              <div className="govuk-form-group">
                <FileUpload
                  title={LABELS.UPLOAD_LABEL}
                  prefix={`${appId}/${NWL_FILE_CATEGORIES.NWL_IMPLIED_WAYLEAVE}/`}
                  applicationId={appId}
                  category={NWL_FILE_CATEGORIES.NWL_IMPLIED_WAYLEAVE}
                  addedBy={userId}
                  uploadedFiles={uploadedFiles}
                  applicationDocuments={applicationDocuments}
                  onUploaded={(newUploadedFiles: UploadedFile[], newProjectDocuments: ApplicationDocument[]) => {
                    setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
                    setApplicationDocuments((prev) => [...prev, ...newProjectDocuments]);
                  }}
                />
              </div>

              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                >
                  Save and continue
                </button>
                {/* <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
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

export default UploadImpliedWayleave;
