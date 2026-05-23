import React from 'react';

// ── PhaseBanner Constants ────────────────────────────────────────────────────
const PHASE_TAG = 'Beta';
const PHASE_TEXT = 'This is a new service – your';
const FEEDBACK_LINK_TEXT = 'feedback';
const FEEDBACK_LINK_URL = '/feedback';
const PHASE_TEXT_SUFFIX = 'will help us to improve it.';

export default function PhaseBanner() {
    return (
        <div className="govuk-phase-banner govuk-width-container">
            <p className="govuk-phase-banner__content">
                <strong className="govuk-tag govuk-phase-banner__content__tag" style={{ backgroundColor: '#1d70b8', color: '#fff', fontWeight: 700 }}>
                    {PHASE_TAG}
                </strong>
                <span className="govuk-phase-banner__text">
                    {PHASE_TEXT}{' '}
                    <a href={FEEDBACK_LINK_URL} className="govuk-link">
                        {FEEDBACK_LINK_TEXT}
                    </a>{' '}
                    {PHASE_TEXT_SUFFIX}
                </span>
            </p>
        </div>
    );
}
