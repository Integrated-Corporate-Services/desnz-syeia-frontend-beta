import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useAssetStore } from '../../../store/useAssetStore';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

/**
 * Read-only Assets Summary Page
 * Displayed when consultations have started (section locked)
 */
const AssetSummary: React.FC = () => {
    const applicationId = useGetApplicationId();
    const { assets, loading, fetchAssets } = useAssetStore();

    useEffect(() => {
        if (applicationId) {
            fetchAssets(applicationId);
        }
    }, [applicationId, fetchAssets]);

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

                        {loading ? (
                            <p className="govuk-body">Loading...</p>
                        ) : assets && assets.length > 0 ? (
                            <div className="govuk-summary-card">
                                <div className="govuk-summary-card__title-wrapper">
                                    <h2 className="govuk-summary-card__title">Assets</h2>
                                </div>
                                <div className="govuk-summary-card__content">
                                    <dl className="govuk-summary-list">
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">Standard specification reference number</dt>
                                            <dd className="govuk-summary-list__value">{assets[0].standardSpecificationReferenceNumber || '-'}</dd>
                                        </div>
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">Type of line</dt>
                                            <dd className="govuk-summary-list__value">{assets[0].typeOfLine ? assets[0].typeOfLine.charAt(0).toUpperCase() + assets[0].typeOfLine.slice(1) : '-'}</dd>
                                        </div>
                                        {assets[0].typeOfLine === 'transmission' && assets[0].tori_noi && (
                                            <div className="govuk-summary-list__row">
                                                <dt className="govuk-summary-list__key">TORI/NOI code for this project</dt>
                                                <dd className="govuk-summary-list__value">{assets[0].tori_noi}</dd>
                                            </div>
                                        )}
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">Line voltage</dt>
                                            <dd className="govuk-summary-list__value">{assets[0].lineVoltage ? (Array.isArray(assets[0].lineVoltage) ? assets[0].lineVoltage.join(', ') : assets[0].lineVoltage) : '-'}</dd>
                                        </div>
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">Line length</dt>
                                            <dd className="govuk-summary-list__value">{assets[0].lineLength ? `${assets[0].lineLength}m` : '-'}</dd>
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
    );
};

export default AssetSummary;
