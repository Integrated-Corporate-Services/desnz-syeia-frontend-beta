import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { getSensitiveAreaSettings } from '../../../services/sensitiveAreaSettingsService';
import { getSensitiveAreaReviewSummary, SensitiveAreaReviewSummary as ReviewSummaryData } from '../../../services/sensitiveAreaService';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { getRoutesWithPoints } from '../../../services/routeMapService';
import SensitiveAreaCheckMap from '../../../components/SensitiveAreaCheckMap';
import SensitiveAreaCheckSummaryRows from '../../CheckYourAnswers/component/SensitiveAreaCheckSummaryRows';
import { SENSITIVE_AREA_LABELS } from '../../../constants/sensitiveAreaLabels';
import type { ReviewSummaryForLayers } from '../../CheckYourAnswers/utils/sensitiveAreaSummaryUtils';

/**
 * Read-only Sensitive Area Check Summary Page
 * Displayed when consultations have started (section locked)
 */
const SensitiveAreaCheckSummary: React.FC = () => {
    const applicationId = useGetApplicationId();
    const [toleranceRequired, setToleranceRequired] = useState<string | null>(null);
    const [toleranceValue, setToleranceValue] = useState('');
    const [routes, setRoutes] = useState<Array<{ route_id: string; routeName: string; gridPoints: Array<{ easting: string | number; northing: string | number }> }>>([]);
    const [reviewSummary, setReviewSummary] = useState<ReviewSummaryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch routes
                const routeData = await getRoutesWithPoints(applicationId);
                setRoutes(routeData.routes || []);

                // Fetch sensitive area settings
                const settings = await getSensitiveAreaSettings(applicationId);
                if (Array.isArray(settings) && settings.length > 0) {
                    const first = settings[0];
                    if (typeof first.tolerance_required === 'boolean') {
                        setToleranceRequired(first.tolerance_required ? 'yes' : 'no');
                    }
                    if (typeof first.tolerance_meters === 'number' || typeof first.tolerance_meters === 'string') {
                        setToleranceValue(String(first.tolerance_meters ?? ''));
                    }
                }

                // Fetch review summary to get intersected layers
                const summaryData = await getSensitiveAreaReviewSummary(applicationId);
                setReviewSummary(summaryData);
            } catch {
                // Silently fail - no data available
            } finally {
                setLoading(false);
            }
        }
        if (applicationId) fetchData();
    }, [applicationId]);

    // Transform routes for the map component (matching CYA format)
    const transformedRoutes = routes
        .filter((r) => Array.isArray(r.gridPoints) && r.gridPoints.length > 0)
        .map((r) => ({
            points: (r.gridPoints || []).map((pt) => ({
                easting: String(pt.easting || ''),
                northing: String(pt.northing || ''),
            })),
            routeName: r.routeName || 'Route',
        }));

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
                        Sensitive area check
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
                            <>
                                {/* Route map summary card */}
                                <div className="govuk-summary-card">
                                    <div className="govuk-summary-card__title-wrapper">
                                        <h2 className="govuk-summary-card__title">Route map</h2>
                                    </div>
                                    <div className="govuk-summary-card__content">
                                        <div
                                            style={{
                                                width: '100%',
                                                height: 500,
                                                border: '1px solid #b1b4b6',
                                                borderRadius: 4,
                                                overflow: 'hidden',
                                                background: '#fff',
                                            }}
                                        >
                                            <SensitiveAreaCheckMap routes={transformedRoutes} mode="overview" />
                                        </div>
                                    </div>
                                </div>

                                {/* Sensitive area check settings */}
                                <div className="govuk-summary-card">
                                    <div className="govuk-summary-card__title-wrapper">
                                        <h2 className="govuk-summary-card__title">{SENSITIVE_AREA_LABELS.CHECK_SECTION_TITLE}</h2>
                                    </div>
                                    <div className="govuk-summary-card__content">
                                        <dl className="govuk-summary-list">
                                            <SensitiveAreaCheckSummaryRows
                                                toleranceRequired={
                                                    toleranceRequired === 'yes'
                                                        ? true
                                                        : toleranceRequired === 'no'
                                                          ? false
                                                          : null
                                                }
                                                toleranceValue={
                                                    toleranceValue ? Number(toleranceValue) : null
                                                }
                                                reviewSummary={reviewSummary as ReviewSummaryForLayers | null}
                                            />
                                        </dl>
                                    </div>
                                </div>
                            </>
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

export default SensitiveAreaCheckSummary;
