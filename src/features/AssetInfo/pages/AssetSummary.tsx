import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useAssets } from '../../../hooks/useAssets';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { useConsultationDetails } from '../../../hooks/useConsultationDetails';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { ConsultationStatus } from '../../../constants/consultationStatus';

/**
 * Assets Summary Page
 * Shows asset details with individual Change links per section (except line voltage)
 * When consultations start, Change links are hidden (read-only mode)
 */
const AssetSummary: React.FC = () => {
    const applicationId = useGetApplicationId();
    const { assets, loading, fetchAssets } = useAssets();
    const { user } = useAuthUser();
    const { consultations, loading: consultationsLoading } = useConsultationDetails(applicationId, user?.user_id);

    // Custom logic for Asset Summary: Hide change links when PUBLIC consultation started OR all consultations closed
    const shouldHideChangeLinks = useMemo(() => {
        if (!consultations || consultations.length === 0) {
            return false;
        }

        // Find the PUBLIC consultation
        const publicConsultation = consultations.find(
            (consultation) => consultation.consultationType === 'PUBLIC'
        );

        // Check if public notice consultation has started
        const publicNoticeStarted = publicConsultation && 
            publicConsultation.status.toLowerCase() !== ConsultationStatus.NOT_STARTED.toLowerCase();

        // Check if ALL consultations are closed
        const allConsultationsComplete = consultations.every(
            (consultation) => {
                const status = consultation.status.toLowerCase();
                return status === ConsultationStatus.CLOSED.toLowerCase() || 
                       status === 'not required' ||
                       status === 'completed';
            }
        );

        return publicNoticeStarted || allConsultationsComplete;
    }, [consultations]);

    useEffect(() => {
        if (applicationId) {
            fetchAssets(applicationId);
        }
    }, [applicationId, fetchAssets]);

    return (
        <>
                        <div className="govuk-width-container">
            <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
                <ol className="govuk-breadcrumbs__list">
                    <li className="govuk-breadcrumbs__list-item">
                        <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
                            Task list
                        </Link>
                    </li>
                    <li className="govuk-breadcrumbs__list-item" aria-current="page">
                        Assets
                    </li>
                </ol>
            </nav>

            <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        {/* Warning banner */}
                        <div className="govuk-warning-text">
                            <span className="govuk-warning-text__icon" aria-hidden="true">
                                !
                            </span>
                            <strong className="govuk-warning-text__text">
                                <span className="govuk-visually-hidden">Warning</span>
                                Once you start the first consultation, you will not be able to make changes to these sections of this application: Asset information, Route, Sensitive area checks, Sensitive area review, Parishes, EIA.
                            </strong>
                        </div>

                        {loading || consultationsLoading ? (
                            <p className="govuk-body">Loading...</p>
                        ) : assets && assets.length > 0 ? (
                            <div className="govuk-summary-card">
                                <div className="govuk-summary-card__title-wrapper">
                                    <h2 className="govuk-summary-card__title">Assets</h2>
                                </div>
                                <div className="govuk-summary-card__content">
                                    <dl className="govuk-summary-list">
                                        {/* Standard specification reference number - WITH CHANGE LINK */}
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">Standard specification reference number</dt>
                                            <dd className="govuk-summary-list__value">{assets[0].standardSpecificationReferenceNumber || '-'}</dd>
                                            {!shouldHideChangeLinks && (
                                                <dd className="govuk-summary-list__actions">
                                                    <Link
                                                        to={`${S37_BASE_URL}/${applicationId}/asset-information`}
                                                        state={{ fromSummary: true }}
                                                        className="govuk-link"
                                                    >
                                                        Change<span className="govuk-visually-hidden"> standard specification reference number</span>
                                                    </Link>
                                                </dd>
                                            )}
                                        </div>
                                        
                                        {/* Type of line - WITH CHANGE LINK */}
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">Type of line</dt>
                                            <dd className="govuk-summary-list__value">{assets[0].typeOfLine ? assets[0].typeOfLine.charAt(0).toUpperCase() + assets[0].typeOfLine.slice(1) : '-'}</dd>
                                            {!shouldHideChangeLinks && (
                                                <dd className="govuk-summary-list__actions">
                                                    <Link
                                                        to={`${S37_BASE_URL}/${applicationId}/asset-information`}
                                                        state={{ fromSummary: true }}
                                                        className="govuk-link"
                                                    >
                                                        Change<span className="govuk-visually-hidden"> type of line</span>
                                                    </Link>
                                                </dd>
                                            )}
                                        </div>
                                        
                                        {/* TORI/NOI code - WITH CHANGE LINK */}
                                        {assets[0].typeOfLine === 'transmission' && assets[0].tori_noi && (
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">TORI/NOI code for this project</dt>
                                                <dd className="govuk-summary-list__value">{assets[0].tori_noi}</dd>
                                                {!shouldHideChangeLinks && (
                                                    <dd className="govuk-summary-list__actions">
                                                        <Link
                                                            to={`${S37_BASE_URL}/${applicationId}/asset-information`}
                                                            state={{ fromSummary: true }}
                                                            className="govuk-link"
                                                        >
                                                            Change<span className="govuk-visually-hidden"> TORI/NOI code</span>
                                                        </Link>
                                                    </dd>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Line voltage - NO CHANGE LINK (as per requirements) */}
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">Line voltage</dt>
                                            <dd className="govuk-summary-list__value">{assets[0].lineVoltage ? (Array.isArray(assets[0].lineVoltage) ? assets[0].lineVoltage.join(', ') : assets[0].lineVoltage) : '-'}</dd>
                                        </div>
                                        
                                        {/* Line length - WITH CHANGE LINK */}
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">Line length</dt>
                                            <dd className="govuk-summary-list__value">{assets[0].lineLength ? `${assets[0].lineLength}m` : '-'}</dd>
                                            {!shouldHideChangeLinks && (
                                                <dd className="govuk-summary-list__actions">
                                                    <Link
                                                        to={`${S37_BASE_URL}/${applicationId}/asset-information`}
                                                        state={{ fromSummary: true }}
                                                        className="govuk-link"
                                                    >
                                                        Change<span className="govuk-visually-hidden"> line length</span>
                                                    </Link>
                                                </dd>
                                            )}
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        ) : (
                            <p className="govuk-body">No asset information available.</p>
                        )}

                        <Link to={`${S37_BASE_URL}/${applicationId}/task-list`} className="govuk-button govuk-button--secondary" data-module="govuk-button">
                            Return to task list
                        </Link>
                    </div>
                </div>
            </main>
            </div>
        </>
    );
};

export default AssetSummary;
