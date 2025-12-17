import React from 'react';
import { useManageUsers, useManageUsersNavigation } from '../../hooks';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import {
  AddUserButton,
  UserOverviewSection,
  UsersHeader,
  UsersTable
} from '../../components/shared/ManageUsersComponents';

const ManageUsersPage: React.FC = () => {
  const {
    filteredUsers,
    loading,
    error,
    showRevokeWarning,
    activeCount,
    inactiveCount,
    actionColumnCount,
    userOrganisation,
    handleRevokeAccess,
    confirmRevokeAccess,
    cancelRevoke
  } = useManageUsers();

  const {
    navigateToDashboard,
    navigateToAccessRevoked,
    navigateToAddUser
  } = useManageUsersNavigation();

  const handleConfirmRevoke = (userId: string) => {
    confirmRevokeAccess(userId, navigateToAccessRevoked);
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">

        <a
          href="#"
          className="govuk-back-link"
          onClick={(e) => {
            e.preventDefault();
            navigateToDashboard();
          }}
        >
          Back To Dashboard
        </a>

        {/* Page heading with aligned primary action */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Manage users</h1>
          </div>
          {/* TODO: Re-enable Add User button when manual user creation feature is ready
          <div className="govuk-grid-column-one-third" style={{ textAlign: 'right', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <AddUserButton onAddUser={navigateToAddUser} />
          </div>
          */}
        </div>

        {error && (
          <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{error}</p>
            </div>
          </div>
        )}

        {/* User Overview Section */}
        <div className="govuk-!-margin-bottom-6">
          {loading ? (
            <LoadingSkeleton type="summary" />
          ) : (
            <UserOverviewSection
              activeCount={activeCount}
              inactiveCount={inactiveCount}
              userOrganisation={userOrganisation}
            />
          )}
        </div>

        <div className="govuk-!-margin-bottom-4">
          <UsersHeader />
        </div>

        {/* Users Table */}
        {loading ? (
          <LoadingSkeleton type="table" />
        ) : (
          <UsersTable
            filteredUsers={filteredUsers}
            showRevokeWarning={showRevokeWarning}
            actionColumnCount={actionColumnCount}
            onRevokeAccess={handleRevokeAccess}
            onConfirmRevoke={handleConfirmRevoke}
            onCancelRevoke={cancelRevoke}
            onAddUser={navigateToAddUser}
            userOrganisation={userOrganisation}
          />
        )}

      </main>
    </div>
  );
};

export default ManageUsersPage;
