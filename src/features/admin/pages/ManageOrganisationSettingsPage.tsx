import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useOrganisation } from '../../../hooks';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { MANAGE_ORGANISATION_SETTINGS_CONSTANTS, ADMIN_COMMON_CONSTANTS } from '../constants/userManagementConstants';
import './ManageOrganisationSettingsPage.css';

const ManageOrganisationSettingsPage: React.FC = () => {
  const { organisationId } = useParams<{ organisationId: string }>();
  const location = useLocation();
  const { organisation, loading, error } = useOrganisation(organisationId);
  const updatedSection = (location.state as { updatedSection?: string } | null)?.updatedSection;

  useBreadcrumb(
    <Link to="/admin/user-management" className="govuk-back-link">{ADMIN_COMMON_CONSTANTS.BACK}</Link>
  );

  if (loading) {
    return (
      <>
                <div className="govuk-width-container">
                      <LoadingSkeleton type="summary" />
                  </div>
      </>
    );
  }

  if (error || !organisation) {
    return (
      <>
                <div className="govuk-width-container">
                    <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                  {ADMIN_COMMON_CONSTANTS.ERROR_SUMMARY_TITLE}
                </h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body">{error || MANAGE_ORGANISATION_SETTINGS_CONSTANTS.ORGANISATION_NOT_FOUND}</p>
                </div>
              </div>
            </div>
          </div>
              </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title={MANAGE_ORGANISATION_SETTINGS_CONSTANTS.TITLE} />
            <div className="govuk-width-container">
                <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l govuk-!-margin-top-6">{MANAGE_ORGANISATION_SETTINGS_CONSTANTS.TITLE}</h1>

            {updatedSection && (
              <div className="govuk-notification-banner govuk-notification-banner--success" role="alert">
                <div className="govuk-notification-banner__header">
                  <h2 className="govuk-notification-banner__title">{MANAGE_ORGANISATION_SETTINGS_CONSTANTS.SUCCESS}</h2>
                </div>
                <div className="govuk-notification-banner__content">
                  <p className="govuk-notification-banner__heading">
                    {MANAGE_ORGANISATION_SETTINGS_CONSTANTS.UPDATED(updatedSection)}
                  </p>
                </div>
              </div>
            )}

            <dl className="govuk-summary-list organisation-details__summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  {MANAGE_ORGANISATION_SETTINGS_CONSTANTS.ORGANISATION_NAME}
                </dt>
                <dd className="govuk-summary-list__value govuk-!-text-break-word">
                  {organisation.organisation_name}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <Link className="govuk-link govuk-link--no-visited-state" to={`/admin/organisations/${organisationId}/change-name`}>
                    {MANAGE_ORGANISATION_SETTINGS_CONSTANTS.CHANGE}<span className="govuk-visually-hidden">{MANAGE_ORGANISATION_SETTINGS_CONSTANTS.CHANGE_NAME_HIDDEN}</span>
                  </Link>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  {MANAGE_ORGANISATION_SETTINGS_CONSTANTS.ORGANISATION_ADDRESS}
                </dt>
                <dd className="govuk-summary-list__value govuk-!-text-break-word">
                  {organisation.address_line1 ? (
                    <>
                      {organisation.address_line1}<br />
                      {organisation.address_line2 && <>{organisation.address_line2}<br /></>}
                      {organisation.town_city && <>{organisation.town_city}<br /></>}
                      {organisation.county && <>{organisation.county}<br /></>}
                      {organisation.postcode}
                    </>
                  ) : (
                    MANAGE_ORGANISATION_SETTINGS_CONSTANTS.ADDRESS_NOT_AVAILABLE
                  )}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <Link className="govuk-link govuk-link--no-visited-state" to={`/admin/organisations/${organisationId}/change-address`}>
                    {MANAGE_ORGANISATION_SETTINGS_CONSTANTS.CHANGE}<span className="govuk-visually-hidden">{MANAGE_ORGANISATION_SETTINGS_CONSTANTS.CHANGE_ADDRESS_HIDDEN}</span>
                  </Link>
                </dd>
              </div>

              <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
                <dt className="govuk-summary-list__key">
                  {MANAGE_ORGANISATION_SETTINGS_CONSTANTS.TEAM_COORDINATORS}
                </dt>
                <dd className="govuk-summary-list__value govuk-!-text-break-word">
                  {organisation.team_coordinator_emails?.length ? (
                    organisation.team_coordinator_emails.map((email, index) => (
                      <React.Fragment key={email}>
                        {email}
                        {index < organisation.team_coordinator_emails!.length - 1 && ','}
                        <br />
                      </React.Fragment>
                    ))
                  ) : (
                    MANAGE_ORGANISATION_SETTINGS_CONSTANTS.NO_TEAM_COORDINATORS
                  )}
                </dd>
                {/* Change link hidden for now
                <dd className="govuk-summary-list__actions">
                  <Link className="govuk-link govuk-link--no-visited-state" to={`/admin/organisations/${organisationId}/team-coordinators`}>
                    {MANAGE_ORGANISATION_SETTINGS_CONSTANTS.CHANGE}<span className="govuk-visually-hidden">{MANAGE_ORGANISATION_SETTINGS_CONSTANTS.CHANGE_TEAM_COORDINATORS_HIDDEN}</span>
                  </Link>
                </dd>
                */}
              </div>
            </dl>

            <p className="govuk-body govuk-!-margin-bottom-9">
              <Link to="/admin/user-management" className="govuk-link govuk-link--no-visited-state">
                {ADMIN_COMMON_CONSTANTS.RETURN_TO_DASHBOARD}
              </Link>
            </p>
          </div>
        </div>
          </div>
    </>
  );
};

export default ManageOrganisationSettingsPage;
