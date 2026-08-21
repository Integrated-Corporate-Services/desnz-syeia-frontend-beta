import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const NotFoundContent: React.FC = () => {
  const contentStartRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Focus management for screen reader users
    if (contentStartRef.current) {
      contentStartRef.current.focus();
    }
  }, []);

  return (
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
  );
};

export default NotFoundContent;
