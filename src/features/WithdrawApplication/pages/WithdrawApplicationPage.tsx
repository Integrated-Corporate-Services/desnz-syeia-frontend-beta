/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { WITHDRAWAL_CONSTANTS as CONSTANTS } from '../constants';
import { WithdrawalRequest } from '../types';
import { getApplicationTypeFromLocation } from '../utils';

import { submitWithdrawal, getWithdrawalReasons } from '../services';

import { WithdrawApplicationBreadcrumbs, WithdrawalWarning } from '../components';

import { validateWithdrawalForm, getRemainingCharacters } from '../utils';

const WithdrawApplicationPage: React.FC = () => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const applicationType = getApplicationTypeFromLocation(location);

    const [selectedReason, setSelectedReason] = useState<string>('');
    const [additionalComments, setAdditionalComments] = useState<string>('');
    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ reason?: string; confirmation?: string; comments?: string }>({});

    const reasons = getWithdrawalReasons(applicationType);
    const remainingChars = getRemainingCharacters(additionalComments, CONSTANTS.WITHDRAW_PAGE.COMMENTS_MAXLENGTH);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validateWithdrawalForm(selectedReason, confirmed, additionalComments);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            setTimeout(() => {
                const errorSummary = document.querySelector('.govuk-error-summary');
                if (errorSummary) errorSummary.scrollIntoView();
            }, 0);
            return;
        }

        setSubmitting(true);

        try {
            const request: WithdrawalRequest = {
                applicationId: applicationId!,
                applicationType,
                reason: selectedReason,
                additionalComments: additionalComments || undefined,
                requestedBy: 'current-user',
                requestedDate: new Date().toISOString(),
            };

            const response = await submitWithdrawal(request);

            navigate(CONSTANTS.ROUTES.CONFIRMATION(applicationType, applicationId!), {
                state: {
                    desnzRef: response.desnzRef,
                    withdrawalDate: new Date().toISOString(),
                    reason: selectedReason,
                },
            });
        } catch (err: any) {
            console.error('Failed to submit withdrawal:', err);
            setErrors({ confirmation: err.message || CONSTANTS.ERROR });
            setSubmitting(false);

            setTimeout(() => {
                const errorSummary = document.querySelector('.govuk-error-summary');
                if (errorSummary) errorSummary.scrollIntoView();
            }, 0);
        }
    };

    const handleCancel = () => {
        navigate(CONSTANTS.ROUTES.SUMMARY(applicationType, applicationId!));
    };

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div className="govuk-width-container">
            <WithdrawApplicationBreadcrumbs
                applicationType={applicationType}
                applicationId={applicationId!}
                currentPage="withdraw"
            />

            <main className="govuk-main-wrapper" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        {hasErrors && (
                            <div
                                className="govuk-error-summary"
                                role="alert"
                                aria-labelledby="error-summary-title"
                                tabIndex={-1}
                            >
                                <h2 className="govuk-error-summary__title" id="error-summary-title">
                                    There is a problem
                                </h2>
                                <div className="govuk-error-summary__body">
                                    <ul className="govuk-list govuk-error-summary__list">
                                        {errors.reason && (
                                            <li>
                                                <a href="#reason">{errors.reason}</a>
                                            </li>
                                        )}
                                        {errors.confirmation && (
                                            <li>
                                                <a href="#confirmation">{errors.confirmation}</a>
                                            </li>
                                        )}
                                        {errors.comments && (
                                            <li>
                                                <a href="#additional-comments">{errors.comments}</a>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <h1 className="govuk-heading-xl">{CONSTANTS.WITHDRAW_PAGE.HEADING}</h1>

                        <WithdrawalWarning />

                        <p className="govuk-body">{CONSTANTS.WITHDRAW_PAGE.DESCRIPTION}</p>

                        <form onSubmit={handleSubmit}>
                            <div className={`govuk-form-group ${errors.reason ? 'govuk-form-group--error' : ''}`}>
                                <fieldset className="govuk-fieldset">
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                        <h2 className="govuk-fieldset__heading">
                                            {CONSTANTS.WITHDRAW_PAGE.REASON_LABEL}
                                        </h2>
                                    </legend>
                                    <div id="reason-hint" className="govuk-hint">
                                        {CONSTANTS.WITHDRAW_PAGE.REASON_HINT}
                                    </div>
                                    {errors.reason && (
                                        <p id="reason-error" className="govuk-error-message">
                                            <span className="govuk-visually-hidden">Error:</span> {errors.reason}
                                        </p>
                                    )}
                                    <div className="govuk-radios" data-module="govuk-radios">
                                        {reasons.map((reason) => (
                                            <div className="govuk-radios__item" key={reason.value}>
                                                <input
                                                    className="govuk-radios__input"
                                                    id={`reason-${reason.value}`}
                                                    name="reason"
                                                    type="radio"
                                                    value={reason.value}
                                                    checked={selectedReason === reason.value}
                                                    onChange={(e) => setSelectedReason(e.target.value)}
                                                    aria-describedby="reason-hint"
                                                />
                                                <label
                                                    className="govuk-label govuk-radios__label"
                                                    htmlFor={`reason-${reason.value}`}
                                                >
                                                    {reason.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </fieldset>
                            </div>

                            <div className={`govuk-form-group ${errors.comments ? 'govuk-form-group--error' : ''}`}>
                                <label className="govuk-label govuk-label--m" htmlFor="additional-comments">
                                    {CONSTANTS.WITHDRAW_PAGE.COMMENTS_LABEL}
                                </label>
                                <div id="additional-comments-hint" className="govuk-hint">
                                    {CONSTANTS.WITHDRAW_PAGE.COMMENTS_HINT}
                                </div>
                                {errors.comments && (
                                    <p id="additional-comments-error" className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span> {errors.comments}
                                    </p>
                                )}
                                <textarea
                                    className={`govuk-textarea ${errors.comments ? 'govuk-textarea--error' : ''}`}
                                    id="additional-comments"
                                    name="additionalComments"
                                    rows={5}
                                    maxLength={CONSTANTS.WITHDRAW_PAGE.COMMENTS_MAXLENGTH}
                                    value={additionalComments}
                                    onChange={(e) => setAdditionalComments(e.target.value)}
                                    aria-describedby="additional-comments-hint"
                                />
                                <div className="govuk-hint govuk-character-count__message">
                                    {CONSTANTS.WITHDRAW_PAGE.COMMENTS_REMAINING(remainingChars)}
                                </div>
                            </div>

                            {/* Confirmation checkbox */}
                            <div
                                className={`govuk-form-group ${errors.confirmation ? 'govuk-form-group--error' : ''}`}
                            >
                                {errors.confirmation && (
                                    <p id="confirmation-error" className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span> {errors.confirmation}
                                    </p>
                                )}
                                <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                                    <div className="govuk-checkboxes__item">
                                        <input
                                            className="govuk-checkboxes__input"
                                            id="confirmation"
                                            name="confirmation"
                                            type="checkbox"
                                            checked={confirmed}
                                            onChange={(e) => setConfirmed(e.target.checked)}
                                        />
                                        <label className="govuk-label govuk-checkboxes__label" htmlFor="confirmation">
                                            {CONSTANTS.WITHDRAW_PAGE.CONFIRMATION_LABEL}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="govuk-button-group">
                                <button
                                    type="submit"
                                    className="govuk-button govuk-button--warning"
                                    data-module="govuk-button"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? CONSTANTS.WITHDRAW_PAGE.SUBMITTING
                                        : CONSTANTS.WITHDRAW_PAGE.SUBMIT_BUTTON}
                                </button>
                                <button
                                    type="button"
                                    className="govuk-button govuk-button--secondary"
                                    data-module="govuk-button"
                                    onClick={handleCancel}
                                    disabled={submitting}
                                >
                                    {CONSTANTS.WITHDRAW_PAGE.CANCEL_BUTTON}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WithdrawApplicationPage;
