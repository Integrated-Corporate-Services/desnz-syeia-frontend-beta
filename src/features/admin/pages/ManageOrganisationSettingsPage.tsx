import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useOrganisation } from '../../../hooks';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import SkipLink from '../../../components/SkipLink';

const ManageOrganisationSettingsPage: React.FC = () => {
  const { organisationId } = useParams<{ organisationId: string }>();
  const navigate = useNavigate();
  const { organisation, loading, error } = useOrganisation(organisationId);

  const [hasChanges, setHasChanges] = useState(false);

  const handleSaveChanges = () => {
    // TODO: Implement save functionality
    setHasChanges(false);
    // Show success message or navigate
  };

  if (loading) {
    return (
      <>
        <SkipLink />
        <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <LoadingSkeleton type="summary" />
        </main>
      </div>
    );
  }

  if (error || !organisation) {
    return (
      <>
        <SkipLink />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
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
        </main>
      </div>      </>    );
  }

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <Link to="/admin/user-management" className="govuk-back-link">Back</Link>

            <h1 className="govuk-heading-l govuk-!-margin-top-6">Manage organisation settings</h1>

            <h2 className="govuk-heading-m govuk-!-margin-top-6">Organisation details</h2>

            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  Organisation name
                </dt>
                <dd className="govuk-summary-list__value">
                  {organisation.organisation_name}
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
                      {organisation.town_city}<br />
                      {organisation.postcode}
                    </>
                  ) : (
                    'Not available'
                  )}
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  Team coordinators
                </dt>
                <dd className="govuk-summary-list__value">
                  {organisation.team_coordinators && organisation.team_coordinators.length > 0 ? (
                    organisation.team_coordinators.map((email, index) => (
                      <React.Fragment key={email}>
                        {email}
                        {index < organisation.team_coordinators.length - 1 && ','}
                        <br />
                      </React.Fragment>
                    ))
                  ) : (
                    'No team coordinators'
                  )}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <Link 
                    className="govuk-link" 
                    to={`/admin/organisations/${organisationId}/team-coordinators`}
                  >
                    Change
                  </Link>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  Approved domains
                </dt>
                <dd className="govuk-summary-list__value">
                  {organisation.approved_domains && organisation.approved_domains.length > 0 ? (
                    organisation.approved_domains.map((domain, index) => (
                      <React.Fragment key={domain}>
                        {domain}
                        {index < organisation.approved_domains.length - 1 && ','}
                        <br />
                      </React.Fragment>
                    ))
                  ) : (
                    'No approved domains'
                  )}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <Link 
                    className="govuk-link" 
                    to={`/admin/organisations/${organisationId}/approved-domains`}
                  >
                    Change
                  </Link>
                </dd>
              </div>
            </dl>

            <button
              type="button"
              className="govuk-button govuk-!-margin-top-6"
              onClick={handleSaveChanges}
              disabled={!hasChanges}
            >
              Save changes
            </button>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default ManageOrganisationSettingsPage;
