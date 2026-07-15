import React from 'react';
import { SummaryRow } from '../types';

export interface SummaryListProps {
    rows: SummaryRow[];
    classes?: string;
}

export const SummaryList: React.FC<SummaryListProps> = ({ rows, classes = '' }) => {
    return (
        <dl className={`govuk-summary-list ${classes}`}>
            {rows.map((row, index) => (
                <div className="govuk-summary-list__row" key={index}>
                    <dt className={`govuk-summary-list__key ${row.key.classes || ''}`}>
                        {row.key.text}
                    </dt>
                    <dd className={`govuk-summary-list__value ${row.value.classes || ''}`}>
                        {row.value.html ? (
                            <div dangerouslySetInnerHTML={{ __html: row.value.html }} />
                        ) : (
                            row.value.text
                        )}
                    </dd>
                    {row.actions && (
                        <dd className="govuk-summary-list__actions">
                            {row.actions.items.map((action, actionIndex) => (
                                <React.Fragment key={actionIndex}>
                                    {actionIndex > 0 && <br />}
                                    <a className="govuk-link" href={action.href}>
                                        {action.text}
                                        {action.visuallyHiddenText && (
                                            <span className="govuk-visually-hidden">
                                                {' '}
                                                {action.visuallyHiddenText}
                                            </span>
                                        )}
                                    </a>
                                </React.Fragment>
                            ))}
                        </dd>
                    )}
                </div>
            ))}
        </dl>
    );
};
