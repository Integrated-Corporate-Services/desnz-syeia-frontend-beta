import React from 'react';
import type { CpoTaskStatus } from '../types/cpoTaskList';
import { getStatusColour } from '../utils/taskStatus';

const CpoTaskStatusTag: React.FC<{ status: CpoTaskStatus }> = ({ status }) => (
  <strong className={`govuk-tag govuk-tag--${getStatusColour(status)}`}>
    {status}
  </strong>
);

export default CpoTaskStatusTag;
