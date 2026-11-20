import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useEiaFees } from '../../../hooks/useEiaFees';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import EiaFeesSummaryCard from '../component/EiaFeesSummaryCard';
import { EIA_ASSESSMENT, EIA_CONTENT } from '../constants/eiaAssessment';
import { useEditableDraft } from '../hooks/useEditableDraft';
import { useEiaFeesCompletion } from '../hooks/useEiaFeesCompletion';
import { getEiaAssessment } from '../utils/eiaAssessment';

/**
 * Read-only EIA Fees Summary Page
 * Displayed when consultations have started (section locked)
 */
const EIAFeesSummary: React.FC = () => {
    const applicationId = useGetApplicationId();
    const { eiaFees, fetchEiaFees, loading } = useEiaFees();
    // SYEIA-1485 recovery: a full EIA without a report on a draft can still have the report uploaded, and one whose
    // report was uploaded but whose save failed (section not Completed) can still finish that save.
    const fullEia = !loading && !!eiaFees
        && getEiaAssessment(eiaFees.isEiaDevelopment, eiaFees.screeningOnly) === EIA_ASSESSMENT.FULL_EIA;
    const reportMissing = fullEia && (eiaFees?.applicationDocuments ?? []).length === 0;
    const completionPending = useEiaFeesCompletion(applicationId, fullEia && !reportMissing) === 'incomplete';
    const recoveryNeeded = reportMissing || completionPending;
    const canUploadReport = useEditableDraft(applicationId, recoveryNeeded) === 'editable' && recoveryNeeded;

    useBreadcrumb(
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
                <li className="govuk-breadcrumbs__list-item">
                    <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
                        Task list
                    </Link>
                </li>
                <li className="govuk-breadcrumbs__list-item" aria-current="page">
                    EIA
                </li>
            </ol>
        </nav>
    );

    useEffect(() => {
        if (!applicationId) return;
        fetchEiaFees(applicationId);
    }, [applicationId, fetchEiaFees]);

    return (
        <>
            <PageTitle title="EIA fees summary" />
                        <div className="govuk-width-container">
                            <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        {/* Warning banner */}
                        <h1 className="govuk-heading-l">EIA</h1>
                        <div className="govuk-warning-text">
                            <span className="govuk-warning-text__icon" aria-hidden="true">
                                !
                            </span>
                            <strong className="govuk-warning-text__text">
                                <span className="govuk-visually-hidden">Warning</span>
                                Once you start the first consultation, you will not be able to make changes to these sections of this application: Asset information, Route, Sensitive area checks, Sensitive area review, Parishes, EIA.
                            </strong>
                        </div>

                        {loading ? (
                            <p className="govuk-body">Loading...</p>
                        ) : (
                            <EiaFeesSummaryCard
                                title="EIA"
                                isEiaDevelopment={eiaFees?.isEiaDevelopment}
                                screeningOnly={eiaFees?.screeningOnly}
                                reportNames={(eiaFees?.applicationDocuments ?? []).map((doc) => doc.title).filter((title): title is string => !!title)}
                            />
                        )}

                        {canUploadReport && (
                            <div className="govuk-inset-text">
                                <p className="govuk-body">
                                    {reportMissing ? EIA_CONTENT.REPORT_MISSING_AFTER_CONSULTATION : EIA_CONTENT.REPORT_NOT_SAVED_AFTER_CONSULTATION}
                                </p>
                                <Link className="govuk-link" to={`${S37_BASE_URL}/${applicationId}/eia-fees/upload-eia-report`}>
                                    {reportMissing ? EIA_CONTENT.UPLOAD_TITLE : EIA_CONTENT.FINISH_SAVING_REPORT}
                                </Link>
                            </div>
                        )}

                        <Link to={`${S37_BASE_URL}/${applicationId}/task-list`} className="govuk-button govuk-button--secondary" data-module="govuk-button">
                            Return to task list
                        </Link>
                    </div>
                </div>
                    </div>
        </>
    );
};

export default EIAFeesSummary;
