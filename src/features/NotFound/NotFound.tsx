import React from "react";
import Header from "../../layouts/component/Header";
import Footer from "../../layouts/component/Footer";
import SkipLink from "../../components/SkipLink";
import NotFoundContent from "./NotFoundContent";

const NotFound: React.FC = () => {
  return (
    <>
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
