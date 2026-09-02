import React from 'react';
import { buildBackendUrl } from '../utils/apiConfig';
import PageTitle from '../components/PageTitle';

const TabConflictPage: React.FC = () => (
  <div className="govuk-width-container">
    <PageTitle title="This service is open in another tab" />
    <main className="govuk-main-wrapper" id="main-content" role="main">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">This service is open in another tab</h1>
          <p className="govuk-body-l">
            To protect your information, you can only use this service in one browser tab at a time.
          </p>
          <p className="govuk-body">Close this tab and continue in the tab where the service is already open.</p>
          <p className="govuk-body">
            <a className="govuk-link" href={buildBackendUrl(`/auth/logout?redirectTo=${encodeURIComponent('/landingPage')}`)}>
              Sign out
            </a>
          </p>
        </div>
      </div>
    </main>
  </div>
);

export default TabConflictPage;