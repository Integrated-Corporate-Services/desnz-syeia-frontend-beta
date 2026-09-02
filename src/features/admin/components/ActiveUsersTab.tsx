import React from "react";
import LoadingSkeleton from "../../../components/shared/LoadingSkeleton";
import PaginationComponent from "./PaginationComponent";
import { ROLES } from "../../../constants/roles";
import "../../../styles/DashboardMobile.css";

interface User {
  id: string;
  fullName: string;
  email: string;
  organisation: string;
  role: string;
  status: string;
  lastLogin: string | null;
}

const formatRole = (role: string) => {
  if (role === ROLES.SUPERUSER) return 'DESNZ Admin';
  if (role === ROLES.APPLICANT_TEAM_COORDINATOR) return 'Team coordinator';
  if (role === ROLES.TECH_ADMIN) return 'Tech Admin';
  if (role === ROLES.APPLICANT_AGENT) return 'Applicant agent';
  return 'Applicant';
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

interface ActiveUsersTabProps {
  totalResults: number;
  usersError: string;
  usersLoading: boolean;
  paginatedUsers: User[];
  navigateToRevokeUser: (userId: string) => void;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

export const ActiveUsersTab: React.FC<ActiveUsersTabProps> = ({
  totalResults,
  usersError,
  usersLoading,
  navigateToRevokeUser,
  paginatedUsers,
  currentPage,
  totalPages,
  handlePageChange,
}) => {
 

  return (
    <div className="govuk-tabs__panel" id="active-users">
      <h2 className="govuk-heading-m">Active users</h2>
      <p className="govuk-body-s govuk-!-margin-bottom-3">{totalResults} results</p>

     

      {usersError && (
        <div
          className="govuk-error-summary"
          aria-labelledby="error-summary-title"
          role="alert"
          tabIndex={-1}
        >
          <h2 className="govuk-error-summary__title" id="error-summary-title">
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{usersError}</p>
          </div>
        </div>
      )}

      {usersLoading ? (
        <LoadingSkeleton type="table" />
      ) : (
        <>
          {/* Desktop table view */}
          <table className="govuk-table user-management-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">
                  Name
                </th>
                <th scope="col" className="govuk-table__header">
                  Email
                </th>
                <th scope="col" className="govuk-table__header">
                  Role
                </th>
                <th scope="col" className="govuk-table__header">
                  Status
                </th>
                <th scope="col" className="govuk-table__header">
                  Last login
                </th>
                <th scope="col" className="govuk-table__header">
                  Action(s)
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {paginatedUsers.length === 0 ? (
                <tr className="govuk-table__row">
                  <td
                    className="govuk-table__cell"
                    colSpan={7}
                  >
                    <p className="govuk-body">No active users found.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="govuk-table__row">
                    <td className="govuk-table__cell">{user.fullName}</td>
                    <td className="govuk-table__cell">{user.email}</td>
                    <td className="govuk-table__cell">
                      {formatRole(user.role)}
                    </td>
                    <td className="govuk-table__cell">
                      <strong className="govuk-tag govuk-tag--green">
                        Active
                      </strong>
                    </td>
                    <td className="govuk-table__cell">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Never'}
                    </td>
                    <td className="govuk-table__cell">
                      {user.role !== "SYSTEM" && (
                        <a
                          className="govuk-link"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToRevokeUser(user.id);
                          }}
                        >
                          Manage
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile card view */}
          <div className="user-card-list" role="list" aria-label="Active users list">
            {paginatedUsers.length === 0 ? (
              <p className="govuk-body">No active users found.</p>
            ) : (
              paginatedUsers.map((user) => (
                <div key={`card-${user.id}`} className="user-card" role="listitem">
                  <div className="user-card__header">
                    <div className="user-card__name">{user.fullName}</div>
                    <div className="user-card__status">
                      <strong className="govuk-tag govuk-tag--green">Active</strong>
                    </div>
                  </div>
                  <div className="user-card__body">
                    <div className="user-card__row">
                      <span className="user-card__label">Organisation: </span>
                      <span className="user-card__value">{user.organisation || 'SSE Networks'}</span>
                    </div>
                    <div className="user-card__row">
                      <span className="user-card__label">Email: </span>
                      <span className="user-card__value">{user.email}</span>
                    </div>
                    <div className="user-card__row">
                      <span className="user-card__label">Role: </span>
                      <span className="user-card__value">{formatRole(user.role)}</span>
                    </div>
                    <div className="user-card__row">
                      <span className="user-card__label">Last login: </span>
                      <span className="user-card__value">{formatDate(user.lastLogin)}</span>
                    </div>
                  </div>
                  {user.role !== "SYSTEM" && (
                    <div className="user-card__action">
                      <a
                        className="govuk-link"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToRevokeUser(user.id);
                        }}
                      >
                        Manage
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="app-pagination-container govuk-!-margin-top-6">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
