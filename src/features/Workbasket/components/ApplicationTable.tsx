import React from "react";
import { useApplicationNavigation } from "../../../hooks";
import type { Application } from "../../../types/application";
import { getStatusTagClass } from "../constants/statusDisplay";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatStatusText = (status: string): string => {
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
    <table className="govuk-table" aria-label="Applications list">
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th scope="col" className="govuk-table__header">
            DESNZ reference
          </th>
          <th scope="col" className="govuk-table__header">
            Your reference
          </th>
          <th scope="col" className="govuk-table__header">
            Case type
          </th>
          <th scope="col" className="govuk-table__header">
            Status
          </th>
          <th scope="col" className="govuk-table__header">
            Date submitted
          </th>
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
                <a
                  href="#"
                  className="govuk-link"
                  aria-label={`View application ${app.operator_ref}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToApplication(
                      app.type,
                      app.application_id,
                      "task-list"
                    );
                  }}
                >
                  {app.operator_ref}
                </a>
              </td>
              <td className="govuk-table__cell">
                {app.your_reference || "123456789"}
              </td>
              <td className="govuk-table__cell">Overhead lines</td>
              <td className="govuk-table__cell">{getStatusTag(app.status)}</td>
              <td className="govuk-table__cell">
                {formatDate(app.created_at)}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default ApplicationTable;
