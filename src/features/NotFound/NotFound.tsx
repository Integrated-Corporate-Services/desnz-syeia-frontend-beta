import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../../layouts/component/Header";
import Footer from "../../layouts/component/Footer";
import SkipLink from "../../components/SkipLink";
import PageTitle from "../../components/PageTitle";

const NotFound: React.FC = () => {
  const contentStartRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Move focus to the heading for screen reader users
    if (contentStartRef.current) {
      contentStartRef.current.focus();
    }
  }, []);

  return (
    <>
      {/* WCAG 2.4.2 Page Titled (Level A) - Issue #6 */}
      <PageTitle title="Page not found" />
      
      <SkipLink />
      <Header />
      <div className="govuk-width-container">
        <main
          className="govuk-main-wrapper"
          id="main-content"
          role="main"
          style={{ paddingTop: 16, paddingBottom: 16 }}
        >
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1
                className="govuk-heading-xl"
                ref={contentStartRef}
                tabIndex={-1}
                style={{ outline: "none" }}
              >
                Page not found
              </h1>
              <p className="govuk-body">
                If you entered a web address, check it is correct.
              </p>
              <p className="govuk-body">
                You can{" "}
                <Link to="/" className="govuk-link">
                  browse from the homepage
                </Link>{" "}
                to find the information you need.
              </p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;