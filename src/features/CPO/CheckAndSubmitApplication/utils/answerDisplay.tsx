import React from 'react';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { DOCUMENT_CATEGORIES, DOCUMENT_GROUP_CATEGORIES } from '../../OrderDocuments/constants/orderDocumentsConstants';
import { NOTICE_CATEGORIES } from '../../RecordNotices/constants/noticesConstants';
import type { NoticeStep } from '../../RecordNotices/types/notices';
import { noticeDateText } from '../../RecordNotices/utils/noticeRecord';
import type { CpoAnswers } from '../hooks/useCpoApplicationAnswers';

/** Empty answers stay blank, same as NWL Check your answers. */
export const NOT_ANSWERED = '';

export interface AnswerFile {
  key: string;
  filename: string;
  s3Key: string;
  fileId: string;
  documentId: string;
  /** False while the virus check is still running or the file failed it. */
  clean: boolean;
  detail?: string;
}

export interface FileListOptions {
  canDownload: boolean;
  applicationId: string;
  onDownloadError: () => void;
  empty?: string;
}

export const meetingAnswer = ({
  pre_submission_meeting_answer: answer,
  pre_submission_meeting_requested: requested,
}: CpoAnswers['application']) => {
  if (answer === 'Yes, I’ve had this meeting') return 'Yes';
  if (answer || typeof requested === 'boolean') return 'No';
  return NOT_ANSWERED;
};

export const fileList = (files: AnswerFile[], options: FileListOptions) => {
  const empty = options.empty ?? 'Not uploaded';
  if (!files.length) return empty;
  return files.map((file) => (
    <React.Fragment key={file.key}>
      <p className="govuk-!-margin-top-0 govuk-!-margin-bottom-0">
        {options.canDownload && file.clean ? (
          <a
            className="govuk-link"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              void downloadS3FileOnSameTab(file.s3Key, file.fileId, options.applicationId, file.documentId).catch(options.onDownloadError);
            }}
          >
            {file.filename}
          </a>
        ) : (
          file.filename
        )}
        {!file.clean && ' (Virus check not complete)'}
      </p>
      {file.detail && <p className="govuk-!-margin-top-0 govuk-!-margin-bottom-0">{file.detail}</p>}
    </React.Fragment>
  ));
};

export const orderFiles = (documents: CpoAnswers['documents']['documents'], categories: string[]): AnswerFile[] =>
  documents
    .filter((file) => categories.includes(file.category))
    .map((file) => ({
      key: file.document_id,
      filename: file.filename,
      s3Key: file.s3_key,
      fileId: file.file_id,
      documentId: file.document_id,
      clean: true,
    }));

export const ORDER_DOCUMENT_GROUPS = DOCUMENT_GROUP_CATEGORIES;
export const ORDER_DOCUMENT_CATEGORIES = DOCUMENT_CATEGORIES;

export const summaryFiles = (documents: CpoAnswers['order']['documents']): AnswerFile[] =>
  documents.map((file) => ({
    key: file.document_id,
    filename: file.filename,
    s3Key: file.s3_key,
    fileId: file.file_id,
    documentId: file.document_id,
    clean: file.scan_status === 'COMPLETED' && file.scan_result === 'CLEAN',
  }));

/** Notice files only reach the record once uploaded; the download endpoint checks the scan itself. */
export const noticeFiles = (
  notices: CpoAnswers['notices'],
  step: NoticeStep,
  datedEach?: string,
): AnswerFile[] =>
  notices.documents
    .filter((file) => file.category === NOTICE_CATEGORIES[step])
    .map((file) => {
      const date = notices.record[step]?.evidence?.find((entry) => entry.fileId === file.file_id)?.date;
      return {
        key: file.document_id,
        filename: file.filename,
        s3Key: '',
        fileId: file.file_id,
        documentId: file.document_id,
        clean: true,
        detail: datedEach ? `${datedEach} ${noticeDateText(date)}` : undefined,
      };
    });

export const completedNotice = (
  notices: CpoAnswers['notices'],
  step: NoticeStep,
  label: string,
  options: FileListOptions,
) => {
  const files = noticeFiles(notices, step);
  const date = notices.record[step]?.completionDate;
  return (
    <>
      {fileList(files, options)}
      {date && <p className="govuk-!-margin-top-0 govuk-!-margin-bottom-0">{label} {noticeDateText(date)}</p>}
    </>
  );
};

export const changeUrlFor = (base: string, path: string, editable: boolean) =>
  editable ? `${base}/${path}?from=check-and-submit` : undefined;
