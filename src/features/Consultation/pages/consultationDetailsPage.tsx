import React, { useEffect, useState } from 'react';
import { S37_BASE_URL } from '../../../constants/s37';
import { Link, useNavigate } from 'react-router-dom';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import ConsultationSummaryCard from '../components/SummaryCard';
import { useConsultationDetails } from '../../../hooks/useConsultationDetails';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { ConsultationStatus } from '../../../constants/consultationStatus';
import { ConsultationType, isOtherConsultation } from '../../../constants/consultationType';
import { progressApiService } from '../../../services/progressApiService';
import { getNextPageUrl, TASK_NAMES } from '../../../utils/taskListUtils';
import { createLogger } from '../../../utils/logger';
import SkipLink from '../../../components/SkipLink';

const logger = createLogger('ConsultationDetailsPage');

const ConsultationDetailsPage: React.FC = () => {
    const applicationId = useGetApplicationId();
    const { user } = useAuthUser();
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { consultations } = useConsultationDetails(applicationId, user?.user_id);

    // Separate consultations into regular and OTHER types
    // Note: "OTHER-LPA" consultations are treated as OTHER for display purposes
    const regularConsultations = consultations.filter((c) => !isOtherConsultation(c.consultationType || ''));
    const otherConsultations = consultations.filter((c) => isOtherConsultation(c.consultationType || ''));

    // Separate active and historical consultations
    // Only withdrawn consultations are considered historical
    const isHistoricalStatus = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        return normalizedStatus === ConsultationStatus.WITHDRAWN.toLowerCase();
    };

    // Filter active and historical for regular consultations
    const activeRegularConsultations = regularConsultations.filter((c) => !isHistoricalStatus(c.status));
    const historicalRegularConsultations = regularConsultations.filter((c) => isHistoricalStatus(c.status));

    // Filter active and historical for other consultations
    const activeOtherConsultations = otherConsultations.filter((c) => !isHistoricalStatus(c.status));
    const historicalOtherConsultations = otherConsultations.filter((c) => isHistoricalStatus(c.status));

    // Combine all historical consultations
    const allHistoricalConsultations = [...historicalRegularConsultations, ...historicalOtherConsultations];

    const handleRemoveConsultation = (consultationId: string, consultationName: string) => {
        // Navigate to the Remove Consultation page
        navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/remove?consultationName=${encodeURIComponent(consultationName)}`);
    };

    const handleSaveAndContinue = async () => {
        // Clear any existing errors
        setError('');

        // Check if all MANDATORY consultations (excluding OTHER consultees) are closed, not required, or withdrawn
        // OTHER consultations are optional and should not block progression
        const allMandatoryConsultationsClosed = regularConsultations.every(
            (consultation) =>
                consultation.status.toLowerCase() === ConsultationStatus.CLOSED.toLowerCase() ||
                consultation.status.toLowerCase() === ConsultationStatus.NOT_REQUIRED.toLowerCase() ||
                consultation.status.toLowerCase() === ConsultationStatus.WITHDRAWN.toLowerCase()
        );

        if (!allMandatoryConsultationsClosed) {
            setError('All mandatory consultations (LPA, Non-LPA, and Public Notices) must be closed or marked as not required before you can continue');
            // Scroll to error summary
            const errorSummary = document.getElementById('error-summary');
            if (errorSummary) {
                errorSummary.focus();
                errorSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
        }

        try {
            setIsSubmitting(true);
            // Mark consultations as completed
            await progressApiService.updateApplicationProgress(applicationId, 'Consultations', 'Completed');

            // Navigate to next page
            const nextPageUrl = getNextPageUrl(TASK_NAMES.CONSULTATIONS, applicationId);
            navigate(nextPageUrl);
        } catch (err) {
            logger.error('Error updating progress', { error: err });
            setError('Failed to save progress. Please try again.');
            const errorSummary = document.getElementById('error-summary');
            if (errorSummary) {
                errorSummary.focus();
                errorSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <SkipLink />
            <div className="govuk-width-container">
            <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
                <ol className="govuk-breadcrumbs__list">
                    <li className="govuk-breadcrumbs__list-item">
                        <Link to={`${S37_BASE_URL}/${applicationId}/task-list`} className="govuk-breadcrumbs__link">
                            Task list
                        </Link>
                    </li>
                    <li className="govuk-breadcrumbs__list-item" aria-current="page">
                        Consultation details
                    </li>
                </ol>
            </nav>
            <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    {error && (
                        <div className="govuk-error-summary govuk-!-width-two-thirds" data-module="govuk-error-summary" id="error-summary" tabIndex={-1} role="alert">
                            <h2 className="govuk-error-summary__title">There is a problem</h2>
                            <div className="govuk-error-summary__body">
                                <ul className="govuk-list govuk-error-summary__list">
                                    <li>{error}</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    <h1 className="govuk-heading-l">Manage consultations</h1>

                    {/* Warning about locked sections once consultations start */}
                    <div className="govuk-warning-text govuk-!-margin-top-0">
                        <span className="govuk-warning-text__icon" aria-hidden="true">
                            !
                        </span>
                        <strong className="govuk-warning-text__text">
                            <span className="govuk-visually-hidden">Warning</span>
                            Once you start the first consultation, you will not be able to make changes to these sections of this application: Asset information, Route, Sensitive area checks, Sensitive area review, Parishes, EIA.
                        </strong>
                    </div>

                    <p className="govuk-body">You must send a consultation request to the mandatory organisations (LPA, Non-LPA, and Public Notices) shown on this page.</p>
                    <div className="govuk-body">
                        <p>For each mandatory organisation you must:</p>
                        <ul className="govuk-list govuk-list--bullet">
                            <li>send a request (or show that you have sent a request)</li>
                            <li>upload any response received</li>
                        </ul>
                        <p>For Natural England, you can mark the consultation as 'Not required' and you will be asked to explain why it is not required.</p>
                        <p className="govuk-body govuk-!-font-weight-bold">Other consultations you add are optional and will not block progression to the next section.</p>
                    </div>

                    {/* Active Regular consultations */}
                    {activeRegularConsultations.map((consultation) => {
                        const isPublic = consultation.consultationType === ConsultationType.PUBLIC;

                        return (
                            <ConsultationSummaryCard
                                key={consultation.id}
                                orgName={consultation.consulteeOrganisationName}
                                consultationName={consultation.otherConsultee || consultation.consulteeOrganisationName || consultation.consultationType}
                                status={consultation.status}
                                consultationId={consultation.id}
                                applicationId={applicationId}
                                consultationType={consultation.consultationType}
                                // For PUBLIC: use firstDatePublished, otherwise use dateRequestCreated
                                dateRequestCreated={isPublic ? (consultation.firstDatePublished ?? undefined) : (consultation.dateRequestCreated ?? undefined)}
                                // secondDatePublished for PUBLIC consultations
                                secondDatePublished={isPublic ? (consultation.secondDatePublished ?? undefined) : (consultation.secondDate ?? undefined)}
                                dateClosed={consultation.dateClosed ?? undefined}
                                objectionRaised={consultation.objectionRaised}
                                closeComments={consultation.closeComments}
                                // For PUBLIC: use publicResponseDocuments, otherwise use responseDocuments
                                responseDocuments={isPublic ? consultation.publicResponseDocuments : consultation.responseDocuments}
                                respondingConsulteeName={consultation.respondingConsulteeName}
                                respondingConsulteeEmail={consultation.respondingConsulteeEmail}
                                notRequiredMessage={consultation.notRequiredReason}
                                notRequiredDocs={consultation.notRequiredDocs}
                                // For PUBLIC: use evidenceOfPublicationDocs, otherwise use consultationRequestDocs
                                consultationRequestDocs={isPublic ? consultation.evidenceOfPublicationDocs : consultation.consultationRequestDocs}
                                lpaConsultationForm={consultation.lpaConsultationForm}
                                evidenceResponseNotReceivedDocs={consultation.evidenceResponseNotReceivedDocs}
                            />
                        );
                    })}
                    {/* Active Other consultations section */}
                    {activeOtherConsultations.length > 0 && (
                        <>
                            <h2 className="govuk-heading-m govuk-!-margin-top-6">Other consultations</h2>
                            <p className="govuk-body">You can add and remove any consultations in this optional section.</p>
                        </>
                    )}

                    {activeOtherConsultations.map((consultation) => {
                        const isPublic = consultation.consultationType === ConsultationType.PUBLIC;

                        return (
                            <ConsultationSummaryCard
                                key={consultation.id}
                                orgName={consultation.consulteeOrganisationName}
                                consultationName={consultation.otherConsultee || consultation.consulteeOrganisationName || consultation.consultationType}
                                status={consultation.status}
                                consultationId={consultation.id}
                                applicationId={applicationId}
                                // For PUBLIC: use firstDatePublished, otherwise use dateRequestCreated
                                dateRequestCreated={isPublic ? (consultation.firstDatePublished ?? undefined) : (consultation.dateRequestCreated ?? undefined)}
                                secondDatePublished={isPublic ? (consultation.secondDatePublished ?? undefined) : (consultation.secondDate ?? undefined)}
                                dateClosed={consultation.dateClosed ?? undefined}
                                objectionRaised={consultation.objectionRaised}
                                closeComments={consultation.closeComments}
                                responseDocuments={isPublic ? consultation.publicResponseDocuments : consultation.responseDocuments}
                                respondingConsulteeName={consultation.respondingConsulteeName}
                                respondingConsulteeEmail={consultation.respondingConsulteeEmail}
                                notRequiredMessage={consultation.notRequiredReason}
                                notRequiredDocs={consultation.notRequiredDocs}
                                consultationRequestDocs={isPublic ? consultation.evidenceOfPublicationDocs : consultation.consultationRequestDocs}
                                lpaConsultationForm={consultation.lpaConsultationForm}
                                evidenceResponseNotReceivedDocs={consultation.evidenceResponseNotReceivedDocs}
                                consultationType={consultation.consultationType}
                                onRemove={() => handleRemoveConsultation(consultation.id, consultation.otherConsultee || consultation.consulteeOrganisationName || consultation.consultationType || 'Consultee')}
                            />
                        );
                    })}

                    <div className="govuk-!-margin-bottom-6 ">
                        <Link to={`${S37_BASE_URL}/${applicationId}/consultation/select-other-consultations`} className="govuk-button govuk-button--secondary ">
                            Add more consultations
                        </Link>
                    </div>

                    {/* View Previous Consultations - Expandable Section */}
                    {allHistoricalConsultations.length > 0 && (
                        <details className="govuk-details govuk-!-margin-top-6 govuk-!-margin-bottom-6" data-module="govuk-details">
                            <summary className="govuk-details__summary">
                                <span className="govuk-details__summary-text">View previous consultations ({allHistoricalConsultations.length})</span>
                            </summary>
                            <div className="govuk-details__text">
                                <p className="govuk-body">These consultations have been withdrawn and are shown here for reference.</p>

                                {allHistoricalConsultations.map((consultation) => {
                                    const isPublic = consultation.consultationType === ConsultationType.PUBLIC;

                                    return (
                                        <ConsultationSummaryCard
                                            key={consultation.id}
                                            orgName={consultation.consulteeOrganisationName}
                                            consultationName={consultation.otherConsultee || consultation.consulteeOrganisationName || consultation.consultationType}
                                            status={consultation.status}
                                            consultationId={consultation.id}
                                            applicationId={applicationId}
                                            consultationType={consultation.consultationType}
                                            dateRequestCreated={isPublic ? (consultation.firstDatePublished ?? undefined) : (consultation.dateRequestCreated ?? undefined)}
                                            secondDatePublished={isPublic ? (consultation.secondDatePublished ?? undefined) : (consultation.secondDate ?? undefined)}
                                            dateClosed={consultation.dateClosed ?? undefined}
                                            objectionRaised={consultation.objectionRaised}
                                            closeComments={consultation.closeComments}
                                            responseDocuments={isPublic ? consultation.publicResponseDocuments : consultation.responseDocuments}
                                            respondingConsulteeName={consultation.respondingConsulteeName}
                                            respondingConsulteeEmail={consultation.respondingConsulteeEmail}
                                            notRequiredMessage={consultation.notRequiredReason}
                                            notRequiredDocs={consultation.notRequiredDocs}
                                            consultationRequestDocs={isPublic ? consultation.evidenceOfPublicationDocs : consultation.consultationRequestDocs}
                                            lpaConsultationForm={consultation.lpaConsultationForm}
                                            evidenceResponseNotReceivedDocs={consultation.evidenceResponseNotReceivedDocs}
                                        />
                                    );
                                })}
                            </div>
                        </details>
                    )}

                    {error && (
                        <p className="govuk-error-message" id="save-error">
                            <span className="govuk-visually-hidden">Error:</span> {error}
                        </p>
                    )}

                    <div className="govuk-button-group">
                        <button type="button" className="govuk-button" data-module="govuk-button" onClick={handleSaveAndContinue} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save and continue'}
                        </button>
                        {/* <Link
              to={`${S37_BASE_URL}/${applicationId}/task-list`}
              className="govuk-button govuk-button--secondary"
              data-module="govuk-button"
            >
              Save for later
            </Link> */}
                    </div>
                </div>
            </div>
            </main>
        </div>
        </>
    );
};

export default ConsultationDetailsPage;
