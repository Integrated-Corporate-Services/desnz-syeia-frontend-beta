import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useOrganisation } from '../../../hooks';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import PageTitle from '../../../components/PageTitle';

const ManageOrganisationSettingsPage: React.FC = () => {
  const { organisationId } = useParams<{ organisationId: string }>();
  const location = useLocation();
  const { organisation, loading, error } = useOrganisation(organisationId);
  const updatedSection = (location.state as { updatedSection?: string } | null)?.updatedSection;

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
              <Link to="/admin/user-management" className="govuk-back-link">Back</Link>
              <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body">{error || 'Organisation not found'}</p>
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
      <PageTitle title="Manage organisation" />
            <div className="govuk-width-container">
                <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <Link to="/admin/user-management" className="govuk-back-link">Back</Link>

            <h1 className="govuk-heading-l govuk-!-margin-top-6">Manage organisation</h1>

            {updatedSection && (
              <div className="govuk-notification-banner govuk-notification-banner--success" role="alert">
                <div className="govuk-notification-banner__header">
                  <h2 className="govuk-notification-banner__title">Success</h2>
                </div>
                <div className="govuk-notification-banner__content">
                  <p className="govuk-notification-banner__heading">
                    Organisation {updatedSection} updated
                  </p>
                </div>
              </div>
            )}

            <h2 className="govuk-heading-m govuk-!-margin-top-6">Organisation details</h2>

            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  Organisation name
                </dt>
                <dd className="govuk-summary-list__value">
                  {organisation.organisation_name}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <Link className="govuk-link" to={`/admin/organisations/${organisationId}/change-name`}>
                    Change<span className="govuk-visually-hidden"> organisation name</span>
                  </Link>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  Organisation address
                </dt>
                <dd className="govuk-summary-list__value">
                  {organisation.address_line1 ? (
                    <>
                      {organisation.address_line1}<br />
                      {organisation.address_line2 && <>{organisation.address_line2}<br /></>}
                      {organisation.town_city && <>{organisation.town_city}<br /></>}
                      {organisation.county && <>{organisation.county}<br /></>}
                      {organisation.postcode}
                    </>
                  ) : (
                    'Not available'
                  )}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <Link className="govuk-link" to={`/admin/organisations/${organisationId}/change-address`}>
                    Change<span className="govuk-visually-hidden"> organisation address</span>
                  </Link>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  Team coordinators
                </dt>
                <dd className="govuk-summary-list__value">
                  {organisation.team_coordinator_emails?.length ? (
                    organisation.team_coordinator_emails.map((email, index) => (
                      <React.Fragment key={email}>
                        {email}
                        {index < organisation.team_coordinator_emails!.length - 1 && ','}
                        <br />
                      </React.Fragment>
                    ))
                  ) : (
                    'No team coordinators'
                  )}
                </dd>
              </div>
            </dl>

            <Link to="/admin/user-management" className="govuk-link">
              Return to dashboard
            </Link>
          </div>
        </div>
          </div>
    </>
  );
};

export default ManageOrganisationSettingsPage;
