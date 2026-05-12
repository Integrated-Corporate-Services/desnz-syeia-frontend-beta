import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useEiaFeesStore } from '../../../store/useEiaFeesStore';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

/**
 * Read-only EIA Fees Summary Page
 * Displayed when consultations have started (section locked)
 */
const EIAFeesSummary: React.FC = () => {
    const applicationId = useGetApplicationId();
    const eiaFees = useEiaFeesStore((state) => state.eiaFees);
    const fetchEiaFees = useEiaFeesStore((state) => state.fetchEiaFees);
    const loading = useEiaFeesStore((state) => state.loading);

    useEffect(() => {
        if (!applicationId) return;
        fetchEiaFees(applicationId);
    }, [applicationId, fetchEiaFees]);

    return (
        <div className="govuk-width-container">
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

            <main className="govuk-main-wrapper" id="main-content">
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

                        {loading ? (
                            <p className="govuk-body">Loading...</p>
                        ) : (
                            <div className="govuk-summary-card">
                                <div className="govuk-summary-card__title-wrapper">
                                    <h2 className="govuk-summary-card__title">EIA</h2>
                                </div>
                                <div className="govuk-summary-card__content">
                                    <dl className="govuk-summary-list">
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">Is this an EIA development?</dt>
                                            <dd className="govuk-summary-list__value">{eiaFees?.isEiaDevelopment !== undefined ? (eiaFees.isEiaDevelopment ? 'Yes' : 'No') : '-'}</dd>
                                        </div>
                                        {eiaFees?.isEiaDevelopment && (
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">Is this screening only?</dt>
                                                <dd className="govuk-summary-list__value">{eiaFees?.screeningOnly !== undefined ? (eiaFees.screeningOnly ? 'Yes' : 'No') : '-'}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </div>
                        )}

                        <Link to={`${S37_BASE_URL}/${applicationId}/task-list`} className="govuk-button govuk-button--secondary" data-module="govuk-button">
                            Return to task list
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EIAFeesSummary;
