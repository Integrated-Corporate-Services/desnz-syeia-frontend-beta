import React from "react";
import { getStatusTagClass } from "../constants/statusDisplay";
import { useApplicationNavigation } from "../../../hooks";
import type { Application } from "../../../types/application";

const formatStatusText = (status: string): string => {
  // Convert to title case (capitalize first letter of each word)
  return status
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getStatusTag = (status: string) => {
  const tagClass = getStatusTagClass(status);
  const formattedStatus = formatStatusText(status);
  return <strong className={tagClass}>{formattedStatus}</strong>;
};

type Props = {
  applications: Application[];
};

const ApplicationTable: React.FC<Props> = ({ applications }) => {
  const { navigateToApplication } = useApplicationNavigation();

  return (
    <table className="govuk-table" style={{ marginTop: 32 }}>
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th className="govuk-table__header">Reference</th>
          <th className="govuk-table__header">Type</th>
          <th className="govuk-table__header">Applicant Name</th>
          <th className="govuk-table__header">Status</th>
          <th className="govuk-table__header">Action</th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {applications
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .map((app) => (
            <tr className="govuk-table__row" key={app.application_id}>
              <td className="govuk-table__cell">
                <strong>{app.operator_ref}</strong>
              </td>
              <td className="govuk-table__cell">{app.type}</td>
              <td className="govuk-table__cell">{app.operator_name || ""}</td>
              <td className="govuk-table__cell">{getStatusTag(app.status)}</td>
              <td className="govuk-table__cell">
                <a
                  href="#"
                  className="govuk-link"
                  style={{ marginRight: "10px", color: "#4c2c92" }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToApplication(
                      app.type,
                      app.application_id,
                      "task-list"
                    );
                  }}
                >
                  View
                </a>
                <a
                  href="#"
                  className="govuk-link"
                  style={{ color: "#4c2c92" }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToApplication(
                      app.type,
                      app.application_id,
                      "delete"
                    );
                  }}
                >
                  Delete
                </a>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default ApplicationTable;
