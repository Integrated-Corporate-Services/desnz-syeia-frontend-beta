import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { getSensitiveAreaReviewSummary, SensitiveAreaReviewSummary as ReviewSummaryData } from '../../../services/sensitiveAreaService';
import { getSensitiveAreaReview } from '../../../services/sensitiveAreaReviewService';
import { SensitiveAreaReview } from '../../../types/sensitiveAreaReviewTypes';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { SensitiveAreaPoleOption } from '../../../types/SensitiveAreaPoleOption';
import { downloadS3FileOnSameTab } from '../../../utils/s3DownloadUtil';
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

        console.log('=== FETCHING DATA ===');
        console.log('ApplicationId:', applicationId);

        Promise.all([getSensitiveAreaReviewSummary(applicationId), getSensitiveAreaReview(applicationId)])
            .then(([summaryData, reviewData]) => {
                console.log('Summary Data received:', summaryData);
                console.log('Review Data received:', reviewData);
                setReviewSummary(summaryData);
                setReview(reviewData?.[0] || null);
                console.log('Review set to:', reviewData?.[0] || null);
            })
            .catch((err) => {
                console.error('Failed to fetch sensitive area review data:', err);
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
                                    <h2 className="govuk-summary-card__title">Sensitive area review</h2>
                                </div>
                                <div className="govuk-summary-card__content">
                                    <dl className="govuk-summary-list">
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">Other areas the route passes through</dt>
                                            <dd className="govuk-summary-list__value">
                                                {(() => {
                                                    console.log('=== SENSITIVE AREA REVIEW SUMMARY DEBUG ===');
                                                    console.log('Full reviewSummary:', reviewSummary);
                                                    console.log('reviewSummary?.checks?.manual:', reviewSummary?.checks?.manual);

                                                    const selectedLayers = reviewSummary?.checks?.manual?.selected || [];
                                                    const customAddedLayers = reviewSummary?.checks?.manual?.customAdded || [];

                                                    console.log('selectedLayers:', selectedLayers);
                                                    console.log('selectedLayers count:', selectedLayers.length);
                                                    console.log('customAddedLayers:', customAddedLayers);
                                                    console.log('customAddedLayers count:', customAddedLayers.length);

                                                    // Extract layer names from selected layers
                                                    const selectedLayerNames = selectedLayers.map((layer: any) => layer.layerName).filter(Boolean);

                                                    // Extract layer names from custom added layers
                                                    const customLayerNames = customAddedLayers
                                                        .map((layer: any) => {
                                                            console.log('Custom layer object:', layer);
                                                            return layer.layerName || layer.layer_name || layer.name;
                                                        })
                                                        .filter(Boolean);

                                                    console.log('selectedLayerNames:', selectedLayerNames);
                                                    console.log('customLayerNames:', customLayerNames);

                                                    const allLayerNames = [...selectedLayerNames, ...customLayerNames];
                                                    console.log('allLayerNames combined:', allLayerNames);

                                                    if (allLayerNames.length === 0) {
                                                        console.log('No layer names found, returning dash');
                                                        return '-';
                                                    }

                                                    // Get unique layer names
                                                    const uniqueLayerNames = Array.from(new Set(allLayerNames));
                                                    console.log('uniqueLayerNames:', uniqueLayerNames);
                                                    console.log('=== END DEBUG ===');

                                                    return (
                                                        <ul className="govuk-list govuk-list--bullet">
                                                            {uniqueLayerNames.map((layerName, index) => (
                                                                <li key={index}>{layerName}</li>
                                                            ))}
                                                        </ul>
                                                    );
                                                })()}
                                            </dd>
                                        </div>
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">Environmental and archaeological documents</dt>
                                            <dd className="govuk-summary-list__value">
                                                {(() => {
                                                    console.log('=== DOCUMENTS DEBUG ===');
                                                    console.log('review object:', review);
                                                    console.log('review?.application_documents:', review?.application_documents);
                                                    console.log('documents length:', review?.application_documents?.length);

                                                    if (!review?.application_documents || review.application_documents.length === 0) {
                                                        console.log('No documents found');
                                                        return '-';
                                                    }

                                                    console.log('Rendering documents:', review.application_documents);

                                                    return (
                                                        <ul className="govuk-list">
                                                            {review.application_documents.map((doc: any, idx: number) => (
                                                                <li key={idx}>
                                                                    <a
                                                                        href="#"
                                                                        className="govuk-link"
                                                                        onClick={async (e) => {
                                                                            e.preventDefault();
                                                                            const key = doc.s3_key || doc.file_id;
                                                                            if (key) {
                                                                                try {
                                                                                    await downloadS3FileOnSameTab(key);
                                                                                } catch (error) {
                                                                                    logger.error('Failed to download file:', { error });
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        {doc.title || 'Document'}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    );
                                                })()}
                                            </dd>
                                        </div>
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">Poles and lines within sensitive area</dt>
                                            <dd className="govuk-summary-list__value">
                                                {(() => {
                                                    console.log('=== POLES DEBUG ===');
                                                    console.log('review?.asset_presence_option_id:', review?.asset_presence_option_id);
                                                    console.log('SensitiveAreaPoleOption.POLES_WITHIN:', SensitiveAreaPoleOption.POLES_WITHIN);

                                                    if (review?.asset_presence_option_id === SensitiveAreaPoleOption.POLES_WITHIN) {
                                                        return 'Yes, there are poles in the sensitive areas';
                                                    } else if (review?.asset_presence_option_id === 2) {
                                                        return 'No, the lines are overhead only';
                                                    } else {
                                                        return '-';
                                                    }
                                                })()}
                                            </dd>
                                        </div>
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
