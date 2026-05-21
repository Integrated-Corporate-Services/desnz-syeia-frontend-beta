import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { WITHDRAWAL_CONSTANTS as CONSTANTS } from '../constants';

import { WithdrawApplicationBreadcrumbs } from '../components';

import { formatDate, getCaseTypeLabel, getReasonLabel } from '../utils';

const WithdrawalConfirmationPage: React.FC = () => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const location = useLocation();

    const applicationType: 'NWL' | 'S37' | 'TLP' = location.pathname.includes('/nwl/') 
        ? 'NWL' 
        : location.pathname.includes('/tlp/')
        ? 'TLP'
        : 'S37';

    const { desnzRef, withdrawalDate, reason } = (location.state as any) || {};
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="govuk-width-container">
            <WithdrawApplicationBreadcrumbs
                applicationType={applicationType}
                applicationId={applicationId!}
                currentPage="confirmation"
            />

            <main className="govuk-main-wrapper" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <div className="govuk-panel govuk-panel--confirmation">
                            <h1 className="govuk-panel__title">{CONSTANTS.CONFIRMATION_PAGE.PANEL_TITLE}</h1>
                            {desnzRef && (
                                <div className="govuk-panel__body">
                                    {CONSTANTS.CONFIRMATION_PAGE.DESNZ_REF}
                                    <br />
                                    <strong>{desnzRef}</strong>
                                </div>
                            )}
                        </div>

                        <h2 className="govuk-heading-m govuk-!-margin-top-7">
                            {CONSTANTS.CONFIRMATION_PAGE.WHAT_HAPPENS_NEXT}
                        </h2>
                        <p className="govuk-body">{CONSTANTS.CONFIRMATION_PAGE.NEXT_STEPS}</p>
                        <p className="govuk-body">{CONSTANTS.CONFIRMATION_PAGE.NO_FURTHER_ACTION}</p>
                        <p className="govuk-body">{CONSTANTS.CONFIRMATION_PAGE.NEW_APPLICATION}</p>

                        <h2 className="govuk-heading-m govuk-!-margin-top-8">
                            {CONSTANTS.CONFIRMATION_PAGE.DETAILS_HEADING}
                        </h2>
                        <dl className="govuk-summary-list">
                            {desnzRef && (
                                <div className="govuk-summary-list__row">
                                    <dt className="govuk-summary-list__key">
                                        {CONSTANTS.CONFIRMATION_PAGE.DESNZ_REF}
                                    </dt>
                                    <dd className="govuk-summary-list__value">{desnzRef}</dd>
                                </div>
                            )}
                            <div className="govuk-summary-list__row">
                                <dt className="govuk-summary-list__key">
                                    {CONSTANTS.CONFIRMATION_PAGE.APPLICATION_TYPE}
                                </dt>
                                <dd className="govuk-summary-list__value">{getCaseTypeLabel(applicationType)}</dd>
                            </div>
                            {withdrawalDate && (
                                <div className="govuk-summary-list__row">
                                    <dt className="govuk-summary-list__key">
                                        {CONSTANTS.CONFIRMATION_PAGE.WITHDRAWAL_DATE}
                                    </dt>
                                    <dd className="govuk-summary-list__value">{formatDate(withdrawalDate)}</dd>
                                </div>
                            )}
                            {reason && (
                                <div className="govuk-summary-list__row">
                                    <dt className="govuk-summary-list__key">{CONSTANTS.CONFIRMATION_PAGE.REASON}</dt>
                                    <dd className="govuk-summary-list__value">
                                        {getReasonLabel(applicationType, reason)}
                                    </dd>
                                </div>
                            )}
                        </dl>

                        <div className="govuk-button-group govuk-!-margin-top-6">
                            <Link
                                to={CONSTANTS.ROUTES.APPLICATIONS}
                                className="govuk-button"
                                data-module="govuk-button"
                            >
                                {CONSTANTS.CONFIRMATION_PAGE.BACK_TO_APPLICATIONS}
                            </Link>
                            <button
                                type="button"
                                className="govuk-button govuk-button--secondary"
                                data-module="govuk-button"
                                onClick={handlePrint}
                            >
                                {CONSTANTS.CONFIRMATION_PAGE.PRINT_CONFIRMATION}
                            </button>
                        </div>

                        <h2 className="govuk-heading-m govuk-!-margin-top-8">
                            {CONSTANTS.CONFIRMATION_PAGE.FEEDBACK_HEADING}
                        </h2>
                        <p className="govuk-body">{CONSTANTS.CONFIRMATION_PAGE.FEEDBACK_TEXT}</p>
                        <p className="govuk-body">
                            <a href="#" className="govuk-link">
                                {CONSTANTS.CONFIRMATION_PAGE.FEEDBACK_LINK}
                            </a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WithdrawalConfirmationPage;