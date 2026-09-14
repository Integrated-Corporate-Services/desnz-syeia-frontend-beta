import React from 'react';
import PageTitle from '../components/PageTitle';

const ThereIsAProblemPage: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const reference = searchParams.get('ref');

  const handleTryAgain = () => {
    window.location.href = '/';
  };

  return (
    <div className="govuk-width-container">
      <PageTitle title="There is a problem" />
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">There is a problem</h1>

            <p className="govuk-body">Try again later.</p>

            <p className="govuk-body">
              We have saved any answers you have submitted so far. You can continue your
              application when the service is available again.
            </p>

            {reference && (
              <p className="govuk-body">
                If you contact us, quote reference{' '}
                <span className="govuk-!-font-weight-bold">{reference}</span>.
              </p>
            )}

            <p className="govuk-body">
              <button
                onClick={handleTryAgain}
                className="govuk-button"
                data-module="govuk-button"
                type="button"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThereIsAProblemPage;
