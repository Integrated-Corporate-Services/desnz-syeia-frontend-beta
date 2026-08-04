import React from 'react';
import { ROUTE_ERROR_MESSAGES, DISCONNECTED_ROUTE_JUSTIFICATION_MAX_LENGTH } from '../../../constants/routeErrorMessages';
import { S37_BASE_URL } from '../../../constants/s37';
import SensitiveAreaCheckMap from '../../../components/SensitiveAreaCheckMap';
import { useNavigate, useLocation } from 'react-router-dom';
import RouteDeletedBanner from '../component/RouteDeletedBanner';
import { useRoutes } from '../../../hooks/useRoutes';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { useProgress } from '../../../hooks/useProgress';
import { getNextRouteName } from '../../../utils/routeNamingUtils';
import { getNextPageUrl, TASK_NAMES } from '../../../utils/taskListUtils';
import { useConsultationsStarted } from '../../../hooks/useConsultationsStarted';
import RouteSummary from './RouteSummary';
import SkipLink from '../../../components/SkipLink';
export const RouteOverviewPage: React.FC = () => {
    const [spurChoice, setSpurChoice] = React.useState<string | null>(null);
    const [details, setDetails] = React.useState('');
    const [formError, setFormError] = React.useState<string | null>(null);
    const detailsRef = React.useRef<HTMLTextAreaElement>(null);
    const remainingChars = Math.max(0, DISCONNECTED_ROUTE_JUSTIFICATION_MAX_LENGTH - details.length);
    const applicationId = useGetApplicationId();
    const navigate = useNavigate();
    const location = useLocation();
    const store = useRoutes();
    const progressData = useProgress();
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
    const error = store?.error;
    const fetchRoutes = store?.fetchRoutes;
    // Banner state
    const [showBanner, setShowBanner] = React.useState<{ routeName: string } | null>(null);

    React.useEffect(() => {
        if (location.state && location.state.routeDeletedName) {
            setShowBanner({ routeName: location.state.routeDeletedName });
            // Remove state from history so banner doesn't persist on refresh
            navigate(location.pathname, { replace: true, state: undefined });
        }
    }, [location, navigate]);

    React.useEffect(() => {
        if (applicationId && fetchRoutes) fetchRoutes(applicationId);
    }, [applicationId, fetchRoutes]);

    const handleEdit = (route_id: string | number) => {
        const route = routes.find((r) => r.route_id === route_id);
        if (!route) return;
        navigate(`${S37_BASE_URL}/${applicationId}/route-map`, { state: { route_id: route.route_id, gridPoints: route.gridPoints, applicationId, routeName: route.routeName } });
    };

    const handleDelete = (route_id: string | number) => {
        const route = routes.find((r) => r.route_id === route_id);
        if (!route) return;
        navigate(`${S37_BASE_URL}/${applicationId}/route-delete`, {
            state: {
                routeName: route.routeName || 'Route',
                gridPoints: route.gridPoints,
                applicationId,
                route_id: route.route_id,
            },
        });
    };

    const hasRoute = routes.length > 0 && routes.some((r) => Array.isArray(r.gridPoints) && r.gridPoints.length > 0);

    // Check if consultations have started - if so, show read-only summary
    const { consultationsStarted, loading: consultationsLoading } = useConsultationsStarted(applicationId);

    // While checking consultation status, show loading to prevent flash
    if (consultationsLoading) {
        return (
            <div className="govuk-width-container">
                <div className="govuk-main-wrapper">
                    <p className="govuk-body">Loading...</p>
                </div>
            </div>
        );
    }

    // If consultations started, show read-only RouteSummary page
    if (consultationsStarted) {
        return <RouteSummary />;
    }

    return (
        <>
            <SkipLink />
            <div className="govuk-width-container">
            <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
                <ol className="govuk-breadcrumbs__list">
                    <li className="govuk-breadcrumbs__list-item">
                        <a
                            className="govuk-breadcrumbs__link"
                            href={`${window.location.origin}${S37_BASE_URL}/${applicationId || ''}/task-list`}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(`${S37_BASE_URL}/${applicationId || ''}/task-list`);
                            }}
                        >
                            Task list
                        </a>
                    </li>
                    <li className="govuk-breadcrumbs__list-item" aria-current="page">
                        Route overview
                    </li>
                </ol>
            </nav>
            <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
                {showBanner && <RouteDeletedBanner routeName={showBanner.routeName} />}
                <h1 className="govuk-heading-l">Route overview</h1>
                <p className="govuk-body" style={{ maxWidth: 700 }}>
                    Any changes to the route will require you to run the sensitive area checks again, upload new plan information, and reconsult or provide updated information to consultees if consultations are open.
                </p>
                <div className="govuk-inset-text" style={{ maxWidth: 700, marginTop: 12 }}>
                    <a className="govuk-link" href={`${window.location.origin}${S37_BASE_URL}/${applicationId || ''}/route-guidance`}>
                        Read the guidance on adding a route or a route spur
                    </a>
                </div>
                {loading && <div>Loading routes...</div>}
                {error && <div style={{ color: 'red' }}>Error: {error}</div>}
                {hasRoute && (
                    <div className="govuk-grid-row" style={{ marginBottom: '2rem' }}>
                        <div className="govuk-grid-column-one-half">
                            {routes.map(
                                (route, idx) =>
                                    Array.isArray(route.gridPoints) &&
                                    route.gridPoints.length > 0 && (
                                        <div className="govuk-summary-card" id={`route-summary-${idx}`} key={route.route_id || idx} style={{ marginBottom: '2rem' }}>
                                            <div className="govuk-summary-card__title-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h2 className="govuk-summary-card__title">{route.routeName || `Route ${String.fromCharCode(65 + idx)}`}</h2>
                                                <ul className="govuk-summary-card__actions" style={{ display: 'flex', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
                                                    <li className="govuk-summary-card__action">
                                                        <a
                                                            className="govuk-link"
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleEdit(route.route_id || idx);
                                                            }}
                                                        >
                                                            Edit<span className="govuk-visually-hidden"> {route.routeName}</span>
                                                        </a>
                                                    </li>
                                                    <li className="govuk-summary-card__action">
                                                        <a
                                                            className="govuk-link"
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleDelete(route.route_id || idx);
                                                            }}
                                                        >
                                                            Delete<span className="govuk-visually-hidden"> {route.routeName}</span>
                                                        </a>
                                                    </li>
                                                </ul>
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
                                                    <div>
                                                        {' '}
                                                        <span className="govuk-body">{route.disconnectedroute_justification}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                            )}
                        </div>
                        <div className="govuk-grid-column-one-half">
                            {/* Show map for the first route with gridPoints */}
                            <div style={{ width: 466, height: 500, border: '1px solid #b1b4b6', borderRadius: 4, overflow: 'hidden', background: '#fff', margin: '0 auto' }}>
                                <SensitiveAreaCheckMap
                                    routes={routes
                                        .filter((r) => Array.isArray(r.gridPoints) && r.gridPoints.length > 0)
                                        .map((r) => ({
                                            points: r.gridPoints.map((pt: any) => ({ easting: String(pt.easting), northing: String(pt.northing) })),
                                            routeName: r.routeName,
                                        }))}
                                    mode="overview"
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-three-quarters">
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                // Validation: require a radio button selection
                                if (!spurChoice) {
                                    setFormError(ROUTE_ERROR_MESSAGES.addAnotherRoute);
                                    return;
                                }
                                if (spurChoice === 'notconnected' && !details.trim()) {
                                    setFormError(ROUTE_ERROR_MESSAGES.disconnectedRouteJustification);
                                    setTimeout(() => {
                                        detailsRef.current?.focus();
                                    }, 0);
                                    return;
                                }
                                if (spurChoice === 'notconnected' && details.length > DISCONNECTED_ROUTE_JUSTIFICATION_MAX_LENGTH) {
                                    setFormError(ROUTE_ERROR_MESSAGES.disconnectedRouteJustificationTooLong);
                                    setTimeout(() => {
                                        detailsRef.current?.focus();
                                    }, 0);
                                    return;
                                }
                                setFormError(null);
                                if (spurChoice === 'spur' || spurChoice === 'notconnected') {
                                    navigate(`${S37_BASE_URL}/${applicationId}/route-map`, {
                                        state: { applicationId, routeName: getNextRouteName(routes.map((r) => r.routeName)), isNewRoute: true, details: spurChoice === 'notconnected' ? details : undefined },
                                    });
                                } else {
                                    // Call progress update for 'no spur' before navigating
                                    try {
                                        await progressData.updateProgressItem(applicationId!, 'Route', 'Completed');
                                    } catch (err) {
                                        // TODO: error handling
                                    }
                                    const nextPageUrl = getNextPageUrl(TASK_NAMES.ROUTE, applicationId || '');
                                    navigate(nextPageUrl);
                                }
                            }}
                            noValidate
                        >
                            {/* Radio group error only for radio group */}
                            <div className={`govuk-form-group${formError === ROUTE_ERROR_MESSAGES.addAnotherRoute ? ' govuk-form-group--error' : ''}`.trim()}>
                                <fieldset
                                    className="govuk-fieldset"
                                    aria-describedby={`fieldset-1-hint${formError === ROUTE_ERROR_MESSAGES.addAnotherRoute ? ' addRouteRadioGroup-error' : ''}`.trim()}
                                    id="addRouteRadioGroup"
                                    tabIndex={-1}
                                >
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                        <h2 className="govuk-fieldset__heading">Do you want to add another route?</h2>
                                    </legend>
                                    <div className="govuk-hint" id="fieldset-1-hint">
                                        If you have a line off the main route, you will need to add a route spur. If your routes do not connect, you need to provide justification for including it in this application.
                                    </div>
                                    {formError === ROUTE_ERROR_MESSAGES.addAnotherRoute && (
                                        <span className="govuk-error-message" id="addRouteRadioGroup-error">
                                            <span className="govuk-visually-hidden">Error:</span> {formError}
                                        </span>
                                    )}
                                    <div className="govuk-radios">
                                        <div className="govuk-radios__item">
                                            <input className="govuk-radios__input" id="addRouteRadioOption" name="addRouteRadioOption" type="radio" value="spur" checked={spurChoice === 'spur'} onChange={() => setSpurChoice('spur')} />
                                            <label className="govuk-label govuk-radios__label" htmlFor="addRouteRadioOption">
                                                Yes, I want to add a spur connected to the main route
                                            </label>
                                        </div>
                                        <div className="govuk-radios__item">
                                            <input
                                                className="govuk-radios__input"
                                                id="addRouteRadioOption-2"
                                                name="addRouteRadioOption"
                                                type="radio"
                                                value="notconnected"
                                                checked={spurChoice === 'notconnected'}
                                                onChange={() => setSpurChoice('notconnected')}
                                            />
                                            <label className="govuk-label govuk-radios__label" htmlFor="addRouteRadioOption-2">
                                                Yes, I want to add another route not connected to the main route
                                            </label>
                                        </div>
                                        {/* Justification error only for textarea */}
                                        {spurChoice === 'notconnected' && (
                                            <div className={`govuk-inset-text${formError === ROUTE_ERROR_MESSAGES.disconnectedRouteJustification || formError === ROUTE_ERROR_MESSAGES.disconnectedRouteJustificationTooLong ? ' govuk-form-group--error' : ''}`} style={{ marginLeft: 0, marginTop: 8, borderLeft: formError === ROUTE_ERROR_MESSAGES.disconnectedRouteJustification || formError === ROUTE_ERROR_MESSAGES.disconnectedRouteJustificationTooLong ? '4px solid #d4351c' : undefined }}>
                                                <div className="govuk-form-group govuk-character-count" data-module="govuk-character-count" data-maxlength={DISCONNECTED_ROUTE_JUSTIFICATION_MAX_LENGTH}>
                                                    <label htmlFor="routeDetails" className="govuk-label">
                                                        Explain why this additional route should be included with the main route of this application
                                                    </label>
                                                    {(formError === ROUTE_ERROR_MESSAGES.disconnectedRouteJustification || formError === ROUTE_ERROR_MESSAGES.disconnectedRouteJustificationTooLong) && (
                                                        <span className="govuk-error-message" id="routeDetails-error">
                                                            <span className="govuk-visually-hidden">Error:</span> {formError}
                                                        </span>
                                                    )}
                                                    <textarea
                                                        id="routeDetails"
                                                        className={`govuk-textarea govuk-js-character-count${formError === ROUTE_ERROR_MESSAGES.disconnectedRouteJustification || formError === ROUTE_ERROR_MESSAGES.disconnectedRouteJustificationTooLong ? ' govuk-textarea--error' : ''}`}
                                                        style={{ minHeight: 100 }}
                                                        rows={5}
                                                        ref={detailsRef}
                                                        value={details}
                                                        maxLength={DISCONNECTED_ROUTE_JUSTIFICATION_MAX_LENGTH}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val.length <= DISCONNECTED_ROUTE_JUSTIFICATION_MAX_LENGTH) {
                                                                setDetails(val);
                                                            } else {
                                                                setDetails(val.slice(0, DISCONNECTED_ROUTE_JUSTIFICATION_MAX_LENGTH));
                                                            }
                                                        }}
                                                        aria-describedby={(formError === ROUTE_ERROR_MESSAGES.disconnectedRouteJustification || formError === ROUTE_ERROR_MESSAGES.disconnectedRouteJustificationTooLong) ? 'routeDetails-error routeDetails-info' : 'routeDetails-info'}
                                                        aria-invalid={formError === ROUTE_ERROR_MESSAGES.disconnectedRouteJustification || formError === ROUTE_ERROR_MESSAGES.disconnectedRouteJustificationTooLong}
                                                    />
                                                    <div id="routeDetails-info" className="govuk-hint govuk-character-count__message govuk-visually-hidden">You can enter up to {DISCONNECTED_ROUTE_JUSTIFICATION_MAX_LENGTH} characters</div>
                                                    <div className="govuk-hint govuk-character-count__message govuk-character-count__status" aria-hidden="true">You have {remainingChars} characters remaining</div>
                                                    <div className="govuk-character-count__sr-status govuk-visually-hidden" aria-live="polite">You have {remainingChars} characters remaining</div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="govuk-radios__item">
                                            <input className="govuk-radios__input" id="addRouteRadioOption-3" name="addRouteRadioOption" type="radio" value="no" checked={spurChoice === 'no'} onChange={() => setSpurChoice('no')} />
                                            <label className="govuk-label govuk-radios__label" htmlFor="addRouteRadioOption-3">
                                                No
                                            </label>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                            <button type="submit" className="govuk-button" data-module="govuk-button" style={{ marginTop: 8 }}>
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
        </>
    );
};

export default RouteOverviewPage;
