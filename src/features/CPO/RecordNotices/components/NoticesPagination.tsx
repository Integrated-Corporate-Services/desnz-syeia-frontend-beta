import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';
import { NOTICE_PAGINATION_STEPS, type NoticePaginationStep } from '../constants/noticesConstants';

const NoticesPagination: React.FC<{ current: NoticePaginationStep }> = ({ current }) => {
  const applicationId = useCpoApplicationId();
  const [params] = useSearchParams();
  const from = params.get('from');
  const query = from ? `?from=${from}` : '';
  const index = NOTICE_PAGINATION_STEPS.findIndex(item => item.step === current);
  const previous = NOTICE_PAGINATION_STEPS[index - 1];
  const next = NOTICE_PAGINATION_STEPS[index + 1];
  const urlFor = (path: string) => `/cpo/${applicationId}/record-notices/${path}${query}`;

  return (
    <nav className="govuk-pagination" role="navigation" aria-label="Record your notices pages">
      {previous && (
        <div className="govuk-pagination__prev">
          <Link className="govuk-link govuk-pagination__link" to={urlFor(previous.path)} rel="prev">
            <span className="govuk-pagination__link-title">Previous<span className="govuk-visually-hidden"> page</span></span>
            <span className="govuk-pagination__link-label">{previous.label}</span>
          </Link>
        </div>
      )}
      {next && (
        <div className="govuk-pagination__next">
          <Link className="govuk-link govuk-pagination__link" to={urlFor(next.path)} rel="next">
            <span className="govuk-pagination__link-title">Next<span className="govuk-visually-hidden"> page</span></span>
            <span className="govuk-pagination__link-label">{next.label}</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default NoticesPagination;
