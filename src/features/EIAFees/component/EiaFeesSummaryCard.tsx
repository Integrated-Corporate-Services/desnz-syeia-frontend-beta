import React from 'react';
import { EIA_ASSESSMENT, EIA_ASSESSMENT_LABELS, EIA_CONTENT } from '../constants/eiaAssessment';
import { getEiaAssessment } from '../utils/eiaAssessment';

interface EiaFeesSummaryCardProps {
    title: string;
    isEiaDevelopment?: boolean | null;
    screeningOnly?: boolean | null;
    reportNames?: string[];
}

// SYEIA-1485: the EIA answer on Check your answers, the application summary and the read-only EIA page.
const EiaFeesSummaryCard: React.FC<EiaFeesSummaryCardProps> = ({ title, isEiaDevelopment, screeningOnly, reportNames = [] }) => {
    const assessment = getEiaAssessment(isEiaDevelopment, screeningOnly);
    return (
        <div className="govuk-summary-card">
            <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">{title}</h2>
            </div>
            <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                    <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">{EIA_CONTENT.SUMMARY_ASSESSMENT}</dt>
                        <dd className="govuk-summary-list__value">{assessment ? EIA_ASSESSMENT_LABELS[assessment] : '-'}</dd>
                    </div>
                    {assessment === EIA_ASSESSMENT.FULL_EIA && (
                        <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">{EIA_CONTENT.SUMMARY_REPORT}</dt>
                            <dd className="govuk-summary-list__value">
                                {reportNames.length > 0 ? (
                                    <ul className="govuk-list">
                                        {reportNames.map((name) => <li key={name}>{name}</li>)}
                                    </ul>
                                ) : '-'}
                            </dd>
                        </div>
                    )}
                </dl>
            </div>
        </div>
    );
};

export default EiaFeesSummaryCard;
