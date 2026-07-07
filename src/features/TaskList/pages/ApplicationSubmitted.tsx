import React from 'react';
import { APPLICATION_SUBMITTED } from '../../../constants/content';

const ApplicationSubmitted: React.FC = () => (
  <div className="govuk-panel govuk-panel--confirmation">
    <h1 className="govuk-panel__title">{APPLICATION_SUBMITTED.title}</h1>
    <div className="govuk-panel__body">
      {APPLICATION_SUBMITTED.body}
    </div>
  </div>
);

export default ApplicationSubmitted;