import React, { useMemo, useId } from "react";
import { useApplicationNavigation } from "../../../hooks";
import type { Application } from "../../../types/application";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import type { TabType } from "../constants/filterOptions";
import { createLogger } from "../../../utils/logger";
import "../../../styles/DashboardMobile.css";

const logger = createLogger('ApplicationTable');

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);

    // Check for invalid date
    if (isNaN(date.getTime())) {
      return "—";
    }

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    logger.error("Date formatting error:", error);
    return "—";
  }
};

const getCaseTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    s37: "Overhead lines (S37)",
    "s-37": "Overhead lines (S37)",
    nwl: "Necessary wayleaves",
    tlp: "Tree lopping and felling",
    "overhead-lines": "Overhead lines (S37)",
    "necessary-wayleaves": "Necessary wayleaves",
    "tree-lopping": "Tree lopping and felling",
  };
  const label = typeMap[type.toLowerCase()] || type;
  return label.replace(/\s*\(.*\)\s*$/, "");
};

// TODO Phase 3: Add completed_at and archived_at fields to Application type
const DATE_COLUMN_CONFIG: Record<
  TabType,
  { label: string; getDate: (app: Application) => string | undefined }
> = {
  draft: {
    label: "Date started",
    getDate: (app) => app.created_at,
  },
  active: {
    label: "Date submitted",
    getDate: (app) => app.submitted_at || app.created_at,
  },
  completed: {
    label: "Date completed",
    getDate: (app) => app.submitted_at || app.created_at,
  },
  archived: {
    label: "Date archived",
    getDate: (app) => app.created_at,
  },
};

type Props = {
  applications: Application[];
  activeTab?: TabType;
};

export const ApplicationTable: React.FC<Props> = ({
  applications,
  activeTab = "active",
}) => {
   const { navigateToApplication, getNavigationPath } = useApplicationNavigation();
  const tableId = useId();
  const captionId = `table-description-${tableId}`;

  const dateColumnConfig =
    DATE_COLUMN_CONFIG[activeTab] || DATE_COLUMN_CONFIG.active;

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }, [applications]);

  const handleApplicationClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    app: Application,
  ) => {
    e.preventDefault();
    
    // Draft applications should always navigate to task-list to continue editing
    const isDraft = app.status?.toLowerCase() === 'draft';
    
    if (isDraft || app.permissions?.canEdit) {
      navigateToApplication(app.type, app.application_id, "task-list");
    } else if (app.permissions?.canView) {
      navigateToApplication(app.type, app.application_id, "application-summary");
    }
  };

  return (
    <>
    <table
      className="govuk-table"
      role="table"
      aria-label={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} applications table`}
      aria-describedby={captionId}
    >
      <caption className="govuk-visually-hidden" id={captionId}>
        Table showing {activeTab} applications with columns for DESNZ reference,
        your reference, case type,{" "}
        {activeTab !== "draft" ? "status, and" : "and"}{" "}
        {dateColumnConfig.label.toLowerCase()}. Navigate through rows using
        arrow keys. Activate links using Enter or Space.
      </caption>

      <thead className="govuk-table__head">
        <tr className="govuk-table__row" role="row">
          <th
            scope="col"
            className="govuk-table__header govuk-!-width-one-tenth"
            role="columnheader"
          >
            <span aria-label="DESNZ reference number">DESNZ reference</span>
          </th>
          <th scope="col" className="govuk-table__header" role="columnheader">
            <span aria-label="Your reference number or identifier">
              Your reference
            </span>
          </th>
          <th scope="col" className="govuk-table__header" role="columnheader">
            <span aria-label="Application case type">Case type</span>
          </th>
          {activeTab !== "draft" && (
            <th scope="col" className="govuk-table__header" role="columnheader">
              <span aria-label="Current application status">Status</span>
            </th>
          )}
          <th scope="col" className="govuk-table__header" role="columnheader">
            <span
              aria-label={`Date the application was ${activeTab === "draft" ? "started" : activeTab === "active" ? "submitted" : "completed"}`}
            >
              {dateColumnConfig.label}
            </span>
          </th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {sortedApplications.map((app, rowIndex) => (
          <tr
            className="govuk-table__row"
            key={app.application_id}
            role="row"
            aria-rowindex={rowIndex + 2}
            aria-label={`Application row ${rowIndex + 1} of ${sortedApplications.length}`}
          >
            <td
              className="govuk-table__cell"
              role="cell"
              aria-label={`DESNZ reference: ${app.desnz_ref || "Not available"}`}
            >
              <a
                href={getNavigationPath(
                  app.type, 
                  app.application_id, 
                  (app.status?.toLowerCase() === 'draft' || app.permissions?.canEdit) ? 'task-list' : 'application-summary'
                )}
                className="govuk-link"
                aria-label={`View details for application ${app.desnz_ref || "with no reference"}, ${getCaseTypeLabel(app.type)}, ${activeTab !== "draft" ? app.status + " status, " : ""}submitted on ${formatDate(dateColumnConfig.getDate(app))}`}
                onClick={(e) => handleApplicationClick(e, app)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const isDraft = app.status?.toLowerCase() === 'draft';
                    const destination = (isDraft || app.permissions?.canEdit) ? "task-list" : "application-summary";
                    navigateToApplication(
                      app.type,
                      app.application_id,
                      destination,
                    );
                  }
                }}
                tabIndex={0}
              >
                {app.desnz_ref || "N/A"}
              </a>
            </td>

            <td
              className="govuk-table__cell"
              role="cell"
              aria-label={`Your reference: ${app.your_reference || "Not provided"}`}
            >
              {app.your_reference || "—"}
            </td>

            <td
              className="govuk-table__cell"
              role="cell"
              aria-label={`Case type: ${getCaseTypeLabel(app.type)}`}
            >
              {getCaseTypeLabel(app.type)}
            </td>

            {activeTab !== "draft" && (
              <td
                className="govuk-table__cell"
                role="cell"
                aria-label={`Status: ${app.status.replace(/-/g, " ")}`}
              >
                <StatusBadge status={app.status} />
              </td>
            )}

            <td
              className="govuk-table__cell"
              role="cell"
              aria-label={`${dateColumnConfig.label}: ${formatDate(dateColumnConfig.getDate(app))}`}
            >
              {formatDate(dateColumnConfig.getDate(app))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Mobile card view - visible only on small screens */}
    <div className="application-card-list" role="list" aria-label="Applications list">
      {sortedApplications.map((app) => {
        const isDraft = app.status?.toLowerCase() === 'draft';
        const destination = (isDraft || app.permissions?.canEdit) ? "task-list" : "application-summary";
        
        return (
          <div 
            key={`card-${app.application_id}`} 
            className="application-card"
            role="listitem"
          >
            <div className="application-card__header">
              <div className="application-card__reference">
                <a
                  href={getNavigationPath(app.type, app.application_id, destination)}
                  className="govuk-link"
                  onClick={(e) => handleApplicationClick(e, app)}
                >
                  {app.desnz_ref || "N/A"}
                </a>
              </div>
              {activeTab !== "draft" && (
                <div className="application-card__status">
                  <StatusBadge status={app.status} />
                </div>
              )}
            </div>
            <div className="application-card__body">
              <div className="application-card__row">
                <span className="application-card__label">Your reference: </span>
                <span className="application-card__value">{app.your_reference || "—"}</span>
              </div>
              <div className="application-card__row">
                <span className="application-card__label">Case type: </span>
                <span className="application-card__value">{getCaseTypeLabel(app.type)}</span>
              </div>
              <div className="application-card__row">
                <span className="application-card__label">{dateColumnConfig.label}: </span>
                <span className="application-card__value">{formatDate(dateColumnConfig.getDate(app))}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
};

// Display name for React DevTools
ApplicationTable.displayName = "ApplicationTable";

export default ApplicationTable;
