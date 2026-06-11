/**
 * User Radio List Component
 * Radio button list for selecting a new editor
 * Created: 2026-06-09
 */

import React from 'react';
import { OrgUser } from '../../../services/assignmentApiService';

interface UserRadioListProps {
  users: OrgUser[];
  selectedUserId: string | null;
  onSelect: (userId: string) => void;
  currentEditorId?: string;
  error?: string;
}

export const UserRadioList: React.FC<UserRadioListProps> = ({
  users,
  selectedUserId,
  onSelect,
  currentEditorId,
  error,
}) => {
  // Map role codes to display names
  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      'APPLICANT_TEAM_COORDINATOR': 'Team Coordinator',
      'APPLICANT_USER': 'Applicant User',
      'APPLICANT_AGENT': 'Agent',
      'APPLICANT_FINANCE': 'Finance User',
    };
    return roleMap[role] || role;
  };

  return (
    <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
      <fieldset className="govuk-fieldset">
        {error && (
          <p id="user-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}
        <div className="govuk-radios" data-module="govuk-radios">
          {users.map((user) => {
            const isCurrentEditor = user.id === currentEditorId;
            const userName = user.fullName || user.email;
            const userRole = getRoleDisplay(user.role);

            return (
              <div className="govuk-radios__item" key={user.id}>
                <input
                  className="govuk-radios__input"
                  id={`user-${user.id}`}
                  name="selectedUser"
                  type="radio"
                  value={user.id}
                  checked={selectedUserId === user.id}
                  onChange={() => onSelect(user.id)}
                  aria-describedby={error ? 'user-error' : undefined}
                />
                <label
                  className="govuk-label govuk-radios__label"
                  htmlFor={`user-${user.id}`}
                >
                  <strong>{userName}</strong>
                  {isCurrentEditor && (
                    <strong className="govuk-tag govuk-tag--blue govuk-!-margin-left-2">
                      You
                    </strong>
                  )}
                </label>
                <div id={`user-${user.id}-hint`} className="govuk-hint govuk-radios__hint">
                  {userRole}
                  {isCurrentEditor && ' (currently assigned)'}
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
};

export default UserRadioList;
