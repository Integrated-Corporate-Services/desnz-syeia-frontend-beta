import React from 'react';
import { Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useParishes } from '../hooks/useParishes';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

/**
 * Read-only Parishes Summary Page
 * Displayed when consultations have started (section locked)
 */
const ParishesSummary: React.FC = () => {
    const applicationId = useGetApplicationId();
    const { parishes, isLoading } = useParishes(applicationId);

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
                        Parishes
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

                        {isLoading ? (
                            <p className="govuk-body">Loading parishes...</p>
                        ) : (
                            <div className="govuk-summary-card">
                                <div className="govuk-summary-card__title-wrapper">
                                    <h2 className="govuk-summary-card__title">Parishes</h2>
                                </div>
                                <div className="govuk-summary-card__content">
                                    {parishes && parishes.length > 0 ? (
                                        <ul className="govuk-list govuk-list--bullet">
                                            {parishes.map((parish: any) => (
                                                <li key={parish.parishId || parish.id}>{parish.parishName || parish.name}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="govuk-body">No parishes added.</p>
                                    )}
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
        </>
    );
};

export default ParishesSummary;
