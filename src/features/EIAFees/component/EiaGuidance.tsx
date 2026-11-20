import React from 'react';
import { EIA_LINKS } from '../constants/eiaAssessment';

const NewTabLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a className="govuk-link" href={href} target="_blank" rel="noopener noreferrer">
        {children} (opens in a new tab)
    </a>
);

interface EiaGuidanceProps {
    mandatory: boolean;
    highVoltage: boolean;
    sensitiveArea: boolean;
}

// SYEIA-1485 Image 2 (screening not mandatory) and Image 3 (screening mandatory).
const EiaGuidance: React.FC<EiaGuidanceProps> = ({ mandatory, highVoltage, sensitiveArea }) => {
    const reportLink = <NewTabLink href={EIA_LINKS.EIA_REPORT}>submit an EIA report</NewTabLink>;

    if (mandatory) {
        return (
            <>
                <p className="govuk-body">
                    <NewTabLink href={EIA_LINKS.MANDATORY_SCREENING}>A mandatory EIA screening decision is required</NewTabLink> for
                    this application because your:
                </p>
                <ul className="govuk-list govuk-list--bullet">
                    {highVoltage && <li>lines carry a voltage of 132kV or higher</li>}
                    {sensitiveArea && <li>route passes through one or more sensitive areas</li>}
                </ul>
                <p className="govuk-body">
                    If you believe the proposed development is likely to have significant effects on the environment, you should
                    request a full EIA evaluation and {reportLink} with your application.
                </p>
                <p className="govuk-body">
                    <NewTabLink href={EIA_LINKS.FEE}>A non-refundable fee</NewTabLink> will be added to the cost of your
                    application. Please note the cost difference between the two options.
                </p>
            </>
        );
    }

    return (
        <>
            <p className="govuk-body">A mandatory EIA screening decision is not required for this application.</p>
            <p className="govuk-body">
                If you would like the Secretary of State to assess whether the proposed development is likely to have a
                significant effect on the environment, you can request an EIA screening decision.
            </p>
            <p className="govuk-body">
                But if you believe the proposed development is likely to have a significant effect on the environment, you
                should request a full EIA evaluation and {reportLink} with your application.
            </p>
            <p className="govuk-body">
                If you choose either of these options, <NewTabLink href={EIA_LINKS.FEE}>a non-refundable fee</NewTabLink> will
                be added to the cost of your application. Please note the cost difference between the two options.
            </p>
            <p className="govuk-body">If no significant effect on the environment is likely, then no assessment is necessary.</p>
        </>
    );
};

export default EiaGuidance;
