import React from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';

/**
 * GOV.UK Design System "service unavailable" pattern:
 * https://design-system.service.gov.uk/patterns/service-unavailable-pages/
 */
const ServiceUnavailablePage: React.FC = () => {
  return (
    <>
      <PageTitle title="Sorry, the service is unavailable" />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Sorry, the service is unavailable</h1>

          <p className="govuk-body">
            We are carrying out essential maintenance, or a service we rely on is temporarily
            unavailable.
          </p>
          <p className="govuk-body">Please try again in a few minutes.</p>
          <p className="govuk-body">
            Any information you had entered but not submitted has not been saved.
          </p>

          <p className="govuk-body">
            <Link className="govuk-link" to="/">
              Go to the homepage
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ServiceUnavailablePage;
