import React from 'react';

// ── PhaseBanner Constants ────────────────────────────────────────────────────
const PHASE_TAG = 'Beta';
const PHASE_TEXT = 'This is a new service – your';
const FEEDBACK_LINK_TEXT = 'feedback';
const FEEDBACK_LINK_URL = '/feedback';
const PHASE_TEXT_SUFFIX = 'will help us to improve it.';

export default function PhaseBanner() {
    return (
        <div className="govuk-phase-banner" style={{ border: 'none' }}>
            <div className="govuk-width-container" style={{ borderBottom: '1px solid #b1b4b6', paddingBottom: '8px' }}>
                <p className="govuk-phase-banner__content" style={{ margin: 0 }}>
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
        </div>
    );
}
