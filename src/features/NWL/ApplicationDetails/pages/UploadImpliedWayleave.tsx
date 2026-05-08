import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useAuthUser } from "../../../../hooks/useAuthUser";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { useApplicationNavigation } from "../hooks";
import { NWL_FILE_CATEGORIES } from "../../../../constants/fileCategoryConstants";
import FileUpload from "../../../../components/FileUpload";
import { UploadedFile, ApplicationDocument } from "../../../../types/fileUpload";
import {
  BREADCRUMBS,
  LABELS,
} from "../constants/uploadImpliedWayleaveConstants";

/**
 * Upload Implied Wayleave Page
 * Upload evidence of the implied wayleave
 */
const UploadImpliedWayleave: React.FC = () => {
  const appId = useGetApplicationId();
  const { navigateToNoticeToTerminate, navigateToTaskList } = useApplicationNavigation(appId || "");
  const { user } = useAuthUser();
  const userId = user?.user_id;
  const fetchAndSetApplication = useApplicationStore(
    (state) => state.fetchAndSetApplication
  );

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);

  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Save to backend when API is ready
    navigateToNoticeToTerminate();
  };

  const handleSaveForLater = () => {
    navigateToTaskList();
  };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${NWL_BASE_URL}/${appId}/task-list`}
            >
              {BREADCRUMBS.TASK_LIST}
            </Link>
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
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
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

export default UploadImpliedWayleave;
