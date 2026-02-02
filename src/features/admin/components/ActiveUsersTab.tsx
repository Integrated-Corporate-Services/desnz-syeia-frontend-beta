import React from "react";
import LoadingSkeleton from "../../../components/shared/LoadingSkeleton";
import PaginationComponent from "./PaginationComponent";
import { ROLES } from "../../../constants/roles";

interface User {
  id: string;
  fullName: string;
  organisation: string;
  role: string;
  status: string;
}

interface ActiveUsersTabProps {
  isDesnzAdmin: boolean;
  totalResults: number;
  usersError: string;
  usersLoading: boolean;
  paginatedUsers: User[];
  handleExportCSV: () => void;
  navigateToRevokeUser: (userId: string) => void;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

export const ActiveUsersTab: React.FC<ActiveUsersTabProps> = ({
  isDesnzAdmin,
  totalResults,
  usersError,
  usersLoading,
  paginatedUsers,
  handleExportCSV,
  navigateToRevokeUser,
  currentPage,
  totalPages,
  handlePageChange,
}) => {
  return (
    <div className="govuk-tabs__panel" id="active-users">
      <h2 className="govuk-heading-m">Active users</h2>

      <div className="govuk-grid-row govuk-!-margin-bottom-4">
        <div className="govuk-grid-column-one-half">
          <p className="govuk-body">{totalResults} results</p>
        </div>
        <div
          className="govuk-grid-column-one-half"
          style={{ textAlign: "right" }}
        >
          <button
            type="button"
            className="govuk-button"
            onClick={handleExportCSV}
          >
            Download all (CSV)
          </button>
        </div>
      </div>

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
                {isDesnzAdmin && (
                  <th scope="col" className="govuk-table__header">
                    Organisation
                  </th>
                )}
                <th scope="col" className="govuk-table__header">
                  Role
                </th>
                <th scope="col" className="govuk-table__header">
                  Status
                </th>
                <th scope="col" className="govuk-table__header">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {paginatedUsers.length === 0 ? (
                <tr className="govuk-table__row">
                  <td
                    className="govuk-table__cell"
                    colSpan={isDesnzAdmin ? 5 : 4}
                  >
                    <p className="govuk-body">No active users found.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="govuk-table__row">
                    <td className="govuk-table__cell">
                      <strong>{user.fullName}</strong>
                    </td>
                    {isDesnzAdmin && (
                      <td className="govuk-table__cell">{user.organisation}</td>
                    )}
                    <td className="govuk-table__cell">
                      {user.role === ROLES.DESNZ_ADMIN
                        ? "DESNZ Admin"
                        : user.role === ROLES.APPLICANT_TEAM_COORDINATOR
                          ? "DNO Team Coordinator"
                          : user.role}
                    </td>
                    <td className="govuk-table__cell">
                      <strong className="govuk-tag govuk-tag--green">
                        Active
                      </strong>
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
                          Revoke access
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};
