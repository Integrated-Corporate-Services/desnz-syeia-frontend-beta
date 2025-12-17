import React from 'react';
import { useAuthUserContext } from '../../context/AuthUserContext';
import type { AuthUser } from '../../types/auth';

interface User {
  id: string;
  fullName: string;
  email: string;
  organisation: string;
  role: string;
  status: string;
  lastLogin: string | null;
}

interface AddUserButtonProps {
  onAddUser: () => void;
}

interface UserOverviewSectionProps {
  activeCount: number;
  inactiveCount: number;
  userOrganisation?: string;
}

interface EmptyUsersStateProps {
  onAddUser: () => void;
  userOrganisation?: string;
}

interface UsersTableProps {
  filteredUsers: User[];
  showRevokeWarning: string | null;
  actionColumnCount: number;
  onRevokeAccess: (userId: string) => void;
  onConfirmRevoke: (userId: string) => void;
  onCancelRevoke: () => void;
  onAddUser: () => void;
  userOrganisation?: string;
}

interface UserRowProps {
  user: User;
  showRevokeWarning: string | null;
  actionColumnCount: number;
  onRevokeAccess: (userId: string) => void;
  onConfirmRevoke: (userId: string) => void;
  onCancelRevoke: () => void;
}

/**
 * Add user button positioned with page heading (GDS primary action pattern)
 * Only visible to admin users (DNO_TEAM_COORDINATOR or SUPERUSER)
 */
export const AddUserButton: React.FC<AddUserButtonProps> = ({ onAddUser }) => {
  const { user } = useAuthUserContext();
  const isAdmin = user && ((user as AuthUser)?.role === 'SUPERUSER' || (user as AuthUser)?.role === 'DNO_TEAM_COORDINATOR');
  return isAdmin ? (
    <button
      type="button"
      className="govuk-button"
      onClick={onAddUser}
    >
      Add user
    </button>
  ) : null;
};

/**
 * User overview statistics component
 */
export const UserOverviewSection: React.FC<UserOverviewSectionProps> = ({
  activeCount,
  inactiveCount,
  userOrganisation
}) => (
  <>
    <h2 className="govuk-heading-m">User overview</h2>
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <dl className="govuk-summary-list">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Active users</dt>
            <dd className="govuk-summary-list__value">{activeCount}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Inactive users</dt>
            <dd className="govuk-summary-list__value">{inactiveCount}</dd>
          </div>
        </dl>
      </div>
    </div>
  </>
);

/**
 * Users section header
 */
export const UsersHeader: React.FC = () => (
  <h2 className="govuk-heading-m">All users</h2>
);

/**
 * Empty state component for when there are no users
 */
export const EmptyUsersState: React.FC<EmptyUsersStateProps> = ({ onAddUser, userOrganisation }) => {
  const { user } = useAuthUserContext();
  const isSuperUser = user?.role === 'SUPERUSER';
  const isAdmin = user && ((user as AuthUser)?.role === 'SUPERUSER' || (user as AuthUser)?.role === 'DNO_TEAM_COORDINATOR');
  return (
    <div className="govuk-inset-text">
      <p className="govuk-body govuk-!-margin-bottom-3">
        There are no users for {isSuperUser ? 'any organisation' : userOrganisation || 'your organisation'} yet.
      </p>
      {isAdmin && (
        <button
          type="button"
          className="govuk-button"
          onClick={onAddUser}
        >
          Add user
        </button>
      )}
    </div>
  );
};

/**
 * Users table component
 */
export const UsersTable: React.FC<UsersTableProps> = ({
  filteredUsers,
  showRevokeWarning,
  actionColumnCount,
  onRevokeAccess,
  onConfirmRevoke,
  onCancelRevoke,
  onAddUser,
  userOrganisation
}) => {
  const { user } = useAuthUserContext();
  const isSuperUser = user?.role === 'SUPERUSER';
  // Handle empty state
  if (filteredUsers.length === 0) {
    return (
      <EmptyUsersState
        onAddUser={onAddUser}
        userOrganisation={userOrganisation}
      />
    );
  }

  return (
    <table className="govuk-table govuk-!-margin-bottom-8">
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th scope="col" className="govuk-table__header">Name</th>
          {isSuperUser && <th scope="col" className="govuk-table__header">Organisation</th>}
          {/* <th scope="col" className="govuk-table__header">Email</th> */}
          <th scope="col" className="govuk-table__header">Role</th>
          <th scope="col" className="govuk-table__header">Status</th>
          <th scope="col" className="govuk-table__header">Last login</th>
          {/* <th scope="col" className="govuk-table__header">Action</th> */}
        </tr>
      </thead>

      <tbody className="govuk-table__body">
        {filteredUsers.map(user => (
          <React.Fragment key={user.id}>
            <UserRow
              user={user}
              showRevokeWarning={showRevokeWarning}
              actionColumnCount={actionColumnCount}
              onRevokeAccess={onRevokeAccess}
              onConfirmRevoke={onConfirmRevoke}
              onCancelRevoke={onCancelRevoke}
            />
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

/**
 * Individual user row component
 */
export const UserRow: React.FC<UserRowProps> = ({
  user,
  showRevokeWarning,
  actionColumnCount,
  onRevokeAccess,
  onConfirmRevoke,
  onCancelRevoke
}) => {
  const { user: currentUser } = useAuthUserContext();
  const isSuperUser = currentUser?.role === 'SUPERUSER';
  return (
    <>
      <tr className="govuk-table__row">
        <td className="govuk-table__cell"><strong>{user.fullName}</strong></td>
        {isSuperUser && <td className="govuk-table__cell">{user.organisation}</td>}
        {/* <td className="govuk-table__cell">{user.email}</td> */}
        <td className="govuk-table__cell">
          <strong
            className="govuk-tag"
            style={{
              backgroundColor: user.role === 'SUPERUSER' ? '#4c2c92' : user.role === 'DNO_TEAM_COORDINATOR' ? '#1d70b8' : '#505a5f',
              color: '#ffffff'
            }}
          >
            {user.role === 'SUPERUSER' ? 'Superuser' : user.role === 'DNO_TEAM_COORDINATOR' ? 'DNO Coordinator' : user.role}
          </strong>
        </td>
        <td className="govuk-table__cell">
          <strong
            className="govuk-tag"
            style={{
              backgroundColor: user.status === 'ACTIVE' ? '#00703c' : '#d4351c',
              color: '#ffffff'
            }}
          >
            {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </strong>
        </td>
        <td className="govuk-table__cell">{user.lastLogin || 'Never'}</td>
        {/* Action column disabled
      <td className="govuk-table__cell">
        {user.status === 'ACTIVE' && user.role !== 'SYSTEM' && isSuperUser && (
          <a
            className="govuk-link"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onRevokeAccess(user.id);
            }}
          >
            Revoke access
          </a>
        )}
      </td>
      */}
      </tr>

      {/* Revoke confirmation row */}
      {showRevokeWarning === user.id && (
        <tr className="govuk-table__row">
          <td className="govuk-table__cell" colSpan={actionColumnCount}>
            <div className="govuk-warning-text govuk-!-margin-bottom-2">
              <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
              <strong className="govuk-warning-text__text">
                <span className="govuk-visually-hidden">Warning</span>
                Are you sure you want to revoke access for {user.fullName}? They will no longer be able to use this service.
              </strong>
            </div>
            <div className="govuk-button-group">
              <button
                className="govuk-button govuk-button--warning"
                onClick={() => onConfirmRevoke(user.id)}
              >
                Yes, revoke access
              </button>
              <a
                className="govuk-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onCancelRevoke();
                }}
              >
                Cancel
              </a>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
