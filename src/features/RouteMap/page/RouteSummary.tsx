import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useRoutes } from '../../../hooks/useRoutes';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import SensitiveAreaCheckMap from '../../../components/SensitiveAreaCheckMap';
import SkipLink from '../../../components/SkipLink';

/**
 * Read-only Route Summary Page
 * Displayed when consultations have started (section locked)
 */
const RouteSummary: React.FC = () => {
    const applicationId = useGetApplicationId();
    const store = useRoutes();
    let routes = Array.isArray(store?.routes) ? store.routes : [];

    // Sort routes by routeName (A, B, C, ...)
    routes = [...routes].sort((a, b) => {
        const getLetter = (r: any) => {
            if (!r.routeName) return '';
            const match = r.routeName.match(/Route\s+([A-Z])/i);
            return match ? match[1].toUpperCase() : '';
        };
        const aLetter = getLetter(a);
        const bLetter = getLetter(b);
        if (aLetter && bLetter) return aLetter.localeCompare(bLetter);
        if (aLetter) return -1;
        if (bLetter) return 1;
        return 0;
    });

    const loading = store?.loading;
    const fetchRoutes = store?.fetchRoutes;

    useEffect(() => {
        if (applicationId && fetchRoutes) fetchRoutes(applicationId);
    }, [applicationId, fetchRoutes]);

    const hasRoute = routes.length > 0 && routes.some((r) => Array.isArray(r.gridPoints) && r.gridPoints.length > 0);

    // Transform routes for the map component (matching CYA format)
    const transformedRoutes = routes
        .filter((r) => Array.isArray(r.gridPoints) && r.gridPoints.length > 0)
        .map((r) => ({
            points: (r.gridPoints || []).map((pt: any) => ({
                easting: String(pt.easting || ''),
                northing: String(pt.northing || ''),
            })),
            routeName: r.routeName || 'Route',
        }));

    return (
        <>
            <SkipLink />
            <div className="govuk-width-container">
            <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
                <ol className="govuk-breadcrumbs__list">
                    <li className="govuk-breadcrumbs__list-item">
                        <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
                            Task list
                        </Link>
                    </li>
                    <li className="govuk-breadcrumbs__list-item" aria-current="page">
                        Route overview
                    </li>
                </ol>
            </nav>

            <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <h1 className="govuk-heading-l">Route overview</h1>
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

                        {loading && <p className="govuk-body">Loading routes...</p>}

                        {!loading && hasRoute ? (
                            <>
                                {/* Route map summary card */}
                                <div className="govuk-summary-card">
                                    <div className="govuk-summary-card__title-wrapper">
                                        <h2 className="govuk-summary-card__title">
                                            Route map
                                            <a href={`${S37_BASE_URL}/${applicationId}/route-map-only`} target="_blank" rel="noopener noreferrer" className="govuk-link" style={{ marginLeft: 12, fontWeight: 400, fontSize: '1rem' }}>
                                                View map (Opens in new tab)
                                            </a>
                                        </h2>
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

                                {/* Route detail cards with grid points */}
                                {routes.map(
                                    (route, idx) =>
                                        Array.isArray(route.gridPoints) &&
                                        route.gridPoints.length > 0 && (
                                            <div className="govuk-summary-card" key={route.route_id || idx} style={{ marginBottom: '2rem' }}>
                                                <div className="govuk-summary-card__title-wrapper">
                                                    <h2 className="govuk-summary-card__title">{route.routeName || `Route ${String.fromCharCode(65 + idx)}`}</h2>
                                                </div>
                                                <div className="govuk-summary-card__content">
                                                    <table className="govuk-table">
                                                        <thead className="govuk-table__head">
                                                            <tr className="govuk-table__row">
                                                                <th className="govuk-table__header">Easting</th>
                                                                <th className="govuk-table__header">Northing</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="govuk-table__body">
                                                            {route.gridPoints.map((pt: any, i: number) => (
                                                                <tr className="govuk-table__row" key={i}>
                                                                    <td className="govuk-table__cell">{pt.easting}</td>
                                                                    <td className="govuk-table__cell">{pt.northing}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    {route.disconnectedroute_justification && (
                                                        <div style={{ marginTop: '1rem' }}>
                                                            <span className="govuk-body">{route.disconnectedroute_justification}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                )}
                            </>
                        ) : !loading ? (
                            <p className="govuk-body">No route information available.</p>
                        ) : null}

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

export default RouteSummary;
