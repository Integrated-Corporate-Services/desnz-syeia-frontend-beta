import React from 'react';
import { APPLICATION_SUBMITTED } from '../../../constants/content';
import PageTitle from '../../../components/PageTitle';

const ApplicationSubmitted: React.FC = () => (
  <>
    <PageTitle title="Application submitted" />
    <div className="govuk-panel govuk-panel--confirmation">
      <h1 className="govuk-panel__title">{APPLICATION_SUBMITTED.title}</h1>
      <div className="govuk-panel__body">
        {APPLICATION_SUBMITTED.body}
      </div>
    </div>
  </>
);

export default ApplicationSubmitted;