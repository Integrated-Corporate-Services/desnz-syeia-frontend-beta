import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { getSensitiveAreaReviewSummary, SensitiveAreaReviewSummary as ReviewSummaryData } from '../../../services/sensitiveAreaService';
import { getSensitiveAreaReview } from '../../../services/sensitiveAreaReviewService';
import { SensitiveAreaReview } from '../../../types/sensitiveAreaReviewTypes';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import SensitiveAreaReviewSummaryRows from '../../CheckYourAnswers/component/SensitiveAreaReviewSummaryRows';
import { SENSITIVE_AREA_LABELS } from '../../../constants/sensitiveAreaLabels';
import type { ReviewSummaryForLayers } from '../../CheckYourAnswers/utils/sensitiveAreaSummaryUtils';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('SensitiveAreaReviewSummary');

/**
 * Read-only Sensitive Area Review Summary Page
 * Displayed when consultations have started (section locked)
 */
const SensitiveAreaReviewSummary: React.FC = () => {
    const applicationId = useGetApplicationId();
    const [loading, setLoading] = useState(true);
    const [reviewSummary, setReviewSummary] = useState<ReviewSummaryData | null>(null);
    const [review, setReview] = useState<SensitiveAreaReview | null>(null);

    useEffect(() => {
        if (!applicationId) return;
        setLoading(true);

        Promise.all([getSensitiveAreaReviewSummary(applicationId), getSensitiveAreaReview(applicationId)])
            .then(([summaryData, reviewData]) => {
                setReviewSummary(summaryData);
                setReview(reviewData?.[0] || null);
            })
            .catch((err) => {
                logger.error('Failed to fetch sensitive area review data', { error: err });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [applicationId]);

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
                        Sensitive area review
                    </li>
                </ol>
            </nav>

            <main className="govuk-main-wrapper" id="main-content" role="main">
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
                                    <h2 className="govuk-summary-card__title">{SENSITIVE_AREA_LABELS.REVIEW_SECTION_TITLE}</h2>
                                </div>
                                <div className="govuk-summary-card__content">
                                    <dl className="govuk-summary-list">
                                        <SensitiveAreaReviewSummaryRows
                                            reviewSummary={reviewSummary as ReviewSummaryForLayers | null}
                                            assetPresenceOptionId={review?.asset_presence_option_id}
                                            applicationDocuments={review?.application_documents}
                                        />
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

export default SensitiveAreaReviewSummary;
