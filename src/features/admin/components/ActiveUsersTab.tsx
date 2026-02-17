import React from "react";
import LoadingSkeleton from "../../../components/shared/LoadingSkeleton";
import PaginationComponent from "./PaginationComponent";
import { ROLES } from "../../../constants/roles";

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
    if (role === ROLES.DESNZ_ADMIN) return 'DESNZ Admin';
    if (role === ROLES.APPLICANT_TEAM_COORDINATOR) return 'Team coordinator';
    if (role === ROLES.APPLICANT_AGENT) return 'Applicant agent';
    return 'Applicant';
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
          <table className="govuk-table">
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
