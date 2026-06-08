import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../layouts/component/Header';
import Footer from '../layouts/component/Footer';

const ClosedPage: React.FC = () => {
  const contentStartRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = 'Access denied - DESNZ - GOV.UK';
    // Move focus to the heading for screen reader users
    if (contentStartRef.current) {
      contentStartRef.current.focus();
    }
  }, []);

  return (
    <>
      <a href="#main-content" className="govuk-skip-link">
        Skip to main content
      </a>
      <Header />
      <div className="govuk-width-container">
        <main
          className="govuk-main-wrapper govuk-!-padding-top-2 govuk-!-padding-bottom-2"
          id="main-content"
          role="main"
        >
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1
                className="govuk-heading-l"
                ref={contentStartRef}
                tabIndex={-1}
              >
                This service is currently in private beta
              </h1>

              <p className="govuk-body-l">
                You need an invite link to access this service at this time.
              </p>

              <p className="govuk-body">
                If you have received an invite, make sure you are using the full
                link from the email.
              </p>

              <h2 className="govuk-heading-m">If you need access</h2>

              <p className="govuk-body">
                Contact the DESNZ team if you believe you should have access to
                this service during the private beta phase.
              </p>

              <p className="govuk-body">
                <Link to="/" className="govuk-link">
                  Return to homepage
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default ClosedPage;
