import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import FileUpload, { type FileUploadHandle } from '../../../components/FileUpload';
import ErrorSummary from '../../../components/commonFormFields/ErrorSummary';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { useEiaFees } from '../../../hooks/useEiaFees';
import type { AuthUser } from '../../../types/auth';
import type { ApplicationDocument, UploadedFile } from '../../../types/fileUpload';
import { getNextPageUrl, TASK_NAMES } from '../../../utils/taskListUtils';
import { createLogger } from '../../../utils/logger';
import '../../../styles/_file_upload.scss';
import { EIA_ASSESSMENT, EIA_CONTENT, EIA_REPORT_MAX_FILES } from '../constants/eiaAssessment';
import { getEiaAssessment, toEiaAnswers } from '../utils/eiaAssessment';
import { EIA_FEES_ERROR_MESSAGES, EIAFeesErrorField, validateEiaReport, type ValidationError } from '../validations';

const logger = createLogger('EiaReportUploadPage');
const SCAN_IN_PROGRESS = 'File scan is in progress. Wait for the scan to finish before continuing.';
// The error summary links to the file input itself.
const FILE_INPUT_ID = 'file-upload-input';

// SYEIA-1485 Image 4: shown only after the applicant chooses a full EIA.
const EiaReportUploadPage: React.FC = () => {
    const navigate = useNavigate();
    const applicationId = useGetApplicationId();
    const { user } = useAuthUserContext();
    const userId = (user as AuthUser)?.user_id;
    const eiaUrl = `${S37_BASE_URL}/${applicationId}/eia-fees`;
    const taskListUrl = `${S37_BASE_URL}/${applicationId}/task-list`;

    useBreadcrumb(
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
                <li className="govuk-breadcrumbs__list-item">
                    <Link className="govuk-breadcrumbs__link" to={taskListUrl}>Task list</Link>
                </li>
                <li className="govuk-breadcrumbs__list-item">
                    <Link className="govuk-breadcrumbs__link" to={eiaUrl}>{EIA_CONTENT.BREADCRUMB}</Link>
                </li>
                <li className="govuk-breadcrumbs__list-item" aria-current="page">{EIA_CONTENT.UPLOAD_TITLE}</li>
            </ol>
        </nav>
    );

    const { eiaFees, loading, error: loadError, fetchEiaFees, updateEiaFees } = useEiaFees();
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
    const [fileErrors, setFileErrors] = useState<string[]>([]);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [saving, setSaving] = useState(false);
    const fileUploadRef = useRef<FileUploadHandle>(null);
    const errorSummaryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (applicationId) fetchEiaFees(applicationId);
    }, [applicationId, fetchEiaFees]);

    useEffect(() => {
        // No saved answer yet: the assessment question comes first.
        if (loadError && !eiaFees) {
            navigate(eiaUrl, { replace: true });
            return;
        }
        if (!eiaFees || eiaFees.applicationId !== applicationId) return;
        // The report belongs to a full EIA only.
        if (getEiaAssessment(eiaFees.isEiaDevelopment, eiaFees.screeningOnly) !== EIA_ASSESSMENT.FULL_EIA) {
            navigate(eiaUrl, { replace: true });
            return;
        }
        setUploadedFiles(eiaFees.uploadedFiles ?? []);
        setApplicationDocuments(eiaFees.applicationDocuments ?? []);
    }, [eiaFees, loadError, applicationId, eiaUrl, navigate]);

    useEffect(() => {
        if (errors.length > 0) errorSummaryRef.current?.focus();
    }, [errors]);

    const handleSubmit = async (saveType: 'continue' | 'later') => {
        if (fileUploadRef.current?.isBusy()) {
            setFileErrors([SCAN_IN_PROGRESS]);
            return;
        }
        let newlyUploaded: UploadedFile[] = [];
        if (fileUploadRef.current) {
            try {
                const result = await fileUploadRef.current.triggerUpload();
                if (result.scanErrors.length > 0) {
                    setFileErrors(result.scanErrors);
                    return;
                }
                newlyUploaded = result.uploadedFiles;
                setUploadedFiles((prev) => [...prev, ...result.uploadedFiles]);
                setApplicationDocuments((prev) => [...prev, ...result.applicationDocuments]);
            } catch (err) {
                logger.error('EIA report upload failed', err);
                setErrors([{ field: 'general', message: EIA_FEES_ERROR_MESSAGES.API.SUBMIT_FAILED }]);
                return;
            }
        }

        const validationErrors = saveType === 'continue' ? validateEiaReport(uploadedFiles.length + newlyUploaded.length) : [];
        setErrors(validationErrors);
        if (validationErrors.length > 0 || !eiaFees?.eiaFeeId) return;

        setSaving(true);
        try {
            // Saving the answer again lets the backend mark the section complete now the report is there.
            await updateEiaFees({
                eiaFeeId: eiaFees.eiaFeeId,
                applicationId,
                ...toEiaAnswers(EIA_ASSESSMENT.FULL_EIA),
                updatedAt: new Date().toISOString(),
                updatedBy: userId,
            });
            navigate(saveType === 'later' ? taskListUrl : getNextPageUrl(TASK_NAMES.EIA_FEES, applicationId));
        } catch {
            setErrors([{ field: 'general', message: EIA_FEES_ERROR_MESSAGES.API.SUBMIT_FAILED }]);
        } finally {
            setSaving(false);
        }
    };

    if (loading && !eiaFees) return <p className="govuk-body">Loading...</p>;

    const reportError = errors.find((e) => e.field === EIAFeesErrorField.EIA_REPORT)?.message;
    const summaryErrors = errors.map((e) => ({
        fieldId: e.field === EIAFeesErrorField.EIA_REPORT ? FILE_INPUT_ID : e.field,
        message: e.message,
    }));

    return (
        <>
            <PageTitle title={EIA_CONTENT.UPLOAD_TITLE} />
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <ErrorSummary ref={errorSummaryRef} errors={summaryErrors} />
                    <h1 className="govuk-heading-l">{EIA_CONTENT.UPLOAD_TITLE}</h1>
                    <p className="govuk-body">
                        You need to submit an EIA report as part of your request for a full environmental impact assessment (EIA).
                    </p>
                    <div className={`govuk-form-group${reportError || fileErrors.length > 0 ? ' govuk-form-group--error' : ''}`}>
                        {reportError && (
                            <p className="govuk-error-message" id={`${EIAFeesErrorField.EIA_REPORT}-error`}>
                                <span className="govuk-visually-hidden">Error:</span> {reportError}
                            </p>
                        )}
                        {fileErrors.map((error, index) => (
                            <p key={index} className="govuk-error-message">
                                <span className="govuk-visually-hidden">Error:</span> {error}
                            </p>
                        ))}
                        <FileUpload
                            ref={fileUploadRef}
                            title="Upload a file"
                            titleHeadingLevel="h2"
                            prefix={`${applicationId}/${FILE_CATEGORIES.EIA_REPORT}`}
                            applicationId={applicationId}
                            category={FILE_CATEGORIES.EIA_REPORT}
                            addedBy={userId}
                            maxFiles={EIA_REPORT_MAX_FILES}
                            uploadedFiles={uploadedFiles}
                            applicationDocuments={applicationDocuments}
                            uploadImmediately={true}
                            onUploaded={(files, documents) => {
                                setUploadedFiles((prev) => [...prev, ...files]);
                                setApplicationDocuments((prev) => [...prev, ...documents]);
                                setErrors([]);
                            }}
                            onDeleteFile={(fileId) => {
                                setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
                                setApplicationDocuments((prev) => prev.filter((doc) => doc.fileId !== fileId));
                            }}
                            onValidationErrors={setFileErrors}
                        />
                    </div>
                    <div className="govuk-button-group">
                        <button
                            type="button"
                            className="govuk-button"
                            data-module="govuk-button"
                            disabled={saving}
                            onClick={() => handleSubmit('continue')}
                        >
                            Save and continue
                        </button>
                        <button
                            type="button"
                            className="govuk-button govuk-button--secondary"
                            data-module="govuk-button"
                            disabled={saving}
                            onClick={() => handleSubmit('later')}
                        >
                            Save for later
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EiaReportUploadPage;
