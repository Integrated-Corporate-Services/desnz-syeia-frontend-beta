import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import ErrorSummary from '../../../../components/commonFormFields/ErrorSummary';
import type { SummaryError } from '../hooks/useObjectionForm';

interface ObjectionPageProps {
  title: string;
  backTo: string;
  errors: SummaryError[];
  children: React.ReactNode;
}

/** Shared frame for the public objection pages: page title, back link and error summary. */
const ObjectionPage: React.FC<ObjectionPageProps> = ({ title, backTo, errors, children }) => {
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errors.length) summaryRef.current?.focus();
  }, [errors]);

  return (
    <>
      <PageTitle title={errors.length ? `Error: ${title}` : title} />
      <Link className="govuk-back-link" to={backTo}>Back</Link>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <ErrorSummary ref={summaryRef} errors={errors} />
          {children}
        </div>
      </div>
    </>
  );
};

export default ObjectionPage;
