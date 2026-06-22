import React from 'react';
import { SummaryRow } from '../types';

export interface SummaryListProps {
    rows: SummaryRow[];
    classes?: string;
}

export const SummaryList: React.FC<SummaryListProps> = ({ rows, classes = '' }) => {
    if (!rows || rows.length === 0) {
        return <dl className={`govuk-summary-list ${classes}`}></dl>;
    }

    return (
        <dl className={`govuk-summary-list ${classes}`}>
            {rows.map((row, index) => (
                <div className="govuk-summary-list__row" key={index}>
                    <dt className={`govuk-summary-list__key govuk-!-width-one-half ${row.key.classes || ''}`}>{row.key.text}</dt>
                    <dd className={`govuk-summary-list__value govuk-!-width-one-half ${row.value.classes || ''}`}>{row.value.html ? <span dangerouslySetInnerHTML={{ __html: row.value.html }} /> : row.value.text}</dd>
                    {row.actions && (
                        <dd className="govuk-summary-list__actions">
                            {row.actions.items.map((action: { href: string; text: string; visuallyHiddenText?: string }, actionIndex: number) => (
                                <a key={actionIndex} className="govuk-link" href={action.href}>
                                    {action.text}
                                    {action.visuallyHiddenText && <span className="govuk-visually-hidden"> {action.visuallyHiddenText}</span>}
                                </a>
                            ))}
                        </dd>
                    )}
                </div>
            ))}
        </dl>
    );
};
