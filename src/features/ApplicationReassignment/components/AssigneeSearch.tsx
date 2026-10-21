import type { EligibleAssignee } from '../types/applicationReassignment';

interface AssigneeSearchProps {
    assignees: EligibleAssignee[];
    search: string;
    selectedId: string;
    onSearch: (value: string) => void;
    onSelect: (assignee: EligibleAssignee) => void;
}

export function AssigneeSearch({
    assignees,
    search,
    selectedId,
    onSearch,
    onSelect,
}: AssigneeSearchProps) {
    const matches = assignees.filter((assignee) =>
        selectedId
            ? assignee.user_id === selectedId
            : `${assignee.first_name} ${assignee.last_name} ${assignee.email}`
                  .toLowerCase()
                  .includes(search.trim().toLowerCase())
    );
    return (
        <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="new-assignee">
                Choose a new applicant contact
            </label>
            <div className="govuk-hint" id="new-assignee-hint">
                Start typing a name or email address.
            </div>
            <input
                className="govuk-input"
                id="new-assignee"
                type="search"
                autoComplete="off"
                aria-describedby="new-assignee-hint"
                value={search}
                onChange={(event) => onSearch(event.target.value)}
            />
            {assignees.length === 0 && (
                <p className="govuk-body" role="status">
                    No eligible applicant contacts are available.
                </p>
            )}
            {search.trim() && (
                <fieldset className="govuk-fieldset govuk-!-margin-top-3">
                    <legend className="govuk-fieldset__legend govuk-visually-hidden">
                        Matching contacts
                    </legend>
                    <p className="govuk-visually-hidden" role="status">
                        {matches.length} matching contacts
                    </p>
                    <div className="govuk-radios govuk-radios--small">
                        {matches.map((assignee) => (
                            <div className="govuk-radios__item" key={assignee.user_id}>
                                <input
                                    className="govuk-radios__input"
                                    id={`assignee-${assignee.user_id}`}
                                    name="assignee"
                                    type="radio"
                                    checked={selectedId === assignee.user_id}
                                    onChange={() => onSelect(assignee)}
                                />
                                <label
                                    className="govuk-label govuk-radios__label"
                                    htmlFor={`assignee-${assignee.user_id}`}
                                >
                                    {assignee.first_name} {assignee.last_name}
                                    {assignee.is_agent ? ' (agent)' : ''} - {assignee.email}
                                </label>
                            </div>
                        ))}
                    </div>
                    {matches.length === 0 && (
                        <p className="govuk-body">No matching contacts found.</p>
                    )}
                </fieldset>
            )}
        </div>
    );
}
