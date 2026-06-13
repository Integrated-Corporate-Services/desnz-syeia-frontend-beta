import React from 'react';
import { Link } from 'react-router-dom';
import {
    FEEDBACK_LINK_TEXT,
    PHASE_TAG,
    PHASE_TEXT,
    PHASE_TEXT_SUFFIX,
} from '../../constants/phaseBanner.constants';
import { FEEDBACK_PATH } from '../../constants/routes';
import '../../styles/PhaseBanner.css';

export default function PhaseBanner() {
    return (
        <div className="govuk-phase-banner phase-banner-wrapper">
            <div className="govuk-width-container phase-banner-container">
                <p className="govuk-phase-banner__content phase-banner-content">
                <strong className="govuk-tag govuk-phase-banner__content__tag phase-banner-tag">
                    {PHASE_TAG}
                </strong>
                <span className="govuk-phase-banner__text">
                    {PHASE_TEXT}{' '}
                    <Link to={FEEDBACK_PATH} className="govuk-link">
                        {FEEDBACK_LINK_TEXT}
                    </Link>{' '}
                    {PHASE_TEXT_SUFFIX}
                </span>
            </p>
            </div>
        </div>
    );
}
