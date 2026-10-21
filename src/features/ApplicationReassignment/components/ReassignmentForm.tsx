import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReassignmentForm } from '../hooks/useReassignmentForm';
import {
    REASSIGNMENT_JUSTIFICATION_LIMIT,
    normalizeAssignmentStatus,
} from '../constants/reassignment';
import { getAssignmentBasePath } from '../utils/reassignment';
import { AssigneeSearch } from './AssigneeSearch';
import { ReassignmentError } from './ReassignmentError';

export function ApplicationReassignment({
    applicationId,
    status,
}: {
    applicationId: string;
    status: string | null;
}) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const form = useReassignmentForm(applicationId, status);
    const heading = useRef<HTMLHeadingElement>(null);
    useEffect(() => {
        if (form.confirming) heading.current?.focus();
    }, [form.confirming]);
    const onSubmit = async () => {
        const success = await form.submit();
        if (success)
            navigate(`${getAssignmentBasePath(pathname)}/application-summary`, {
                state: { reassignment: success },
            });
    };

    if (form.terminal) return null;
    if (form.loading)
        return (
            <p className="govuk-body" role="status">
                Loading reassignment details...
            </p>
        );
    if (!form.data) return <ReassignmentError message={form.error} />;
    const { details, assignees } = form.data;

    return (
        <section
            className="govuk-!-margin-top-6"
            aria-labelledby="reassignment-heading"
            aria-busy={form.submitting}
        >
            <h1 className="govuk-heading-l" id="reassignment-heading" ref={heading} tabIndex={-1}>
                {form.confirming
                    ? 'Check before you reassign'
                    : 'Who do you want to reassign this application to?'}
            </h1>
            <ReassignmentError message={form.error} />
            {!form.confirming ? (
                <>
                    <p className="govuk-body">
                        {details.application_reference || applicationId} is currently assigned to{' '}
                        {details.current_assignee_name || 'no one'}. Choose a new applicant contact
                        to reassign the application to them.
                    </p>
                    <AssigneeSearch
                        assignees={assignees}
                        search={form.search}
                        selectedId={form.selectedId}
                        onSearch={form.changeSearch}
                        onSelect={form.selectAssignee}
                    />
                    <button
                        className="govuk-button govuk-!-margin-top-3"
                        type="button"
                        disabled={!form.selectedId}
                        onClick={() => form.setConfirming(true)}
                    >
                        Continue
                    </button>
                </>
            ) : (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void onSubmit();
                    }}
                >
                    <dl className="govuk-summary-list">
                        <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">DESNZ reference</dt>
                            <dd className="govuk-summary-list__value">
                                {details.application_reference || applicationId}
                            </dd>
                        </div>
                        <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">Current assignee</dt>
                            <dd className="govuk-summary-list__value">
                                {details.current_assignee_name || 'Not assigned'}
                            </dd>
                        </div>
                        <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">New assignee</dt>
                            <dd className="govuk-summary-list__value">
                                {form.selected?.first_name} {form.selected?.last_name}
                            </dd>
                        </div>
                    </dl>
                    <h2 className="govuk-heading-s">What happens next</h2>
                    <p className="govuk-body">
                        The new assignee will become the contact person for this application. We
                        will email relevant contacts to tell them about this reassignment.
                    </p>
                    {normalizeAssignmentStatus(status) === 'FURTHER_INFORMATION_REQUESTED' && (
                        <div className="govuk-inset-text">
                            A further information request is still outstanding. We will email this
                            request to the new assignee.
                        </div>
                    )}
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="reassignment-justification">
                            Reason for reassignment
                        </label>
                        <div className="govuk-hint" id="reassignment-justification-hint">
                            This reason will be recorded in the reassignment history.
                        </div>
                        <textarea
                            className="govuk-textarea"
                            id="reassignment-justification"
                            name="justification"
                            rows={4}
                            maxLength={REASSIGNMENT_JUSTIFICATION_LIMIT}
                            required
                            aria-describedby="reassignment-justification-hint"
                            value={form.justification}
                            onChange={(event) => form.setJustification(event.target.value)}
                        />
                    </div>
                    <div className="govuk-button-group">
                        <button
                            className="govuk-button"
                            type="submit"
                            disabled={form.submitting || !form.justification.trim()}
                        >
                            Reassign now
                        </button>
                        <button
                            className="govuk-button govuk-button--secondary"
                            type="button"
                            disabled={form.submitting}
                            onClick={() => form.setConfirming(false)}
                        >
                            Cancel
                        </button>
                    </div>
                    {form.submitting && (
                        <p className="govuk-body" role="status">
                            Reassigning application...
                        </p>
                    )}
                </form>
            )}
        </section>
    );
}
