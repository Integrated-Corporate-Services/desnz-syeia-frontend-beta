import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ReassignmentSuccess } from '../types/applicationReassignment';

export function ReassignmentSuccessBanner() {
    const location = useLocation();
    const navigate = useNavigate();
    const [success] = useState<ReassignmentSuccess | null>(
        () => location.state?.reassignment || null
    );
    const banner = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (success) {
            banner.current?.focus();
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [success, navigate, location.pathname]);
    if (!success) return null;
    return (
        <div
            className="govuk-notification-banner govuk-notification-banner--success"
            role="alert"
            aria-labelledby="reassignment-success-title"
            ref={banner}
            tabIndex={-1}
        >
            <div className="govuk-notification-banner__header">
                <h2 className="govuk-notification-banner__title" id="reassignment-success-title">
                    Success
                </h2>
            </div>
            <div className="govuk-notification-banner__content">
                <h3 className="govuk-notification-banner__heading">Application reassigned</h3>
                <p className="govuk-body">
                    {success.reference} is now assigned to {success.name}.
                </p>
            </div>
        </div>
    );
}
