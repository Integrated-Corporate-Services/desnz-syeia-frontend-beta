import React, { useState } from 'react';
import { useParams, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useManageUsers } from '../../../hooks/useManageUsers';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import ErrorSummary from '../../../components/commonFormFields/ErrorSummary';
import { ROLES } from '../../../constants/roles';
import { formatUserRoleLabel } from '../../../utils/roleUtils';
import { isManageUserRoleChangeEnabled } from '../../../config/appConfig';
import userService from '../../../services/userService';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { useAuthUserContext } from '../../../context/AuthUserContext';

interface RoleOption {
  value: string;
  label?: string;
  description: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: ROLES.APPLICANT_USER,
    description:
      "Can create, edit and submit their own applications, and view their organisation's applications.",
  },
  {
    value: ROLES.APPLICANT_TEAM_COORDINATOR,
    label: 'Team coordinator',
    description:
      'Can manage access for all users and create, edit and submit all applications for their organisation.',
  },
];

const FIRST_ROLE_FIELD_ID = `user-role-${ROLE_OPTIONS[0].value}`;

const ChangeUserRolePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  // Keep the Manage user page's own Back destination (e.g. the team coordinators list)
  const from = (useLocation().state as { from?: string } | null)?.from;
  const returnState = from ? { state: { from } } : undefined;
  const { users, loading } = useManageUsers();
  const user = users.find(u => u.id === userId);
  const { user: actor } = useAuthUserContext();
  const isSuperUser = actor?.role === ROLES.SUPERUSER;
  // A user may appear in several list rows (for example, different work addresses).
  // Retain the role/name/ID association; never pair independent aggregated arrays by index.
  const memberships = [...new Map(users.filter(candidate => candidate.id === userId).flatMap(candidate =>
    candidate.organisationMemberships?.length ? candidate.organisationMemberships :
      candidate.organisationIds?.length === 1 ? [{
        organisationId: candidate.organisationIds[0],
        organisationName: candidate.organisation,
        role: candidate.role,
      }] : []
  ).filter(membership => ROLE_OPTIONS.some(option => option.value === membership.role))
    .map(membership => [membership.organisationId, membership])).values()];
  const [selectedOrganisation, setSelectedOrganisation] = useState('');
  const [organisationError, setOrganisationError] = useState<string | null>(null);
  const organisationId = isSuperUser
    ? (memberships.length === 1 ? memberships[0].organisationId : selectedOrganisation)
    : actor?.organisation_id;
  const membership = memberships.find(item => item.organisationId === organisationId);

  // undefined until the user picks an option, falling back to the user's current role
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectionKey = userId + ':' + (organisationId || '');
  const [selectionUserId, setSelectionUserId] = useState(selectionKey);
  const [organisationUserId, setOrganisationUserId] = useState(userId);
  if (organisationUserId !== userId) {
    setOrganisationUserId(userId);
    setSelectedOrganisation('');
    setOrganisationError(null);
  }

  // The route stays mounted when only :userId changes, so drop the previous user's draft
  // selection rather than saving it against the new user.
  if (selectionUserId !== selectionKey) {
    setSelectionUserId(selectionKey);
    setSelectedRole(undefined);
    setError(null);
  }

  const effectiveRole = selectedRole ?? membership?.role ?? (memberships.length === 0 ? user?.role : undefined);

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(`/admin/manage-user/${userId}`, returnState);
  };

  useBreadcrumb(
    <a href="#" className="govuk-back-link" onClick={handleBackClick}>
      Back
    </a>
  );

  if (!isManageUserRoleChangeEnabled()) {
    return <Navigate to={`/admin/manage-user/${userId}`} replace />;
  }

  const handleSaveChanges = async () => {
    if (saving) return;
    setOrganisationError(null);
    if (!organisationId || (isSuperUser && !membership)) {
      setOrganisationError(memberships.length > 1
        ? 'Select an organisation'
        : 'Organisation details could not be loaded. Return to user management and try again.');
      return;
    }
    const allowedRoles = new Set(ROLE_OPTIONS.map(o => o.value));

    if (!userId || !effectiveRole || !allowedRoles.has(effectiveRole)) {
      setError('Select a role');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const response = await userService.updateUserRole(userId, effectiveRole, organisationId);
      if (response.success) {
        navigate(`/admin/manage-user/${userId}`, returnState);
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

  const canChangeRole = memberships.length > 0 || ROLE_OPTIONS.some(option => option.value === user.role);
  if (!canChangeRole) {
    return <Navigate to={`/admin/manage-user/${userId}`} replace />;
  }

  return (
    <>
      <PageTitle title="Choose a role for this user" />
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {(error || organisationError) && (
              <ErrorSummary errors={[
                ...(organisationError ? [{ fieldId: 'role-organisation', message: organisationError }] : []),
                ...(error ? [{ fieldId: FIRST_ROLE_FIELD_ID, message: error }] : []),
              ]} />
            )}
            {isSuperUser && memberships.length !== 1 && (
              <div className={organisationError ? 'govuk-form-group govuk-form-group--error' : 'govuk-form-group'}>
                <label className="govuk-label" htmlFor="role-organisation">Organisation</label>
                <div id="role-organisation-hint" className="govuk-hint">
                  Choose the organisation where this user's role should change.
                </div>
                {organisationError && <p id="role-organisation-error" className="govuk-error-message">
                  <span className="govuk-visually-hidden">Error:</span> {organisationError}
                </p>}
                <select id="role-organisation" className="govuk-select" value={selectedOrganisation}
                  aria-describedby={'role-organisation-hint' + (organisationError ? ' role-organisation-error' : '')}
                  onChange={event => {
                    setSelectedOrganisation(event.target.value);
                    setOrganisationError(null);
                    setSelectedRole(undefined);
                    setError(null);
                  }} disabled={saving}>
                  <option value="">Select an organisation</option>
                  {memberships.map(item => <option key={item.organisationId} value={item.organisationId}>
                    {item.organisationName}
                  </option>)}
                </select>
              </div>
            )}

            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset" aria-describedby={error ? 'user-role-error' : undefined}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                  <h1 className="govuk-fieldset__heading">Choose a role for this user</h1>
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
                        aria-describedby={`user-role-${option.value}-hint`}
                        checked={effectiveRole === option.value}
                        disabled={saving || (isSuperUser && !membership)}
                        onChange={() => {
                          setError(null);
                          setSelectedRole(option.value);
                        }}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor={`user-role-${option.value}`}
                      >
                        {option.label ?? formatUserRoleLabel(option.value)}
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
