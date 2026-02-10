import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import FileUpload from '../../../components/FileUpload';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { useSensitiveAreaReview } from '../../../store/sensitiveAreaReviewStore';

const ReviewDocumentsPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { review, fetchReview, saveReview, loading } = useSensitiveAreaReview(applicationId || '');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  React.useEffect(() => { if (applicationId) fetchReview(); }, [applicationId]);

  const handleSave = async () => {
    const payload = {
      id: review?.id || '',
      application_id: applicationId,
      route_id: review?.route_id || '',
      settings_id: review?.settings_id || '',
      uploaded_files: uploadedFiles,
    } as any;
    await saveReview(payload);
    navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
  };

  return (
    <div className="govuk-width-container">
      <h1 className="govuk-heading-xl">Upload supporting documents</h1>
      <p className="govuk-body">Upload environmental and archaeological documents used to support your review.</p>

      <div id="document-upload" className="govuk-form-group">
        <FileUpload
          title="Environmental and archaeological documents"
          prefix={`${applicationId}/${FILE_CATEGORIES.SENSITIVE_AREA_REVIEW}`}
          applicationId={applicationId || ''}
          category={FILE_CATEGORIES.SENSITIVE_AREA_REVIEW}
          addedBy={review?.reviewed_by || 'current-user'}
          uploadedFiles={uploadedFiles}
          onUploaded={(newUploadedFiles, newProjectDocuments) => {
            setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
          }}
        />
      </div>

      <div className="govuk-!-margin-top-4">
        <button className="govuk-button" disabled={loading} onClick={handleSave}>Save and continue</button>
      </div>
    </div>
  );
};

export default ReviewDocumentsPage;
