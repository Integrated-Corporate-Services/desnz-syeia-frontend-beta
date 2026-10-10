import { forwardRef } from 'react';
import FileUpload, { type FileUploadHandle } from '../../../../components/FileUpload';
import { EXECUTIVE_SUMMARY_CATEGORY, EXECUTIVE_SUMMARY_COPY, EXECUTIVE_SUMMARY_SUBCATEGORY } from '../constants/executiveSummaryConstants';
import type { ExecutiveSummaryDocument } from '../types/executiveSummary';

type Props = {
  applicationId: string;
  documents: ExecutiveSummaryDocument[];
  onUploaded: () => void;
  onDeleteFile: (fileId: string) => void;
  onValidationErrors: (messages: string[]) => void;
};

const ExecutiveSummaryUpload = forwardRef<FileUploadHandle, Props>(({ applicationId, documents, onUploaded, onDeleteFile, onValidationErrors }, ref) => (
  <FileUpload
    ref={ref}
    title={EXECUTIVE_SUMMARY_COPY.uploadTitle}
    applicationId={applicationId}
    category={EXECUTIVE_SUMMARY_CATEGORY}
    subCategory={EXECUTIVE_SUMMARY_SUBCATEGORY}
    prefix={`${applicationId}/${EXECUTIVE_SUMMARY_CATEGORY}`}
    uploadImmediately
    uploadedFiles={documents.map((document) => ({ id: document.file_id, storageProvider: document.storage_provider, s3Key: document.s3_key, bucketName: document.bucket_name, virtualFolder: document.virtual_folder, filename: document.filename, fileContentType: document.file_content_type, fileSizeBytes: document.file_size_bytes, uploadedAtTimestamp: document.uploaded_at_timestamp, scanStatus: document.scan_status, scanResult: document.scan_result }))}
    applicationDocuments={documents.map((document) => ({ documentId: document.document_id, applicationId, fileId: document.file_id, category: EXECUTIVE_SUMMARY_CATEGORY, subCategory: EXECUTIVE_SUMMARY_SUBCATEGORY, addedBy: document.added_by, addedAt: document.added_at }))}
    onValidationErrors={onValidationErrors}
    onDeleteFile={onDeleteFile}
    onUploaded={onUploaded}
  />
));

export default ExecutiveSummaryUpload;
