/**
 * What Happens Next
 * Static guidance shown after submission, with an optional withdraw note.
 */

import React from 'react';
import { NWL_APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';

interface WhatHappensNextProps {
    canWithdraw: boolean;
}

export const WhatHappensNext: React.FC<WhatHappensNextProps> = ({ canWithdraw }) => {
    return (
        <>
            <h2 className="govuk-heading-m govuk-!-margin-top-6">{CONSTANTS.WHAT_HAPPENS_NEXT.HEADING}</h2>
            <p className="govuk-body">{CONSTANTS.WHAT_HAPPENS_NEXT.EMAIL}</p>
            <p className="govuk-body">{CONSTANTS.WHAT_HAPPENS_NEXT.CONTACT}</p>
            <p className="govuk-body">{CONSTANTS.WHAT_HAPPENS_NEXT.REVIEW_TIME}</p>
            {canWithdraw && <p className="govuk-body">{CONSTANTS.WHAT_HAPPENS_NEXT.WITHDRAW}</p>}
        </>
    );
};
