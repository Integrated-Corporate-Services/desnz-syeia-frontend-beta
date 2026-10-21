import { useEffect, useRef } from 'react';

export function ReassignmentError({ message }: { message: string | null }) {
    const summary = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (message) summary.current?.focus();
    }, [message]);
    if (!message) return null;
    return (
        <div
            className="govuk-error-summary"
            role="alert"
            tabIndex={-1}
            ref={summary}
            aria-labelledby="reassignment-error-title"
        >
            <h2 className="govuk-error-summary__title" id="reassignment-error-title">
                There is a problem
            </h2>
            <div className="govuk-error-summary__body">
                <p className="govuk-body">{message}</p>
            </div>
        </div>
    );
}
