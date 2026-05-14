import React from 'react';
import { SummaryList } from './SummaryList';
import { SummaryRow } from '../types';

export interface SummaryCardProps {
    title: string;
    rows: SummaryRow[];
    actions?: Array<{
        href: string;
        text: string;
    }>;
    classes?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, rows, actions, classes = '' }) => {
    return (
        <div className={`govuk-summary-card ${classes}`}>
            <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">{title}</h2>
                {actions && actions.length > 0 && (
                    <ul className="govuk-summary-card__actions">
                        {actions.map((action, index) => (
                            <li className="govuk-summary-card__action" key={index}>
                                <a className="govuk-link" href={action.href}>
                                    {action.text}
                                    <span className="govuk-visually-hidden"> {title}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="govuk-summary-card__content">
                <SummaryList rows={rows} />
            </div>
        </div>
    );
};
