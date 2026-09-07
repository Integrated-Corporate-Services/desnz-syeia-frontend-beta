import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useManageUsers } from '../../../hooks/useManageUsers';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import ErrorSummary from '../../../components/commonFormFields/ErrorSummary';
import { ROLES } from '../../../constants/roles';
import userService from '../../../services/userService';
import PageTitle from '../../../components/PageTitle';

interface RoleOption {
  value: string;
  label: string;
  description: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: ROLES.APPLICANT_USER,
    label: 'Applicant',
    description:
      "Can create and edit their own applications, and view the team's submitted applications.",
  },
  {
    value: ROLES.APPLICANT_TEAM_COORDINATOR,
    label: 'Team coordinator',
    description:
      'A person who create and edit their own applications, and can manage team members and view all applications submitted by the team.',
  },
];

const ChangeUserRolePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { users, loading } = useManageUsers();

  const user = users.find(u => u.id === userId);

  const [selectedRole, setSelectedRole] = useState<string | undefined>(user?.role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the selected role in sync once the user data has loaded
  React.useEffect(() => {
    if (user && selectedRole === undefined) {
      setSelectedRole(user.role);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(`/admin/manage-user/${userId}`);
  };

  const handleSaveChanges = async () => {
    if (!selectedRole) {
      setError('Select a role');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const response = await userService.updateUserRole(userId as string, selectedRole);
      if (response.success) {
        navigate(`/admin/manage-user/${userId}`);
      } else {
        setError(response.message || 'Failed to update user role');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="govuk-width-container">
        <LoadingSkeleton type="default" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="govuk-width-container">
        <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert">
          <h2 className="govuk-error-summary__title" id="error-summary-title">
            User not found
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">The user you are trying to manage could not be found.</p>
          </div>
        </div>
        <Link to="/admin/user-management" className="govuk-link">
          Return to user management
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Which role applies to this user?" />
      <div className="govuk-width-container">
        <a href="#" className="govuk-back-link" onClick={handleBackClick}>
          Back
        </a>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {error && (
              <ErrorSummary errors={[{ fieldId: 'user-role', message: error }]} />
            )}

            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset" aria-describedby={error ? 'user-role-error' : undefined}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                  <h1 className="govuk-fieldset__heading">Which role applies to this user?</h1>
                </legend>

                {error && (
                  <p id="user-role-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {error}
                  </p>
                )}

                <div className="govuk-radios" data-module="govuk-radios">
                  {ROLE_OPTIONS.map(option => (
                    <div className="govuk-radios__item" key={option.value}>
                      <input
                        className="govuk-radios__input"
                        id={`user-role-${option.value}`}
                        name="user-role"
                        type="radio"
                        value={option.value}
                        checked={selectedRole === option.value}
                        onChange={() => setSelectedRole(option.value)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor={`user-role-${option.value}`}
                      >
                        {option.label}
                      </label>
                      <div
                        id={`user-role-${option.value}-hint`}
                        className="govuk-hint govuk-radios__hint"
                      >
                        {option.description}
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>

            <button
              type="button"
              className="govuk-button"
              data-module="govuk-button"
              onClick={handleSaveChanges}
              disabled={saving}
            >
              Save changes
            </button>

            <p className="govuk-body">
              <Link to={`/admin/manage-user/${userId}`} className="govuk-link">
                Return to manage user
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangeUserRolePage;
