import React from "react";
import Header from "../../layouts/component/Header";
import Footer from "../../layouts/component/Footer";
import SkipLink from "../../components/SkipLink";
import PageTitle from "../../components/PageTitle";
import NotFoundContent from "./NotFoundContent";

const NotFound: React.FC = () => {
  const contentStartRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Move focus to the heading for screen reader users
    if (contentStartRef.current) {
      contentStartRef.current.focus();
    }
  }, []);

const NotFound: React.FC = () => {
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
          <NotFoundContent />
        </main>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
